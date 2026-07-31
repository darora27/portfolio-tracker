import type { CashFlow } from "@/lib/math/types";
import {
  isMarketSessionOpen,
  newYorkParts,
  weekdayLabel,
} from "@/lib/market-calendar";

export type Trade = {
  date: string;
  ticker: string;
  action: "buy" | "sell";
  shares: number;
  price: number;
};

export type PricePoint = {
  price: number;
  date: string;
};

export type Position = {
  ticker: string;
  shares: number;
  costBasis: number;
  price: number | null;
  priceAsOf: string | null;
  value: number;
  gain: number | null;
  gainPct: number | null;
  weight: number;
};

/**
 * Current holdings, derived from trades (sum of buys minus sells per
 * ticker) — never read from a stored positions table. Positions with no
 * known price fall back to their cost basis for `value`, with `price`,
 * `priceAsOf`, `gain`, and `gainPct` left null rather than showing a
 * misleading $0 gain.
 */
export function computeHoldings(trades: Trade[], prices: Map<string, PricePoint>): Position[] {
  const byTicker = new Map<string, { shares: number; costBasis: number }>();
  for (const trade of trades) {
    const sign = trade.action === "buy" ? 1 : -1;
    const entry = byTicker.get(trade.ticker) ?? { shares: 0, costBasis: 0 };
    entry.shares += sign * trade.shares;
    entry.costBasis += sign * trade.shares * trade.price;
    byTicker.set(trade.ticker, entry);
  }

  const withoutWeight: Omit<Position, "weight">[] = [];
  for (const [ticker, { shares, costBasis }] of byTicker) {
    if (shares <= 0) continue; // fully sold out of this ticker
    const priceInfo = prices.get(ticker) ?? null;
    const value = priceInfo ? shares * priceInfo.price : costBasis;
    const gain = priceInfo ? value - costBasis : null;
    const gainPct = gain !== null && costBasis !== 0 ? gain / costBasis : null;
    withoutWeight.push({
      ticker,
      shares,
      costBasis,
      price: priceInfo?.price ?? null,
      priceAsOf: priceInfo?.date ?? null,
      value,
      gain,
      gainPct,
    });
  }

  const totalValue = withoutWeight.reduce((sum, p) => sum + p.value, 0);
  return withoutWeight
    .map((p) => ({ ...p, weight: totalValue > 0 ? p.value / totalValue : 0 }))
    .sort((a, b) => b.value - a.value);
}

/** For each ticker, the price from its most recent dated observation. */
export function latestKnownPrices(
  rows: { ticker: string; closePrice: number; date: string }[],
): Map<string, PricePoint> {
  const prices = new Map<string, PricePoint>();
  for (const row of rows) {
    const existing = prices.get(row.ticker);
    if (!existing || row.date > existing.date) {
      prices.set(row.ticker, { price: row.closePrice, date: row.date });
    }
  }
  return prices;
}

export function topWinnersLosers(positions: Position[], n = 3) {
  const ranked = positions.filter(
    (p): p is Position & { gainPct: number } => p.gainPct !== null,
  );
  const winners = [...ranked].sort((a, b) => b.gainPct - a.gainPct).slice(0, n);
  const losers = [...ranked].sort((a, b) => a.gainPct - b.gainPct).slice(0, n);
  return { winners, losers };
}

/**
 * Combines live quotes with a last-known-price fallback: live wins per
 * ticker when available, otherwise the fallback carries that ticker so a
 * down/rate-limited Finnhub degrades to stale prices instead of no price.
 */
export function mergePrices(
  live: Map<string, PricePoint>,
  fallback: Map<string, PricePoint>,
): Map<string, PricePoint> {
  const merged = new Map(fallback);
  for (const [ticker, price] of live) merged.set(ticker, price);
  return merged;
}

/** The most recent priceAsOf date across all priced positions, or null if none are priced. */
export function latestPriceDate(positions: Position[]): string | null {
  const dates = positions.map((p) => p.priceAsOf).filter((d): d is string => d !== null);
  return dates.length === 0 ? null : dates.reduce((max, d) => (d > max ? d : max));
}

/** Top-2 concentration and Herfindahl-Hirschman Index (0-10000 scale) from position weights. */
export function concentration(positions: Position[]) {
  const weights = positions.map((p) => p.weight).sort((a, b) => b - a);
  const top2 = weights.slice(0, 2).reduce((sum, w) => sum + w, 0);
  const hhi = weights.reduce((sum, w) => sum + w * w, 0) * 10000;
  return { top2, hhi };
}

/**
 * The reference price for "today's change": the most recent snapshot
 * close strictly before today, or — if this ticker's first trade IS
 * today — the price it was bought at. Rationale: the holder's actual day
 * P&L starts at purchase, not at yesterday's close for shares they didn't
 * own yet.
 */
export function resolvePrevClose(
  firstTradeDate: string | undefined,
  firstTradePrice: number | undefined,
  priorClose: PricePoint | undefined,
  today: string,
): { prevClose: number | null; boughtToday: boolean } {
  if (firstTradeDate === today) {
    return { prevClose: firstTradePrice ?? null, boughtToday: true };
  }
  return { prevClose: priorClose?.price ?? null, boughtToday: false };
}

export type DayChange = {
  day: number | null;
  dayPct: number | null;
};

/**
 * Today's dollar/percent change for a single position: day$ = shares *
 * (livePrice - prevClose), day% = livePrice/prevClose - 1. Null when
 * either price is unavailable rather than dividing by a missing price.
 */
export function dayChange(shares: number, livePrice: number | null, prevClose: number | null): DayChange {
  if (livePrice === null || prevClose === null) return { day: null, dayPct: null };
  return {
    day: shares * (livePrice - prevClose),
    dayPct: prevClose !== 0 ? livePrice / prevClose - 1 : null,
  };
}

export type DailyDirection = "up" | "down" | "flat";

export type DailyChange = {
  /** Fractional change — 0.0123 means +1.23%. Null when unavailable. */
  pct: number | null;
  /** Position-level dollar change. Null when unavailable. */
  dollars: number | null;
  /** "TODAY" during a live session, else "<WEEKDAY> CLOSE" of the carried day. */
  label: string;
  /** Null whenever pct is null — missing data has no direction. */
  direction: DailyDirection | null;
  /** True when this is a carried prior-session figure, not a live one. */
  carried: boolean;
};

/**
 * Below this, a move is reported as flat rather than up or down. 5 basis
 * points: small enough that a real move is never swallowed, large enough
 * that float noise on an unchanged price never renders an arrow.
 */
const FLAT_EPSILON = 0.0005;

function directionFor(pct: number | null): DailyDirection | null {
  if (pct === null) return null;
  if (Math.abs(pct) < FLAT_EPSILON) return "flat";
  return pct > 0 ? "up" : "down";
}

/**
 * The single source of "the daily move" for every surface — hero strip,
 * holdings rows, movers line, planet panel, Chart Room header, and the
 * scene model's orbital inputs.
 *
 * Two regimes:
 *
 * - **Session open.** Live quote measured against the last completed close.
 *   Labelled "TODAY".
 * - **Session closed** (nights, weekends, holidays, or no live quote). The
 *   last completed close measured against the one before it — the market's
 *   most recent actual day — labelled "<WEEKDAY> CLOSE" so the figure never
 *   claims to be today's.
 *
 * The second regime is the fix for every holding reading 0.0%: outside a
 * session the live price and the latest close are the *same number*, so
 * measuring one against the other yields a real, meaningful zero for
 * thirteen positions at once. Carrying the prior session instead reports
 * the last thing that actually happened, which is what a reader means by
 * "how is it doing".
 *
 * Missing data propagates as null and never as zero (CLAUDE.md: never show
 * zeros as if they were real). A null pct yields a null direction, so a
 * missing figure cannot render an arrow.
 */
export function resolveDailyChange({
  shares,
  quotePrice,
  closes,
  now,
  firstTradeDate,
  firstTradePrice,
}: {
  shares: number;
  /** Live price, or null when no usable quote is available. */
  quotePrice: number | null;
  /** This ticker's close history. Order does not matter; sorted internally. */
  closes: PricePoint[];
  now: Date;
  firstTradeDate?: string;
  firstTradePrice?: number;
}): DailyChange {
  const sorted = [...closes].sort((a, b) => (a.date < b.date ? -1 : 1));
  const measure = (from: number | null, to: number) => {
    if (from === null || from <= 0) return { pct: null, dollars: null };
    return { pct: to / from - 1, dollars: shares * (to - from) };
  };

  if (isMarketSessionOpen(now) && quotePrice !== null) {
    const today = newYorkParts(now).date;
    const priorClose = [...sorted].reverse().find((point) => point.date < today);
    const { prevClose } = resolvePrevClose(
      firstTradeDate,
      firstTradePrice,
      priorClose,
      today,
    );
    const { pct, dollars } = measure(prevClose, quotePrice);
    return {
      pct,
      dollars,
      label: "TODAY",
      direction: directionFor(pct),
      carried: false,
    };
  }

  const last = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const label = last ? `${weekdayLabel(last.date)} CLOSE` : "CLOSE";
  if (!last || !previous) {
    return { pct: null, dollars: null, label, direction: null, carried: true };
  }
  const { pct, dollars } = measure(previous.price, last.price);
  return { pct, dollars, label, direction: directionFor(pct), carried: true };
}

/**
 * Signed cash flows for XIRR: buys negative, sells positive, plus the
 * current total value as a final positive flow as of today.
 */
export function buildXirrCashFlows(
  trades: Trade[],
  currentValue: number,
  asOfDate: string,
): CashFlow[] {
  const flows: CashFlow[] = trades.map((trade) => ({
    date: trade.date,
    amount: trade.action === "buy" ? -trade.shares * trade.price : trade.shares * trade.price,
  }));
  flows.push({ date: asOfDate, amount: currentValue });
  return flows;
}
