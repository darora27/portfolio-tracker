// Static copy for /research, pulled into its own module (rather than an
// inline const in the page component) so it can be checked by the same
// banned-words test as src/lib/surface-copy.ts (PHASE9.md §4).
export const INSIDER_FILINGS_SUBTITLE =
  "Public SEC Form 4 disclosures — filed when insiders trade their own company's stock.";
export const RESEARCH_FOOTER_LINE = "Public information aggregated for personal research — not investment advice.";
/* R7 Aug: REDDIT_PENDING_MESSAGE is gone with the feature. It said
   "awaiting Reddit's API approval" for two phases, and the approval was
   never the blocker — Reddit refuses server-side clients outright. A message
   about a pending integration outlives its truth quickly. */
/* Was: "A row is ringed when news lean and Reddit lean agree and are both
   nonzero." The ring needed two sources to mean anything. */
export const CROSS_SOURCE_SUBTITLE = "News lean and insider activity across your held tickers, over the last 24 hours.";
export const RESEARCH_INTRO = "News and insider filings across your held tickers — public information only.";
