"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import LandmarkModal from "@/components/Map/LandmarkModal";
import MapFilterPanel from "@/components/Map/MapFilterPanel";
import { PinLocation, besiktasPinData } from "@/data/besiktasPinData";
import { normalizePinData, fetchPinsFromDb } from "@/lib/db-service";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

// MapLibre uses WebGL and must stay client-only.
const InteractiveMap = dynamic(
  () => import("@/components/Map/InteractiveMap"),
  { ssr: false }
);

const STORAGE_KEY = "besiktas_mekanlar_db";

/**
 * Reads ALL mekanlar directly from localStorage + besiktasPinData defaults.
 * No Supabase, no db-service, no async — guaranteed to return every pin.
 */
function loadAllPins(): PinLocation[] {
  let stored: PinLocation[] = [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        stored = parsed;
      }
    }
  } catch (e) {
    console.warn("[harita] Failed to read localStorage:", e);
  }

  const pinMap = new Map<string, PinLocation>();

  // 1. Always seed with latest default pins from besiktasPinData
  besiktasPinData.forEach((bp) => {
    pinMap.set(bp.id, normalizePinData(bp));
  });

  // 2. Merge stored pins from localStorage (user/admin added or modified pins)
  stored.forEach((sp) => {
    if (sp && sp.id) {
      const defaultPin = pinMap.get(sp.id);
      if (defaultPin) {
        pinMap.set(sp.id, normalizePinData({ ...defaultPin, ...sp }));
      } else {
        pinMap.set(sp.id, normalizePinData(sp));
      }
    }
  });

  const result = Array.from(pinMap.values());

  console.log(`[harita] loadAllPins: ${result.length} pins loaded from localStorage.`);
  return result;
}

export default function HaritaPage() {
  const [selectedCategory,    setSelectedCategory]    = useState("all");
  const [selectedTimePeriod,  setSelectedTimePeriod]  = useState("all");
  const [selectedNeighborhood,setSelectedNeighborhood]= useState("all");
  const [searchQuery,         setSearchQuery]         = useState("");
  const [selectedPinId,       setSelectedPinId]       = useState<string | null>("dolmabahce-sarayi");
  const [activePin,           setActivePin]           = useState<PinLocation | null>(null);
  const [sidebarOpen,         setSidebarOpen]         = useState(false); // default closed, opened after mount if desktop
  const [pins,                setPins]                = useState<PinLocation[]>([]);

  // Open sidebar by default on desktop only (after hydration)
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  const reloadPins = useCallback(async () => {
    // 1. Render immediately from local storage/defaults (zero delay)
    const initialPins = loadAllPins();
    setPins(initialPins);

    // 2. Async fetch fresh pins from Supabase DB so all PCs/devices sync
    try {
      const dbPins = await fetchPinsFromDb();
      if (dbPins && dbPins.length > 0) {
        setPins(dbPins);
      }
    } catch (err) {
      console.warn("[harita] Error fetching pins from Supabase DB:", err);
    }
  }, []);

  useEffect(() => {
    // Initial load — synchronous, no waiting
    reloadPins();

    // Re-load when admin panel updates data (same tab or other tab)
    const handleUpdate = () => {
      console.log("[harita] Data update event received, reloading...");
      reloadPins();
    };
    window.addEventListener("besiktas_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("besiktas_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [reloadPins]);

  const filteredPins = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return pins.filter((pin) => {
      const catOk =
        selectedCategory === "all" ||
        pin.category === selectedCategory ||
        (pin.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const timeOk =
        selectedTimePeriod === "all" ||
        pin.timePeriod === selectedTimePeriod;

      const neighOk =
        selectedNeighborhood === "all" ||
        pin.neighborhood === selectedNeighborhood;

      const titleText   = (pin.title || "").toLowerCase();
      const addressText = (pin.address || "").toLowerCase();
      const summaryText = (pin.summary || "").toLowerCase();
      const descText    = (pin.description || "").toLowerCase();
      const historyText = (pin.fullHistory || "").toLowerCase();
      const neighText   = (pin.neighborhood || "").toLowerCase();
      const eraText     = (pin.era || "").toLowerCase();
      const catText     = (pin.categoryLabel || "").toLowerCase();

      const searchOk =
        !q ||
        titleText.includes(q) ||
        addressText.includes(q) ||
        summaryText.includes(q) ||
        descText.includes(q) ||
        historyText.includes(q) ||
        neighText.includes(q) ||
        eraText.includes(q) ||
        catText.includes(q);

      return catOk && timeOk && neighOk && searchOk;
    });
  }, [selectedCategory, selectedTimePeriod, selectedNeighborhood, searchQuery, pins]);

  const selectedPin = useMemo(() => {
    if (!selectedPinId) return null;
    return filteredPins.find((pin) => pin.id === selectedPinId) ?? filteredPins[0] ?? null;
  }, [filteredPins, selectedPinId]);

  const handleReset = () => {
    setSelectedCategory("all");
    setSelectedTimePeriod("all");
    setSelectedNeighborhood("all");
    setSearchQuery("");
  };

  return (
    /* Fixed full-screen layout that starts exactly below the header */
    <div
      className="harita-page-root fixed left-0 right-0 bottom-0 flex"
      style={{ top: "var(--header-h)" }}
    >
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className="map-sidebar absolute z-20 flex h-full flex-col overflow-hidden border-r border-white/10 bg-[#0b1118] transition-all duration-300 md:relative md:z-auto"
        style={{ width: sidebarOpen ? "min(88vw, 360px)" : "0px" }}
        aria-label="Filtreler"
      >
        {/* Only render contents when open to avoid layout artifacts */}
        {sidebarOpen && (
          <MapFilterPanel
            selectedCategory={selectedCategory}
            selectedTimePeriod={selectedTimePeriod}
            selectedNeighborhood={selectedNeighborhood}
            searchQuery={searchQuery}
            resultCount={filteredPins.length}
            pins={filteredPins}
            selectedPinId={selectedPin?.id ?? null}
            onCategoryChange={setSelectedCategory}
            onTimePeriodChange={setSelectedTimePeriod}
            onNeighborhoodChange={setSelectedNeighborhood}
            onSearchChange={setSearchQuery}
            onPinSelect={(pin) => setSelectedPinId(pin.id)}
            onReset={handleReset}
          />
        )}
      </aside>

      {/* ── Mobile backdrop when sidebar open ────────── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Toggle sidebar button ────────────────────── */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="map-sidebar-toggle absolute bottom-6 z-[1300] flex h-10 w-9 items-center justify-center rounded-r-xl border border-l-0 border-white/15 bg-[#0b1118] text-[var(--muted)] shadow-lg transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
        style={{ left: sidebarOpen ? "min(88vw, 360px)" : "0px" }}
        id="sidebar-toggle"
        aria-label={sidebarOpen ? "Paneli kapat" : "Paneli aç"}
      >
        {sidebarOpen
          ? <PanelLeftClose size={15} />
          : <PanelLeftOpen size={15} />
        }
      </button>

      {/* ── Map ─────────────────────────────────────── */}
      <div className="relative h-full flex-1 bg-[#2aa8c5]">
        <InteractiveMap
          pins={filteredPins}
          selectedPin={selectedPin}
          onPinSelect={(pin) => setSelectedPinId(pin.id)}
          onClearSelection={() => setSelectedPinId(null)}
          onOpenPin={(pin) => setActivePin(pin)}
        />
      </div>

      {/* ── Landmark popup modal ─────────────────────── */}
      {activePin && (
        <LandmarkModal pin={activePin} onClose={() => setActivePin(null)} />
      )}
    </div>
  );
}
