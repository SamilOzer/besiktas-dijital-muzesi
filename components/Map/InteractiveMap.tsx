"use client";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useRef, useState, useCallback } from "react";
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

const TILE_LAYERS = [
  {
    id: "voyager",
    name: "🏙️ Şehir Haritası (Detaylı)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    maxZoom: 19,
  },
  {
    id: "satellite",
    name: "🛰️ Uydu Görüntüsü (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "abcd",
    maxZoom: 18,
  },
  {
    id: "dark",
    name: "🌙 Gece Haritası (Dark)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    maxZoom: 19,
  },
  {
    id: "osm",
    name: "🗺️ Standart OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    maxZoom: 19,
  },
];

// Fixed pin size — no longer changes with zoom, so markers don't re-render
const PIN_SIZE = 32;

export default function InteractiveMap({ pins, onPinClick }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null!);
  const leafletMapRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);
  const lInstanceRef = useRef<any>(null);
  const onPinClickRef = useRef(onPinClick);

  const [mapReady, setMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [selectedTileId, setSelectedTileId] = useState("voyager");

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
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true, // Better mobile performance, avoids SVG rendering gaps
      });

      const activeConfig = TILE_LAYERS.find((t) => t.id === selectedTileId) || TILE_LAYERS[0];
      const tileLayer = L.tileLayer(activeConfig.url, {
        maxZoom: activeConfig.maxZoom,
        subdomains: activeConfig.subdomains,
        attribution: "&copy; CartoDB & Esri & OpenStreetMap",
        updateWhenIdle: false,      // Load tiles immediately on pan
        updateWhenZooming: false,   // Don't wait for zoom end
        keepBuffer: 4,              // Keep more tiles in buffer
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;

      setZoomLevel(map.getZoom());
      map.on("zoomend", () => {
        setZoomLevel(Math.round(map.getZoom() * 10) / 10);
      });

      leafletMapRef.current = map;
      setMapReady(true);

      // Multiple invalidateSize calls to handle mobile layout timing
      [300, 600, 1200].forEach(ms =>
        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize({ animate: false });
          }
        }, ms)
      );
    });

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTileChange = useCallback((newTileId: string) => {
    setSelectedTileId(newTileId);
    if (leafletMapRef.current && lInstanceRef.current) {
      const L = lInstanceRef.current;
      if (currentTileLayerRef.current) {
        leafletMapRef.current.removeLayer(currentTileLayerRef.current);
      }
      const cfg = TILE_LAYERS.find((t) => t.id === newTileId) || TILE_LAYERS[0];
      const newLayer = L.tileLayer(cfg.url, {
        maxZoom: cfg.maxZoom,
        subdomains: cfg.subdomains,
        attribution: "&copy; CartoDB & Esri & OpenStreetMap",
      }).addTo(leafletMapRef.current);
      currentTileLayerRef.current = newLayer;
    }
  }, []);

  // ── Sync markers whenever pins change OR map becomes ready ──
  // NOTE: zoomLevel is NOT a dependency — pins stay stable during pan/zoom
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
        maxClusterRadius: 10,
        disableClusteringAtZoom: 13,
        spiderfyOnMaxZoom: true,
        spiderfyDistanceMultiplier: 2.2,
      });
    } else {
      markersContainer = L.layerGroup();
    }

    const size = PIN_SIZE;
    const showEmoji = true;

    pins.forEach((pin) => {
      if (
        !pin ||
        !Array.isArray(pin.coordinates) ||
        pin.coordinates.length < 2 ||
        isNaN(Number(pin.coordinates[0])) ||
        isNaN(Number(pin.coordinates[1]))
      ) {
        return;
      }

      const color = CATEGORY_COLORS[pin.category] ?? "#c5a059";
      const icon = CATEGORY_ICONS[pin.category] ?? "📍";

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

    if (pins.length === 1 && pins[0].coordinates) {
      leafletMapRef.current.flyTo(pins[0].coordinates, 16, { duration: 1 });
    }
  }, [pins, mapReady]); // NO zoomLevel dependency — pins stay visible during pan/zoom

  const handleRecenter = useCallback(() => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([41.0425, 29.0075], 14, { duration: 1.2 });
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        id="besiktas-interactive-map"
        className="w-full h-full absolute inset-0"
      />

      {/* Top-Right Controls: responsive */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col sm:flex-row items-end sm:items-center gap-2">
        {/* Tile Layer Switcher */}
        <div className="bg-[#14161d]/95 backdrop-blur-md border border-white/15 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-2 shadow-2xl">
          <span className="text-[10px] sm:text-xs font-semibold text-[var(--accent)] hidden sm:inline">Harita Görünümü:</span>
          <select
            value={selectedTileId}
            onChange={(e) => handleTileChange(e.target.value)}
            className="bg-transparent text-[10px] sm:text-xs text-white [&>option]:bg-[#14161d] font-bold focus:outline-none cursor-pointer"
          >
            {TILE_LAYERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRecenter}
          className="bg-[#14161d]/95 hover:bg-[#1b1e28] text-[var(--accent)] border border-[var(--accent)]/40 hover:border-[var(--accent)] backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-2xl flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95"
          title="Beşiktaş Merkezine Odaklan"
          id="recenter-map-top-btn"
        >
          <span className="text-sm">📍</span> <span className="hidden sm:inline">Merkeze Dön (Beşiktaş)</span><span className="sm:hidden">Merkez</span>
        </button>
      </div>
      
      {/* Bottom-Right Controls */}
      <div className="absolute bottom-4 right-3 sm:bottom-6 sm:right-6 z-[1000] flex items-center gap-2">
        <button
          onClick={handleRecenter}
          className="hidden sm:flex bg-[#14161d]/95 hover:bg-[#1b1e28] text-white border border-white/15 hover:border-[var(--accent)]/50 backdrop-blur-md px-3 py-2 rounded-xl shadow-2xl items-center gap-2 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          title="Merkeze Dön (Beşiktaş)"
          id="recenter-map-bottom-btn"
        >
          <span>🏢</span> Merkeze Dön
        </button>

        <div className="bg-[#14161d]/90 border border-white/15 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-2xl flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-[10px] sm:text-xs font-medium text-gray-300">Zoom:</span>
          <span className="text-xs sm:text-sm font-bold text-[var(--accent)] font-mono tabular-nums">{zoomLevel}x</span>
        </div>
      </div>
    </div>
  );
}
