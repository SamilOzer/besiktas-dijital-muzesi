"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Castle,
  ChevronDown,
  Church,
  Clock3,
  Landmark,
  Layers3,
  Map,
  MapPin,
  RotateCcw,
  Search,
  Trophy,
} from "lucide-react";
import { NEIGHBORHOODS, TIME_PERIODS } from "@/data/besiktasPinData";
import { MAP_CATEGORY_COLORS, MAP_TIME_PERIOD_COLORS } from "@/lib/map-theme";

const CATEGORIES: Array<{ id: string; label: string; icon: LucideIcon; color: string }> = [
  { id: "all", label: "Tümü", icon: Map, color: "#c6a25c" },
  { id: "heykeller", label: "Heykeller", icon: Landmark, color: MAP_CATEGORY_COLORS.heykeller },
  { id: "saraylar", label: "Saraylar", icon: Castle, color: MAP_CATEGORY_COLORS.saraylar },
  { id: "tarihi-yapilar", label: "Tarihi Yapılar", icon: Building2, color: MAP_CATEGORY_COLORS["tarihi-yapilar"] },
  { id: "spor", label: "Stadyum & Spor", icon: Trophy, color: MAP_CATEGORY_COLORS.spor },
  { id: "dini-kamusal", label: "Dini & Kamusal", icon: Church, color: MAP_CATEGORY_COLORS["dini-kamusal"] },
];

interface MapFilterPanelProps {
  searchQuery: string;
  selectedCategory: string;
  selectedTimePeriod: string;
  selectedNeighborhood: string;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTimePeriodChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onReset: () => void;
}

function FilterSection({
  title,
  icon: Icon,
  activeLabel,
  children,
}: {
  title: string;
  icon: LucideIcon;
  activeLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/5"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[var(--accent)]">
            <Icon size={15} strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              {title}
            </span>
            <span className="mt-0.5 block truncate text-[13px] font-medium text-white/85">
              {activeLabel}
            </span>
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-white/35 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

export default function MapFilterPanel({
  searchQuery,
  selectedCategory,
  selectedTimePeriod,
  selectedNeighborhood,
  resultCount,
  onSearchChange,
  onCategoryChange,
  onTimePeriodChange,
  onNeighborhoodChange,
  onReset,
}: MapFilterPanelProps) {
  const hasActiveFilter =
    searchQuery.length > 0 ||
    selectedCategory !== "all" ||
    selectedTimePeriod !== "all" ||
    selectedNeighborhood !== "all";

  const activeCategory = CATEGORIES.find((item) => item.id === selectedCategory)?.label ?? "Tümü";
  const activePeriod = TIME_PERIODS.find((item) => item.id === selectedTimePeriod)?.label ?? "Tüm dönemler";
  const activeNeighborhood =
    NEIGHBORHOODS.find((item) => item.id === selectedNeighborhood)?.label ?? "Tüm mahalleler";
  return (
    <div className="flex h-full min-w-[300px] flex-col text-white">
      <div className="shrink-0 border-b border-white/10 px-5 pb-5 pt-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          Beşiktaş Atlası
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="map-display-title text-[25px] font-semibold leading-[1.08] text-[#f7f2e8]">
              Kültür Haritası
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Semtin hafızasını sokak sokak keşfedin.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="block text-xl font-semibold tabular-nums text-[var(--accent)]">{resultCount}</span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/35">nokta</span>
          </div>
        </div>

        <label className="mt-5 flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 transition-colors focus-within:border-[var(--accent)]/55 focus-within:bg-white/[0.07]">
          <Search size={16} className="shrink-0 text-white/40" strokeWidth={1.8} />
          <span className="sr-only">Mekân ara</span>
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Mekân ara"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
          {hasActiveFilter && (
            <button
              type="button"
              onClick={onReset}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Filtreleri sıfırla"
              title="Filtreleri sıfırla"
              id="filter-reset"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-white/10">
          <FilterSection title="Kategori" icon={Layers3} activeLabel={activeCategory}>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map(({ id, label, icon: Icon, color }) => {
                const active = selectedCategory === id;
                return (
                  <button
                    type="button"
                    key={id}
                    id={`cat-${id}`}
                    onClick={() => onCategoryChange(id)}
                    className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] transition-colors"
                    style={{
                      color: active ? color : "rgba(255,255,255,0.58)",
                      borderColor: active ? `${color}7a` : "transparent",
                      background: active ? `${color}1f` : "rgba(255,255,255,0.035)",
                    }}
                  >
                    <Icon size={13} strokeWidth={1.8} />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Tarihi dönem" icon={Clock3} activeLabel={activePeriod}>
            <div className="space-y-1">
              {TIME_PERIODS.map(({ id, label, range }) => {
                const color = id === "all" ? "#b7bdc6" : MAP_TIME_PERIOD_COLORS[id] ?? "#c6a25c";
                const active = selectedTimePeriod === id;
                return (
                  <button
                    type="button"
                    key={id}
                    id={`period-${id}`}
                    onClick={() => onTimePeriodChange(id)}
                    className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors"
                    style={{
                      background: active ? `${color}18` : "rgba(255,255,255,0.035)",
                      borderColor: active ? `${color}60` : "transparent",
                      color: active ? color : "rgba(255,255,255,0.56)",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                      {label}
                    </span>
                    {range && <span className="text-[10px] opacity-60">{range}</span>}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Mahalle" icon={MapPin} activeLabel={activeNeighborhood}>
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {NEIGHBORHOODS.map(({ id, label }) => {
                const active = selectedNeighborhood === id;
                return (
                  <button
                    type="button"
                    key={id}
                    id={`neigh-${id}`}
                    onClick={() => onNeighborhoodChange(id)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      active
                        ? "border-[var(--accent)]/45 bg-[var(--accent)]/15 text-[var(--accent)]"
                        : "border-transparent bg-white/[0.035] text-white/55 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <MapPin size={12} strokeWidth={1.8} />
                    {label}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        </div>

      </div>
    </div>
  );
}
