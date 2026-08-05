"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Layers, Clock, MapPin } from "lucide-react";
import { TIME_PERIODS, NEIGHBORHOODS } from "@/data/besiktasPinData";

const CATEGORIES = [
  { id: "all",           label: "Tümü",             emoji: "🗺️" },
  { id: "heykeller",     label: "Heykeller",         emoji: "🗿" },
  { id: "saraylar",      label: "Saraylar",          emoji: "🏰" },
  { id: "tarihi-yapilar",label: "Tarihi Yapılar",    emoji: "🏛️" },
  { id: "spor",          label: "Stadyum & Spor",    emoji: "🏟️" },
  { id: "dini-kamusal",  label: "Dini & Kamusal",    emoji: "⛪" },
];

const TIME_PERIOD_COLORS: Record<string, string> = {
  "1400-1600": "#c5a059",
  "1600-1800": "#9b6fd0",
  "1800-1850": "#4a9ead",
  "1850-1900": "#5a9a6b",
  "1900-1960": "#e85d3a",
};

interface MapFilterPanelProps {
  selectedCategory: string;
  selectedTimePeriod: string;
  selectedNeighborhood: string;
  resultCount: number;
  onCategoryChange: (v: string) => void;
  onTimePeriodChange: (v: string) => void;
  onNeighborhoodChange: (v: string) => void;
  onReset: () => void;
}

function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/8 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/4 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp size={14} className="text-[var(--muted)]" /> : <ChevronDown size={14} className="text-[var(--muted)]" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function MapFilterPanel({
  selectedCategory,
  selectedTimePeriod,
  selectedNeighborhood,
  resultCount,
  onCategoryChange,
  onTimePeriodChange,
  onNeighborhoodChange,
  onReset,
}: MapFilterPanelProps) {
  const hasActiveFilter =
    selectedCategory !== "all" ||
    selectedTimePeriod !== "all" ||
    selectedNeighborhood !== "all";

  return (
    <div className="flex flex-col h-full">
      {/* ─── Panel header ─── */}
      <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
        <h1 className="text-base font-bold text-white leading-tight">
          Beşiktaş Kültür Haritası
        </h1>
        <p className="text-[11px] text-[var(--muted)] mt-0.5">
          Tarihi mekânları keşfedin
        </p>

        {/* Result count + reset */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-[var(--muted)]">
            <span className="text-[var(--accent)] font-bold text-sm">{resultCount}</span>
            {" "}mekân
          </span>
          {hasActiveFilter && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/6"
              id="filter-reset"
            >
              <RotateCcw size={11} />
              Sıfırla
            </button>
          )}
        </div>
      </div>

      {/* ─── Scrollable filter area ─── */}
      <div className="flex-1 overflow-y-auto">

        {/* 1. Kategori */}
        <Section title="Kategori" icon={<Layers size={12} />} defaultOpen={false}>
          <div className="flex flex-col gap-1">
            {CATEGORIES.map(({ id, label, emoji }) => (
              <button
                key={id}
                id={`cat-${id}`}
                onClick={() => onCategoryChange(id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-left transition-all ${
                  selectedCategory === id
                    ? "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 font-semibold"
                    : "text-[var(--muted)] hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <span className="text-sm">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* 2. Dönem / Time Period */}
        <Section title="Tarihi Dönem" icon={<Clock size={12} />} defaultOpen={false}>
          <div className="flex flex-col gap-1">
            {TIME_PERIODS.map(({ id, label, range }) => {
              const color = id === "all" ? "#9ca3af" : TIME_PERIOD_COLORS[id] ?? "#c5a059";
              const isActive = selectedTimePeriod === id;
              return (
                <button
                  key={id}
                  id={`period-${id}`}
                  onClick={() => onTimePeriodChange(id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs text-left transition-all border ${
                    isActive
                      ? "font-semibold"
                      : "border-transparent text-[var(--muted)] hover:bg-white/5 hover:text-white"
                  }`}
                  style={
                    isActive
                      ? {
                          background: `${color}18`,
                          color,
                          borderColor: `${color}40`,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2">
                    {id !== "all" && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                    )}
                    {id === "all" && <span className="w-2 h-2" />}
                    <span>{label}</span>
                  </div>
                  {range && (
                    <span
                      className="text-[10px] opacity-70 font-mono tabular-nums"
                      style={{ color }}
                    >
                      {range}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Timeline visual */}
          <div className="mt-4 px-1">
            <div className="relative h-1.5 rounded-full bg-white/8 overflow-hidden">
              {(["1400-1600","1600-1800","1800-1850","1850-1900","1900-1960"] as const).map(
                (period, i) => (
                  <div
                    key={period}
                    className="absolute top-0 h-full transition-opacity duration-200"
                    style={{
                      left: `${i * 20}%`,
                      width: "20%",
                      background: TIME_PERIOD_COLORS[period],
                      opacity: selectedTimePeriod === "all" || selectedTimePeriod === period ? 1 : 0.2,
                    }}
                  />
                )
              )}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-white/30 font-mono">
              <span>1400</span>
              <span>1600</span>
              <span>1800</span>
              <span>1900</span>
              <span>1960</span>
            </div>
          </div>
        </Section>

        {/* 3. Mahalle */}
        <Section title="Mahalle" icon={<MapPin size={12} />} defaultOpen={false}>
          <div className="flex flex-col gap-1">
            {NEIGHBORHOODS.map(({ id, label }) => (
              <button
                key={id}
                id={`neigh-${id}`}
                onClick={() => onNeighborhoodChange(id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-left transition-all ${
                  selectedNeighborhood === id
                    ? "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 font-semibold"
                    : "text-[var(--muted)] hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <span className="text-[10px]">{id === "all" ? "🗺️" : "📍"}</span>
                {label}
              </button>
            ))}
          </div>
        </Section>
      </div>

    </div>
  );
}
