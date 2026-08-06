"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Check, X, Navigation, Loader2 } from "lucide-react";

interface LocationPickerModalProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onConfirm: (lat: number, lng: number, address?: string, neighborhood?: string) => void;
  onClose: () => void;
}

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

  const [lat, setLat] = useState<number>(initialLat || 41.0425);
  const [lng, setLng] = useState<number>(initialLng || 29.0075);
  const [searchQuery, setSearchQuery] = useState<string>(initialAddress);
  const [searching, setSearching] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string>("");
  const [detectedNeighborhood, setDetectedNeighborhood] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reverse geocoding helper to fetch street address & neighborhood from coordinates
  const fetchAddressDetails = useCallback(async (latitude: number, longitude: number) => {
    setFetchingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.pedestrian || addr.street || addr.suburb || "";
        const houseNo = addr.house_number ? ` No:${addr.house_number}` : "";
        const neighbourhood = addr.neighbourhood || addr.suburb || addr.quarter || "Sinanpaşa";
        const district = addr.town || addr.district || addr.city_district || "Beşiktaş";

        const fullFormatted = [
          road ? `${road}${houseNo}` : "",
          neighbourhood,
          district,
          "İstanbul",
        ]
          .filter(Boolean)
          .join(", ");

        setDetectedAddress(fullFormatted || data.display_name || "");
        setDetectedNeighborhood(neighbourhood);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    } finally {
      setFetchingAddress(false);
    }
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
        zoom: 16,
        zoomControl: true,
      });

      // Standard crisp OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Custom Glowing Red/Gold Draggable Pin
      const customIcon = L.divIcon({
        html: `
          <div style="
            width:38px;height:38px;
            border-radius:50%;
            background: radial-gradient(circle at 35% 35%, #e11d48, #9f1239);
            border: 2px solid #ffffff;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;
            cursor:grab;
            box-shadow: 0 0 16px rgba(225,29,72,0.9), 0 6px 16px rgba(0,0,0,0.8);
            position:relative;
          ">
            📍
            <span style="
              position:absolute;
              inset:-6px;
              border-radius:50%;
              border:1.5px solid #e11d48;
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

      // Drag end listener
      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        const nLat = parseFloat(pos.lat.toFixed(6));
        const nLng = parseFloat(pos.lng.toFixed(6));
        setLat(nLat);
        setLng(nLng);
        fetchAddressDetails(nLat, nLng);
      });

      // Map click listener
      map.on("click", (e: any) => {
        const clickedLat = parseFloat(e.latlng.lat.toFixed(6));
        const clickedLng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([clickedLat, clickedLng]);
        setLat(clickedLat);
        setLng(clickedLng);
        fetchAddressDetails(clickedLat, clickedLng);
      });

      leafletMapRef.current = map;
      markerRef.current = marker;

      // Invalidate size immediately and after delays so the container never stays black
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 500);

      // Perform initial reverse geocode
      fetchAddressDetails(startLat, startLng);
    });

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [initialLat, initialLng, fetchAddressDetails]);

  // Address Search
  const handleSearchOnMap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    const fullQuery = `${searchQuery} Beşiktaş İstanbul`.trim();
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
          fullQuery
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setSearchResults(data.slice(0, 5));
        const first = data[0];
        const foundLat = parseFloat(first.lat);
        const foundLng = parseFloat(first.lon);

        selectLocation(foundLat, foundLng, first.display_name, first.address?.suburb);
      } else {
        alert("Adres haritada bulunamadı. Lütfen harita üzerinden bir noktaya tıklayarak konum seçiniz.");
      }
    } catch (err) {
      console.error("Map search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = (nLat: number, nLng: number, addrStr?: string, neighStr?: string) => {
    setLat(nLat);
    setLng(nLng);
    if (leafletMapRef.current && markerRef.current) {
      leafletMapRef.current.flyTo([nLat, nLng], 17, { duration: 1 });
      markerRef.current.setLatLng([nLat, nLng]);
    }
    if (addrStr) setDetectedAddress(addrStr);
    if (neighStr) setDetectedNeighborhood(neighStr);
    else fetchAddressDetails(nLat, nLng);
    setSearchResults([]);
  };

  const handleConfirm = () => {
    onConfirm(lat, lng, detectedAddress, detectedNeighborhood);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#14161d] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#1b1e28] border-b border-white/10 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin size={18} className="text-[var(--accent)]" /> Haritada Açık Adres & Konum Seç
            </h3>
            <p className="text-xs text-neutral-300">
              Haritada istediğiniz noktaya tıklayın veya pini sürükleyin; açık adres bilgisi otomatik çekilir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input & Suggestions */}
        <div className="p-3 bg-[#181a24] border-b border-white/10 relative z-20">
          <form onSubmit={handleSearchOnMap} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sokak, cadde, mahalle veya mekan adı yazın (Örn: Çırağan Caddesi No:32)..."
                className="w-full bg-white/10 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/50 focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 bg-[var(--accent)] text-[#0d0e12] text-xs font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              {searching ? "Aranıyor..." : "Adresi Bul"}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-[#14161d] border border-white/20 rounded-xl shadow-2xl overflow-hidden z-30 max-h-48 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    selectLocation(
                      parseFloat(item.lat),
                      parseFloat(item.lon),
                      item.display_name,
                      item.address?.suburb || item.address?.neighbourhood
                    )
                  }
                  className="w-full text-left p-2.5 hover:bg-white/10 text-xs text-white border-b border-white/5 flex items-start gap-2 cursor-pointer"
                >
                  <MapPin size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative w-full h-full bg-neutral-200">
          <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
        </div>

        {/* Footer Address Info & Actions */}
        <div className="p-4 bg-[#1b1e28] border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] mb-1">
              {fetchingAddress ? (
                <Loader2 size={13} className="animate-spin text-[var(--accent)]" />
              ) : (
                <MapPin size={13} />
              )}
              <span>Haritadan Tespit Edilen Açık Adres:</span>
            </div>
            <p className="text-xs text-white truncate font-medium">
              {fetchingAddress
                ? "Adres bilgisi çekiliyor..."
                : detectedAddress || "Haritaya tıklayarak adres seçiniz."}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1 font-mono">
              <span>Lat: {lat.toFixed(6)}</span>
              <span>Lng: {lng.toFixed(6)}</span>
              {detectedNeighborhood && (
                <span className="text-emerald-400 font-semibold">📍 Mahalle: {detectedNeighborhood}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/20 text-xs text-white hover:bg-white/10 transition-all font-semibold cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[#0d0e12] text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={16} /> Konumu & Adresi Onayla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
