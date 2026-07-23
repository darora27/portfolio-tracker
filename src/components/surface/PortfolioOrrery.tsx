"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

type PortfolioOrreryProps = {
  /**
   * Relative weights (roughly 0-1, largest first) of a handful of
   * holdings — purely to vary the forms' visual scale. Optional: this
   * decorative layer is never the only representation of this data (the
   * same weights drive the real composition donut / holdings table), and
   * it makes no network requests of its own — the caller passes data it
   * already fetched.
   */
  weights?: number[];
  className?: string;
};

const DEFAULT_WEIGHTS = [0.28, 0.19, 0.14, 0.11, 0.08];

// Fixed, deterministic layout — never Math.random() in render — so the
// server-rendered markup and the first client paint match exactly
// (no hydration mismatch) and the composition is reproducible.
const FORM_ANGLES_DEG = [20, 95, 165, 230, 300];
const FORM_TILTS_DEG = [-8, 6, -4, 10, -6];
const MAX_PARALLAX_DEG = 4;

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/**
 * The surface tier's ambient 3D signature: a small floating arrangement of
 * layered paper-like forms with one violet focal element, around/behind
 * the Act 1 hero. Pure CSS 3D transforms + minimal pointer/visibility
 * logic — no 3D library, no canvas, no WebGL.
 *
 * Defaults to the simplified static composition (matches SSR output, so
 * there is nothing to reconcile on hydrate) and only upgrades to the
 * ambient-rotation + pointer-parallax version once we know the client is
 * a wide, fine-pointer, motion-ok viewport — a progressive-enhancement
 * flash rather than a hydration mismatch.
 */
export function PortfolioOrrery({ weights = DEFAULT_WEIGHTS, className = "" }: PortfolioOrreryProps) {
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useMatchMedia("(pointer: fine)");
  const narrow = useMatchMedia("(max-width: 480px)");
  const sceneRef = useRef<HTMLDivElement>(null);
  const [tabVisible, setTabVisible] = useState(true);
  const [inView, setInView] = useState(true);
  const [parallax, setParallax] = useState({ rx: 0, ry: 0 });

  const animated = !reducedMotion && !narrow && finePointer;
  const running = animated && tabVisible && inView;

  // Pause ambient motion while offscreen or the document is hidden.
  useEffect(() => {
    if (!animated) return;
    const node = sceneRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(node);
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [animated]);

  // Bounded pointer parallax — fine pointers only, listens on window (not
  // the decorative layer itself, which stays pointer-events: none) so it
  // never captures input or interferes with controls.
  useEffect(() => {
    if (!animated) return;
    let raf: number | undefined;
    function onMove(e: PointerEvent) {
      if (raf !== undefined) return;
      raf = requestAnimationFrame(() => {
        raf = undefined;
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        setParallax({ rx: ny * -MAX_PARALLAX_DEG, ry: nx * MAX_PARALLAX_DEG });
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, [animated]);

  const forms = weights.slice(0, 5);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-hidden ${className}`}
      style={{ perspective: animated ? "1400px" : undefined }}
    >
      <div
        className={animated ? "orrery-spin" : ""}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: animated ? "preserve-3d" : undefined,
          animationPlayState: animated ? (running ? "running" : "paused") : undefined,
        }}
      >
        <div
          ref={sceneRef}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: animated ? "preserve-3d" : undefined,
            transform: animated ? `rotateX(${parallax.rx}deg) rotateY(${parallax.ry}deg)` : undefined,
            transition: animated ? "transform 300ms ease-out" : undefined,
          }}
        >
          {forms.map((w, i) => {
            const angle = FORM_ANGLES_DEG[i % FORM_ANGLES_DEG.length];
            const tilt = FORM_TILTS_DEG[i % FORM_TILTS_DEG.length];
            const radius = 90 + i * 26;
            const size = 26 + w * 130;
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius * 0.45;
            const z = Math.sin(rad + i) * 60;
            const isFocal = i === 0;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: size,
                  height: size,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  borderRadius: "22%",
                  background: isFocal ? "var(--accent)" : "var(--paper-raised)",
                  border: isFocal ? "none" : "1px solid var(--line)",
                  boxShadow: isFocal ? "0 0 24px var(--accent)" : "none",
                  opacity: isFocal ? 0.9 : 0.7 - i * 0.08,
                  transform: animated
                    ? `translate3d(${x}px, ${y}px, ${z}px) rotateX(${tilt}deg) rotateY(${tilt * 2}deg)`
                    : `translate(${x * 0.45}px, ${y * 0.45}px) rotate(${tilt}deg)`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
