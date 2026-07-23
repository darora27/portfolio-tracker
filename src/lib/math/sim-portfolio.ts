import { dailyReturns } from "./returns";
import { twr } from "./twr";

const INCEPTION_CAPITAL = 10_000;
export const SIM_INCEPTION_DATE = "2026-06-24";

export type SimTrade = {
  date: string;
  ticker: string;
  action: "buy" | "sell";
  shares: number;
  reason: string;
};

export type SimResult = {
  name: string;
  valueSeries: { date: string; value: number }[];
  /** Daily net-of-flow returns (length = valueSeries.length - 1) — reuse for vol/maxDD via the existing math functions, rather than re-deriving from valueSeries. */
  returns: number[];
  twrPct: number;
  trades: SimTrade[];
};

export type Weight = { ticker: string; weight: number };

/** ticker -> date -> close. */
export type CloseMap = Map<string, Map<string, number>>;

function closeOn(closes: CloseMap, ticker: string, date: string): number | undefined {
  return closes.get(ticker)?.get(date);
}

/** Most recent known close for `ticker` on or before `date` — carries forward through a gap rather than treating it as zero. */
function closeOnOrBefore(closes: CloseMap, ticker: string, date: string): number | undefined {
  const series = closes.get(ticker);
  if (!series) return undefined;
  let best: { d: string; c: number } | undefined;
  for (const [d, c] of series) {
    if (d <= date && (!best || d > best.d)) best = { d, c };
  }
  return best?.c;
}

/** Returns + TWR from a value series with no cash flows after inception (totalCost is flat), same convention as the real portfolio. */
function returnsAndTwrFromValues(dates: string[], values: number[]): { returns: number[]; twrPct: number } {
  const snapshots = dates.map((date, i) => ({ date, totalCost: INCEPTION_CAPITAL, totalValue: values[i] }));
  const returns = dailyReturns(snapshots);
  return { returns, twrPct: twr(returns) };
}

/**
 * "Steady Market" — 100% VOO, buy and hold. Deliberately NOT built on the
 * general rebalance engine below: this must be algebraically identical
 * to the dashboard's own same-period VOO return (computed the same way,
 * via dailyReturns + twr, over a value series that's a constant multiple
 * of VOO's close price) — the Identity fixture checks this to 1e-9.
 */
export function steadyMarket(dates: string[], vooCloses: Map<string, number>): SimResult {
  const [firstDate] = dates;
  const firstClose = vooCloses.get(firstDate);
  if (dates.length === 0 || firstClose === undefined) {
    return { name: "Steady Market", valueSeries: [], returns: [], twrPct: 0, trades: [] };
  }

  const shares = INCEPTION_CAPITAL / firstClose;
  const valueSeries = dates.map((date) => ({ date, value: shares * (vooCloses.get(date) ?? firstClose) }));
  const { returns, twrPct } = returnsAndTwrFromValues(
    dates,
    valueSeries.map((v) => v.value),
  );

  return {
    name: "Steady Market",
    valueSeries,
    returns,
    twrPct,
    trades: [{ date: firstDate, ticker: "VOO", shares, action: "buy", reason: "initial purchase: 100% VOO, buy and hold" }],
  };
}

/**
 * Shared engine for a portfolio rebalanced to `targetWeightsAt(date)` on
 * each date in `rebalanceDates` (day 0 is always treated as a rebalance
 * — the initial buy). Renormalizes among only the tickers with an
 * available close on that specific date (a missing close is skipped,
 * not treated as zero), so a caller's target weights never need to be
 * pre-filtered for availability.
 */
export function simulateRebalanced(
  name: string,
  dates: string[],
  closes: CloseMap,
  rebalanceDates: ReadonlySet<string>,
  targetWeightsAt: (date: string) => Weight[],
  reasonAt: (date: string, isInitial: boolean) => string,
): SimResult {
  if (dates.length === 0) return { name, valueSeries: [], returns: [], twrPct: 0, trades: [] };

  let shares = new Map<string, number>();
  const trades: SimTrade[] = [];
  const valueSeries: { date: string; value: number }[] = [];

  for (const [i, date] of dates.entries()) {
    // Mark current holdings to market at today's (or last known) closes.
    let value = 0;
    for (const [ticker, sh] of shares) {
      const price = closeOnOrBefore(closes, ticker, date);
      if (price !== undefined) value += sh * price;
    }
    if (i === 0) value = INCEPTION_CAPITAL;

    if (i === 0 || rebalanceDates.has(date)) {
      const rawWeights = targetWeightsAt(date);
      const available = rawWeights.filter((w) => closeOn(closes, w.ticker, date) !== undefined);
      const totalWeight = available.reduce((sum, w) => sum + w.weight, 0);

      const nextShares = new Map<string, number>();
      if (totalWeight > 0) {
        for (const w of available) {
          const price = closeOn(closes, w.ticker, date)!;
          const targetValue = value * (w.weight / totalWeight);
          nextShares.set(w.ticker, targetValue / price);
        }
      }

      // Log the delta vs. the prior holding for every ticker touched, either side.
      const touched = new Set([...shares.keys(), ...nextShares.keys()]);
      for (const ticker of touched) {
        const before = shares.get(ticker) ?? 0;
        const after = nextShares.get(ticker) ?? 0;
        const delta = after - before;
        if (Math.abs(delta) < 1e-9) continue;
        trades.push({
          date,
          ticker,
          action: delta > 0 ? "buy" : "sell",
          shares: Math.abs(delta),
          reason: reasonAt(date, i === 0),
        });
      }

      shares = nextShares;
    }

    valueSeries.push({ date, value });
  }

  const { returns, twrPct } = returnsAndTwrFromValues(
    dates,
    valueSeries.map((v) => v.value),
  );

  return {
    name,
    valueSeries,
    returns,
    twrPct,
    trades,
  };
}

/** First date in `dates` (already ascending) for each distinct calendar month present. */
export function firstTradingDayOfEachMonth(dates: string[]): Set<string> {
  const seenMonths = new Set<string>();
  const result = new Set<string>();
  for (const date of dates) {
    const month = date.slice(0, 7);
    if (!seenMonths.has(month)) {
      seenMonths.add(month);
      result.add(date);
    }
  }
  return result;
}

/** "Tech Tilt" — 50/50 VOO/XLK, rebalanced to 50/50 on the first trading day of each month. */
export function techTilt(dates: string[], closes: CloseMap): SimResult {
  const rebalanceDates = firstTradingDayOfEachMonth(dates);
  return simulateRebalanced(
    "Tech Tilt",
    dates,
    closes,
    rebalanceDates,
    () => [
      { ticker: "VOO", weight: 0.5 },
      { ticker: "XLK", weight: 0.5 },
    ],
    (_date, isInitial) => (isInitial ? "initial purchase: 50/50 VOO/XLK" : "monthly rebalance: rule = 50/50 VOO/XLK"),
  );
}

/**
 * "AI Concentrate" — equal-weight the tickers that are BOTH held in the
 * real portfolio AND rated High in data/ai-exposure.json, re-formed
 * monthly. A ticker missing a close on a rebalance date is skipped (the
 * shared engine's availability filter handles this); if fewer than 3 of
 * the qualifying tickers have a close on a given rebalance date, that
 * month holds 100% VOO instead.
 */
export function aiConcentrate(dates: string[], closes: CloseMap, qualifyingTickers: string[]): SimResult {
  const rebalanceDates = firstTradingDayOfEachMonth(dates);

  function targetWeightsAt(date: string): Weight[] {
    const available = qualifyingTickers.filter((t) => closeOn(closes, t, date) !== undefined);
    if (available.length < 3) return [{ ticker: "VOO", weight: 1 }];
    const w = 1 / available.length;
    return available.map((ticker) => ({ ticker, weight: w }));
  }

  return simulateRebalanced(
    "AI Concentrate",
    dates,
    closes,
    rebalanceDates,
    targetWeightsAt,
    (_date, isInitial) =>
      isInitial ? "initial purchase: equal-weight High-AI holdings" : "monthly rebalance: rule = equal-weight High-AI holdings",
  );
}
