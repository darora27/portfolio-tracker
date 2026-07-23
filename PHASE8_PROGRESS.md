# Phase 8 Progress Log

Read this first at the start of every session. Work only unchecked items,
top to bottom. Commit after each section (`phase8(§N): <summary>`) with
`npm test` and `npm run build` green.

## Checklist

- [x] §0 Preflight
- [x] §1 Correctness fix — Daily Change net of cash flows
- [ ] §2 Positions table upgrade (day columns, sparklines, clickable rows)
- [ ] §3 Position detail page `/stock/[ticker]`
- [ ] §4 History page `/history`
- [ ] §5 Dashboard additions (news, ATH chip, risk extensions)
- [ ] §6 Live quotes + auto-refresh
- [ ] §7 CSV export
- [ ] §8 Finnhub data layer (cache module)
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
