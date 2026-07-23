# Phase 9 Progress Log

Read this file first, every session, before doing anything else. Work
only unchecked items, in order. Every completed item gets an executor
suffix: `— done by <tool>/<model>` (e.g. `— done by claude-code/sonnet-5`,
`— done by codex/<model>`). One commit per section:
`phase9(§N): <summary>`. `npm test` and `npm run build` must be green
before every commit. Never leave the repo broken between commits, never
stop mid-section.

Also see `AGENTS.md` for the multi-agent protocol and
`docs/PHASE9_UX_BRIEF.md` for the project-specific UX intent — read the
brief before any UI-bearing section (§1, §3, §4, §5, §7).

---

## §0. Preflight + multi-agent groundwork
- [x] Confirm repo green: `npm test` (170/170 passed), `npm run build`
  (compiled successfully) — done by claude-code/sonnet-5
- [x] Probe Finnhub `/news?category=general` — status **200**, expected
  fields (`headline`, `datetime`, `source`, `url`) present — done by
  claude-code/sonnet-5
- [x] Probe Finnhub `/stock/insider-transactions?symbol=ASML` — status
  **200**, `data` field present — done by claude-code/sonnet-5
- [x] Both §0 probes succeeded → §4's News and Insider blocks build in
  their full (non-graceful-absence) state — done by claude-code/sonnet-5
- [x] Check presence of `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`,
  `REDDIT_USER_AGENT` in `.env.local` — all **absent**, as expected.
  §4's Reddit block must build in its flagged-off state — done by
  claude-code/sonnet-5
- [x] Confirm `benchmarks` table covers VOO/VTI/XLK from 2026-06-24
  through the latest snapshot — confirmed: VOO/VTI/XLK each have 21 rows,
  2026-06-23 through 2026-07-22 (latest snapshot: 2026-07-22). Range
  covers the §5 sim inception date of 2026-06-24 — done by
  claude-code/sonnet-5
- [x] Create `AGENTS.md` — merged the Phase 9 multi-agent protocol into
  the existing Next.js-version-warning file without deleting or
  weakening that warning — done by claude-code/sonnet-5
- [x] Add pointer line from `CLAUDE.md` to `AGENTS.md` (no duplicated
  protocol content in `CLAUDE.md`) — done by claude-code/sonnet-5
- [x] Create `docs/PHASE9_UX_BRIEF.md` with the approved project UX
  intent (progressive disclosure / five "acts", Daylight visual
  direction, Portfolio Orrery, non-goals, success criteria) — done by
  claude-code/sonnet-5
- [x] Create `PHASE9_PROGRESS.md` (this file) from the §0–§8 checklist,
  with an executor column, including the approved UX-brief and Portfolio
  Orrery work folded into §0/§1/§3/§7 — done by claude-code/sonnet-5
- [x] Commit: `phase9(§0): preflight probes + AGENTS.md + progress log`
  (also includes `PHASE9.md` itself, previously untracked, and
  `docs/PHASE9_UX_BRIEF.md`) — done by claude-code/sonnet-5

**Notes:** `.env.local` inspected for variable *names* only via
`grep -oE '^[A-Z_]+='`; no values ever printed. Two disposable probe
scripts (`scripts/_tmp-probe-*.ts`) were written, run, and deleted —
not committed, no secrets logged, status codes and field-presence only.

---

## §1. Surface design system — "Daylight" layer
- [ ] Surface tokens added to `globals.css` (`--paper`, `--paper-raised`,
  `--ink`, `--ink-soft`, `--ink-faint`, `--line`, `--accent-ink`,
  `--gain-ink`, `--loss-ink`, `--gain-wash`, `--loss-wash`); contrast
  rules honored
- [ ] Instrument Serif (400 + italic) wired via `next/font/google`,
  surface-only, display moments only, never below 28px, never for
  numbers, never in the deep tier
- [ ] Motion tokens added (`--ease-flip`, `--ease-depth`, `--dur-flip`,
  `--dur-depth`, `--dur-count`, `--dur-micro`)
- [ ] `<FlipCard>` built in `src/components/surface/`
- [ ] `<DepthPull>` built in `src/components/surface/`
- [ ] `<CountUpSettle>` built in `src/components/surface/`
- [ ] **Approved addition:** `<PortfolioOrrery>` primitive built and
  tested in `src/components/surface/` per the UX brief and the Portfolio
  Orrery engineering constraints (CSS 3D only, no new dependency, tokens
  only, reduced-motion static composition, coarse-pointer/390px simplified
  render, aria-hidden, pointer-parallax bounded and fine-pointer-only,
  pauses offscreen/hidden-tab)
- [ ] Reduced-motion verified for all four components (FlipCard,
  DepthPull, CountUpSettle, PortfolioOrrery) via matchMedia mock
- [ ] Zero deep-tier files modified
- [ ] All four render correctly on a scratch page
- [ ] `npm test` + `npm run build` green
- [ ] Commit: `phase9(§1): Daylight surface tokens + FlipCard, DepthPull,
  CountUpSettle, PortfolioOrrery`

---

## §2. Plain-language engine
- [ ] `src/lib/surface-copy.ts` created — pure template logic, no LLM
  calls
- [ ] `weeklySubline({twr7d, voo7d})` implemented per exact rules
- [ ] `todayLine({dayReturn})` implemented (same thresholds, "today"
  wording)
- [ ] `riskLine(hhi)` implemented (Very concentrated / Moderately
  concentrated / Well spread out)
- [ ] Fixture tests for all four exact `weeklySubline` strings
- [ ] Fixture tests for `riskLine` band edges
- [ ] Banned-words unit test (buy, sell, should, consider, recommend)
  greps this module's output strings
- [ ] `npm test` + `npm run build` green
- [ ] Commit: `phase9(§2): plain-language copy engine + banned-words test`

---

## §3. Surface pages + routing
- [ ] Route move: dense private dashboard `/` → `/dashboard`, unchanged
- [ ] Route move: dense share page `/share` → `/share/full`, unchanged
- [ ] New surface page takes over `/` (owner-gated)
- [ ] New surface page takes over `/share` (public)
- [ ] Deep-page nav gains "Overview" (→ surface) as first item;
  Dashboard/History/Trades/Research links unchanged
- [ ] Act 1 (The number): Instrument Serif label, hero (private = $
  total value, share = same-period TWR % only), `weeklySubline`,
  `<CountUpSettle>`
- [ ] **Approved addition:** `<PortfolioOrrery>` integrated into Act 1 of
  both `/` and `/share`, fading/receding before Act 2
- [ ] Act 2 (The shape): surface area chart of TWR growth index, "vs the
  market" toggle chip adds dashed VOO line
- [ ] Act 3 (The doors): three FlipCards ("What I own", "How risky is
  it", "Today") + one primary DepthPull button into `/dashboard`
  (share: `/share/full`)
- [ ] Surface header: wordmark; private adds "Full dashboard" link + Sign
  out; share adds "Read-only" chip
- [ ] `/share` keeps `export const revalidate = 300`
- [ ] Privacy matrix (surface additions) verified — no dollars anywhere
  on `/share`
- [ ] All 170+ existing tests still green after the route moves
- [ ] Logged-out `/` gates; `/share` serves; both surfaces hold at 390px;
  every reveal works by keyboard
- [ ] `npm test` + `npm run build` green
- [ ] Commit: `phase9(§3): surface pages (Act 1–3) + route moves +
  Portfolio Orrery integration`

---

## §4. `/research` — owner-gated
- [ ] Cache module renamed to `src/lib/server/api-cache.ts`, re-exported
  from old path so no import breaks
- [ ] General market news block (12 items, 30min TTL) — or graceful
  omission if §0 probe failed (probe succeeded, so build full block)
- [ ] Company news block (reuse Phase 8 per-ticker fetch, 24h TTL)
- [ ] Insider transactions block ("Insider filings (SEC Form 4)"), 24h
  TTL, last 90 days, required verbatim subtitle copy, per-ticker net
  count badge
- [ ] Reddit mentions block, capability-flagged off (env vars absent) —
  render the "Reddit integration pending" card; full counting-rule logic
  built and unit-tested even though flagged off
- [ ] Reddit counting-rule fixture test (GOOG=2, COST=1, MEI=1)
- [ ] Sentiment lexicon + fixture tests (ASML +2 positive, IBM −2
  negative, GOOG 0 neutral)
- [ ] Cross-source table (News / Reddit / Insider net columns, accent
  ring when news+Reddit lean agree and nonzero)
- [ ] General Market News list + per-ticker insider filings (collapsed)
- [ ] Verbatim footer line present
- [ ] §2 banned-words test extended to this page's static copy
- [ ] `npm test` + `npm run build` green
- [ ] Commit: `phase9(§4): /research — news, insider filings, Reddit
  (flagged), sentiment`

---

## §5. Comparison simulations — `/compare`, owner-gated
- [ ] `src/lib/math/sim-portfolio.ts` created — pure functions, zero new
  external calls
- [ ] "Steady Market" sim (100% VOO, buy and hold)
- [ ] "Tech Tilt" sim (50/50 VOO/XLK, rebalanced monthly)
- [ ] "AI Concentrate" sim (equal-weight held ∩ High AI-exposure,
  re-formed monthly, skip/renormalize/VOO-fallback rules)
- [ ] Sim trade log with plain-text reasons
- [ ] Identity fixture: Steady Market TWR == dashboard VOO return within
  1e-9
- [ ] Tech Tilt synthetic fixture: exactly 0.00%
- [ ] AI Concentrate synthetic fixture: exactly +2.50%
- [ ] `/compare` UI: 4-line chart (real + 3 sims, indexed to 100), stats
  table, per-sim collapsible trade log
- [ ] Mandatory verbatim SIMULATIONS banner on every view rendering sim
  data
- [ ] Banned-words test covers this page (banner's "recommendations" is
  the sanctioned exception)
- [ ] FlipCard-sized entry point on `/dashboard` only (not on any share
  surface)
- [ ] Privacy: nothing sim-related on `/share` or `/share/full`
- [ ] `npm test` + `npm run build` green
- [ ] Commit: `phase9(§5): /compare — Steady Market, Tech Tilt, AI
  Concentrate simulations`

---

## §6. `scripts/agent-relay.sh`
- [ ] ~60-line bash loop with header comment (convenience, not
  infrastructure; both CLIs must already be locally authenticated in
  unattended/full-permission mode; no secrets passed; no network calls
  from the script itself)
- [ ] Inspected actual `--help` output of installed Claude Code and
  Codex CLIs before choosing command syntax
- [ ] Tool A/B commands + rate-limit-detection strings as editable
  variables at the top
- [ ] Alternates on rate-limit signal; sleeps 20 min + loops if both
  limited; logs every attempt with timestamps to `agent-relay.log`;
  exits cleanly on Ctrl-C
- [ ] Documents manual alternation as the reliable fallback
- [ ] `npm test` + `npm run build` green (script doesn't affect app code,
  but re-confirm repo state)
- [ ] Commit: `phase9(§6): scripts/agent-relay.sh`

---

## §7. Integration pass
- [ ] Grep for stray `toFixed(`/`toLocaleString(` outside `format.ts` —
  none in new code
- [ ] Grep `#` (hardcoded hex) in `src/components/surface/` and new
  pages — none
- [ ] 390px audit: both surfaces (`/`, `/share`), `/research`,
  `/compare`
- [ ] **Approved addition:** Portfolio Orrery responsive, accessibility,
  reduced-motion, and visual audit (desktop/tablet/390px, coarse pointer,
  keyboard, aria-hidden correctness, no horizontal overflow) — documented
  here, including any simplification made
- [ ] Logged-out gating pass: `/` gates; `/dashboard`, `/research`,
  `/compare`, `/history`, `/stock/*` gate; `/share` and `/share/full`
  serve; export routes still 401
- [ ] Reduced-motion pass on every new animation
- [ ] Screenshots to `docs/screenshots/` if a browser tool exists; skip
  silently if not
- [ ] `npm test` + `npm run build` green
- [ ] Commit: `phase9(§7): integration pass + Portfolio Orrery audit`

---

## §8. Required closing summary
- [ ] Sections done vs remaining, executor-column totals
- [ ] §0 probe results + any blocks omitted
- [ ] Test count before → after
- [ ] Every judgment call made during the run
- [ ] Confirmation the Steady Market identity fixture passes
- [ ] The "Flags for Devan" list surfaced verbatim
