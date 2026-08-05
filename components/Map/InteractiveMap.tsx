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

    Promise.all([
      import("leaflet"),
      import("leaflet.markercluster")
    ]).then(([LModule]) => {
      if (cancelled || !mapRef.current) return;
      
      const L = LModule.default || LModule;

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
        center: [41.043, 29.005],
        zoom: 14.5,
        minZoom: 13.5,
        maxZoom: 18,
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
    if (!mapReady || !leafletMapRef.current) return;

    import("leaflet").then((L) => {
      if (!leafletMapRef.current) return;

      // Clear old cluster group if exists
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
        leafletMapRef.current.removeLayer(clusterGroupRef.current);
      }

      // @ts-ignore
      const markers = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 40,
      });

      pins.forEach((pin) => {
        const color = CATEGORY_COLORS[pin.category] ?? "#c5a059";
        const icon = CATEGORY_ICONS[pin.category] ?? "📍";

        let size = 36;
        if (zoomLevel <= 12) size = 28;
        else if (zoomLevel === 13) size = 32;
        else if (zoomLevel === 14) size = 36;
        else if (zoomLevel === 15) size = 40;
        else if (zoomLevel >= 16) size = 44;

        const divIcon = L.divIcon({
          html: `
            <div style="
              width:${size}px;height:${size}px;
              border-radius:50%;
              background:${color}28;
              border:2px solid ${color};
              display:flex;align-items:center;justify-content:center;
              font-size:${size * 0.45}px;
              cursor:pointer;
              box-shadow:0 4px 20px rgba(0,0,0,0.7);
              position:relative;
            ">
              ${icon}
              <span style="
                position:absolute;
                inset:-6px;
                border-radius:50%;
                border:1.5px solid ${color};
                animation:pulse-ring 2.5s cubic-bezier(0.215,0.61,0.355,1) infinite;
                opacity:0.5;
                pointer-events:none;
              "></span>
            </div>
          `,
          className: "",
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

        markers.addLayer(marker);
      });
      
      leafletMapRef.current.addLayer(markers);
      clusterGroupRef.current = markers;
    });
  }, [pins, mapReady, zoomLevel]); // re-runs when pins filter changes OR map becomes ready

  return (
    <div className="relative w-full h-full" style={{ minHeight: "100vh" }}>
      <div
        ref={mapRef}
        id="besiktas-interactive-map"
        className="w-full h-full absolute inset-0"
      />
      
      {/* Zoom Level Indicator */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-[#14161d]/90 border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
        <span className="text-xs font-medium text-gray-300">Yakınlaştırma:</span>
        <span className="text-sm font-bold text-[var(--accent)] font-mono tabular-nums">{zoomLevel}x</span>
      </div>
    </div>
  );
}
