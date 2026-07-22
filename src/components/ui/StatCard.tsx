"use client";

import type { ReactNode } from "react";
import { Card } from "./Card";
import { useCountUp } from "./useCountUp";
import { formatCurrency, formatPercent, formatSignedCurrency, formatSignedPercent } from "@/lib/format";

type NumberFormat = "usd" | "signedUsd" | "pct" | "signedPct";

const formatters: Record<NumberFormat, (n: number) => string> = {
  usd: (n) => formatCurrency(n),
  signedUsd: (n) => formatSignedCurrency(n),
  pct: (n) => formatPercent(n),
  signedPct: (n) => formatSignedPercent(n),
};

export function StatCard({
  label,
  value,
  format,
  sublabel,
  delta,
  muted = false,
  headline = false,
}: {
  label: string;
  /** A raw number animates as a count-up (paired with `format`); a string renders as-is. */
  value: number | string;
  format?: NumberFormat;
  sublabel?: ReactNode;
  delta?: ReactNode;
  muted?: boolean;
  headline?: boolean;
}) {
  const numeric = typeof value === "number";
  const animated = useCountUp(numeric ? value : 0);
  const displayValue = numeric ? (format ? formatters[format](animated) : animated.toString()) : value;

  return (
    <Card padding={headline ? "p-8" : "p-6"} className={muted ? "opacity-60" : ""}>
      <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </div>
      <div
        className={`mt-1 font-mono font-bold text-text-primary ${headline ? "text-4xl" : "text-2xl"}`}
      >
        {displayValue}
      </div>
      {(delta || sublabel) && (
        <div className="mt-1.5 flex items-center gap-2">
          {delta}
          {sublabel && <span className="text-xs text-text-secondary">{sublabel}</span>}
        </div>
      )}
    </Card>
  );
}
