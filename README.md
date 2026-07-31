# Portfolio Tracker — the Stock Market Universe

A web-based investment portfolio tracker that replaced a Google Sheets system,
built as a real daily-use tool rather than a demo.

The portfolio is rendered as a **solar system**: the sun is the whole book,
planets are holdings sized by weight, and each planet's trail encodes its
return — dark red at worst through neon green at best. A read-only public view
shows percentages only and never a dollar figure.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · three.js · Recharts ·
Supabase (Postgres, row-level security) · Finnhub · Vercel.

> **Status: active development.** The universe, Mission Control, the planet
> detail views and the analytics dashboard are built and tested. In progress: a
> per-stock analysis page, and consolidating the dashboard's charts into the
> main view.

---

## Why it's built this way

The premise was that seeing a portfolio should take ten seconds, not ten
minutes of reading numbers. Everything below follows from that.

**Every visual channel encodes exactly one real number.** Planet size is
weight. Trail hue-lightness is return magnitude. Orbital direction is the sign.
Nothing on screen is decorative-but-meaningless — an early feature that encoded
day-return as axial spin was *removed* because nobody could read it, and the
freed channel was banked rather than reused.

**Every figure carries its window.** `+5.2%` with no period is treated as a
build error. The vocabulary is fixed: `TODAY · WEEK · 30D · SINCE BUY ·
SINCE START`, and a benchmark comparison must say `SAME PERIOD`.

**Unavailable is never zero.** If a quote fails, the app shows the last
snapshot with a "prices as of" badge. It never renders a zero that could be
mistaken for a real value.

## The financial maths

Correctness here was non-negotiable, because a portfolio tool that flatters you
is worse than no tool.

- **Time-weighted return** chained from daily snapshots net of cash flows —
  `r_t = (V_t − F_t) / V_{t−1} − 1` — so deposits don't masquerade as gains.
- **XIRR** from signed cash flows at trade dates, labelled *annualized* and
  de-emphasised below 90 days of history rather than shown as a confident
  number off five weeks of data.
- **Risk**: annualized volatility, max drawdown, beta vs VOO, Sharpe, top-2
  concentration, HHI — all from daily net-of-flow returns, annualized with √252.
- **Benchmarks are always same-period.** A since-purchase return is never
  compared against an index measured from a different start date.

Unit tests for TWR, XIRR and drawdown were written against hand-computed
fixtures *before* any of it reached the UI.

## How it was built

The project is developed by AI coding agents under a protocol that exists
because the first attempt produced work that looked finished and wasn't.

**Acceptance ledgers.** Every section declares numbered criteria with a risk
level and a verifier. Nothing is marked done without retained evidence, and a
criterion about rendered behaviour cannot be satisfied by reading source —
`expect(source).toContain(...)` is explicitly not coverage.

**Visual truth.** A claim about pixels requires evidence made of pixels: a
committed screenshot at a named viewport, a sampled-pixel measurement, or the
owner's recorded verdict. A section cannot pass review with any visual
criterion unproven. When the agent sandbox couldn't launch a browser, the
answer was to build a capture harness — not to defer the criterion.

**Gates that don't move.** A 50 ms route long-task budget was breached for
seven rounds and was never once weakened to make a section pass. Five of those
rounds blamed shader compilation; a profiler run showed the largest single
frame was 4.5 ms of a 65 ms task and the real cause was diffuse scene
construction plus GC. Staging the work across frames cleared it.

**Owner verdicts close the loop.** A feedback ledger tracks every request as a
row with a status and a closes-when condition. Rows close on a quoted sentence
from the owner or a committed capture — never on an agent's assertion that
something looks right.

Some things this discipline caught that would otherwise have shipped: a public
route leaking owner dollar amounts to any cookie-carrying browser; orbital
trails rendering invisible while a test asserting their opacity passed; a
verifier that had been measuring an inspector panel instead of the planet it
was pointed at; and a radar where clicking one holding's ring opened a
different holding's page, because the clickable box was a rectangle while the
visible ring was an ellipse inside it.

## Repository map

| Path | What's there |
|---|---|
| `src/app` | Next.js routes — the universe, the dashboard, history, trades |
| `src/components/observatory` | the three.js scene: orrery, planets, trails, Mission Control |
| `src/components/dashboard` | charts and tables — value, composition, contribution, risk |
| `src/lib/observatory` | the scene model — geometry, colour, encodings |
| `scripts/` | the capture harness, acceptance tooling, protocol validators |
| `docs/phase10-workflow/` | section specs, acceptance ledgers, review records |
| `docs/phase10-baseline/` | retained evidence: screenshots, measurements, raw output |
| `OWNER_FEEDBACK_LEDGER.md` | every request, its status, and what closes it |

## Running it

```bash
npm install
cp .env.example .env.local   # add Supabase + Finnhub keys
npm run dev
```

Seed data lives in `data/` as CSVs exported from the original spreadsheet;
`scripts/import.ts` loads them, mapping the old history rows into snapshots so
time-weighted return has history from day one.
