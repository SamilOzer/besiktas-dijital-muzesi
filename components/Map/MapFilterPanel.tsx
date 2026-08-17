"use client";

import Image from "next/image";
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
import { NEIGHBORHOODS, PinLocation, TIME_PERIODS } from "@/data/besiktasPinData";
import { FEATURED_MAP_PIN_ORDER, getMapImage } from "@/lib/map-images";
import { MAP_CATEGORY_COLORS } from "@/lib/map-theme";

const CATEGORIES: Array<{ id: string; label: string; icon: LucideIcon; color: string }> = [
  { id: "all", label: "Tümü", icon: Map, color: "#c6a25c" },
  { id: "heykeller", label: "Heykeller", icon: Landmark, color: MAP_CATEGORY_COLORS.heykeller },
  { id: "saraylar", label: "Saraylar", icon: Castle, color: MAP_CATEGORY_COLORS.saraylar },
  { id: "tarihi-yapilar", label: "Tarihi Yapılar", icon: Building2, color: MAP_CATEGORY_COLORS["tarihi-yapilar"] },
  { id: "spor", label: "Stadyum & Spor", icon: Trophy, color: MAP_CATEGORY_COLORS.spor },
  { id: "dini-kamusal", label: "Dini & Kamusal", icon: Church, color: MAP_CATEGORY_COLORS["dini-kamusal"] },
];

const TIME_PERIOD_COLORS: Record<string, string> = {
  "1400-1600": "#c6a25c",
  "1600-1800": "#8065a8",
  "1800-1850": "#467ca4",
  "1850-1900": "#4f8b7e",
  "1900-1960": "#b85e48",
};

interface MapFilterPanelProps {
  searchQuery: string;
  selectedCategory: string;
  selectedTimePeriod: string;
  selectedNeighborhood: string;
  resultCount: number;
  pins: PinLocation[];
  selectedPinId: string | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTimePeriodChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onPinSelect: (pin: PinLocation) => void;
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
  pins,
  selectedPinId,
  onSearchChange,
  onCategoryChange,
  onTimePeriodChange,
  onNeighborhoodChange,
  onPinSelect,
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
  const displayedPins = [...pins].sort((left, right) => {
    const leftIndex = FEATURED_MAP_PIN_ORDER.indexOf(left.id as (typeof FEATURED_MAP_PIN_ORDER)[number]);
    const rightIndex = FEATURED_MAP_PIN_ORDER.indexOf(right.id as (typeof FEATURED_MAP_PIN_ORDER)[number]);
    const leftRank = leftIndex === -1 ? FEATURED_MAP_PIN_ORDER.length : leftIndex;
    const rightRank = rightIndex === -1 ? FEATURED_MAP_PIN_ORDER.length : rightIndex;
    return leftRank - rightRank;
  });

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
                const color = id === "all" ? "#b7bdc6" : TIME_PERIOD_COLORS[id] ?? "#c6a25c";
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

        <section className="px-5 py-5" aria-labelledby="nearby-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="nearby-title" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/55">
              Haritadaki noktalar
            </h2>
            <span className="text-[10px] text-white/30">İlk {Math.min(pins.length, 3)}</span>
          </div>

          {pins.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-xs text-white/40">
              Bu filtrelerle eşleşen bir mekân bulunamadı.
            </div>
          ) : (
            <div className="space-y-1">
              {displayedPins.slice(0, 3).map((pin) => {
                const active = selectedPinId === pin.id;
                const imageSrc = getMapImage(pin);
                const pinColor = MAP_CATEGORY_COLORS[pin.category] ?? "#c6a25c";
                return (
                  <button
                    type="button"
                    key={pin.id}
                    onClick={() => onPinSelect(pin)}
                    className="group flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-colors hover:bg-white/5"
                    style={{
                      borderColor: active ? `${pinColor}8a` : "transparent",
                      background: active ? `${pinColor}17` : undefined,
                    }}
                  >
                    <span className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-lg bg-white/5">
                      <span className="absolute inset-0 flex items-center justify-center text-white/30">
                        <Landmark size={20} />
                      </span>
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={`${pin.title} görünümü`}
                          fill
                          unoptimized={imageSrc.startsWith("http")}
                          sizes="72px"
                          className="z-10 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-white/90">{pin.title}</span>
                      <span className="mt-1 block truncate text-[11px]" style={{ color: pinColor }}>
                        {pin.categoryLabel}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-white/35">{pin.era}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
