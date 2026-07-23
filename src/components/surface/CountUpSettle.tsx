"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { formatCurrency, formatSignedPercent } from "@/lib/format";

/**
 * Counts up from zero to `value` on mount, easing like
 * src/components/ui/useCountUp.ts — but that hook only animates on value
 * *changes* after mount (it seeds its "previous" value from the initial
 * value, so first paint is instant). Surface hero numbers need the
 * opposite: animate from zero on first paint. This is that variant.
 */
function useCountUpFromZero(
  value: number,
  durationMs: number,
  reducedMotion: boolean,
): { display: number; done: boolean } {
  const [display, setDisplay] = useState(() => (reducedMotion ? value : 0));
  const [done, setDone] = useState(reducedMotion);
  const prevValue = useRef(reducedMotion ? value : 0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      setDone(true);
      prevValue.current = value;
      return;
    }

    const from = prevValue.current;
    const to = value;
    if (from === to && done) return;

    setDone(false);
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = to;
        setDone(true);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs, reducedMotion]);

  return { display, done };
}

type CountUpSettleProps = {
  value: number;
  /**
   * Which src/lib/format.ts formatter to animate through. A function prop
   * can't cross the server/client boundary (the surface pages that host
   * this are server components), so the formatter lives here — imported
   * directly from format.ts, same single source of truth — rather than
   * being passed in.
   */
  variant: "currency" | "signedPercent";
  decimals?: number;
  durationMs?: number;
  className?: string;
};

/**
 * Surface hero numbers: count up over --dur-count, then a single 80ms
 * scale settle (1.00 -> 1.015 -> 1.00), once, on load. Reduced-motion
 * renders the final value immediately with no settle.
 */
export function CountUpSettle({
  value,
  variant,
  decimals = 2,
  durationMs = 600,
  className = "",
}: CountUpSettleProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { display, done } = useCountUpFromZero(value, durationMs, reducedMotion);
  const formatted = variant === "currency" ? formatCurrency(display) : formatSignedPercent(display, decimals);
  const [settling, setSettling] = useState(false);
  const hasSettled = useRef(false);

  useEffect(() => {
    if (reducedMotion || !done || hasSettled.current) return;
    hasSettled.current = true;
    setSettling(true);
    const t = setTimeout(() => setSettling(false), 80);
    return () => clearTimeout(t);
  }, [done, reducedMotion]);

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        transform: settling ? "scale(1.015)" : "scale(1)",
        transition: reducedMotion ? undefined : "transform 80ms ease-out",
      }}
    >
      {formatted}
    </span>
  );
}
