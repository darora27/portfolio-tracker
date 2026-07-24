import { formatDate, formatPercent } from "./format";
import { concentrationStatus } from "./portfolio/concentration-status";

// Deterministic template copy for the surface tier — no LLM calls, so it's
// free, instant, and testable. "Legible to an 8-year-old or an 80-year-old."

// PHASE9.md's prose states the "little changed" cutoff as |twr7d| < 0.0005,
// but its own exact fixture {twr7d: 0.0009, voo7d: 0.0002} expects "Little
// changed this week." — 0.0009 is NOT < 0.0005, so the two are
// inconsistent. The fixtures are the binding pass/fail spec (same
// convention as every other phase file's "Fixtures (exact)" blocks), so
// this reuses the market-clause epsilon (0.0015) — the only other
// threshold in the same rule, and the smallest reasonable read of what
// the author meant — as the little-changed cutoff too. Recorded in
// PHASE9_PROGRESS.md §2.
const LITTLE_CHANGED_THRESHOLD = 0.0015;
const MARKET_CLAUSE_THRESHOLD = 0.0015;
export const PULSE_MATERIALITY_THRESHOLD = MARKET_CLAUSE_THRESHOLD;

function directionWord(value: number): "Up" | "Down" {
  return value > 0 ? "Up" : "Down";
}

function magnitude(value: number): string {
  return formatPercent(Math.abs(value), 1);
}

function pointMagnitude(value: number): string {
  return magnitude(value).replace(/%$/, "");
}

export type WeeklySublineInput = { twr7d: number; voo7d: number };

/**
 * `"Up 2.4% this week — ahead of the market."` / `"Little changed this
 * week."` — the surface Act 1 subline under the hero number.
 */
export function weeklySubline({ twr7d, voo7d }: WeeklySublineInput): string {
  if (Math.abs(twr7d) < LITTLE_CHANGED_THRESHOLD) return "Little changed this week.";

  const d = twr7d - voo7d;
  const clause =
    Math.abs(d) < MARKET_CLAUSE_THRESHOLD
      ? "about even with the market"
      : d >= MARKET_CLAUSE_THRESHOLD
        ? "ahead of the market"
        : "behind the market";

  return `${directionWord(twr7d)} ${magnitude(twr7d)} this week — ${clause}.`;
}

export type TodayLineInput = { dayReturn: number };

/** Same thresholds as weeklySubline, "today" wording, no market clause (no benchmark input). */
export function todayLine({ dayReturn }: TodayLineInput): string {
  if (Math.abs(dayReturn) < LITTLE_CHANGED_THRESHOLD) return "Little changed today.";
  return `${directionWord(dayReturn)} ${magnitude(dayReturn)} today.`;
}

/** Maps the Phase 8 HHI concentration bands (src/lib/portfolio/concentration-status.ts) to plain language. */
export function riskLine(hhi: number): string {
  const { tier } = concentrationStatus(hhi);
  if (tier === "critical") return "Very concentrated — a few stocks drive most of the movement.";
  if (tier === "warning") return "Moderately concentrated.";
  return "Well spread out.";
}

export function windowLabel(firstFundedDate: string): string {
  return `since ${formatDate(firstFundedDate)}`;
}

export type PulseLeadInput = {
  historyDays: number;
  portfolioTwrPct: number;
  benchmark: {
    available: boolean;
    twrPct: number | null;
    excessReturnPct: number | null;
  };
  windowLabel: string;
};

export function pulseLeadCopy({
  historyDays,
  portfolioTwrPct,
  benchmark,
  windowLabel: label,
}: PulseLeadInput): string {
  if (
    historyDays < 14 ||
    !benchmark.available ||
    benchmark.twrPct === null ||
    benchmark.excessReturnPct === null
  ) {
    return "Building the market-relative picture — a full comparison needs more trading history.";
  }

  const period = label.replace(/^since\s+/i, "");
  const gapPct = benchmark.excessReturnPct;
  if (Math.abs(gapPct) < PULSE_MATERIALITY_THRESHOLD) {
    return `Since ${period}, the portfolio is ${directionWord(portfolioTwrPct)} ${magnitude(portfolioTwrPct)}, about even with VOO.`;
  }

  const gapWord =
    gapPct > 0
      ? `a ${pointMagnitude(gapPct)}-point lead over`
      : `a ${pointMagnitude(gapPct)}-point gap behind`;
  return `Since ${period}, the portfolio is ${directionWord(portfolioTwrPct)} ${magnitude(portfolioTwrPct)} while VOO is ${directionWord(benchmark.twrPct)} ${magnitude(benchmark.twrPct)} — ${gapWord} the market.`;
}

export type PulseDriverInput = {
  historyDays: number;
  benchmarkAvailable: boolean;
  gapPct: number | null;
  positions: { ticker: string; contribution: number | null }[];
};

export function pulseDriverCopy({
  historyDays,
  benchmarkAvailable,
  gapPct,
  positions,
}: PulseDriverInput): string | null {
  if (historyDays < 14 || !benchmarkAvailable || gapPct === null) return null;

  const drags = positions
    .filter(
      (position): position is { ticker: string; contribution: number } =>
        position.contribution !== null && position.contribution <= -PULSE_MATERIALITY_THRESHOLD,
    )
    .sort((a, b) => a.contribution - b.contribution);
  const boosts = positions
    .filter(
      (position): position is { ticker: string; contribution: number } =>
        position.contribution !== null && position.contribution >= PULSE_MATERIALITY_THRESHOLD,
    )
    .sort((a, b) => b.contribution - a.contribution);

  if (drags.length === 0 && boosts.length === 0) return "No single holding drove most of the result.";

  if (gapPct <= 0) {
    if (drags.length === 0) return "No single holding drove most of the result.";
    const cause =
      drags.length === 1
        ? `The largest drag came from ${drags[0].ticker}.`
        : `Most of the shortfall came from ${drags[0].ticker} and ${drags[1].ticker}.`;
    return boosts.length > 0 ? `${cause} ${boosts[0].ticker} offset part of it.` : cause;
  }

  if (boosts.length === 0) return "No single holding drove most of the result.";
  const cause =
    boosts.length === 1
      ? `The largest gain came from ${boosts[0].ticker}.`
      : `Most of the lead came from ${boosts[0].ticker} and ${boosts[1].ticker}.`;
  return drags.length > 0 ? `${cause} ${drags[0].ticker} offset part of it.` : cause;
}

/**
 * Words this module (and anything quoting it, e.g. /research's static
 * copy) must never use — imperative or advice language. Exported so
 * other UI copy can be checked against the same list rather than each
 * re-deriving it.
 */
export const SURFACE_BANNED_WORDS = ["buy", "sell", "should", "consider", "recommend"] as const;

/** True if `text` contains any SURFACE_BANNED_WORDS as a whole word, case-insensitive. */
export function containsBannedLanguage(text: string): boolean {
  return SURFACE_BANNED_WORDS.some((word) => new RegExp(`\\b${word}\\b`, "i").test(text));
}
