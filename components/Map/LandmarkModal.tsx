"use client";
import { Navigation } from "lucide-react";
import { PinLocation } from "@/data/besiktasPinData";
import MuseumDetail from "@/components/MuseumDetail";
import { getMapImage } from "@/lib/map-images";
export default function LandmarkModal({ pin, onClose }: { pin: PinLocation; onClose: () => void }) {
  const images = Array.from(new Set([getMapImage(pin), ...(pin.images || [])].filter((image): image is string => Boolean(image))));
  return <MuseumDetail title={pin.title} meta={[pin.categoryLabel, pin.era || ""]} location={pin.address} body={pin.description || pin.fullHistory || pin.summary} images={images} sharePath={"/harita#" + pin.id} onClose={onClose}
    action={<a className="museum-button" href={"https://maps.google.com/?q=" + pin.coordinates.join(",")} target="_blank" rel="noopener noreferrer"><Navigation size={15} aria-hidden="true" />Yol tarifi</a>} />;
}
