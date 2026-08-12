"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
  const displayImages = (pin.images && pin.images.length > 0 ? pin.images : []).filter(Boolean);
  const hasMultipleImages = displayImages.length > 1;

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

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div className="landmark-backdrop" onClick={onClose} aria-label="Kapat" />

      {/* ── Modal: desktop=grid, mobile=flex-col via CSS ── */}
      <div
        className="landmark-modal"
        role="dialog"
        aria-modal="true"
        aria-label={pin.title}
        id={`landmark-modal-${pin.id}`}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "1fr",
        }}
      >
        {/* Inner wrapper: side-by-side on desktop, stacked on mobile */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
          {/* Desktop: use a row layout wrapper */}
          <div
            className="modal-inner-grid"
            style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "row", overflow: "hidden" }}
          >
            {/* ── Photo Column (right on desktop, top on mobile) ── */}
            <div
              className="photo-col"
              style={{
                position: "relative",
                background: "#07080a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
                // Desktop: 42% width, full height
                width: "42%",
                order: 2,
              }}
            >
              {displayImages.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayImages[imgIndex]}
                  alt={`${pin.title} foto ${imgIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "8px",
                    display: "block",
                  }}
                  loading="lazy"
                />
              ) : (
                <div style={{ fontSize: 80, opacity: 0.1 }}>{catIcon}</div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: "absolute", top: 12, right: 12,
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", cursor: "pointer", zIndex: 20,
                }}
                aria-label="Kapat"
                id="landmark-modal-close"
              >
                <X size={18} />
              </button>

              {/* Photo counter */}
              {displayImages.length > 0 && (
                <div style={{
                  position: "absolute", top: 12, left: 12,
                  background: "rgba(0,0,0,0.75)", borderRadius: 8,
                  padding: "5px 10px", fontSize: 12, color: "#fff",
                  fontWeight: 600, border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", gap: 6, zIndex: 20,
                }}>
                  <span>📷</span>
                  <span>{imgIndex + 1} / {displayImages.length}</span>
                </div>
              )}

              {/* Carousel arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={() => setImgIndex(i => i === 0 ? displayImages.length - 1 : i - 1)}
                    style={{
                      position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                      width: 40, height: 40, borderRadius: "50%",
                      background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", cursor: "pointer", zIndex: 20,
                    }}
                    aria-label="Önceki fotoğraf"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setImgIndex(i => (i + 1) % displayImages.length)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      width: 40, height: 40, borderRadius: "50%",
                      background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", cursor: "pointer", zIndex: 20,
                    }}
                    aria-label="Sonraki fotoğraf"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Dots */}
                  <div style={{
                    position: "absolute", bottom: 12, left: 0, right: 0,
                    display: "flex", justifyContent: "center", gap: 8, zIndex: 20,
                  }}>
                    {displayImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        style={{
                          height: 8, borderRadius: 4,
                          width: i === imgIndex ? 24 : 8,
                          background: i === imgIndex ? "#c5a059" : "rgba(255,255,255,0.4)",
                          border: "none", cursor: "pointer", transition: "all 0.2s",
                          padding: 0,
                        }}
                        aria-label={`Fotoğraf ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── Text Column (left on desktop, bottom on mobile) ── */}
            <div
              className="text-col"
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                order: 1,
                borderRight: "1px solid rgba(255,255,255,0.08)",
                background: "var(--panel)",
                overflow: "hidden",
              }}
            >
              {/* Scrollable Content Area */}
              <div
                className="text-col-body"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch" as any,
                  padding: "24px",
                }}
              >
                {/* Category & Era badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: `${color}28`, color, border: `1px solid ${color}50`,
                  }}>
                    {catIcon} {pin.categoryLabel}
                  </span>
                  {pin.era && (
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
                      background: "rgba(255,255,255,0.06)", color: "var(--muted)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}>
                      📅 {pin.era}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 16 }}>
                  {pin.title}
                </h2>

                {/* Address */}
                {pin.address && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 16, fontSize: 14, color: "var(--muted)" }}>
                    <MapPin size={15} style={{ marginTop: 2, flexShrink: 0, color }} />
                    <span>{pin.address}</span>
                  </div>
                )}

                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16 }} />

                {/* Full description */}
                <div>
                  <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color, marginBottom: 12 }}>
                    Tarihçe & Açıklama
                  </h3>
                  <p style={{ fontSize: 14, color: "#d4d4d4", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                    {pin.description || pin.fullHistory || pin.summary}
                  </p>
                </div>
              </div>

              {/* Fixed Bottom Footer */}
              <div
                className="text-col-footer"
                style={{
                  flexShrink: 0,
                  padding: "16px 24px",
                  background: "#14161d",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={handleDirections}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 8, padding: "12px 20px", borderRadius: 12, fontWeight: 600,
                      fontSize: 14, border: "none", cursor: "pointer",
                      background: color, color: "#0d0e12",
                    }}
                    id={`landmark-directions-${pin.id}`}
                  >
                    <Navigation size={15} /> Yol Tarifi
                  </button>
                  <button
                    onClick={handleShare}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 8, padding: "12px 20px", borderRadius: 12, fontWeight: 500,
                      fontSize: 14, cursor: "pointer",
                      background: "rgba(255,255,255,0.05)", color: "var(--muted)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                    id={`landmark-share-${pin.id}`}
                  >
                    <Share2 size={15} /> Paylaş
                  </button>
                </div>

                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", margin: 0 }}>
                  📍 {pin.coordinates[0].toFixed(5)}°N &nbsp; {pin.coordinates[1].toFixed(5)}°E
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
