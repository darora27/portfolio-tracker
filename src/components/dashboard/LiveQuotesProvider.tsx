"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { dayChange } from "@/lib/portfolio/holdings";
import type { PositionRow } from "./PositionsTable";

type QuotesResponse = { quotes: Record<string, number>; marketOpen: boolean };

type LiveQuotesState = {
  positions: PositionRow[];
  totalValue: number;
};

const LiveQuotesContext = createContext<LiveQuotesState | null>(null);

/**
 * Polls /api/quotes every 60s (only while the tab is visible; stops for
 * good once a response says the market is closed) and recomputes each
 * position's price/value/Day $/Day % from the new quotes. Everything
 * else about a position (gain, weight, contribution — since-purchase
 * figures) stays frozen at the server-rendered snapshot; only what §6
 * names as live ("Positions day columns, Daily Change, Total Value, and
 * movers") is meant to move between page loads.
 */
export function LiveQuotesProvider({
  initialPositions,
  children,
}: {
  initialPositions: PositionRow[];
  children: ReactNode;
}) {
  const [positions, setPositions] = useState(initialPositions);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;

    async function poll() {
      if (stoppedRef.current || document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/quotes");
        if (!res.ok) return;
        const data: QuotesResponse = await res.json();
        if (!data.marketOpen) stoppedRef.current = true;

        setPositions((prev) =>
          prev.map((p) => {
            const livePrice = data.quotes[p.ticker] ?? p.price;
            const { day, dayPct } = dayChange(p.shares, livePrice, p.prevClose);
            const value = livePrice !== null ? p.shares * livePrice : p.value;
            return { ...p, price: livePrice, value, day, dayPct };
          }),
        );
      } catch {
        // Transient network failure — the next 60s tick retries.
      }
    }

    const intervalId = setInterval(poll, 60_000);
    return () => clearInterval(intervalId);
  }, []);

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);

  return <LiveQuotesContext.Provider value={{ positions, totalValue }}>{children}</LiveQuotesContext.Provider>;
}

export function useLiveQuotes(): LiveQuotesState {
  const ctx = useContext(LiveQuotesContext);
  if (!ctx) throw new Error("useLiveQuotes must be used within a LiveQuotesProvider");
  return ctx;
}
