"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Check, X, Layers } from "lucide-react";

interface LocationPickerModalProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

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

export default function LocationPickerModal({
  initialLat = 41.0425,
  initialLng = 29.0075,
  initialAddress = "",
  onConfirm,
  onClose,
}: LocationPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null!);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);

  const [lat, setLat] = useState<number>(initialLat || 41.0425);
  const [lng, setLng] = useState<number>(initialLng || 29.0075);
  const [searchQuery, setSearchQuery] = useState<string>(initialAddress);
  const [searching, setSearching] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState("voyager");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    let cancelled = false;

    import("leaflet").then((LModule) => {
      if (cancelled || !mapContainerRef.current) return;
      const L = LModule.default || LModule;

      // Fix default icons
      if (L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
      }

      const startLat = initialLat && !isNaN(initialLat) ? initialLat : 41.0425;
      const startLng = initialLng && !isNaN(initialLng) ? initialLng : 29.0075;

      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: 15,
        zoomControl: true,
      });

      const activeConfig = TILE_LAYERS.find((t) => t.id === selectedTileId) || TILE_LAYERS[0];
      const tileLayer = L.tileLayer(activeConfig.url, {
        maxZoom: activeConfig.maxZoom,
        subdomains: activeConfig.subdomains,
        attribution: "&copy; CartoDB & Esri & OpenStreetMap",
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;

      // Custom Glowing Draggable Pin
      const customIcon = L.divIcon({
        html: `
          <div style="
            width:38px;height:38px;
            border-radius:50%;
            background: radial-gradient(circle at 35% 35%, #c5a059, #9b7228);
            border: 2px solid #ffffff;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;
            cursor:grab;
            box-shadow: 0 0 16px rgba(197,160,89,0.9), 0 6px 16px rgba(0,0,0,0.8);
            position:relative;
          ">
            📍
            <span style="
              position:absolute;
              inset:-6px;
              border-radius:50%;
              border:1.5px solid #c5a059;
              animation:pulse-ring 2.5s cubic-bezier(0.215,0.61,0.355,1) infinite;
              opacity:0.6;
              pointer-events:none;
            "></span>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([startLat, startLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      // Update lat/lng state on drag end
      marker.on("dragend", (e: any) => {
        const position = e.target.getLatLng();
        setLat(parseFloat(position.lat.toFixed(6)));
        setLng(parseFloat(position.lng.toFixed(6)));
      });

      // Update marker position when user clicks anywhere on the map
      map.on("click", (e: any) => {
        const clickedLat = parseFloat(e.latlng.lat.toFixed(6));
        const clickedLng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([clickedLat, clickedLng]);
        setLat(clickedLat);
        setLng(clickedLng);
      });

      leafletMapRef.current = map;
      markerRef.current = marker;

      setTimeout(() => {
        if (leafletMapRef.current) leafletMapRef.current.invalidateSize();
      }, 200);
    });

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Handle Tile Layer switch
  const handleTileSwitch = (tileId: string) => {
    setSelectedTileId(tileId);
    if (leafletMapRef.current && typeof window !== "undefined") {
      import("leaflet").then((LModule) => {
        const L = LModule.default || LModule;
        if (currentTileLayerRef.current) {
          leafletMapRef.current.removeLayer(currentTileLayerRef.current);
        }
        const cfg = TILE_LAYERS.find((t) => t.id === tileId) || TILE_LAYERS[0];
        const newLayer = L.tileLayer(cfg.url, {
          maxZoom: cfg.maxZoom,
          subdomains: cfg.subdomains,
          attribution: "&copy; CartoDB & Esri & OpenStreetMap",
        }).addTo(leafletMapRef.current);
        currentTileLayerRef.current = newLayer;
      });
    }
  };

  // Search Address on Map
  const handleSearchOnMap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    const fullQuery = `${searchQuery} Beşiktaş İstanbul`.trim();
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        setLat(foundLat);
        setLng(foundLng);

        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.flyTo([foundLat, foundLng], 16, { duration: 1 });
          markerRef.current.setLatLng([foundLat, foundLng]);
        }
      } else {
        alert("Adres haritada bulunamadı. Lütfen harita üzerinden tıklayarak seçiniz.");
      }
    } catch (err) {
      console.error("Map search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm(lat, lng);
    onClose();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#12141a] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#181a22] border-b border-white/10 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin size={16} className="text-[var(--accent)]" /> Haritada Konum Seç
            </h3>
            <p className="text-xs text-neutral-400">
              İşaretçiyi sürükleyin veya haritada istediğiniz noktaya tıklayarak konumu belirleyin.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Controls Bar: Search & Layer Switcher */}
        <div className="p-3 bg-[#14161d] border-b border-white/10 flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchOnMap} className="flex-1 flex gap-2 min-w-[260px]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Adres veya mekan adı ara (Örn: Çırağan Cad. No:32)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              {searching ? "Aranıyor..." : "Haritada Bul"}
            </button>
          </form>

          {/* Tile Layer Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1">
            <Layers size={13} className="text-[var(--accent)]" />
            <select
              value={selectedTileId}
              onChange={(e) => handleTileSwitch(e.target.value)}
              className="bg-transparent text-xs text-white [&>option]:bg-[#14161d] focus:outline-none cursor-pointer font-medium"
            >
              {TILE_LAYERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative w-full h-full bg-[#0d0e12]">
          <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
        </div>

        {/* Footer Info & Confirmation */}
        <div className="p-4 bg-[#181a22] border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-neutral-400">Seçilen Koordinat:</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[var(--accent)] font-bold">
              Lat: {lat.toFixed(6)}
            </span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[var(--accent)] font-bold">
              Lng: {lng.toFixed(6)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl border border-white/15 text-xs text-neutral-300 hover:bg-white/10 transition-all font-semibold"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[#0d0e12] text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-1.5"
            >
              <Check size={14} /> Konumu Onayla & Kullan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
