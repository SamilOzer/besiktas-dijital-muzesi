"use client";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import HeritageModel from "./HeritageModel";
import { Suspense } from "react";

export default function Scene() {
  return (
    <Canvas
      className="w-full h-full"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: 3, // THREE.ACESFilmicToneMapping
        toneMappingExposure: 1.1,
      }}
      style={{ background: "transparent" }}
      shadows
    >
      {/* Camera */}
      <PerspectiveCamera makeDefault fov={42} position={[0, 0.4, 6]} near={0.1} far={100} />

      {/* Scene-level lighting */}
      <ambientLight intensity={0.18} color="#bbd0ff" />

      {/* Key light — warm top */}
      <directionalLight
        position={[3, 8, 4]}
        intensity={2.2}
        color="#fff3dc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill — cool blue from opposite */}
      <directionalLight
        position={[-4, 2, -6]}
        intensity={0.5}
        color="#4466bb"
      />

      {/* Rim light from below */}
      <directionalLight position={[0, -4, 2]} intensity={0.3} color="#c5a059" />

      {/* Environment for PBR reflections */}
      <Suspense fallback={null}>
        <Environment preset="city" />
        <HeritageModel />
      </Suspense>

      {/* Atmospheric fog */}
      <fog attach="fog" color="#0d0e12" near={9} far={22} />
    </Canvas>
  );
}
