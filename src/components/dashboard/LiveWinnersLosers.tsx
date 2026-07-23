"use client";

import { useLiveQuotes } from "./LiveQuotesProvider";
import { WinnersLosers, type Mover } from "./WinnersLosers";
import type { Position } from "@/lib/portfolio/holdings";

export function LiveWinnersLosers({
  winners,
  losers,
}: {
  winners: (Position & { gainPct: number })[];
  losers: (Position & { gainPct: number })[];
}) {
  const { positions } = useLiveQuotes();

  const movers: Mover[] = [...positions]
    .filter((p): p is typeof p & { day: number; dayPct: number } => p.day !== null && p.dayPct !== null)
    .sort((a, b) => Math.abs(b.dayPct) - Math.abs(a.dayPct))
    .slice(0, 3)
    .map((p) => ({ ticker: p.ticker, day: p.day, dayPct: p.dayPct }));

  return <WinnersLosers winners={winners} losers={losers} movers={movers} />;
}
