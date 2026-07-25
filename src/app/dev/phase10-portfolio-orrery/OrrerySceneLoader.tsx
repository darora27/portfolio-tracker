"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";

const OrreryScene = dynamic(() => import("./OrreryScene"), { ssr: false });

export function canRenderOrrery(forceNo3d: boolean): boolean {
  if (forceNo3d || typeof window.matchMedia !== "function") return false;
  if (!window.matchMedia("(min-width: 1024px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
type SceneProps = ComponentProps<typeof OrreryScene>;

export function OrrerySceneLoader(props: SceneProps & { forceNo3d: boolean }) {
  const { forceNo3d, ...sceneProps } = props;
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!canRenderOrrery(forceNo3d)) return;
    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => setEnabled(true));
    });
    return () => {
      cancelAnimationFrame(outerFrame);
      if (innerFrame) cancelAnimationFrame(innerFrame);
    };
  }, [forceNo3d]);

  return enabled ? <OrreryScene {...sceneProps} /> : null;
}
