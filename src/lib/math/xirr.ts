import type { CashFlow } from "./types";

const MS_PER_DAY = 86_400_000;
const DAYS_PER_YEAR = 365;
const MAX_NEWTON_ITERATIONS = 50;
const MAX_BISECTION_ITERATIONS = 200;
const TOLERANCE = 1e-8;

function yearsBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / MS_PER_DAY / DAYS_PER_YEAR;
}

function npv(rate: number, flows: CashFlow[], t0: string): number {
  return flows.reduce(
    (sum, cf) => sum + cf.amount / Math.pow(1 + rate, yearsBetween(t0, cf.date)),
    0,
  );
}

function dnpv(rate: number, flows: CashFlow[], t0: string): number {
  return flows.reduce((sum, cf) => {
    const years = yearsBetween(t0, cf.date);
    if (years === 0) return sum;
    return sum - (cf.amount * years) / Math.pow(1 + rate, years + 1);
  }, 0);
}

function bisect(flows: CashFlow[], t0: string): number {
  let low = -0.999999;
  let high = 100;
  let npvLow = npv(low, flows, t0);
  for (let i = 0; i < MAX_BISECTION_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid, flows, t0);
    if (Math.abs(npvMid) < TOLERANCE) return mid;
    if (npvMid > 0 === npvLow > 0) {
      low = mid;
      npvLow = npvMid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

/**
 * XIRR (money-weighted annualized return) via Newton-Raphson, falling back
 * to bisection if it fails to converge. `cashFlows` needs at least one
 * negative and one positive amount — construct it as signed cash flows at
 * trade dates (buys negative, sells positive) plus the current total value
 * as a final positive flow as of today.
 */
export function xirr(cashFlows: CashFlow[], guess = 0.1): number {
  const sorted = [...cashFlows].sort((a, b) => (a.date < b.date ? -1 : 1));
  const t0 = sorted[0].date;

  let rate = guess;
  for (let i = 0; i < MAX_NEWTON_ITERATIONS; i++) {
    const value = npv(rate, sorted, t0);
    const derivative = dnpv(rate, sorted, t0);
    if (Math.abs(derivative) < TOLERANCE) break;
    const nextRate = Math.max(rate - value / derivative, -0.999999);
    if (Math.abs(nextRate - rate) < TOLERANCE) {
      return nextRate;
    }
    rate = nextRate;
  }

  if (Number.isFinite(rate) && Math.abs(npv(rate, sorted, t0)) < 1e-4) {
    return rate;
  }
  return bisect(sorted, t0);
}
