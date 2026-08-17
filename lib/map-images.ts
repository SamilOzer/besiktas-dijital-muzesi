import type { PinLocation } from "@/data/besiktasPinData";

export const FEATURED_MAP_PIN_ORDER = [
  "dolmabahce-sarayi",
  "yildiz-sarayi",
  "ortakoy-camii",
] as const;

const LOCAL_MAP_IMAGES: Record<string, string> = {
  "dolmabahce-sarayi": "/images/map/dolmabahce-palace.webp",
  "yildiz-sarayi": "/images/map/yildiz-palace.webp",
  "ortakoy-camii": "/images/map/ortakoy-mosque.webp",
};

export function getMapImage(pin: PinLocation) {
  return LOCAL_MAP_IMAGES[pin.id] ?? pin.images[0] ?? null;
}
