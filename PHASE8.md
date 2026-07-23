# Phase 8 — Sheet Parity Completed + Research-Backed Features (v1)

Read alongside CLAUDE.md. Phase 7 is complete. This phase (a) fixes one
real correctness bug found by cross-checking against the old sheet's
numbers, (b) closes the remaining gaps vs the Google Sheet (per-position
daily moves, the History table, per-stock performance views), and (c)
adds features that established trackers (Snowball, Sharesight, Ziggma)
have and spreadsheets don't: per-holding detail pages with fundamentals,
news, analyst consensus, richer risk stats, and CSV export.

**Who this is written for:** unattended execution by a Haiku-class model.
Every decision is pre-made below — exact formulas, exact fixtures (several
taken from Devan's real data so results can be cross-checked against his
own spreadsheet), exact fallbacks. Implement literally. If something is
genuinely not covered: choose the documented fallback if one exists,
otherwise make the smallest reasonable call, record it in the progress
log, and continue.

## Ground rules (same regime as Phase 7)
1. Create `PHASE8_PROGRESS.md` first (checklist §0–§11). Read it at the
   start of every session; work only unchecked items; update + commit it
   with each section. This is the resume mechanism across session limits.
2. One commit per section: `phase8(§N): <summary>`. `npm test` and
   `npm run build` green before every commit. Never leave the repo broken.
3. Existing tests are the spec for existing behavior — never edit one to
   make new code pass. New math goes in NEW files under `src/lib/math/`.
4. **Never run `vercel --prod`.** Never print or edit `.env*` contents.
5. Every new route/page is owner-gated unless this file says public. The
   only public surface is `/share`.
6. If budget runs low: finish, test, and commit the current section, then
   write the §11 summary. Never stop mid-section.
7. All Finnhub reads are server-side only, through the §8 cache module.
   The API key must never reach the browser.

---

## §0. Preflight
1. Confirm repo green: `npm test`, `npm run build`.
2. Probe these Finnhub endpoints once each (server-side script, symbol
   ASML, real key from env; log STATUS CODES ONLY, never the key):
   - `/company-news?symbol=ASML&from=<14d ago>&to=<today>`
   - `/stock/recommendation?symbol=ASML`
   - `/stock/metric?symbol=ASML&metric=all`
   Record each status + whether the expected fields exist in
   `PHASE8_PROGRESS.md`. These are believed free-tier but the candles
   endpoint taught us to verify. Any that fail → the dependent UI block
   in §5/§6 renders nothing (graceful absence), and you note it.
3. Confirm `snapshot_positions` has per-ticker daily closes covering the
   snapshot range (COST will have ~1 day — expected).
4. Commit: `phase8(§0): preflight probes + progress log`.

---

## §1. CORRECTNESS FIX — Daily Change must be net of cash flows
**The bug:** the dashboard's Daily Change card computes
`V_now − V_prev_snapshot` raw. On 2026-07-22 it showed **+$2,584.76
(+11.32%)** while the true market move was a loss — because a $2,775.00
COST purchase that day was counted as gain. Deposits are not profit; the
TWR math already knows this, the headline card doesn't.

**The fix:**
- `netFlowsToday` = Σ(total of today's buy trades) − Σ(total of today's
  sell trades), from the `trades` table, using the America/New_York date.
  (Do NOT derive it from snapshot cost deltas — today's snapshot doesn't
  exist yet intraday.)
- Daily Change $ = `V_now − V_prev − netFlowsToday`
- Daily Change % = `(V_now − netFlowsToday) / V_prev − 1` — the same
  end-of-day-flow convention as `dailyReturns` in the math lib. Reuse or
  mirror that function; do not invent a third convention.

**Fixtures (from Devan's real 2026-07-22 data — his sheet independently
shows the dollar figure):**
- V_now = 25341.75, V_prev = 22834.10, netFlowsToday = 2775.00
  → Daily Change $ = **−267.35** (exact), % = **−1.171%** (≈ −1.17%).
- Note: his sheet displays −1.09% for the percent because it uses a
  different denominator convention. Ours matches the TWR library. Do not
  "fix" the percent to match the sheet — the dollar figure matching is
  the cross-check.
- No-flow day regression: V_now 22834.10, V_prev 22164.66, flows 0
  → +$669.44 / +3.02%.
Unit-test both. Apply the same flow-aware logic anywhere else "today's
change" appears (share page daily figure if present).

**Also in this section (small display fix):** the Upcoming Earnings list
shows Finnhub-resolved symbols (GOOGL, ASML.AS). Display the HELD ticker
(GOOG, ASML); keep the resolved symbol as muted sublabel text. The
resolver mapping already exists from the earnings work — reuse it.

---

## §2. Positions table upgrade (day columns + sparklines + clickable rows)
- New columns after VALUE: **DAY $** and **DAY %** per position.
  - `day$ = shares × (livePrice − prevClose)`; `day% = livePrice/prevClose − 1`.
  - `prevClose` = that ticker's close in the most recent snapshot before
    today (from `snapshot_positions`).
  - **Bought-today rule:** if a position's first trade date is today,
    `prevClose = that trade's price` and the row gets a small `--accent`
    "new" dot. Fixture (real data): COST bought today at 925.00, live
    927.31, 3 shares → day$ = **+$6.93**, day% = **+0.25%**. Rationale:
    the holder's actual day P&L starts at purchase, not at yesterday's
    close for shares they didn't own.
  - INTC fixture (real data): prevClose 105.45, live 102.62, 20 shares
    → day$ = **−$56.60**, day% = **−2.68%**. Matches his sheet exactly.
- **Sparkline column** (last ~30 snapshot closes per ticker): build
  `<Sparkline points width=96 height=28/>` in `src/components/ui/` —
  pure SVG polyline, min–max normalized with 2px padding, stroke 2,
  color `--gain` if last ≥ first else `--loss`, single-point/flat series
  → straight `--text-muted` line, `aria-hidden`, no tooltip. Hidden below
  `sm` breakpoint.
- Rows become links to `/stock/[ticker]` (§3). Row hover already exists
  via `<DataTable>`; add cursor-pointer.
- "TODAY'S MOVERS" mini-card beside Winners/Losers: top 3 by |day %|,
  `<DeltaChip>` per row. (Winners/Losers stays since-purchase; movers is
  today. Label both clearly.)

---

## §3. Position detail page `/stock/[ticker]` — owner-gated, NOT public
The single biggest "real tracker" feature. Layout top to bottom:
1. Header: ticker (mono, big) + sector chip + AI-exposure chip; right
   side: value, shares, weight.
2. Four `<StatCard>`s: Since purchase (% + $), Day (% + $), Cost basis,
   Contribution.
3. Price chart since purchase: line of daily closes from
   `snapshot_positions`, with a horizontal dashed reference line at cost
   per share, labeled "Cost basis". §1-of-Phase-7 chart styling. COST
   edge case: 1 data point must render (dot + reference line), not crash.
4. Fundamentals row (from `/stock/metric`, 24h-cached; any null → "—"):
   52-week range as a thin `--border` track with an `--accent` dot at the
   current price position + mono low/high labels; P/E (TTM); market cap
   (Finnhub returns MILLIONS — display $1,234.5B when ≥ 1000, else
   $XXX.XM); dividend yield, and when yield present: "Est. annual income:
   $X" = yield × position value, labeled *Estimated*.
5. Analyst consensus (from `/stock/recommendation`, latest month,
   24h-cached): single horizontal stacked bar — strongBuy `--gain`, buy
   gain@60% opacity, hold `--text-muted`, sell loss@60%, strongSell
   `--loss` — with a text line like "14 Buy · 5 Hold · 1 Sell (Jun 2026)".
   Endpoint empty/404 (possible for SPCX/CBRS) → omit the block entirely.
6. Recent news (from `/company-news`, last 14 days, max 5, 24h-cached):
   title (2-line clamp), source + date (relative "3h ago" under 24h, else
   `fmtDate`), external link `target="_blank" rel="noopener noreferrer"`.
   Empty → omit block.
7. Its correlation row vs the other holdings (reuse Phase 7 matrix data
   as a single row of cells).
Use the existing GOOG→GOOGL resolver for ALL Finnhub company endpoints
here. Unknown ticker in URL → 404 page, not a crash.

---

## §4. History page `/history` — owner-gated (the History tab reborn)
- Nav gains "History" between Dashboard and Trades (private pages only).
- Two charts on top, dashboard styling:
  - **Daily returns bars**: one bar per snapshot day, net-of-flow daily
    return (REUSE `dailyReturns` — this is why deposits won't paint fake
    green bars), `--gain`/`--loss` fill.
  - **Drawdown (underwater) chart**: area chart of the existing drawdown
    series, `--loss` gradient fill, 0 line on top.
- Below: `<DataTable>` — Date | Invested | Value | Day $ | Day % |
  Cumulative TWR — newest first. Day $ is flow-adjusted
  (`V_t − V_{t−1} − F_t`); Cumulative TWR = growth index_t − 1, signed %.
  Sanity fixture: 2026-07-22 row → Day $ = −$267.35, Day % ≈ −1.17%.
- CSV export button (§7) top-right.

---

## §5. Dashboard additions
- **Latest News section** (private dashboard only, NOT /share): top 6
  headlines across all holdings by datetime, each prefixed with a mono
  ticker chip; same item styling as §3.6; pulls from the same 24h cache
  (13 tickers × 1 call/day max). Probe failed in §0 → omit section.
- **"From all-time high" chip** on/near the Total Value card:
  `last(growthIndex)/max(growthIndex) − 1`, e.g. "−9.3% from Jul 1 peak"
  (`--loss` text), or "At all-time high" (`--gain`) when at max. Sanity:
  with current data expect roughly −9% to −10%; if you get something wildly
  different you've used raw value instead of the TWR growth index.
- **Risk section extensions** — new file `src/lib/math/daily-stats.ts`,
  unit-tested with these exact fixtures:
  - `downsideDeviation(returns, mar=0)`: population mean over ALL n of
    `min(r − mar, 0)²`, then sqrt. Fixture: `[0.02, −0.02]` →
    `0.02/√2 ≈ 0.014142` (exact identity).
  - `sortino(returns, rf=0.04)`: `(mean(returns)×252 − rf) /
    (downsideDeviation(returns)×√252)`. Test via composition with the
    fixture above; zero downside deviation → `null`, render "—".
  - `winRate(returns)`: count(r > 0)/n; zeros count in n, not as wins.
    Fixture `[0.01, −0.01, 0.02, 0, 0.03]` → **0.6 exactly**.
  - `bestDay/worstDay`: max/min return with its date.
  - `currentStreak(returns)`: from most recent backwards while sign is
    consistent; zero breaks it. Fixtures: `[−0.01, 0.004, 0.002]` →
    `{dir:'up', n:2}`; `[0.01, 0, −0.02]` → `{dir:'down', n:1}`.
  New Risk cards: Sortino, Best day (% + date), Worst day (% + date),
  Win rate, Current streak ("2 up days" / "3 down days").

---

## §6. Live quotes + auto-refresh (replaces the sheet's intraday tracker)
Server-side intraday history is deliberately NOT built: Vercel Hobby
crons are once-per-day maximum (verified — more frequent schedules fail
at deploy), so a 5-minute polling job cannot exist on this stack. The
replacement:
- `/api/quotes` (public-safe: returns tickers + prices only, no
  positions): serves all held tickers' quotes through the §8 cache
  (30s TTL), plus `{ marketOpen: boolean }` from the existing market
  calendar.
- Private dashboard polls it every 60s ONLY while
  `document.visibilityState === 'visible'`; if a response says
  `marketOpen: false`, stop polling until next page load. Positions
  day columns, Daily Change, Total Value, and movers update from it;
  `<StatCard>`'s existing count-up animation fires on change.
- `/share` does NOT poll. Add `export const revalidate = 300` to the
  share page — statically served, refreshed at most every 5 minutes.

---

## §7. CSV export (owner-gated)
- Routes `/api/export/trades.csv` and `/api/export/history.csv`: proper
  `Content-Type: text/csv` + `Content-Disposition: attachment`, values
  RFC-4180 quoted (write a ~15-line util; no dependency). History export
  columns match the §4 table.
- "Export CSV" buttons on the Trades page and History page. Both routes
  must 401 when logged out — test that.

---

## §8. Finnhub data layer (do FIRST within its commit if not naturally
earlier — §3/§5/§6 depend on it)
`src/lib/server/finnhub-cache.ts`:
- `getOrFetch(key, ttlMs, fn)` over an in-memory Map. Serverless caveat:
  per-instance only — acceptable best-effort; note it in a comment.
- TTLs: quotes 30s; metric/news/recommendation 24h; earnings unchanged.
- Budget guard: simple counter capped at 50 calls/min; over budget or
  HTTP 429 → return cached value or null, never throw, never retry-storm.
- Migrate existing quote/earnings fetches onto this module so there is
  ONE Finnhub choke point.

---

## §9. Privacy matrix additions (re-verify in §10)
| Element | Private dashboard | /share |
|---|---|---|
| Day $ / Day % columns | both | **% only** — no day-$ column |
| Sparklines | yes | yes (shape only, fine) |
| Today's movers | $ + % | % only |
| News section | yes | **absent** |
| History page | yes | **absent** (route stays gated) |
| /stock/[ticker] pages | yes | **absent** (gated) |
| New risk stats (Sortino, streaks, win rate, ATH chip) | yes | yes (all %) |
| CSV exports | owner only | 401 |

---

## §10. Integration pass
- All new numbers through `src/lib/format.ts` (grep for stray
  `toFixed(`/`toLocaleString(` outside it).
- New components use the Phase 7 tokens/components; no new one-off hexes
  (grep `#` in new component files).
- 390px audit on every changed page: positions table with new columns
  (sticky ticker column + horizontal scroll), /stock pages, /history.
- Logged-out checks: `/`, `/history`, `/stock/ASML` all gate; `/share`
  serves; export routes 401.
- Screenshot capture into `docs/screenshots/` if a browser tool exists;
  skip silently if not.

---

## §11. Final summary (required output)
Report: sections done vs remaining; §0 probe results and any blocks
omitted because of them; test count before → after; every judgment call
(also in the progress log); confirmation the Daily Change fixture
(−$267.35) passes; and remind Devan of the two manual steps that remain
his: reviewing locally (`npm run dev`), then `vercel --prod` to ship
Phases 7+8 together.

## Future ideas — record, do NOT build
Price alerts (needs email/push infra), monthly-returns heatmap (needs
≥3 months of history), FIFO/tax-lot views, dividend calendar (premium
Finnhub endpoint), true stored intraday history (requires Vercel Pro or
an external scheduler hitting the snapshot route), GitHub-connected
auto-deploy, PWA install for phones.
