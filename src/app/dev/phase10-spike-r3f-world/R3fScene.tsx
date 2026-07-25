"use client";

import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  OBSERVATORY_CHAPTERS,
  type ObservatoryChapterId,
} from "@/lib/observatory/chapters";

const POSITIONS: Record<ObservatoryChapterId, [number, number, number]> = {
  pulse: [-3.6, 1.25, 0.8],
  forces: [-0.8, 2.7, -1.2],
  structure: [3.2, 1.0, 0.15],
  timeline: [2.3, -2.1, -1.5],
  lab: [-2.5, -2.25, -0.3],
};

function CameraRig({ activeChapterId }: { activeChapterId: ObservatoryChapterId }) {
  const { camera } = useThree();
  const targetPosition = useMemo(() => {
    const [x, y, z] = POSITIONS[activeChapterId];
    return new THREE.Vector3(x * 0.18, y * 0.14, 8.2 + z * 0.16);
  }, [activeChapterId]);
  const targetLookAt = useMemo(() => {
    const [x, y, z] = POSITIONS[activeChapterId];
    return new THREE.Vector3(x * 0.16, y * 0.12, z * 0.08);
  }, [activeChapterId]);
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    camera.position.set(0, 0, 14);
  }, [camera]);

  useFrame((_, delta) => {
    const amount = 1 - Math.exp(-delta * 5.5);
    camera.position.lerp(targetPosition, amount);
    lookAtRef.current.lerp(targetLookAt, amount);
    camera.lookAt(lookAtRef.current);
  });
  return null;
}

function ChapterBodies({
  activeChapterId,
  hoveredChapterId,
  onHoverChapter,
  onNavigateChapter,
}: {
  activeChapterId: ObservatoryChapterId;
  hoveredChapterId: ObservatoryChapterId | null;
  onHoverChapter: (chapter: ObservatoryChapterId | null) => void;
  onNavigateChapter: (chapter: ObservatoryChapterId) => void;
}) {
  return OBSERVATORY_CHAPTERS.map((chapter) => {
    const active = chapter.id === activeChapterId;
    const hovered = chapter.id === hoveredChapterId;
    return (
      <mesh
        key={chapter.id}
        position={POSITIONS[chapter.id]}
        rotation={[0.12 * chapter.index, -0.18 * chapter.index, 0.05 * chapter.index]}
        scale={active ? 1.2 : hovered ? 1.08 : 1}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          onHoverChapter(chapter.id);
        }}
        onPointerOut={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          onHoverChapter(null);
        }}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onNavigateChapter(chapter.id);
        }}
      >
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial
          color={active ? "#72e2d4" : hovered ? "#9588ff" : "#26314a"}
          emissive={active ? "#174d4a" : hovered ? "#281f55" : "#080a12"}
          emissiveIntensity={0.85}
          roughness={0.48}
          metalness={0.32}
        />
      </mesh>
    );
  });
}

export default function R3fScene({
  activeChapterId,
  hoveredChapterId,
  onHoverChapter,
  onNavigateChapter,
}: {
  activeChapterId: ObservatoryChapterId;
  hoveredChapterId: ObservatoryChapterId | null;
  onHoverChapter: (chapter: ObservatoryChapterId | null) => void;
  onNavigateChapter: (chapter: ObservatoryChapterId) => void;
}) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 14], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#07090f"]} />
      <fog attach="fog" args={["#07090f", 8, 19]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 8]} intensity={2.2} color="#c9fff8" />
      <pointLight position={[-5, -2, 5]} intensity={20} color="#7667ff" distance={14} />
      <CameraRig activeChapterId={activeChapterId} />
      <ChapterBodies
        activeChapterId={activeChapterId}
        hoveredChapterId={hoveredChapterId}
        onHoverChapter={onHoverChapter}
        onNavigateChapter={onNavigateChapter}
      />
    </Canvas>
  );
}
