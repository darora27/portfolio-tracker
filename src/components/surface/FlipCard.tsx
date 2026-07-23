"use client";

import { useState } from "react";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

type FlipCardProps = {
  /** Plain-language stat shown on the front face. */
  front: React.ReactNode;
  /** Reused existing deep component (chart/meter) shown on the back face. */
  back: React.ReactNode;
  /** Destination for the "See more" link into the deep tier. */
  seeMoreHref: string;
  seeMoreLabel?: string;
  /** Accessible name for the flip toggle, e.g. "Flip: What I own". */
  ariaLabel: string;
  className?: string;
};

/**
 * The surface-tier "workhorse" reveal: a plain-language front, a reused
 * deep-tier component on the back, and a real link into the full page.
 *
 * The flip toggle is a real <button> (aria-pressed) wrapping both faces.
 * The "See more" link is deliberately NOT nested inside that button — a
 * link inside a button is invalid HTML and behaves unpredictably across
 * browsers — so it renders as a sibling <a>, visible and tab-reachable
 * only once the card is flipped (aria-hidden + tabIndex track the same
 * `flipped` state as the back face).
 */
export function FlipCard({
  front,
  back,
  seeMoreHref,
  seeMoreLabel = "See more",
  ariaLabel,
  className = "",
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const faceBase = "absolute inset-0 block overflow-auto p-8";

  return (
    <div
      className={`relative min-h-[280px] rounded-xl border border-line bg-paper-raised ${className}`}
      style={{ perspective: reducedMotion ? undefined : "1200px" }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-4 z-10 text-lg text-ink-faint select-none"
      >
        ⟳
      </span>

      <button
        type="button"
        aria-pressed={flipped}
        aria-label={ariaLabel}
        onClick={() => setFlipped((f) => !f)}
        className="block h-full min-h-[44px] w-full rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span
          className="relative block h-full w-full"
          style={
            reducedMotion
              ? undefined
              : {
                  transformStyle: "preserve-3d",
                  transition: `transform var(--dur-flip) var(--ease-flip)`,
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }
          }
        >
          <span
            aria-hidden={flipped}
            className={`${faceBase} ${
              reducedMotion
                ? `transition-opacity duration-150 ${flipped ? "opacity-0" : "opacity-100"}`
                : ""
            }`}
            style={reducedMotion ? undefined : { backfaceVisibility: "hidden" }}
          >
            {front}
          </span>
          <span
            aria-hidden={!flipped}
            className={`${faceBase} ${
              reducedMotion
                ? `transition-opacity duration-150 ${flipped ? "opacity-100" : "opacity-0"}`
                : ""
            }`}
            style={
              reducedMotion
                ? undefined
                : { backfaceVisibility: "hidden", transform: "rotateY(180deg)" }
            }
          >
            {back}
          </span>
        </span>
      </button>

      <a
        href={seeMoreHref}
        aria-hidden={!flipped}
        tabIndex={flipped ? undefined : -1}
        className={`absolute bottom-6 right-8 z-10 text-sm font-medium text-accent-ink underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          flipped ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {seeMoreLabel} →
      </a>
    </div>
  );
}
