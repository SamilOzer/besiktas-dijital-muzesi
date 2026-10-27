"use client";
import { Search, RotateCcw, ArrowUpRight } from "lucide-react";
import { NEIGHBORHOODS, TIME_PERIODS, PinLocation } from "@/data/besiktasPinData";
import { MAP_CATEGORY_COLORS } from "@/lib/map-theme";
const categories = [
  { id: "all", label: "Tümü" }, { id: "saraylar", label: "Saraylar" }, { id: "heykeller", label: "Anıtlar" },
  { id: "tarihi-yapilar", label: "Tarihi yapılar" }, { id: "dini-kamusal", label: "Dini ve kamusal" }, { id: "spor", label: "Spor" },
];
interface Props {
  searchQuery: string; selectedCategory: string; selectedTimePeriod: string; selectedNeighborhood: string; resultCount: number;
  onSearchChange: (value: string) => void; onCategoryChange: (value: string) => void;
  onTimePeriodChange: (value: string) => void; onNeighborhoodChange: (value: string) => void; onReset: () => void;
  pins: PinLocation[]; onOpenPin: (pin: PinLocation) => void;
}
export default function MapFilterPanel(props: Props) {
  const active = props.searchQuery || props.selectedCategory !== "all" || props.selectedTimePeriod !== "all" || props.selectedNeighborhood !== "all";
  return <div className="atlas-panel">
    <header><p className="section-kicker">Beşiktaş’ı yerinde tanıyın</p><h1>Kültür haritası</h1><p>Her sokakta başka bir hikâye.</p></header>
    <label className="atlas-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Mekân ara</span><input value={props.searchQuery} onChange={e => props.onSearchChange(e.target.value)} placeholder="Mekân veya mahalle ara…" type="search" /></label>
    <div className="atlas-scroll">
      <div className="atlas-categories" role="group" aria-label="Mekân kategorileri">{categories.map(cat => <button key={cat.id} id={"cat-" + cat.id} aria-pressed={props.selectedCategory === cat.id} onClick={() => props.onCategoryChange(cat.id)}>{cat.id !== "all" && <span style={{ background: MAP_CATEGORY_COLORS[cat.id] }} />}{cat.label}</button>)}</div>
      <div className="atlas-selects"><label className="field"><span>Tarihi dönem</span><select value={props.selectedTimePeriod} onChange={e => props.onTimePeriodChange(e.target.value)}>{TIME_PERIODS.map(p => <option key={p.id} value={p.id}>{p.id === "all" ? "Tüm dönemler" : p.range}</option>)}</select></label>
        <label className="field"><span>Mahalle</span><select value={props.selectedNeighborhood} onChange={e => props.onNeighborhoodChange(e.target.value)}>{NEIGHBORHOODS.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></label></div>
      <div className="atlas-count"><p role="status">{props.resultCount} mekân</p>{active && <button id="filter-reset" onClick={props.onReset}><RotateCcw size={12} aria-hidden="true" />Temizle</button>}</div>
      <div className="atlas-place-list">{props.pins.map(pin => <button key={pin.id} onClick={() => props.onOpenPin(pin)}><span><strong>{pin.title}</strong><small>{pin.neighborhood} / {pin.categoryLabel}</small></span><ArrowUpRight size={17} aria-hidden="true" /></button>)}</div>
      {props.resultCount === 0 && <div className="atlas-empty"><p>Bu filtrelerle bir mekân bulunamadı.</p><button className="text-link" onClick={props.onReset}>Tüm mekânları göster</button></div>}
    </div>
  </div>;
}
