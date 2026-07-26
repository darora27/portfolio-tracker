"use client";

import { useEffect, useRef } from "react";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
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
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(activeChapterId);
  const hoveredRef = useRef(hoveredChapterId);
  const hoverCallbackRef = useRef(onHoverChapter);
  const navigateCallbackRef = useRef(onNavigateChapter);
  useEffect(() => {
    activeRef.current = activeChapterId;
    hoveredRef.current = hoveredChapterId;
    hoverCallbackRef.current = onHoverChapter;
    navigateCallbackRef.current = onNavigateChapter;
  }, [activeChapterId, hoveredChapterId, onHoverChapter, onNavigateChapter]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new Scene();
    scene.background = new Color("#07090f");
    scene.fog = new Fog("#07090f", 8, 19);
    const camera = new PerspectiveCamera(42, 1, 0.1, 40);
    camera.position.set(0, 0, 14);

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    scene.add(new AmbientLight("#ffffff", 0.75));
    scene.add(new DirectionalLight("#c9fff8", 2.2));
    const point = new PointLight("#7667ff", 20, 14);
    point.position.set(-5, -2, 5);
    scene.add(point);

    const geometry = new IcosahedronGeometry(0.72, 0);
    const meshes = new Map<ObservatoryChapterId, Mesh<IcosahedronGeometry, MeshStandardMaterial>>();
    for (const chapter of OBSERVATORY_CHAPTERS) {
      const material = new MeshStandardMaterial({
        color: "#26314a",
        emissive: "#080a12",
        emissiveIntensity: 0.85,
        roughness: 0.48,
        metalness: 0.32,
      });
      const mesh = new Mesh(geometry, material);
      mesh.position.set(...POSITIONS[chapter.id]);
      mesh.rotation.set(0.12 * chapter.index, -0.18 * chapter.index, 0.05 * chapter.index);
      mesh.userData.chapterId = chapter.id;
      scene.add(mesh);
      meshes.set(chapter.id, mesh);
    }

    const pointer = new Vector2(2, 2);
    const raycaster = new Raycaster();
    const targetPosition = new Vector3();
    const targetLookAt = new Vector3();
    const lookAt = new Vector3();
    let pointerX = 0;
    let pointerY = 0;
    let localHovered: ObservatoryChapterId | null = null;

    const readPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerX = pointer.x;
      pointerY = pointer.y;
    };
    const pick = () => {
      raycaster.setFromCamera(pointer, camera);
      const chapterId = raycaster.intersectObjects([...meshes.values()], false)[0]?.object.userData
        .chapterId as ObservatoryChapterId | undefined;
      const nextHovered = chapterId ?? null;
      if (nextHovered !== localHovered) {
        localHovered = nextHovered;
        hoverCallbackRef.current(nextHovered);
      }
      renderer.domElement.style.cursor = chapterId ? "pointer" : "default";
      return chapterId;
    };
    const onPointerMove = (event: PointerEvent) => {
      readPointer(event);
      pick();
    };
    const onPointerLeave = () => {
      pointer.set(2, 2);
      localHovered = null;
      hoverCallbackRef.current(null);
      renderer.domElement.style.cursor = "default";
    };
    const onClick = (event: MouseEvent) => {
      readPointer(event as PointerEvent);
      const chapterId = pick();
      if (chapterId) navigateCallbackRef.current(chapterId);
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onClick);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    let previousTime = performance.now();
    let animationFrame = 0;
    const render = (now: number) => {
      const delta = Math.min(0.05, (now - previousTime) / 1000);
      previousTime = now;
      const active = activeRef.current;
      const hovered = hoveredRef.current;

      for (const chapter of OBSERVATORY_CHAPTERS) {
        const mesh = meshes.get(chapter.id);
        if (!mesh) continue;
        const isActive = chapter.id === active;
        const isHovered = chapter.id === hovered;
        const targetScale = isActive ? 1.2 : isHovered ? 1.08 : 1;
        const scale =
          mesh.scale.x + (targetScale - mesh.scale.x) * (1 - Math.exp(-delta * 8));
        mesh.scale.setScalar(scale);
        mesh.material.color.set(isActive ? "#72e2d4" : isHovered ? "#9588ff" : "#26314a");
        mesh.material.emissive.set(isActive ? "#174d4a" : isHovered ? "#281f55" : "#080a12");
      }

      const [x, y, z] = POSITIONS[active];
      targetPosition.set(x * 0.18 + pointerX * 0.1, y * 0.14 + pointerY * 0.08, 8.2 + z * 0.16);
      targetLookAt.set(x * 0.16, y * 0.12, z * 0.08);
      const amount = 1 - Math.exp(-delta * 5.5);
      camera.position.lerp(targetPosition, amount);
      lookAt.lerp(targetLookAt, amount);
      camera.lookAt(lookAt);
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("click", onClick);
      for (const mesh of meshes.values()) mesh.material.dispose();
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} aria-hidden="true" />;
}
