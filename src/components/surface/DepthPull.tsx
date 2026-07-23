"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

// Mirrors the --dur-depth token in globals.css. Kept as a JS constant
// (rather than read from the DOM) since it only drives a setTimeout, not
// layout — if the token changes, update both.
const DUR_DEPTH_MS = 560;

type Phase = "idle" | "covering" | "wiping";

type DepthPullContextValue = {
  trigger: (href: string) => void;
};

const DepthPullContext = createContext<DepthPullContextValue | null>(null);

/**
 * Mounted once in the root layout so its overlay state survives the route
 * change it triggers (the App Router keeps the root layout mounted across
 * a router.push — only the page content beneath it swaps).
 *
 * Sequence: click -> overlay covers the viewport in --paper (no
 * transition, instant) -> router.push fires -> one frame later the
 * overlay wipes upward via clip-path over --dur-depth, revealing the
 * (now-committed) deep route beneath -> overlay unmounts.
 */
export function DepthPullProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const pendingHref = useRef<string | null>(null);

  const trigger = useCallback(
    (href: string) => {
      if (reducedMotion) {
        router.push(href);
        return;
      }
      pendingHref.current = href;
      setPhase("covering");
    },
    [reducedMotion, router],
  );

  useEffect(() => {
    if (phase === "covering") {
      if (pendingHref.current) {
        router.push(pendingHref.current);
        pendingHref.current = null;
      }
      // Two rAFs: one to let the covered frame paint, one to start the
      // wipe transition cleanly on the next tick.
      let raf2: number | undefined;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setPhase("wiping"));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2 !== undefined) cancelAnimationFrame(raf2);
      };
    }
    if (phase === "wiping") {
      const t = setTimeout(() => setPhase("idle"), DUR_DEPTH_MS);
      return () => clearTimeout(t);
    }
  }, [phase, router]);

  return (
    <DepthPullContext.Provider value={{ trigger }}>
      {children}
      {phase !== "idle" && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 bg-paper"
          style={{
            clipPath: phase === "wiping" ? "inset(0 0 100% 0)" : "inset(0 0 0 0)",
            transition: phase === "wiping" ? `clip-path var(--dur-depth) var(--ease-depth)` : "none",
          }}
        />
      )}
    </DepthPullContext.Provider>
  );
}

/** Returns a navigate function that plays the depth-pull transition (or a plain push under reduced motion). */
export function useDepthPull(): (href: string) => void {
  const ctx = useContext(DepthPullContext);
  const router = useRouter();
  if (!ctx) {
    // No provider mounted (e.g. isolated test render) — fall back to a
    // plain client-side navigation rather than throwing.
    return (href: string) => router.push(href);
  }
  return ctx.trigger;
}

type DepthPullLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * The tier-transition trigger as a real link: works as plain navigation
 * if JS never hydrates, and plays the depth-pull overlay once it has.
 */
export function DepthPull({ href, children, className = "" }: DepthPullLinkProps) {
  const trigger = useDepthPull();
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        trigger(href);
      }}
    >
      {children}
    </a>
  );
}
