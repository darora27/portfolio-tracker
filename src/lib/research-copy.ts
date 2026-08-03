// Static copy for /research, pulled into its own module (rather than an
// inline const in the page component) so it can be checked by the same
// banned-words test as src/lib/surface-copy.ts (PHASE9.md §4).
export const INSIDER_FILINGS_SUBTITLE =
  "Public SEC Form 4 disclosures — filed when insiders trade their own company's stock.";
export const RESEARCH_FOOTER_LINE = "Public information aggregated for personal research — not investment advice.";
/* R7 Aug: the approval is never coming, and it is no longer needed — the
   public JSON endpoints require none. This message now covers the only
   remaining reason the section can be empty: Reddit was unreachable, or
   nobody has mentioned these tickers in the window. */
export const REDDIT_PENDING_MESSAGE = "No Reddit mentions for your holdings in the last 24 hours.";
export const CROSS_SOURCE_SUBTITLE = "A row is ringed when news lean and Reddit lean agree and are both nonzero.";
export const RESEARCH_INTRO = "News, Reddit mentions, and insider filings across your held tickers — public information only.";
