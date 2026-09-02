"use client";

import { createElement, useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Image from "next/image";
import maplibregl, { Map as MapLibreMap, Marker as MapLibreMarker, Popup } from "maplibre-gl";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  Castle,
  Check,
  Church,
  Compass,
  Landmark,
  Layers3,
  LocateFixed,
  Minus,
  Plus,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { PinLocation } from "@/data/besiktasPinData";
import { getMapImage } from "@/lib/map-images";
import { MAP_CATEGORY_COLORS, MAP_CATEGORY_LEGEND } from "@/lib/map-theme";

interface InteractiveMapProps {
  pins: PinLocation[];
  selectedPin: PinLocation | null;
  onPinSelect: (pin: PinLocation) => void;
  onClearSelection: () => void;
  onOpenPin: (pin: PinLocation) => void;
}

const BESIKTAS_CENTER: [number, number] = [29.016, 41.0525];
const DEFAULT_ZOOM = 13.35;
const DEFAULT_PITCH = 38;
const DEFAULT_BEARING = -10;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  heykeller: Landmark,
  saraylar: Castle,
  "tarihi-yapilar": Building2,
  spor: Trophy,
  "dini-kamusal": Church,
};

const MAP_STYLES = {
  museum: {
    label: "Müze atlası",
    description: "Canlı renkler ve 3D yapılar",
    url: "https://tiles.openfreemap.org/styles/liberty",
    pitch: DEFAULT_PITCH,
  },
  calm: {
    label: "Sade atlas",
    description: "Düşük yoğunluklu kent görünümü",
    url: "https://tiles.openfreemap.org/styles/positron",
    pitch: 24,
  },
} as const;

type MapStyleKey = keyof typeof MAP_STYLES;
type MarkerRecord = { marker: MapLibreMarker; popup: Popup; element: HTMLButtonElement };

function buildTooltip(pin: PinLocation) {
  const content = document.createElement("div");
  content.className = "culture-tooltip-content";

  const title = document.createElement("strong");
  title.textContent = pin.title;
  content.appendChild(title);

  const meta = document.createElement("span");
  meta.textContent = `${pin.categoryLabel} · ${pin.neighborhood}`;
  content.appendChild(meta);

  return content;
}

function setPaintSafely(map: MapLibreMap, layerId: string, property: string, value: unknown) {
  try {
    map.setPaintProperty(layerId, property, value as never);
  } catch {
    // Some provider layers do not expose every paint property.
  }
}

function setLayoutSafely(map: MapLibreMap, layerId: string, property: string, value: unknown) {
  try {
    map.setLayoutProperty(layerId, property, value as never);
  } catch {
    // Keep the provider default when the property is unsupported.
  }
}

function applyMuseumPalette(map: MapLibreMap, styleKey: MapStyleKey) {
  const style = map.getStyle();
  const layers = style.layers ?? [];
  const isMuseum = styleKey === "museum";

  layers.forEach((layer) => {
    const sourceLayer = "source-layer" in layer ? String(layer["source-layer"] ?? "") : "";
    const key = `${layer.id} ${sourceLayer}`.toLowerCase();

    if (layer.type === "background") {
      setPaintSafely(map, layer.id, "background-color", isMuseum ? "#efe8da" : "#f4f6f4");
      return;
    }

    if (layer.type === "fill") {
      if (/water|ocean|river|lake/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#22a6c2" : "#82cad8");
        setPaintSafely(map, layer.id, "fill-opacity", 1);
        setPaintSafely(map, layer.id, "fill-outline-color", isMuseum ? "#14859e" : "#66b9ca");
      } else if (/beach|sand/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#ead29d" : "#efe4c8");
        setPaintSafely(map, layer.id, "fill-opacity", 0.95);
      } else if (/park|wood|forest|grass|garden|nature|green/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#96c875" : "#d6e6c8");
        setPaintSafely(map, layer.id, "fill-outline-color", isMuseum ? "#77ae5c" : "#bfd6ae");
        setPaintSafely(map, layer.id, "fill-opacity", 0.94);
      } else if (/pitch|stadium|sport/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#9ed1aa" : "#d5e8d9");
        setPaintSafely(map, layer.id, "fill-outline-color", isMuseum ? "#6eae81" : "#b8d6c0");
        setPaintSafely(map, layer.id, "fill-opacity", 0.92);
      } else if (/hospital|medical/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#f0d3d0" : "#f3e5e3");
        setPaintSafely(map, layer.id, "fill-opacity", 0.88);
      } else if (/school|university|college/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#eadcaa" : "#eee8d0");
        setPaintSafely(map, layer.id, "fill-opacity", 0.88);
      } else if (/building/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#d7cab9" : "#e8ece9");
        setPaintSafely(map, layer.id, "fill-outline-color", isMuseum ? "#afa291" : "#c8d2cd");
        setPaintSafely(map, layer.id, "fill-opacity", isMuseum ? 0.92 : 0.62);
      } else if (/commercial|retail/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#efd7c7" : "#f0e8e2");
        setPaintSafely(map, layer.id, "fill-opacity", 0.78);
      } else if (/industrial/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#dcd5e8" : "#e8e5ec");
        setPaintSafely(map, layer.id, "fill-opacity", 0.78);
      } else if (/residential/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#ede4d6" : "#eef1ef");
        setPaintSafely(map, layer.id, "fill-opacity", 0.8);
      } else if (/landuse|landcover/.test(key)) {
        setPaintSafely(map, layer.id, "fill-color", isMuseum ? "#e5dfd1" : "#eef1ef");
        setPaintSafely(map, layer.id, "fill-opacity", 0.72);
      }
      return;
    }

    if (layer.type === "line") {
      if (/water|river|stream|canal/.test(key)) {
        setPaintSafely(map, layer.id, "line-color", isMuseum ? "#168aa5" : "#6bc9db");
      } else if (/motorway|trunk/.test(key)) {
        setPaintSafely(map, layer.id, "line-color", isMuseum ? "#b86c2e" : "#cfab58");
      } else if (/primary/.test(key)) {
        setPaintSafely(map, layer.id, "line-color", isMuseum ? "#d49a45" : "#e1c983");
      } else if (/secondary|tertiary/.test(key)) {
        setPaintSafely(map, layer.id, "line-color", isMuseum ? "#e5c47b" : "#f1e5c3");
      } else if (/rail/.test(key)) {
        setPaintSafely(map, layer.id, "line-color", isMuseum ? "#876d6a" : "#9ba3a0");
        setPaintSafely(map, layer.id, "line-opacity", isMuseum ? 0.72 : 0.48);
      } else if (/road|street|transportation/.test(key)) {
        setPaintSafely(map, layer.id, "line-color", isMuseum ? "#fffaf0" : "#f8f5ee");
      } else if (/boundary|admin/.test(key)) {
        setPaintSafely(map, layer.id, "line-color", isMuseum ? "#777f78" : "#a9b0a4");
        setPaintSafely(map, layer.id, "line-opacity", isMuseum ? 0.58 : 0.42);
      }
      return;
    }

    if (layer.type === "symbol") {
      if (/poi/.test(key)) {
        setLayoutSafely(map, layer.id, "visibility", "none");
        return;
      }

      if (/water/.test(key)) {
        setPaintSafely(map, layer.id, "text-color", isMuseum ? "#086f88" : "#147e99");
        setPaintSafely(map, layer.id, "text-halo-color", "rgba(255,255,255,0.75)");
      } else if (/park|wood|forest|garden/.test(key)) {
        setPaintSafely(map, layer.id, "text-color", isMuseum ? "#3f763b" : "#5d7856");
        setPaintSafely(map, layer.id, "text-halo-color", isMuseum ? "#edf3e5" : "#f7faf8");
      } else if (/road|street/.test(key)) {
        setPaintSafely(map, layer.id, "text-color", isMuseum ? "#6a5c4f" : "#6c726e");
        setPaintSafely(map, layer.id, "text-halo-color", isMuseum ? "#fffaf0" : "#f7faf8");
      } else {
        setPaintSafely(map, layer.id, "text-color", isMuseum ? "#253944" : "#334b56");
        setPaintSafely(map, layer.id, "text-halo-color", isMuseum ? "#f7f1e6" : "#f7faf8");
      }
      setPaintSafely(map, layer.id, "text-halo-width", 1.35);
      setPaintSafely(map, layer.id, "text-halo-blur", 0.35);
    }
  });

  if (map.getLayer("museum-3d-buildings")) return;

  const vectorSourceId = Object.entries(style.sources ?? {}).find(([, source]) => source.type === "vector")?.[0];
  const firstLabelLayer = layers.find((layer) => layer.type === "symbol")?.id;

  if (!vectorSourceId) return;

  try {
    map.addLayer(
      {
        id: "museum-3d-buildings",
        source: vectorSourceId,
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 13.2,
        paint: {
          "fill-extrusion-color": ["interpolate", ["linear"], ["zoom"], 13.2, "#dacdbb", 16, "#bca88d"],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            13.2,
            0,
            14.5,
            ["coalesce", ["get", "render_height"], ["get", "height"], 7],
          ],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
          "fill-extrusion-opacity": styleKey === "museum" ? 0.88 : 0.5,
          "fill-extrusion-vertical-gradient": true,
        },
      },
      firstLabelLayer
    );
  } catch {
    // The live provider can change source-layer names; the 2D map remains usable.
  }
}

function buildMarkerElement(pin: PinLocation, selected: boolean) {
  const Icon = CATEGORY_ICONS[pin.category] ?? Landmark;
  const color = MAP_CATEGORY_COLORS[pin.category] ?? "#c18a38";
  const element = document.createElement("button");
  element.type = "button";
  element.className = `museum-map-marker${selected ? " is-selected" : ""}`;
  element.style.setProperty("--marker-color", color);
  element.setAttribute("aria-label", `${pin.title} — ${pin.categoryLabel}`);
  element.setAttribute("title", pin.title);
  element.innerHTML = renderToStaticMarkup(
    createElement(Icon, { size: selected ? 21 : 18, strokeWidth: 2, "aria-hidden": true })
  );
  return element;
}

export default function InteractiveMap({
  pins,
  selectedPin,
  onPinSelect,
  onClearSelection,
  onOpenPin,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MarkerRecord[]>([]);
  const onPinSelectRef = useRef(onPinSelect);
  const mapStyleRef = useRef<MapStyleKey>("museum");
  const activeMapStyleRef = useRef<MapStyleKey>("museum");
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("museum");
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const selectedPinImage = selectedPin ? getMapImage(selectedPin) : null;

  useEffect(() => {
    onPinSelectRef.current = onPinSelect;
  }, [onPinSelect]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.museum.url,
      center: BESIKTAS_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      minZoom: 11.5,
      maxZoom: 19,
      attributionControl: false,
      fadeDuration: 500,
      maxBounds: [
        [28.82, 40.93],
        [29.22, 41.19],
      ],
    });

    const handleStyleLoad = () => {
      applyMuseumPalette(map, mapStyleRef.current);
      setMapReady(true);
    };
    const handleZoom = () => setZoomLevel(Math.round(map.getZoom() * 10) / 10);

    map.on("style.load", handleStyleLoad);
    map.on("zoom", handleZoom);
    mapRef.current = map;

    return () => {
      markersRef.current.forEach(({ marker, popup }) => {
        popup.remove();
        marker.remove();
      });
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || activeMapStyleRef.current === mapStyle) return;

    const selectedStyle = MAP_STYLES[mapStyle];
    activeMapStyleRef.current = mapStyle;
    mapStyleRef.current = mapStyle;
    setMapReady(false);
    map.setStyle(selectedStyle.url);
    map.easeTo({ pitch: selectedStyle.pitch, bearing: mapStyle === "museum" ? DEFAULT_BEARING : -4, duration: 650 });
  }, [mapReady, mapStyle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach(({ marker, popup }) => {
      popup.remove();
      marker.remove();
    });
    markersRef.current = pins.map((pin) => {
      const selected = selectedPin?.id === pin.id;
      const element = buildMarkerElement(pin, selected);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 26, className: "museum-map-popup" })
        .setDOMContent(buildTooltip(pin));
      const [lat, lng] = pin.coordinates;
      const marker = new maplibregl.Marker({ element, anchor: "center" }).setLngLat([lng, lat]).addTo(map);

      const showPopup = () => popup.setLngLat([lng, lat]).addTo(map);
      const hidePopup = () => popup.remove();
      const selectPin = () => {
        onPinSelectRef.current(pin);
        map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 14.2), duration: 650 });
      };

      element.addEventListener("mouseenter", showPopup);
      element.addEventListener("mouseleave", hidePopup);
      element.addEventListener("focus", showPopup);
      element.addEventListener("blur", hidePopup);
      element.addEventListener("click", selectPin);

      return { marker, popup, element };
    });
  }, [pins, selectedPin?.id, mapReady]);

  const zoomIn = () => mapRef.current?.zoomIn({ duration: 350 });
  const zoomOut = () => mapRef.current?.zoomOut({ duration: 350 });
  const returnToBesiktas = () =>
    mapRef.current?.easeTo({
      center: BESIKTAS_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: MAP_STYLES[mapStyle].pitch,
      bearing: mapStyle === "museum" ? DEFAULT_BEARING : -4,
      duration: 900,
    });

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#24a8c6]">
      <div ref={mapContainerRef} id="besiktas-interactive-map" className="absolute inset-0 h-full w-full" />

      {!mapReady && (
        <div className="pointer-events-none absolute inset-0 z-[8] flex items-center justify-center bg-[#edf3ef]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-white/90 px-5 py-3 text-slate-700 shadow-xl">
            <Sparkles size={17} className="animate-pulse text-[#b17e32]" />
            <span className="text-xs font-semibold">Vektör atlas hazırlanıyor</span>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-5 top-5 z-[10] hidden w-[270px] overflow-hidden rounded-2xl border border-slate-900/10 bg-white/92 shadow-xl backdrop-blur-xl sm:block">
        <div className="border-b border-slate-900/8 px-4 py-3">
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#a06f28]">
            <Compass size={13} /> 3D kültür atlası
          </span>
          <span className="mt-1 block text-xs font-semibold text-slate-800">Beşiktaş · {pins.length} kültür noktası</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 py-3">
          {MAP_CATEGORY_LEGEND.map((item) => (
            <span key={item.id} className="flex items-center gap-2 text-[9px] font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ background: MAP_CATEGORY_COLORS[item.id] }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {selectedPin && (
        <aside className="map-place-preview absolute bottom-6 left-1/2 z-[10] flex w-[min(420px,calc(100%-40px))] -translate-x-1/2 overflow-hidden rounded-[18px] border border-white/10 bg-[#0b1118]/96 p-2.5 text-white shadow-2xl backdrop-blur-xl sm:p-3">
          <div className="relative h-[112px] w-[116px] shrink-0 overflow-hidden rounded-[13px] bg-white/5 sm:h-[124px] sm:w-[148px]">
            {selectedPinImage ? (
              <Image
                src={selectedPinImage}
                alt={`${selectedPin.title} görünümü`}
                fill
                unoptimized={selectedPinImage.startsWith("http")}
                sizes="148px"
                className="object-cover"
                loading="eager"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/30">
                <Landmark size={28} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 px-3 py-1.5 sm:px-4 sm:py-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)] sm:text-[10px] sm:tracking-[0.15em]">Seçili kültür noktası</p>
            <h2 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-white sm:text-[16px]">{selectedPin.title}</h2>
            <p className="mt-1 truncate text-[11px] text-white/50">{selectedPin.categoryLabel} · {selectedPin.era}</p>
            <button
              type="button"
              onClick={() => onOpenPin(selectedPin)}
              className="mt-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--accent)] px-3 py-2 text-[11px] font-semibold text-[#11161c] transition-colors hover:bg-[#dfbd73] sm:mt-3 sm:gap-2 sm:px-3.5"
            >
              Detayı Gör <ArrowRight size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={onClearSelection}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white/65 transition-colors hover:bg-black/70 hover:text-white"
            aria-label="Seçimi kapat"
          >
            <X size={14} />
          </button>
        </aside>
      )}

      <div className="absolute bottom-6 right-5 z-[10] flex flex-col items-end gap-2">
        {layerMenuOpen && (
          <div className="mb-1 w-60 overflow-hidden rounded-2xl border border-slate-900/10 bg-white/96 p-2 text-slate-900 shadow-2xl backdrop-blur-xl">
            <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Harita görünümü</p>
            {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => {
              const style = MAP_STYLES[key];
              const active = mapStyle === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setMapStyle(key);
                    setLayerMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${active ? "bg-[#edf4ef]" : "hover:bg-slate-100"}`}
                >
                  <span>
                    <span className="block text-xs font-semibold">{style.label}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-500">{style.description}</span>
                  </span>
                  {active && <Check size={15} className="text-[#21857d]" />}
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setLayerMenuOpen((value) => !value)}
          className="map-control-button"
          aria-label="Harita görünümünü değiştir"
          aria-expanded={layerMenuOpen}
        >
          <Layers3 size={18} />
        </button>
        <button type="button" onClick={returnToBesiktas} className="map-control-button" aria-label="Beşiktaş'a dön">
          <LocateFixed size={18} />
        </button>
        <div className="overflow-hidden rounded-xl border border-slate-900/10 bg-white/95 shadow-xl backdrop-blur-md">
          <button type="button" onClick={zoomIn} className="map-control-button rounded-none border-0 shadow-none" aria-label="Yakınlaştır">
            <Plus size={18} />
          </button>
          <div className="mx-2 h-px bg-slate-900/10" />
          <button type="button" onClick={zoomOut} className="map-control-button rounded-none border-0 shadow-none" aria-label="Uzaklaştır">
            <Minus size={18} />
          </button>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-2 right-5 z-[9] text-[9px] font-medium text-slate-700/65">
        © OpenStreetMap · OpenFreeMap · {zoomLevel.toFixed(1)}x
      </p>
    </div>
  );
}
