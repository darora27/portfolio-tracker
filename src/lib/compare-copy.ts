// Mandatory verbatim banner for every view that renders sim data
// (PHASE9.md §5). "recommendations" here is the one sanctioned exception
// to the §2 banned-words list — see surface-copy.ts's
// containsBannedLanguage, which word-boundary-matches "recommend" and so
// never flags "recommendations" in the first place.
export const SIMULATIONS_BANNER =
  "SIMULATIONS — hypothetical portfolios for comparison only. Not advice, not predictions, not recommendations.";
