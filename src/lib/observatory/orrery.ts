import { trailingReturn } from "@/lib/portfolio/trailing-return";

export const ORRERY_FLAT_EPSILON = 0.0005;
export const ORRERY_MIN_RADIUS = 0.34;
export const ORRERY_MAX_RADIUS = 0.92;
export const ORRERY_MIN_ANGULAR_SPEED = 0.08;
export const ORRERY_MAX_ANGULAR_SPEED = 0.32;

const MIN_WEIGHT = 0.01;
const MAX_WEIGHT = 0.35;
const MIN_SPEED_RETURN = 0.002;
const MAX_SPEED_RETURN = 0.12;

const COMPANY_NAMES: Record<string, string> = {
  ASML: "ASML Holding",
  CBRS: "CBRS",
  COST: "Costco Wholesale",
  CRM: "Salesforce",
  GOOG: "Alphabet",
  IBM: "IBM",
  INTC: "Intel",
  KYMR: "Kymera Therapeutics",
  MEI: "Methode Electronics",
  MSFT: "Microsoft",
  NBIS: "Nebius Group",
  ORCL: "Oracle",
  SPCX: "SPAC and New Issue ETF",
};

export type OrreryDirection = "clockwise" | "counterclockwise" | "neutral";

export type PublicOrreryHolding = {
  ticker: string;
  companyName: string;
  weight: number;
  weeklyReturn: number | null;
  portfolioRelativeReturn: number | null;
  volatilityPct: number | null;
  betaVsVoo: number | null;
};

export function companyNameForTicker(ticker: string): string {
  return COMPANY_NAMES[ticker] ?? `${ticker} holding`;
}
export function radiusForWeight(weight: number): number {
  const clamped = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, weight));
  const normalized = (clamped - MIN_WEIGHT) / (MAX_WEIGHT - MIN_WEIGHT);
  return ORRERY_MIN_RADIUS + Math.sqrt(normalized) * (ORRERY_MAX_RADIUS - ORRERY_MIN_RADIUS);
}

export function directionForWeeklyReturn(
  weeklyReturn: number | null,
): OrreryDirection {
  if (weeklyReturn === null || Math.abs(weeklyReturn) <= ORRERY_FLAT_EPSILON) {
    return "neutral";
  }
  return weeklyReturn > 0 ? "clockwise" : "counterclockwise";
}

export function angularSpeedForWeeklyReturn(weeklyReturn: number | null): number {
  if (directionForWeeklyReturn(weeklyReturn) === "neutral") return 0;
  const magnitude = Math.abs(weeklyReturn ?? 0);
  const clamped = Math.min(MAX_SPEED_RETURN, Math.max(MIN_SPEED_RETURN, magnitude));
  const normalized = (clamped - MIN_SPEED_RETURN) / (MAX_SPEED_RETURN - MIN_SPEED_RETURN);
  return ORRERY_MIN_ANGULAR_SPEED +
    normalized * (ORRERY_MAX_ANGULAR_SPEED - ORRERY_MIN_ANGULAR_SPEED);
}

export function weeklyReturnForPrices(
  prices: readonly { date: string; price: number }[],
): number | null {
  return trailingReturn(
    prices.map(({ date, price }) => ({ date, index: price })),
    7,
  );
}
