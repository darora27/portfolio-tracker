/**
 * Downside deviation: population standard deviation of returns below the
 * minimum acceptable return (mar), squaring the shortfall against ALL n
 * observations (not just the ones below mar) — the standard Sortino-ratio
 * denominator.
 */
export function downsideDeviation(returns: number[], mar = 0): number {
  if (returns.length === 0) return 0;
  const sumSquaredShortfall = returns.reduce((sum, r) => sum + Math.min(r - mar, 0) ** 2, 0);
  return Math.sqrt(sumSquaredShortfall / returns.length);
}

const TRADING_DAYS_PER_YEAR = 252;

/**
 * Sortino ratio: annualized excess return over downside deviation. Null
 * when downside deviation is 0 (no losing days to divide by) rather than
 * dividing by zero — the UI renders "—" for that case.
 */
export function sortino(returns: number[], rf = 0.04): number | null {
  const dd = downsideDeviation(returns);
  if (dd === 0) return null;
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  return (meanReturn * TRADING_DAYS_PER_YEAR - rf) / (dd * Math.sqrt(TRADING_DAYS_PER_YEAR));
}

/** Fraction of days with a strictly positive return. Zero-return days count in n, not as wins. */
export function winRate(returns: number[]): number {
  if (returns.length === 0) return 0;
  return returns.filter((r) => r > 0).length / returns.length;
}

export type DatedReturn = { date: string; r: number };

/** The single best day by return, with its date. Null for an empty series. */
export function bestDay(returns: DatedReturn[]): DatedReturn | null {
  if (returns.length === 0) return null;
  return returns.reduce((best, cur) => (cur.r > best.r ? cur : best));
}

/** The single worst day by return, with its date. Null for an empty series. */
export function worstDay(returns: DatedReturn[]): DatedReturn | null {
  if (returns.length === 0) return null;
  return returns.reduce((worst, cur) => (cur.r < worst.r ? cur : worst));
}

export type Streak = { dir: "up" | "down"; n: number };

/**
 * The current up/down streak, counted backwards from the most recent day
 * while the sign stays consistent. A zero return breaks the streak (it's
 * neither up nor down) — including as the most recent day, which yields
 * no current streak at all (null).
 */
export function currentStreak(returns: number[]): Streak | null {
  if (returns.length === 0) return null;
  const last = returns[returns.length - 1];
  if (last === 0) return null;
  const dir: "up" | "down" = last > 0 ? "up" : "down";

  let n = 0;
  for (let i = returns.length - 1; i >= 0; i--) {
    const r = returns[i];
    if (dir === "up" ? r > 0 : r < 0) n++;
    else break;
  }
  return { dir, n };
}
