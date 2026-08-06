"use client";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useRef, useState } from "react";
import { PinLocation } from "@/data/besiktasPinData";

interface InteractiveMapProps {
  pins: PinLocation[];
  onPinClick: (pin: PinLocation) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  heykeller: "#c5a059",
  saraylar: "#9b6fd0",
  "tarihi-yapilar": "#4a9ead",
  spor: "#e11d48",
  "dini-kamusal": "#5a9a6b",
};

const CATEGORY_ICONS: Record<string, string> = {
  heykeller: "🗿",
  saraylar: "🏰",
  "tarihi-yapilar": "🏛️",
  spor: "🏟️",
  "dini-kamusal": "⛪",
};

export default function InteractiveMap({ pins, onPinClick }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null!);
  const leafletMapRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const lInstanceRef = useRef<any>(null);
  const onPinClickRef = useRef(onPinClick);
  // Track whether the map is fully initialized
  const [mapReady, setMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(14);

  useEffect(() => {
    onPinClickRef.current = onPinClick;
  }, [onPinClick]);

  // ── Initialize map (runs once) ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (leafletMapRef.current) return;

    let cancelled = false;

    import("leaflet").then((LModule) => {
      if (cancelled || !mapRef.current) return null;
      const L = LModule.default || LModule;
      if (typeof window !== "undefined") {
        (window as any).L = L;
      }
      return import("leaflet.markercluster").then(() => L).catch(() => L);
    }).then((L) => {
      if (!L || cancelled || !mapRef.current) return;

      lInstanceRef.current = L;

      // Patch default icon paths (needed in webpack/Next.js)
      // @ts-ignore
      if (L.Icon && L.Icon.Default && L.Icon.Default.prototype && L.Icon.Default.prototype._getIconUrl) {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
      }

      const map = L.map(mapRef.current, {
        center: [41.0425, 29.0075],
        zoom: 14,
        minZoom: 10.5,
        maxZoom: 19,
        zoomControl: true,
        attributionControl: false,
      });

      // OpenStreetMap tile layer — dark filter applied via CSS
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      setZoomLevel(map.getZoom());
      map.on("zoomend", () => {
        setZoomLevel(Math.round(map.getZoom() * 10) / 10);
      });

      leafletMapRef.current = map;
      // Signal that map is ready so the marker effect can run
      setMapReady(true);
      setTimeout(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      }, 250);
    });

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []); // empty deps — only once

  // ── Sync markers whenever pins change OR map becomes ready ──
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !lInstanceRef.current) return;

    const L = lInstanceRef.current;

    // Clear old cluster group if exists
    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers();
      leafletMapRef.current.removeLayer(clusterGroupRef.current);
    }

    const createClusterGroup = (L as any).markerClusterGroup;
    let markersContainer: any;
    if (typeof createClusterGroup === "function") {
      markersContainer = createClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 25,
        disableClusteringAtZoom: 15,
        spiderfyOnMaxZoom: true,
        spiderfyDistanceMultiplier: 1.8,
      });
    } else {
      markersContainer = L.layerGroup();
    }

    pins.forEach((pin) => {
      const color = CATEGORY_COLORS[pin.category] ?? "#c5a059";
      const icon = CATEGORY_ICONS[pin.category] ?? "📍";

      let size = 34;
      if (zoomLevel <= 11) size = 16;
      else if (zoomLevel === 12) size = 20;
      else if (zoomLevel === 13) size = 26;
      else if (zoomLevel === 14) size = 34;
      else if (zoomLevel === 15) size = 40;
      else if (zoomLevel >= 16) size = 46;

      const showEmoji = size >= 24;

      const divIcon = L.divIcon({
        html: `
          <div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background: radial-gradient(circle at 35% 35%, ${color}, ${color}dd);
            border: 2px solid #ffffff;
            display:flex;align-items:center;justify-content:center;
            font-size:${size * 0.48}px;
            cursor:pointer;
            box-shadow: 0 0 14px ${color}dd, 0 0 28px ${color}77, 0 6px 16px rgba(0,0,0,0.85);
            position:relative;
            transition: transform 0.2s ease;
          ">
            ${showEmoji ? icon : `<span style="width:6px;height:6px;border-radius:50%;background:#ffffff;"></span>`}
            <span style="
              position:absolute;
              inset:-6px;
              border-radius:50%;
              border:1.5px solid ${color};
              animation:pulse-ring 2.5s cubic-bezier(0.215,0.61,0.355,1) infinite;
              opacity:0.6;
              pointer-events:none;
              box-shadow: 0 0 10px ${color}99;
            "></span>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
      });

      const marker = L.marker(pin.coordinates, { icon: divIcon })
        .on("click", () => onPinClickRef.current(pin));

      marker.bindTooltip(
        `<div style="
          background:#14161d;
          border:2px solid rgba(255,255,255,0.2);
          border-radius:8px;padding:7px 12px;
          font-family:Inter,sans-serif;font-size:12px;
          color:#f3f4f6;white-space:nowrap;
          box-shadow:0 4px 16px rgba(0,0,0,0.5);
        ">
          <strong style="color:${color}">${pin.title}</strong><br>
          <span style="color:#9ca3af;font-size:11px">${pin.categoryLabel}</span>
          ${pin.era ? `<br><span style="color:#6b7280;font-size:10px">📅 ${pin.era}</span>` : ""}
        </div>`,
        {
          permanent: false,
          direction: "top",
          offset: [0, -8],
          className: "custom-tooltip",
          opacity: 1,
        }
      );

      markersContainer.addLayer(marker);
    });
    
    leafletMapRef.current.addLayer(markersContainer);
    clusterGroupRef.current = markersContainer;
  }, [pins, mapReady, zoomLevel]); // re-runs when pins filter changes OR map becomes ready

  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([41.0425, 29.0075], 14, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-full" style={{ minHeight: "100vh" }}>
      <div
        ref={mapRef}
        id="besiktas-interactive-map"
        className="w-full h-full absolute inset-0"
      />

      {/* Prominent Top-Right Merkeze Dön Button */}
      <button
        onClick={handleRecenter}
        className="absolute top-4 right-4 z-[1000] bg-[#14161d]/95 hover:bg-[#1b1e28] text-[var(--accent)] border border-[var(--accent)]/40 hover:border-[var(--accent)] backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95"
        title="Beşiktaş Merkezine Odaklan"
        id="recenter-map-top-btn"
      >
        <span className="text-sm">📍</span> Merkeze Dön (Beşiktaş)
      </button>
      
      {/* Map Controls: Bottom-Right Merkeze Dön & Zoom Level */}
      <div className="absolute bottom-6 right-6 z-[1000] flex items-center gap-3">
        <button
          onClick={handleRecenter}
          className="bg-[#14161d]/95 hover:bg-[#1b1e28] text-white border border-white/15 hover:border-[var(--accent)]/50 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          title="Merkeze Dön (Beşiktaş)"
          id="recenter-map-bottom-btn"
        >
          <span>🏢</span> Merkeze Dön
        </button>

        <div className="bg-[#14161d]/90 border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-xs font-medium text-gray-300">Yakınlaştırma:</span>
          <span className="text-sm font-bold text-[var(--accent)] font-mono tabular-nums">{zoomLevel}x</span>
        </div>
      </div>
    </div>
  );
}
