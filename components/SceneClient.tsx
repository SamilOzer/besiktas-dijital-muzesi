"use client";
import dynamic from "next/dynamic";

// Dynamically import the 3D scene to avoid SSR issues
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

export default function SceneClient() {
  return (
    <div className="w-full h-full">
      <Scene />
    </div>
  );
}
