"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setHidden(true), 600);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`loading-screen transition-opacity duration-700 ${
        progress >= 100 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Real Beşiktaş Belediyesi logo — large */}
      <div className="relative w-72 h-36 animate-float">
        <Image
          src="/besiktas-belediyesi-logo.png"
          alt="Beşiktaş Belediyesi"
          fill
          className="object-contain opacity-90"
          priority
        />
      </div>

      {/* Title */}
      <div className="text-center space-y-1 mt-4">
        <p className="eyebrow">Yükleniyor</p>
        <p className="text-sm text-[var(--muted)]">Dijital Müze</p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden mt-4">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-200 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
