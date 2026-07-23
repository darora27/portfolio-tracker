import { formatPercent } from "./format";
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

function directionWord(value: number): "Up" | "Down" {
  return value > 0 ? "Up" : "Down";
}

function magnitude(value: number): string {
  return formatPercent(Math.abs(value), 1);
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
