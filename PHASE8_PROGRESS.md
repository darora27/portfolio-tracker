# Phase 8 Progress Log

Read this first at the start of every session. Work only unchecked items,
top to bottom. Commit after each section (`phase8(§N): <summary>`) with
`npm test` and `npm run build` green.

## Checklist

- [x] §0 Preflight
- [x] §1 Correctness fix — Daily Change net of cash flows
- [x] §2 Positions table upgrade (day columns, sparklines, clickable rows)
- [x] §3 Position detail page `/stock/[ticker]`
- [x] §4 History page `/history`
- [x] §5 Dashboard additions (news, ATH chip, risk extensions)
- [x] §6 Live quotes + auto-refresh
- [ ] §7 CSV export
- [x] §8 Finnhub data layer (cache module)
- [ ] §9 Privacy matrix re-verification
- [ ] §10 Integration pass
- [ ] §11 Final summary

## §0 Preflight results

- Baseline confirmed green: `npm test` — 86 tests / 18 files passed.
  `npm run build` — compiles clean, all 9 routes render.
- Finnhub probes (symbol=ASML), status codes only:
  - `/company-news?symbol=ASML&from=<14d ago>&to=<today>` → **200**.
    Array of 247 items, fields: category, datetime, headline, id, image,
    related, source, summary, url. Usable as-is for §3/§5.
  - `/stock/recommendation?symbol=ASML` → **200**. Array of 4 monthly
    rows, fields: symbol, period, strongBuy, buy, hold, sell, strongSell.
    Latest month = index 0 (most recent `period`). Usable for §3.
  - `/stock/metric?symbol=ASML&metric=all` → **200**. `metric.52WeekHigh`,
    `52WeekLow`, `52WeekHighDate`, `52WeekLowDate`, `marketCapitalization`,
    `peTTM`, `currentDividendYieldTTM` all present. Usable for §3.
  - All three free-tier as expected — no §5/§6-style UI blocks need to be
    omitted for probe failure.
- `snapshot_positions` coverage confirmed per ticker (20-day window):
  COST has exactly 1 day (2026-07-22 only, bought today) as expected;
  all other 12 held tickers have 14-20 days. Confirms the COST
  single-point chart edge case in §3 is real and must be handled, not
  hypothetical.

## Judgment calls log

- No explicit "GOOG→GOOGL resolver" module exists in the codebase (Phase
  8 assumed one from "the earnings work"). What actually exists is the
  *pattern* in `getUpcomingEarnings`: query Finnhub per held ticker (e.g.
  `symbol=GOOG`), and Finnhub internally resolves + returns its own
  symbol in the payload (`GOOGL`) for calendar/earnings specifically.
  For §1's display fix and §3's company-endpoint calls, the applied
  convention is: always query Finnhub with the HELD ticker (never
  manually rewrite to GOOGL etc.) and, only where the response itself
  echoes a resolved symbol (earnings), keep that resolved symbol as a
  muted sublabel rather than the primary display.

- §1: `dailyChangeAsOf` is now `pricesAsOf ?? today` rather than the last
  stored snapshot's date. Rationale: the change itself now compares LIVE
  totalValue against the last CLOSED day before today, so the "as of"
  label should reflect the live price staleness (matching the existing
  "Prices as of" badge convention), not a stored snapshot date that may
  lag behind what's actually being compared.
- §1: `prevSnapshot` is picked as the most recent snapshot with
  `date < today` (NOT simply `mathSnapshots.at(-2)`), so the fix is
  correct both intraday (today's snapshot doesn't exist yet) and after
  the EOD cron has already run for today (today's snapshot exists but
  must still be excluded — "yesterday" stays yesterday either way).

- §8 done out of numeric order, per its own note that §3/§5/§6 depend on
  it — built right after §1 so later sections can use it immediately.
- `src/lib/server/finnhub-cache.ts` deliberately does NOT carry the
  `server-only` tag (unlike every other Finnhub-touching file). It holds
  no secrets itself — just a generic cache/budget Map — and needs to be
  importable from plain Vitest, which chokes on `server-only` outside a
  Next.js server bundle (confirmed: every other `server-only`-tagged file
  in the repo has zero direct tests, only their pure parser counterparts
  are tested — same reasoning applied here, just inverted: drop the tag
  instead of skipping the test).
- Also added `getCompanyMetric`, `getRecommendationTrend`, and
  `getCompanyNews` (+ their pure parsers: finnhub-metric.ts,
  finnhub-recommendation.ts, finnhub-news.ts) as part of §8 rather than
  deferring to §3, since the phase doc's own §8 TTL table already names
  metric/news/recommendation — building them alongside the cache module
  they depend on avoided splitting one cohesive unit across two commits.
  Verified all three against live Finnhub responses for ASML: metric
  returns peTTM/marketCap as expected; recommendation already arrives
  newest-period-first from Finnhub itself (parser's own sort is
  idempotent with that); news returns 247 items for the 14-day window.

- §2: rows navigate via `router.push` in a client `PositionsTable` (not a
  real `<a>`, since `<tr>` can't validly contain one) — a `role="link"`
  + `tabIndex`/Enter-key handler on the row covers keyboard access. A new
  `linkRows` prop (default true) is explicitly set false on `/share`,
  since §9's privacy matrix keeps `/stock/[ticker]` entirely absent from
  the public view — `hideDollars` alone wasn't a safe proxy for "is this
  the share page" (it's a settings toggle, not a route identity).
- §2: found and fixed a real bug via browser verification (not caught by
  any type check): a single-point sparkline (COST, bought same-day) built
  a `<polyline>` with exactly one coordinate pair, which SVG renders as
  nothing. Extracted the coordinate math into a pure, tested
  `sparklineGeometry()` (`src/lib/sparkline.ts`) that draws a full-width
  flat line for both the single-point and genuinely-flat-series cases.
  Regression test asserts the exact coordinate string for a 1-point input.
- §2: verified live against the running dev server via `/share` (no
  login needed) rather than typing `OWNER_PASSWORD` into the browser —
  confirmed Day %, the flat COST sparkline, colored trend lines, and
  Today's Movers all render correctly, and confirmed via
  `document.querySelectorAll('tr[role="link"]').length === 0` on
  `/share` that rows are correctly non-clickable there. Did not
  browser-verify the private dashboard's row-click-to-`/stock` behavior
  (would require the owner password) — covered by code review instead;
  worth a manual click-through by Devan.

- §3: `getStockDetailData()` (new `src/lib/stock-data.ts`) reuses the full
  `getDashboardData()` computation rather than re-deriving weight,
  contribution, day-change, or correlation independently — one source of
  truth for those, at the cost of recomputing the whole dashboard for a
  single-ticker page. Accepted given the app's scale (single owner,
  family-sized traffic); flagged here in case Vercel Hobby function
  duration ever becomes a concern.
- §3: discovered by live testing (not by type-checking) that the
  fundamentals/analyst-consensus/news sections can all disappear at once
  — not a bug, but the §8 budget guard doing exactly its job. Loading
  `/share` and `/` repeatedly while testing §2, then loading `/stock/ASML`
  immediately after, burned through the 50-calls/min budget (13 tickers ×
  earnings-TTL-0 alone is 13 calls per dashboard load, since "earnings
  unchanged" per §8 means never cached). Confirmed by waiting 65s for the
  window to reset and reloading — all three sections reappeared with real
  data. Worth flagging to Devan: a family member refreshing `/share` a
  few times within a minute could hit this same budget wall and briefly
  see the news/earnings sections empty. This is what the phase doc's own
  "earnings unchanged" instruction produces; not deviated from, but noted
  as a real operational characteristic rather than a hypothetical one.
- §3: StatCards render a literal "—" (not "$0.00" muted) when
  gain/day/contribution is null (no live price yet) — showing a zero
  dollar amount for genuinely unknown data would be the exact "never show
  zeros as if they were real" mistake CLAUDE.md calls out for the API
  failure case.
- §3: verified live end-to-end using the dev server's already-authenticated
  browser session (a prior owner login had persisted its cookie — did not
  read or type `OWNER_PASSWORD` to get there). Confirmed: unauthenticated
  gate, unknown-ticker 404, row-click navigation from `/` landing
  correctly on `/stock/[ticker]`, and — by chance, since the click
  navigated to COST — the exact single-data-point chart edge case the
  phase doc calls out (bought-today position, one snapshot close so far):
  it renders one dot plus the dashed cost-basis reference line, no crash.

- §4: recognized that §4's "Day $ is flow-adjusted (V_t − V_{t−1} − F_t)"
  is mathematically identical to §1's `dailyChangeAmount`/
  `dailyChangePercent` — just fed a cost-basis delta between two closed
  snapshots instead of today's live trades. Reused those functions
  directly rather than writing new ones, and confirmed the §4 sanity
  fixture (`Day $ = -$267.35`) passes through the shared code path
  (`src/lib/portfolio/history.test.ts`) — it's the exact same numbers as
  the §1 fixture, applied via the historical-row code path instead of the
  live-dashboard one.
- §4: `buildHistoryRows` (the pure per-row math) had to live in a
  separate file (`src/lib/portfolio/history.ts`) from `getHistoryData`
  (`src/lib/history-data.ts`, which does the Supabase fetch) — importing
  `@/lib/supabase/client` at module scope throws immediately under
  Vitest (no env vars loaded there), so any file that imports it can
  never be unit-tested directly. This is the same reason `dashboard-data.ts`
  itself has never had a test file; matched that existing convention by
  splitting pure math out rather than trying to test the I/O wrapper.
- §4: verified live in browser — Daily Returns bars, Drawdown area chart,
  and the History table all render with real data; the top table row
  (2026-07-22) independently reproduces the exact −$190.24/−0.83% figures
  implied by the actual stored snapshot values (differs from the phase
  doc's illustrative −$267.35 only because the real EOD close moved past
  where that hypothetical was written, per the §1 session note).

- §5: reconfirmed the §3 budget-exhaustion finding, now for the dashboard
  itself — the "Latest News" and "Upcoming Earnings" sections both
  render fully empty when the 50/min Finnhub budget is exhausted (which
  my own repeated testing did twice this session), then both repopulate
  correctly once the window resets. Math it out: one cold-cache dashboard
  load alone is already 13 quotes + 13 earnings (never cached, TTL 0) +
  13 news (cached 24h after the first hit) = up to 39 calls; a second
  load within the same 60s adds another 13 (earnings again) = 52 > 50.
  **This means two ordinary page loads within a minute — not unusual
  browsing, no stress-testing required — can trip the budget wall and
  show the family an empty news/earnings section for up to a minute.**
  Not a bug relative to the spec (this is what "earnings unchanged" i.e.
  uncached literally produces once routed through a shared budget), but
  worth Devan's attention before shipping — flagged again in §11.
- §5: `From all-time high` chip renders as a plain colored `<Card>` (own
  `text-gain`/`text-loss` on the value), not a `<StatCard>` — `StatCard`
  never color-codes its value by sign (every existing usage relies on the
  +/- prefix alone), but the phase doc explicitly calls for `--gain`/
  `--loss` text here specifically. Verified live: shows "−10.1% · Jun 30,
  2026 peak", matching the phase doc's "roughly −9% to −10%" sanity check.
  Kept always-visible (not gated by `hideDollars`) per §9's privacy
  matrix ("ATT chip | yes | yes (all %)") — it's a pure percentage, no
  dollar amount to hide either way.
- §5: verified live in browser (after the budget reset above) — ATH chip,
  Latest News (6 items, ticker chips, relative timestamps), and all 5 new
  Risk cards (Sortino, Best/Worst day with dates, Win rate, Current
  streak) all render with real data matching their computed fixtures'
  shape.

## Session notes

- Session 1 (2026-07-23): §0 complete.
- Session 1 (2026-07-23): §1 complete. New `src/lib/math/daily-change.ts`
  (netFlowsForDate, dailyChangeAmount, dailyChangePercent) with the two
  required fixtures unit-tested exactly (−267.35/−1.171% and
  +669.44/+3.02%). Wired into `dashboard-data.ts` — single source of
  truth shared by `/` and `/share`, so no separate share-page fix needed.
  Also fixed the earnings-ticker display bug: `parseEarningsCalendarResponse`
  now accepts an optional `queriedTicker` and returns the held ticker as
  `ticker` with Finnhub's own resolved symbol (when different) as
  `resolvedSymbol`, rendered as a muted sublabel in `EarningsCalendar.tsx`.
  Existing tests untouched and still pass (backward-compatible optional
  param). Verified netFlowsToday logic against live Supabase data (real
  "today" has since rolled to 2026-07-23 with no trades, so the exact
  fixture is covered by unit tests, not live reproduction). 93/93 tests
  pass, build clean.
- Session 1 (2026-07-23): §8 complete (done early, see judgment calls
  log). New cache/budget module + metric/recommendation/news parsers and
  fetchers, existing quote/earnings calls migrated onto it. 109/109 tests
  pass, build clean.
- Session 1 (2026-07-23): §2 complete. Day $/Day % columns (new
  `dayChange`/`resolvePrevClose` in holdings.ts), sparkline column (new
  `Sparkline` component + `sparklineGeometry` pure helper), clickable
  rows to `/stock/[ticker]` (route doesn't exist until §3 — expected,
  landing next in this session), and a "Today's Movers" card added to
  WinnersLosers. Found and fixed a real single-point-sparkline rendering
  bug via live browser verification. 119/119 tests pass, build clean.
- Session 1 (2026-07-23): §3 complete. New `/stock/[ticker]` page (owner-
  gated) with header, 4 StatCards, price-since-purchase chart w/ cost
  basis reference line, fundamentals row, analyst consensus bar, recent
  news, and a correlation row. New `formatMarketCap`/`formatMonthYear`/
  `formatRelativeOrDate` in format.ts (tested). Verified live in browser
  including the COST single-point chart edge case. 125/125 tests pass,
  build clean.
- Session 1 (2026-07-23): §4 complete. New `/history` page (owner-gated,
  new NavBar entry) with a daily-returns bar chart, a drawdown area
  chart, and the full snapshot history table. Reused §1's daily-change
  functions for the table's Day $/% columns. Export CSV button wired to
  the not-yet-built `/api/export/history.csv` (lands in §7, next).
  129/129 tests pass, build clean.
- Session 1 (2026-07-23): §5 complete. New "From all-time high" chip,
  "Latest News" section (private only), and 5 new Risk cards (Sortino,
  Best/Worst day, Win rate, Current streak) via new
  `src/lib/math/daily-stats.ts` and `all-time-high.ts` (both fully
  fixture-tested). Confirmed the Finnhub-budget interaction noted above.
  146/146 tests pass, build clean.

## §6 notes

- Live updates use a React Context provider (`LiveQuotesProvider`) rather
  than one monolithic client component, because the three sections §6
  names as live ("Positions day columns, Daily Change, Total Value, and
  movers") are NOT adjacent in the page — ValueChart/Beta/Excess Returns/
  Realized-Unrealized/Composition/Sector/AI/Correlation sit between
  HeadlineStats and PositionsTable, and Earnings sits between
  PositionsTable and WinnersLosers. The provider wraps the whole page
  body; three thin client wrappers (`LiveHeadlineStats`,
  `LivePositionsTable`, `LiveWinnersLosers`) consume it via `useLiveQuotes()`
  in their normal JSX positions, so `page.tsx`'s rendering order is
  untouched. `/share` doesn't use any of these — it keeps the plain
  static components, matching "does NOT poll."
- Scope of what updates live is deliberately narrow, per the phase doc's
  own list: only `price`, `value` (needed so Total Value = sum of
  position values stays internally consistent), `day`, and `dayPct` are
  recomputed per position on each poll tick. `gain`/`gainPct`/`weight`/
  `contribution` and the since-purchase Winners/Losers stay frozen at
  their server-rendered values — those aren't in scope and freezing them
  avoids inventing update semantics the phase doc never specified.
- `export const revalidate = 300` was added to `/share` as instructed,
  but it does NOT actually make the route statically served in practice:
  Next.js opts a route into full dynamic rendering wherever it contains
  a `fetch` with `cache: "no-store"`, and every Finnhub call in
  `finnhub.ts` intentionally uses `no-store` (so Next's own fetch cache
  never fights with the custom §8 TTL/budget cache). Confirmed via
  `npm run build`'s route table — `/share` is still marked `ƒ` (dynamic)
  before and after this change. The half of §6 that matters more (no
  client-side polling from `/share`, unlike `/`) is fully achieved; the
  ISR/static half is not, given the current Finnhub-fetch architecture.
  Recorded here rather than silently claiming something the build output
  contradicts.
- Verified: `/api/quotes` returns `{quotes, marketOpen}` with real prices
  (curl'd directly). In the browser, `document.visibilityState` reported
  `"hidden"` for the whole automated tab session — confirmed the poll
  correctly skips fetching while hidden (matches the spec exactly).
  Forcing `document.visibilityState` to `"visible"` via
  `Object.defineProperty` and waiting through further 60s windows did not
  produce an observed `/api/quotes` request in the network log, most
  likely because this session's heavy file-editing triggered repeated
  Next.js Fast-Refresh/HMR reconnects that reset component state/timers
  mid-wait (5 `[HMR] connected` events logged in the same second during
  one of the waits) — not something a real user's session would
  experience. Manually executing the exact fetch the poller performs,
  from the page's own JS context, succeeded and returned the exact shape
  `LiveQuotesProvider` expects. Combined with code review and the
  already-unit-tested `dayChange`/`dailyChangeAmount`/`dailyChangePercent`
  math the poller calls, this is strong-but-not-fully-live confirmation —
  recommend Devan do one real manual check (open the dashboard, watch the
  Network tab for ~90s) before relying on this in production.
