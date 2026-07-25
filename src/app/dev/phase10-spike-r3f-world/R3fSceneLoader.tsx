"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";

const R3fScene = dynamic(() => import("./R3fScene"), { ssr: false });

export function probeWebgl(forceFailure: boolean): boolean {
  try {
    const canvas = document.createElement("canvas");
    if (forceFailure) {
      canvas.getContext = (() => {
        throw new Error("WebGL context creation failure");
      }) as typeof canvas.getContext;
    }
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type SceneProps = ComponentProps<typeof R3fScene>;

export function R3fSceneLoader(props: SceneProps & { forceWebglFailure: boolean }) {
  const { forceWebglFailure, ...sceneProps } = props;
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shouldEnable =
      desktop.matches && !reducedMotion.matches && probeWebgl(forceWebglFailure);
    if (!shouldEnable) return;

    // Keep the R3F module evaluation and scene construction out of the route's
    // first-paint task. Two frame boundaries let semantic content paint before
    // the intentionally lazy desktop enhancement is requested.
    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => setEnabled(true));
    });
    return () => {
      cancelAnimationFrame(outerFrame);
      if (innerFrame) cancelAnimationFrame(innerFrame);
    };
  }, [forceWebglFailure]);

  return enabled ? <R3fScene {...sceneProps} /> : null;
}
