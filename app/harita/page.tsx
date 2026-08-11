"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import LandmarkModal from "@/components/Map/LandmarkModal";
import MapFilterPanel from "@/components/Map/MapFilterPanel";
import { PinLocation, besiktasPinData } from "@/data/besiktasPinData";
import { normalizePinData } from "@/lib/db-service";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

// Leaflet must be client-only
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

  // Merge: start with localStorage, guarantee all besiktasPinData defaults exist
  const merged = [...stored];
  besiktasPinData.forEach((bp) => {
    if (!merged.some((p) => p.id === bp.id)) {
      merged.push(bp);
    }
  });

  const result = merged.map(normalizePinData);
  console.log(`[harita] loadAllPins: ${stored.length} from localStorage + defaults → ${result.length} total`);
  result.forEach((p, i) => console.log(`  ${i + 1}. [${p.id}] "${p.title}" coords=[${p.coordinates}]`));
  return result;
}

export default function HaritaPage() {
  const [selectedCategory,    setSelectedCategory]    = useState("all");
  const [selectedTimePeriod,  setSelectedTimePeriod]  = useState("all");
  const [selectedNeighborhood,setSelectedNeighborhood]= useState("all");
  const [searchQuery,         setSearchQuery]         = useState("");
  const [activePin,           setActivePin]           = useState<PinLocation | null>(null);
  const [sidebarOpen,         setSidebarOpen]         = useState(false); // default closed, opened after mount if desktop
  const [pins,                setPins]                = useState<PinLocation[]>([]);

  // Open sidebar by default on desktop only (after hydration)
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  const reloadPins = useCallback(() => {
    setPins(loadAllPins());
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
    const result = pins.filter((pin) => {
      const catOk   = selectedCategory    === "all" || pin.category    === selectedCategory;
      const timeOk  = selectedTimePeriod  === "all" || pin.timePeriod  === selectedTimePeriod;
      const neighOk = selectedNeighborhood=== "all" || pin.neighborhood=== selectedNeighborhood;
      const searchOk =
        !q ||
        pin.title.toLowerCase().includes(q) ||
        (pin.address || "").toLowerCase().includes(q) ||
        (pin.summary || "").toLowerCase().includes(q);

      return catOk && timeOk && neighOk && searchOk;
    });
    if (result.length !== pins.length) {
      console.log(`[harita] Filtered: ${pins.length} → ${result.length} pins (cat=${selectedCategory}, time=${selectedTimePeriod}, neigh=${selectedNeighborhood}, q=${q})`);
    }
    return result;
  }, [selectedCategory, selectedTimePeriod, selectedNeighborhood, searchQuery, pins]);

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
        className={`h-full flex flex-col border-r border-white/10 bg-[#14161d]/98 backdrop-blur-md transition-all duration-300 overflow-hidden
          ${sidebarOpen ? "w-[280px]" : "w-0"}
          absolute md:relative z-20 md:z-auto`
        }
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
            totalCount={pins.length}
            onCategoryChange={setSelectedCategory}
            onTimePeriodChange={setSelectedTimePeriod}
            onNeighborhoodChange={setSelectedNeighborhood}
            onSearchChange={setSearchQuery}
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
        className="absolute bottom-6 z-30 flex items-center justify-center w-8 h-8 rounded-r-xl bg-[#14161d] border border-l-0 border-white/15 text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-all shadow-lg"
        style={{ left: sidebarOpen ? "280px" : "0px" }}
        id="sidebar-toggle"
        aria-label={sidebarOpen ? "Paneli kapat" : "Paneli aç"}
      >
        {sidebarOpen
          ? <PanelLeftClose size={15} />
          : <PanelLeftOpen size={15} />
        }
      </button>

      {/* ── Map ─────────────────────────────────────── */}
      <div className="flex-1 h-full relative bg-[#0d0e12]">
        <InteractiveMap
          pins={filteredPins}
          onPinClick={(pin) => setActivePin(pin)}
        />
      </div>

      {/* ── Landmark popup modal ─────────────────────── */}
      {activePin && (
        <LandmarkModal pin={activePin} onClose={() => setActivePin(null)} />
      )}
    </div>
  );
}
