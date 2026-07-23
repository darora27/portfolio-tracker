/**
 * Net cash flow for a single date: today's buy trade totals minus today's
 * sell trade totals. Positive means money went in (a deposit), which must
 * be excluded from "today's change" — otherwise a same-day purchase reads
 * as a market gain.
 */
export function netFlowsForDate(
  trades: { date: string; action: "buy" | "sell"; total: number }[],
  date: string,
): number {
  return trades
    .filter((t) => t.date === date)
    .reduce((sum, t) => sum + (t.action === "buy" ? t.total : -t.total), 0);
}

/**
 * Dollar change in portfolio value for the current day, net of cash flows:
 * V_now - V_prev - netFlowsToday. Deposits/withdrawals are not profit, so
 * they're backed out before comparing to the prior day's close.
 */
export function dailyChangeAmount(vNow: number, vPrev: number, netFlowsToday: number): number {
  return vNow - vPrev - netFlowsToday;
}

/**
 * Percent change in portfolio value for the current day, net of cash
 * flows: (V_now - netFlowsToday) / V_prev - 1. Same end-of-day-flow
 * convention as `dailyReturns` in returns.ts — do not diverge from it.
 */
export function dailyChangePercent(vNow: number, vPrev: number, netFlowsToday: number): number {
  if (vPrev === 0) return 0;
  return (vNow - netFlowsToday) / vPrev - 1;
}
