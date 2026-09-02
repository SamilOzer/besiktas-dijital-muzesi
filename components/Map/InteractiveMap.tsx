"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import maplibregl, { GeoJSONSource, Map as MapLibreMap, Popup } from "maplibre-gl";
import {
  ArrowRight,
  Check,
  Compass,
  Landmark,
  Layers3,
  LocateFixed,
  Minus,
  Plus,
  Sparkles,
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
const DEFAULT_PITCH = 52;
const DEFAULT_BEARING = -14;
const PIN_SOURCE_ID = "museum-pins";
const PIN_HALO_LAYER_ID = "museum-pin-halo";
const PIN_LAYER_ID = "museum-pin-points";
const PIN_CORE_LAYER_ID = "museum-pin-core";
const SELECTED_PIN_LAYER_ID = "museum-selected-pin";
const CLUSTER_HALO_LAYER_ID = "museum-cluster-halo";
const CLUSTER_LAYER_ID = "museum-clusters";
const CLUSTER_COUNT_LAYER_ID = "museum-cluster-count";

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

type PinFeatureProperties = {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  neighborhood: string;
};

function pinsToGeoJson(pins: PinLocation[]): GeoJSON.FeatureCollection<GeoJSON.Point, PinFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: pins.map((pin) => {
      const [lat, lng] = pin.coordinates;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: {
          id: pin.id,
          title: pin.title,
          category: pin.category,
          categoryLabel: pin.categoryLabel,
          neighborhood: pin.neighborhood,
        },
      };
    }),
  };
}

const PIN_COLOR_EXPRESSION: maplibregl.ExpressionSpecification = [
  "match",
  ["get", "category"],
  "heykeller",
  MAP_CATEGORY_COLORS.heykeller,
  "saraylar",
  MAP_CATEGORY_COLORS.saraylar,
  "tarihi-yapilar",
  MAP_CATEGORY_COLORS["tarihi-yapilar"],
  "spor",
  MAP_CATEGORY_COLORS.spor,
  "dini-kamusal",
  MAP_CATEGORY_COLORS["dini-kamusal"],
  "#c18a38",
];

function addPinLayers(map: MapLibreMap, pins: PinLocation[], selectedPinId: string | null) {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  map.addSource(PIN_SOURCE_ID, {
    type: "geojson",
    data: pinsToGeoJson(pins),
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: isMobile ? 38 : 54,
  });

  map.addLayer({
    id: CLUSTER_HALO_LAYER_ID,
    type: "circle",
    source: PIN_SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#ffffff",
      "circle-opacity": 0.36,
      "circle-radius": ["step", ["get", "point_count"], isMobile ? 18 : 27, 6, isMobile ? 22 : 32, 12, isMobile ? 26 : 37],
      "circle-blur": 0.25,
    },
  });

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: "circle",
    source: PIN_SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": ["step", ["get", "point_count"], "#1d7871", 6, "#356f93", 12, "#72569a"],
      "circle-radius": ["step", ["get", "point_count"], isMobile ? 13 : 20, 6, isMobile ? 16 : 25, 12, isMobile ? 20 : 30],
      "circle-stroke-color": "rgba(255,255,255,0.96)",
      "circle-stroke-width": isMobile ? 2 : 3,
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: "symbol",
    source: PIN_SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["Noto Sans Regular"],
      "text-size": isMobile ? 10 : 12,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": "rgba(10,18,24,0.22)",
      "text-halo-width": 0.7,
    },
  });

  map.addLayer({
    id: PIN_HALO_LAYER_ID,
    type: "circle",
    source: PIN_SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": PIN_COLOR_EXPRESSION,
      "circle-radius": isMobile ? 12 : 23,
      "circle-opacity": 0.2,
      "circle-blur": 0.3,
    },
  });

  map.addLayer({
    id: PIN_LAYER_ID,
    type: "circle",
    source: PIN_SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": PIN_COLOR_EXPRESSION,
      "circle-radius": isMobile ? 8 : 15,
      "circle-stroke-color": "rgba(255,255,255,0.98)",
      "circle-stroke-width": isMobile ? 2 : 3,
    },
  });

  map.addLayer({
    id: PIN_CORE_LAYER_ID,
    type: "circle",
    source: PIN_SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "rgba(255,255,255,0.94)",
      "circle-radius": isMobile ? 2 : 3.2,
    },
  });

  map.addLayer({
    id: SELECTED_PIN_LAYER_ID,
    type: "circle",
    source: PIN_SOURCE_ID,
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "id"], selectedPinId ?? "__none__"]],
    paint: {
      "circle-color": "rgba(255,255,255,0.08)",
      "circle-radius": isMobile ? 12 : 21,
      "circle-stroke-color": "#d6ae59",
      "circle-stroke-width": isMobile ? 2.5 : 4,
    },
  });
}

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
        minzoom: 12.7,
        paint: {
          "fill-extrusion-color": ["interpolate", ["linear"], ["zoom"], 12.7, "#e5d8c7", 16, "#ae9676"],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12.7,
            0,
            13.15,
            ["coalesce", ["get", "render_height"], ["get", "height"], 7],
          ],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
          "fill-extrusion-opacity": styleKey === "museum" ? 0.92 : 0.48,
          "fill-extrusion-vertical-gradient": true,
        },
      },
      firstLabelLayer
    );
  } catch {
    // The live provider can change source-layer names; the 2D map remains usable.
  }
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
  const onPinSelectRef = useRef(onPinSelect);
  const pinsRef = useRef(pins);
  const pinIndexRef = useRef(new Map(pins.map((pin) => [pin.id, pin])));
  const selectedPinIdRef = useRef<string | null>(selectedPin?.id ?? null);
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
    pinsRef.current = pins;
    pinIndexRef.current = new Map(pins.map((pin) => [pin.id, pin]));
    selectedPinIdRef.current = selectedPin?.id ?? null;
  }, [pins, selectedPin?.id]);

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
      addPinLayers(map, pinsRef.current, selectedPinIdRef.current);
      setMapReady(true);
    };
    const handleZoom = () => setZoomLevel(Math.round(map.getZoom() * 10) / 10);
    const hoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 18,
      className: "museum-map-popup",
    });
    let hoveredPinId: string | null = null;

    const interactiveLayers = () =>
      [CLUSTER_LAYER_ID, PIN_LAYER_ID, SELECTED_PIN_LAYER_ID].filter((layerId) => Boolean(map.getLayer(layerId)));

    const handleMapClick = async (event: maplibregl.MapMouseEvent) => {
      const layers = interactiveLayers();
      if (layers.length === 0) return;

      const feature = map.queryRenderedFeatures(event.point, { layers })[0];
      if (!feature || feature.geometry.type !== "Point") return;
      const coordinates = feature.geometry.coordinates as [number, number];

      if (feature.properties?.cluster) {
        const source = map.getSource(PIN_SOURCE_ID) as GeoJSONSource | undefined;
        const clusterId = Number(feature.properties.cluster_id);
        if (!source || !Number.isFinite(clusterId)) return;
        const expansionZoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: coordinates,
          zoom: expansionZoom,
          pitch: mapStyleRef.current === "museum" ? DEFAULT_PITCH : MAP_STYLES.calm.pitch,
          duration: 650,
        });
        return;
      }

      const pinId = String(feature.properties?.id ?? "");
      const pin = pinIndexRef.current.get(pinId);
      if (!pin) return;
      onPinSelectRef.current(pin);
      map.easeTo({
        center: coordinates,
        zoom: Math.max(map.getZoom(), 14.25),
        pitch: mapStyleRef.current === "museum" ? 56 : MAP_STYLES.calm.pitch,
        duration: 650,
      });
    };

    const handlePointerMove = (event: maplibregl.MapMouseEvent) => {
      const layers = interactiveLayers();
      if (layers.length === 0) return;
      const features = map.queryRenderedFeatures(event.point, { layers });
      const feature = features.find((item) => !item.properties?.cluster && item.properties?.id);
      map.getCanvas().style.cursor = features.length > 0 ? "pointer" : "";

      if (!feature || feature.geometry.type !== "Point") {
        hoveredPinId = null;
        hoverPopup.remove();
        return;
      }

      const pinId = String(feature.properties?.id ?? "");
      if (hoveredPinId === pinId) return;
      const pin = pinIndexRef.current.get(pinId);
      if (!pin) return;
      hoveredPinId = pinId;
      hoverPopup
        .setLngLat(feature.geometry.coordinates as [number, number])
        .setDOMContent(buildTooltip(pin))
        .addTo(map);
    };

    const handlePointerLeave = () => {
      map.getCanvas().style.cursor = "";
      hoveredPinId = null;
      hoverPopup.remove();
    };

    map.on("style.load", handleStyleLoad);
    map.on("zoom", handleZoom);
    map.on("click", handleMapClick);
    map.on("mousemove", handlePointerMove);
    map.getCanvas().addEventListener("mouseleave", handlePointerLeave);
    mapRef.current = map;

    return () => {
      hoverPopup.remove();
      map.getCanvas().removeEventListener("mouseleave", handlePointerLeave);
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

    const source = map.getSource(PIN_SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(pinsToGeoJson(pins));
    if (map.getLayer(SELECTED_PIN_LAYER_ID)) {
      map.setFilter(SELECTED_PIN_LAYER_ID, [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "id"], selectedPin?.id ?? "__none__"],
      ]);
    }
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
