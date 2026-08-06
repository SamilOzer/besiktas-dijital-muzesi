"use client";
import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import LandmarkModal from "@/components/Map/LandmarkModal";
import MapFilterPanel from "@/components/Map/MapFilterPanel";
import { PinLocation } from "@/data/besiktasPinData";
import { fetchPinsFromDb } from "@/lib/db-service";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

// Leaflet must be client-only
const InteractiveMap = dynamic(
  () => import("@/components/Map/InteractiveMap"),
  { ssr: false }
);

export default function HaritaPage() {
  const [selectedCategory,    setSelectedCategory]    = useState("all");
  const [selectedTimePeriod,  setSelectedTimePeriod]  = useState("all");
  const [selectedNeighborhood,setSelectedNeighborhood]= useState("all");
  const [activePin,           setActivePin]           = useState<PinLocation | null>(null);
  const [sidebarOpen,         setSidebarOpen]         = useState(true);
  const [pins,                setPins]                = useState<PinLocation[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadPins = async () => {
      try {
        const data = await fetchPinsFromDb();
        if (isMounted) {
          setPins(data);
        }
      } catch (e) {
        console.error("Error loading pins:", e);
      }
    };

    loadPins();

    const handleUpdate = () => loadPins();
    window.addEventListener("besiktas_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("besiktas_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      const catOk   = selectedCategory    === "all" || pin.category    === selectedCategory;
      const timeOk  = selectedTimePeriod  === "all" || pin.timePeriod  === selectedTimePeriod;
      const neighOk = selectedNeighborhood=== "all" || pin.neighborhood=== selectedNeighborhood;
      return catOk && timeOk && neighOk;
    });
  }, [selectedCategory, selectedTimePeriod, selectedNeighborhood, pins]);

  const handleReset = () => {
    setSelectedCategory("all");
    setSelectedTimePeriod("all");
    setSelectedNeighborhood("all");
  };

  return (
    /* Fixed full-screen layout that starts exactly below the header */
    <div
      className="harita-page-root fixed left-0 right-0 bottom-0 flex"
      style={{ top: "var(--header-h)" }}
    >
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className="flex-shrink-0 h-full flex flex-col border-r border-white/10 bg-[#14161d]/95 backdrop-blur-md transition-all duration-300 overflow-hidden"
        style={{ width: sidebarOpen ? "280px" : "0px" }}
        aria-label="Filtreler"
      >
        {/* Only render contents when open to avoid layout artifacts */}
        {sidebarOpen && (
          <MapFilterPanel
            selectedCategory={selectedCategory}
            selectedTimePeriod={selectedTimePeriod}
            selectedNeighborhood={selectedNeighborhood}
            resultCount={filteredPins.length}
            onCategoryChange={setSelectedCategory}
            onTimePeriodChange={setSelectedTimePeriod}
            onNeighborhoodChange={setSelectedNeighborhood}
            onReset={handleReset}
          />
        )}
      </aside>

      {/* ── Toggle sidebar button ────────────────────── */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 bottom-6 z-30 flex items-center justify-center w-8 h-8 rounded-r-xl bg-[#14161d] border border-l-0 border-white/15 text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-all shadow-lg"
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
