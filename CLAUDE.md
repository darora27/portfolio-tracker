# Portfolio Tracker Platform — Project Spec

## What this is
A web-based investment portfolio tracker replacing a Google Sheets system.
Owner: Devan. This is a portfolio/resume project AND a real daily-use tool,
shared read-only with friends and family.

## Product requirements (in priority order)
1. **Holdings dashboard** — total value, invested, gain/loss, daily change,
   position table with weights, top winners/losers, contribution to return.
2. **Accurate performance math** — time-weighted return (TWR) computed from
   daily snapshots net of cash flows; XIRR (money-weighted); comparison vs
   VOO/VTI/XLK over the same period. Simple return shown but clearly labeled.
3. **Risk analytics** — annualized volatility, max drawdown, beta vs VOO,
   Sharpe, top-2 concentration, HHI.
4. **Trade log** — every buy/sell: date, ticker, action, shares, price,
   reason, realized gain/loss. Adding a trade updates holdings automatically.
5. **Daily snapshot job** — end-of-day close prices captured automatically
   (cron/scheduled function), building the history that powers TWR/drawdown.
6. **Earnings calendar** — upcoming earnings dates for held tickers, pulled
   from the market-data API (this was impossible in Sheets — make it good).
7. **Share mode** — a read-only public URL (no login) showing the dashboard,
   with the option to hide dollar amounts and show percentages only.

## Explicitly out of scope (do not build)
- No thesis/journal feature.
- No multi-user accounts in v1 (one owner + public read-only view).
- No intraday tick tracking (daily closes are enough; the old 5-min intraday
  tracking added noise, not decisions).
- No trading/brokerage integration. Display and analytics only.

## Stack (keep it boring and deployable)
- Next.js (App Router) + TypeScript + Tailwind. Charts: Recharts.
- Database: Supabase (Postgres) free tier. Use its row-level security so the
  public share view can only read, never write.
- Market data: Finnhub free tier (quotes, daily candles, earnings calendar).
  API key lives in environment variables — NEVER commit it.
- Hosting: Vercel free tier. Daily snapshot via Vercel Cron hitting an API
  route after US market close (schedule for 4:30 PM America/New_York;
  Vercel cron is configured in UTC — handle DST by checking market calendar
  in code, and skip weekends/US market holidays).

## Data model (Postgres tables)
- `trades`: id, date, ticker, action (buy/sell), shares, price, total,
  reason, realized_gain
- `snapshots`: id, date, total_cost, total_value  (one row per market day)
- `snapshot_positions`: snapshot_id, ticker, shares, close_price, value
- `benchmarks`: date, ticker (VOO/VTI/XLK), close
Holdings are DERIVED from trades (sum of buys minus sells per ticker) —
never stored as a separate editable table. One source of truth.

## Seed data
`/data/` contains CSVs exported from the old Google Sheet:
- `trades.csv` (from the Trade_Log tab), `history.csv` (from History tab),
  `closing_prices.csv` (from Closing_Prices tab).
Build `scripts/import.ts` to load these into the database, mapping the old
History rows into `snapshots` so TWR history is preserved from day one.

## Financial math rules (get these right)
- Daily return net of flows: r_t = (V_t − F_t) / V_{t−1} − 1, where F_t is
  cash added that day (change in total cost). TWR = chained (1+r_t) − 1.
- XIRR: signed cash flows (buys negative, sells positive) at trade dates,
  plus current total value as the final positive flow at today. Label it
  "annualized" and de-emphasize it when history < 90 days.
- Never compare since-purchase simple return against a benchmark measured
  from a fixed start date — always same-period comparisons.
- Volatility/beta/Sharpe from daily net-of-flow returns; annualize with √252.
- Write unit tests for TWR, XIRR, and drawdown against hand-computed
  fixtures BEFORE wiring them to the UI.

## Engineering rules for the agent
- Work in small verifiable steps; run the app and tests after each change.
- Commit after each working step with a clear message.
- No secrets in the repo. `.env.local` is gitignored; document required env
  vars in `.env.example`.
- Handle API failure gracefully: if Finnhub is down or rate-limited, show
  last snapshot values with a "prices as of <date>" badge — never crash,
  never show zeros as if they were real.
- Accessibility and mobile layout matter — family will open this on phones.
- Prefer server components / API routes for anything touching the API key;
  the key must never reach the browser.

## Build phases (do them in order; stop after each for review)
1. **Scaffold + schema**: Next.js app, Supabase schema, import script,
   seed from CSVs. Prove it: a plain page listing trades and snapshots.
2. **Math core + tests**: TWR, XIRR, drawdown, vol, beta, Sharpe as pure
   functions with unit tests. No UI yet.
3. **Dashboard UI**: headline numbers, positions table, winners/losers,
   value-over-time chart vs VOO.
4. **Live prices + snapshot cron**: Finnhub quotes, EOD snapshot job,
   market-holiday handling.
5. **Trade entry + earnings calendar.**
6. **Share mode + polish + deploy to Vercel.**
