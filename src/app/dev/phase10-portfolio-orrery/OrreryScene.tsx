"use client";

import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import {
  angularSpeedForWeeklyReturn,
  directionForWeeklyReturn,
  radiusForWeight,
  type PublicOrreryHolding,
} from "@/lib/observatory/orrery";

const PLANET_COLORS = [
  "#75d8bd",
  "#e1a94f",
  "#77a8b8",
  "#ad6f55",
  "#92a467",
  "#cf7f61",
  "#6f91c2",
  "#d8c78f",
  "#8e7fb8",
  "#72a59d",
  "#c89767",
  "#7991a6",
  "#b56f7b",
];

function orbitRadiusForIndex(index: number): number {
  return 2.15 + index * 0.47;
}

function CameraRig({
  selectedTicker,
  holdings,
}: {
  selectedTicker: string | null;
  holdings: readonly PublicOrreryHolding[];
}) {
  const { camera } = useThree();
  const targetPosition = useRef(camera.position.clone().set(0, 1.2, 13.5));
  const targetLookAt = useRef(camera.position.clone().set(0, 0, 0));
  const lookAt = useRef(camera.position.clone().set(0, 0, 0));

  useEffect(() => {
    const index = holdings.findIndex((holding) => holding.ticker === selectedTicker);
    if (index < 0) {
      targetPosition.current.set(0, 1.2, 13.5);
      targetLookAt.current.set(0, 0, 0);
      return;
    }
    const radius = orbitRadiusForIndex(index);
    const angle = index * 2.399963;
    targetPosition.current.set(Math.cos(angle) * radius * 0.2, Math.sin(angle) * radius * 0.12, 9.6);
    targetLookAt.current.set(Math.cos(angle) * radius * 0.42, Math.sin(angle) * radius * 0.25, 0);
  }, [holdings, selectedTicker]);

  useFrame((_, delta) => {
    const amount = 1 - Math.exp(-delta * 4.8);
    camera.position.lerp(targetPosition.current, amount);
    lookAt.current.lerp(targetLookAt.current, amount);
    camera.lookAt(lookAt.current);
  });
  return null;
}

function Planet({
  holding,
  index,
  stabilized,
  onHover,
  onSelect,
}: {
  holding: PublicOrreryHolding;
  index: number;
  stabilized: boolean;
  onHover: (ticker: string | null) => void;
  onSelect: (ticker: string) => void;
}) {
  const orbitRef = useRef<Group>(null);
  const direction = directionForWeeklyReturn(holding.weeklyReturn);
  const angularSpeed = angularSpeedForWeeklyReturn(holding.weeklyReturn);
  const orbitRadius = orbitRadiusForIndex(index);
  const radius = radiusForWeight(holding.weight);
  const initialAngle = index * 2.399963;
  const tiltX = ((index % 5) - 2) * 0.055;
  const tiltY = ((index % 3) - 1) * 0.045;

  useFrame((_, delta) => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    if (stabilized) {
      const amount = 1 - Math.exp(-delta * 7);
      orbit.rotation.z += (initialAngle - orbit.rotation.z) * amount;
      return;
    }
    if (direction === "neutral") return;
    orbit.rotation.z += (direction === "clockwise" ? -1 : 1) * angularSpeed * delta;
  });

  return (
    <group rotation={[tiltX, tiltY, 0]}>
      <mesh>
        <ringGeometry args={[orbitRadius - 0.008, orbitRadius + 0.008, 96]} />
        <meshBasicMaterial color="#42745f" transparent opacity={0.45} />
      </mesh>
      <group ref={orbitRef} rotation={[0, 0, initialAngle]}>
        <mesh
          position={[orbitRadius, 0, 0]}
          scale={stabilized ? 1.08 : 1}
          onPointerOver={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            onHover(holding.ticker);
          }}
          onPointerOut={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            onHover(null);
          }}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            onSelect(holding.ticker);
          }}
        >
          <sphereGeometry args={[radius, 16, 12]} />
          <meshStandardMaterial
            color={PLANET_COLORS[index % PLANET_COLORS.length]}
            emissive={PLANET_COLORS[index % PLANET_COLORS.length]}
            emissiveIntensity={stabilized ? 0.34 : 0.12 + (index % 4) * 0.035}
            metalness={0.12 + (index % 3) * 0.12}
            roughness={0.38 + (index % 5) * 0.08}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function OrreryScene({
  holdings,
  selectedTicker,
  hoveredTicker,
  onHover,
  onSelect,
  onSelectPortfolio,
}: {
  holdings: readonly PublicOrreryHolding[];
  selectedTicker: string | null;
  hoveredTicker: string | null;
  onHover: (ticker: string | null) => void;
  onSelect: (ticker: string) => void;
  onSelectPortfolio: () => void;
}) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={1}
      camera={{ position: [0, 1.2, 13.5], fov: 43 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#020706"]} />
      <fog attach="fog" args={["#020706", 11, 25]} />
      <ambientLight intensity={0.42} color="#9fd5c4" />
      <directionalLight position={[6, 8, 10]} intensity={1.5} color="#d5e9d2" />
      <pointLight position={[0, 0, 2]} intensity={42} color="#efb952" distance={14} />
      <CameraRig selectedTicker={selectedTicker} holdings={holdings} />
      <mesh
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onSelectPortfolio();
        }}
      >
        <sphereGeometry args={[1.14, 24, 18]} />
        <meshStandardMaterial
          color="#f1b84d"
          emissive="#d87320"
          emissiveIntensity={1.5}
          roughness={0.66}
        />
      </mesh>
      <mesh scale={1.16}>
        <sphereGeometry args={[1.14, 20, 14]} />
        <meshBasicMaterial color="#f4c56a" transparent opacity={0.12} />
      </mesh>
      {holdings.map((holding, index) => (
        <Planet
          key={holding.ticker}
          holding={holding}
          index={index}
          stabilized={holding.ticker === selectedTicker || holding.ticker === hoveredTicker}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </Canvas>
  );
}
