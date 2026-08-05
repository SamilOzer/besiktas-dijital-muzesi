"use client";
import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SCROLL_SECTIONS } from "./scrollStates";

// ── Shared materials (created once) ───────────────────────────────────────
function useMaterials() {
  return useMemo(() => {
    const gold = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8a84b"),
      metalness: 0.92,
      roughness: 0.08,
      envMapIntensity: 2.0,
    });
    const goldDark = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#7a5c1e"),
      metalness: 0.8,
      roughness: 0.3,
      envMapIntensity: 1.0,
    });
    const marble = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e8e0d0"),
      metalness: 0.0,
      roughness: 0.55,
      envMapIntensity: 0.5,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#16181f"),
      metalness: 0.5,
      roughness: 0.4,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e11d48"),
      metalness: 0.7,
      roughness: 0.2,
      envMapIntensity: 1.2,
    });
    const glassGold = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8a84b"),
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.55,
    });
    return { gold, goldDark, marble, dark, accent, glassGold };
  }, []);
}

// ── Ottoman Dome ───────────────────────────────────────────────────────────
function OttomanDome({ mat }: { mat: ReturnType<typeof useMaterials> }) {
  const domeRef = useRef<THREE.Group>(null!);
  const lanternRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (domeRef.current) {
      domeRef.current.rotation.y = t * 0.06;
    }
    if (lanternRef.current) {
      lanternRef.current.position.y = 1.62 + Math.sin(t * 0.9) * 0.008;
      const s = 1 + Math.sin(t * 1.4) * 0.012;
      lanternRef.current.scale.set(s, s, s);
    }
  });

  // Onion dome profile points
  const domePoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const angle = t * Math.PI * 0.9;
      // Bulging onion shape
      const r = Math.sin(angle) * (1 + 0.28 * Math.sin(angle * 2.5));
      const y = Math.cos(angle);
      pts.push(new THREE.Vector2(r * 0.72, y * 1.1));
    }
    return pts;
  }, []);

  // Muqarnas-like band points (stacked rings)
  const bandPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new THREE.Vector2(0.72 + Math.sin(t * Math.PI) * 0.1, -1.1 + t * 0.32));
    }
    return pts;
  }, []);

  return (
    <group ref={domeRef}>
      {/* Main dome body */}
      <mesh material={mat.gold} castShadow>
        <latheGeometry args={[domePoints, 32]} />
      </mesh>

      {/* Dome drum (cylindrical base of dome) */}
      <mesh material={mat.marble} position={[0, -1.1, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.78, 0.28, 32]} />
      </mesh>

      {/* Decorative gold band at drum */}
      <mesh material={mat.gold} position={[0, -0.98, 0]}>
        <torusGeometry args={[0.76, 0.025, 8, 48]} />
      </mesh>
      <mesh material={mat.gold} position={[0, -1.21, 0]}>
        <torusGeometry args={[0.76, 0.025, 8, 48]} />
      </mesh>

      {/* Finial (lantern spike) */}
      <mesh ref={lanternRef} position={[0, 1.62, 0]} material={mat.gold} castShadow>
        <coneGeometry args={[0.055, 0.42, 16]} />
      </mesh>
      {/* Finial sphere */}
      <mesh position={[0, 1.45, 0]} material={mat.gold}>
        <sphereGeometry args={[0.07, 16, 16]} />
      </mesh>

      {/* Decorative arched ribs on dome surface */}
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.71, -0.05, Math.sin(angle) * 0.71]}
            rotation={[0, angle + Math.PI / 2, 0]}
            material={mat.goldDark}
          >
            <boxGeometry args={[0.014, 1.4, 0.014]} />
          </mesh>
        );
      })}

      {/* Half-moon crescent at top */}
      <mesh position={[0, 1.9, 0]} material={mat.gold} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.1, 0.018, 8, 32, Math.PI * 1.4]} />
      </mesh>
    </group>
  );
}

// ── Ottoman Colonnade ─────────────────────────────────────────────────────
function Colonnade({ mat }: { mat: ReturnType<typeof useMaterials> }) {
  const colRef = useRef<THREE.Group>(null!);
  const N = 6;
  const radius = 1.65;

  useFrame(({ clock }) => {
    if (colRef.current) {
      colRef.current.rotation.y = -clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <group ref={colRef}>
      {[...Array(N)].map((_, i) => {
        const angle = (i / N) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, -1.38, z]}>
            {/* Shaft */}
            <mesh material={mat.marble} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 1.7, 16]} />
            </mesh>
            {/* Capital */}
            <mesh material={mat.gold} position={[0, 0.95, 0]}>
              <cylinderGeometry args={[0.16, 0.09, 0.2, 8]} />
            </mesh>
            {/* Base */}
            <mesh material={mat.gold} position={[0, -0.92, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
            </mesh>
            {/* Gold band mid-shaft */}
            <mesh material={mat.gold} position={[0, 0, 0]}>
              <torusGeometry args={[0.09, 0.012, 8, 24]} />
            </mesh>
          </group>
        );
      })}

      {/* Circular entablature connecting columns */}
      <mesh material={mat.gold} position={[0, -0.46, 0]}>
        <torusGeometry args={[radius, 0.04, 8, 48]} />
      </mesh>
    </group>
  );
}

// ── Geometric Star Floor ───────────────────────────────────────────────────
function StarFloor({ mat }: { mat: ReturnType<typeof useMaterials> }) {
  return (
    <group position={[0, -2.22, 0]}>
      {/* Base disc */}
      <mesh material={mat.dark} receiveShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.06, 64]} />
      </mesh>
      {/* Rim */}
      <mesh material={mat.gold} position={[0, 0.04, 0]}>
        <torusGeometry args={[2.2, 0.04, 8, 64]} />
      </mesh>
      {/* Star pattern — 8-pointed star tiles */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 1.35, 0.04, Math.sin(angle) * 1.35]}>
            <mesh material={mat.gold} rotation={[Math.PI / 2, 0, angle]}>
              <torusGeometry args={[0.28, 0.022, 4, 8]} />
            </mesh>
          </group>
        );
      })}
      {/* Centre star */}
      <mesh material={mat.gold} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.028, 4, 8]} />
      </mesh>
    </group>
  );
}

// ── Floating Calligraphy Rings ─────────────────────────────────────────────
function CalligraphyRings({ mat }: { mat: ReturnType<typeof useMaterials> }) {
  const g1 = useRef<THREE.Mesh>(null!);
  const g2 = useRef<THREE.Mesh>(null!);
  const g3 = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (g1.current) {
      g1.current.rotation.x = Math.PI / 2.2 + Math.sin(t * 0.22) * 0.12;
      g1.current.rotation.y = t * 0.14;
    }
    if (g2.current) {
      g2.current.rotation.z = -t * 0.11;
      g2.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.18) * 0.1;
    }
    if (g3.current) {
      g3.current.rotation.y = t * 0.09;
      g3.current.rotation.z = Math.sin(t * 0.25) * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={g1} material={mat.glassGold}>
        <torusGeometry args={[2.1, 0.022, 8, 72]} />
      </mesh>
      <mesh ref={g2} material={mat.glassGold}>
        <torusGeometry args={[2.35, 0.016, 8, 72]} />
      </mesh>
      <mesh ref={g3} material={mat.glassGold} scale={[1, 0.6, 1]}>
        <torusGeometry args={[2.55, 0.012, 8, 72]} />
      </mesh>
    </group>
  );
}

// ── Gold Dust Particles ────────────────────────────────────────────────────
function GoldParticles() {
  const count = 180;
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 1.6 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      positions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = r * Math.sin(phi) * 1.5;
      positions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const orig = positions;
      const phase = phases[i];
      pos.setY(i, orig[i * 3 + 1] + Math.sin(t * 0.6 + phase) * 0.12);
    }
    pos.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.025;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#e8c86a"
        size={0.028}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ── Main exported component ────────────────────────────────────────────────
export default function HeritageModel() {
  const groupRef = useRef<THREE.Group>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { camera } = useThree();
  const mat = useMaterials();

  // Mouse tracking for interactive tilt
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Scroll-driven camera
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docH = document.body.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? scrollY / docH : 0;

      const idx = SCROLL_SECTIONS.findIndex(
        (s, i) =>
          progress >= s.progress &&
          (i === SCROLL_SECTIONS.length - 1 || progress < SCROLL_SECTIONS[i + 1].progress)
      );
      const current = SCROLL_SECTIONS[Math.max(0, idx)];
      const next = SCROLL_SECTIONS[Math.min(SCROLL_SECTIONS.length - 1, idx + 1)];
      if (!current || !next) return;

      const sp =
        current.progress === next.progress
          ? 1
          : (progress - current.progress) / (next.progress - current.progress);

      const cam = camera as THREE.PerspectiveCamera;
      cam.position.z = THREE.MathUtils.lerp(
        cam.position.z,
        THREE.MathUtils.lerp(current.cameraZ, next.cameraZ, sp),
        0.07
      );
      cam.position.y = THREE.MathUtils.lerp(
        cam.position.y,
        THREE.MathUtils.lerp(current.cameraY, next.cameraY, sp),
        0.07
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [camera]);

  // Per-frame: mouse-driven tilt + floating
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle float
      groupRef.current.position.y = Math.sin(t * 0.35) * 0.07;
      // Smooth mouse-driven tilt (interactive)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouseRef.current.y * 0.18,
        0.04
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseRef.current.x * 0.22,
        0.04
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base platform */}
      <StarFloor mat={mat} />

      {/* Columns */}
      <Colonnade mat={mat} />

      {/* Dome */}
      <OttomanDome mat={mat} />

      {/* Floating rings */}
      <CalligraphyRings mat={mat} />

      {/* Gold dust particles */}
      <GoldParticles />

      {/* Extra accent point lights for drama */}
      <pointLight position={[0, 2.5, 0]} intensity={0.9} color="#ffeebb" distance={5} />
      <pointLight position={[2, -0.5, 2]} intensity={0.5} color="#c5a059" distance={6} />
      <pointLight position={[-2, -0.5, -2]} intensity={0.4} color="#6680ff" distance={6} />
    </group>
  );
}
