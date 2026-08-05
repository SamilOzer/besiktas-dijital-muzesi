"use client";
import { useEffect, useRef, useState } from "react";
import { X, Share2, Navigation, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { PinLocation } from "@/data/besiktasPinData";

interface LandmarkModalProps {
  pin: PinLocation;
  onClose: () => void;
}

const categoryColors: Record<string, string> = {
  heykeller: "#c5a059",
  saraylar: "#9b6fd0",
  "tarihi-yapilar": "#4a9ead",
  spor: "#e11d48",
  "dini-kamusal": "#5a9a6b",
};

const categoryIcons: Record<string, string> = {
  heykeller: "🗿",
  saraylar: "🏰",
  "tarihi-yapilar": "🏛️",
  spor: "🏟️",
  "dini-kamusal": "⛪",
};

export default function LandmarkModal({ pin, onClose }: LandmarkModalProps) {
  const [imgIndex, setImgIndex] = useState(0);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const color = categoryColors[pin.category] ?? "#c5a059";
  const catIcon = categoryIcons[pin.category] ?? "📍";
  const hasMultipleImages = pin.images.length > 1;

  const handleDirections = () => {
    const [lat, lng] = pin.coordinates;
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/harita#${pin.id}`;
    if (navigator.share) {
      navigator.share({ title: pin.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert("Bağlantı kopyalandı!"));
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="landmark-backdrop"
        onClick={onClose}
        aria-label="Kapat"
      />

      {/* ── Centered Modal ── */}
      <div
        className="landmark-modal"
        role="dialog"
        aria-modal="true"
        aria-label={pin.title}
        id={`landmark-modal-${pin.id}`}
      >
        {/* ── Image section (top half) ── */}
        <div className="relative h-72 bg-[#0a0b0e] overflow-hidden rounded-t-[20px]">
          {pin.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pin.images[imgIndex]}
              alt={`${pin.title} fotoğraf ${imgIndex + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl opacity-20">{catIcon}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--panel)] via-[var(--panel)]/20 to-transparent" />

          {/* Category badge on image */}
          <div className="absolute top-4 left-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm"
              style={{ background: `${color}28`, color, border: `1px solid ${color}50` }}
            >
              {catIcon} {pin.categoryLabel}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors"
            aria-label="Kapat"
            id="landmark-modal-close"
          >
            <X size={18} />
          </button>

          {/* Image nav */}
          {hasMultipleImages && (
            <>
              <button
                onClick={() => setImgIndex((i) => (i === 0 ? pin.images.length - 1 : i - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                aria-label="Önceki fotoğraf"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setImgIndex((i) => (i + 1) % pin.images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                aria-label="Sonraki fotoğraf"
              >
                <ChevronRight size={18} />
              </button>
              {/* Dots */}
              <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5">
                {pin.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imgIndex ? "bg-white w-5" : "bg-white/40 w-1.5"
                    }`}
                    aria-label={`Fotoğraf ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Content (bottom half) ── */}
        <div className="p-6 md:p-8">
          {/* Title + era */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight flex-1">
              {pin.title}
            </h2>
            {pin.era && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/6 text-[var(--muted)] border border-white/10 whitespace-nowrap">
                📅 {pin.era}
              </span>
            )}
          </div>

          {/* Address */}
          {pin.address && (
            <div className="flex items-start gap-2 mb-4 text-sm text-[var(--muted)]">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color }} />
              <span>{pin.address}</span>
            </div>
          )}

          {/* Summary pull-quote */}
          <p
            className="text-sm text-[var(--muted)] leading-relaxed italic border-l-2 pl-4 mb-5"
            style={{ borderColor: color }}
          >
            {pin.summary}
          </p>

          {/* Divider */}
          <div className="border-t border-white/8 mb-5" />

          {/* Full history */}
          <div className="mb-6">
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color }}
            >
              Tarihçe
            </h3>
            <p className="text-sm text-neutral-300 leading-7">{pin.fullHistory}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDirections}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: color, color: "#0d0e12" }}
              id={`landmark-directions-${pin.id}`}
            >
              <Navigation size={15} />
              Yol Tarifi
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-white/15 text-[var(--muted)] text-sm hover:border-white/30 hover:text-white transition-all"
              id={`landmark-share-${pin.id}`}
            >
              <Share2 size={15} />
              Paylaş
            </button>
          </div>

          {/* Coordinates */}
          <p className="text-xs text-white/20 text-center font-mono mt-4">
            {pin.coordinates[0].toFixed(5)}°N &nbsp; {pin.coordinates[1].toFixed(5)}°E
          </p>
        </div>
      </div>
    </>
  );
}
