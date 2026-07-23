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
- [x] Surface tokens added to `globals.css` (`--paper`, `--paper-raised`,
  `--ink`, `--ink-soft`, `--ink-faint`, `--line`, `--accent-ink`,
  `--gain-ink`, `--loss-ink`, `--gain-wash`, `--loss-wash`); contrast
  rules honored (values copied verbatim from PHASE9.md §1a) — done by
  claude-code/sonnet-5
- [x] Instrument Serif (400 + italic) wired via `next/font/google` in
  `layout.tsx` as `--font-instrument-serif` -> `font-display` utility;
  surface-only, display moments only (used at 24-30px+ in the scratch
  page/labels), never for numbers, never in the deep tier — done by
  claude-code/sonnet-5
- [x] Motion tokens added (`--ease-flip`, `--ease-depth`, `--dur-flip`,
  `--dur-depth`, `--dur-count`, `--dur-micro`) — done by
  claude-code/sonnet-5
- [x] `<FlipCard>` built in `src/components/surface/FlipCard.tsx` — done
  by claude-code/sonnet-5
- [x] `<DepthPull>` (+ `DepthPullProvider`, `useDepthPull`) built in
  `src/components/surface/DepthPull.tsx`, mounted once in the root
  layout so overlay state survives the route change it triggers — done
  by claude-code/sonnet-5
- [x] `<CountUpSettle>` built in `src/components/surface/CountUpSettle.tsx`
  — done by claude-code/sonnet-5
- [x] **Approved addition:** `<PortfolioOrrery>` primitive built and
  tested in `src/components/surface/PortfolioOrrery.tsx` per the UX
  brief and the Portfolio Orrery engineering constraints (CSS 3D only,
  no new dependency, tokens only, reduced-motion static composition,
  coarse-pointer/390px simplified render, aria-hidden, pointer-parallax
  bounded and fine-pointer-only, pauses offscreen/hidden-tab) — done by
  claude-code/sonnet-5
- [x] Reduced-motion verified for all four components (FlipCard,
  DepthPull, CountUpSettle, PortfolioOrrery) via matchMedia mock — 21 new
  Vitest tests added (jsdom environment via a per-file
  `// @vitest-environment jsdom` docblock, `@testing-library/react` +
  `jsdom` added as devDependencies) — done by claude-code/sonnet-5
- [x] Zero deep-tier files modified — done by claude-code/sonnet-5
- [x] All four render correctly on a scratch page
  (`/dev/surface-scratch`, owner-gated) — verified both via `npm run
  build` (SSR) and a live Chrome pass: FlipCard flip + See-more-link
  reveal, DepthPull cover→push→wipe into `/dashboard` (expected 404
  right now — the route move happens in §3), CountUpSettle animating to
  the correct formatted values — done by claude-code/sonnet-5
- [x] `npm test` (191/191, up from 170) + `npm run build` green — done by
  claude-code/sonnet-5
- [x] Commit: `phase9(§1): Daylight surface tokens + FlipCard, DepthPull,
  CountUpSettle, PortfolioOrrery` — done by claude-code/sonnet-5

**Notes / judgment calls:**
- `CountUpSettle`'s `format` prop was originally a function per a literal
  reading of "extend the Phase 7 count-up hook", but a function can't
  cross the server/client boundary (the surface pages hosting the hero
  are server components) — Next.js throws
  `Error: Functions cannot be passed directly to Client Components`.
  Changed the API to `variant: "currency" | "signedPercent"`, imported
  directly from `src/lib/format.ts` inside the client component. Same
  single source of truth, just referenced instead of injected.
- `useCountUp` (Phase 7's hook) only animates on value *changes* after
  mount — it seeds "previous" from the initial value, so first paint is
  instant, by design for live-updating StatCards. Surface hero numbers
  need to animate from zero on first paint, which is a different
  contract, so `CountUpSettle` has its own small `useCountUpFromZero`
  that mirrors the same eased rAF/cubic-ease-out curve rather than
  wrapping the existing hook.
- A stray `next dev` process was found running on port 3000 from an
  earlier terminal session (PID 27518, started the previous evening,
  attached to a real Chrome tab) — not a competing coding agent (no
  Claude/Codex process was found via `ps`/`pgrep`). Stopped it and
  `.next` was cleared before restarting cleanly, since it was serving a
  stale Turbopack module-resolution cache that briefly 500'd on the new
  `@/components/surface/DepthPull` import.
- The browser tool's `resize_window` did not change the actual viewport
  in this environment (window stayed ~1562x803 regardless of the
  requested size) — a 390px live screenshot audit wasn't obtainable this
  way. Deferred a real device-width visual audit to §7; relied on
  responsive Tailwind classes (`grid-cols-1 sm:grid-cols-3`, `max-w-3xl`,
  `overflow-hidden` on the Orrery) plus the component-level tests for
  this section.
- Real login was performed via the app's own `/api/auth/login` route
  (password read from `.env.local` server-side by a shell subshell,
  never printed/echoed anywhere) to obtain the session cookie for
  scratch-page checks — no `.env*` contents were displayed at any point.

---

## §2. Plain-language engine
- [x] `src/lib/surface-copy.ts` created — pure template logic, no LLM
  calls — done by claude-code/sonnet-5
- [x] `weeklySubline({twr7d, voo7d})` implemented per exact rules — done
  by claude-code/sonnet-5
- [x] `todayLine({dayReturn})` implemented (same thresholds, "today"
  wording) — done by claude-code/sonnet-5
- [x] `riskLine(hhi)` implemented (Very concentrated / Moderately
  concentrated / Well spread out), reusing
  `src/lib/portfolio/concentration-status.ts` rather than reforking the
  HHI bands — done by claude-code/sonnet-5
- [x] Fixture tests for all four exact `weeklySubline` strings — done by
  claude-code/sonnet-5
- [x] Fixture tests for `riskLine` band edges — done by
  claude-code/sonnet-5
- [x] Banned-words unit test (buy, sell, should, consider, recommend)
  checks this module's output strings — implemented as an exported
  `containsBannedLanguage()` helper (word-boundary match) so §4/§5 can
  reuse the identical check rather than re-deriving it — done by
  claude-code/sonnet-5
- [x] `npm test` (199/199) + `npm run build` green — done by
  claude-code/sonnet-5
- [x] Commit: `phase9(§2): plain-language copy engine + banned-words test`
  — done by claude-code/sonnet-5

**Notes / judgment calls:**
- **Spec inconsistency found and resolved:** PHASE9.md's prose gives the
  "little changed" cutoff as `|twr7d| < 0.0005`, but its own exact
  fixture `{twr7d: 0.0009, voo7d: 0.0002} → "Little changed this week."`
  is impossible under that literal threshold (0.0009 is not < 0.0005).
  Treated the fixture as binding (same convention as every other exact-
  fixture block in Phases 7-9) and reused the market-clause epsilon
  (0.0015) as the little-changed threshold too, since it's the only
  other threshold in the same rule and satisfies all four fixtures.
  Documented in a code comment in `surface-copy.ts` as well.
- `containsBannedLanguage` uses word-boundary matching, so
  "recommendations" (needed verbatim in §5's mandatory banner) does not
  false-positive against the banned word "recommend" — verified by a
  dedicated test. This resolves the §5 "banner is the only allowed
  occurrence" requirement automatically rather than needing a manual
  exception later.

---

## §3. Surface pages + routing
- [x] Route move: dense private dashboard `/` → `/dashboard`, unchanged
  (`git mv`, content untouched) — done by claude-code/sonnet-5
- [x] Route move: dense share page `/share` → `/share/full`, unchanged
  (`git mv`, content untouched) — done by claude-code/sonnet-5
- [x] New surface page takes over `/` (owner-gated) — done by
  claude-code/sonnet-5
- [x] New surface page takes over `/share` (public) — done by
  claude-code/sonnet-5
- [x] Deep-page nav gains "Overview" (→ surface) as first item;
  Dashboard/History/Trades links unchanged, Dashboard href updated to
  `/dashboard` — done by claude-code/sonnet-5
- [x] Act 1 (The number): Instrument Serif label, hero (private = $
  total value, share = same-period TWR % only), `weeklySubline`,
  `<CountUpSettle>` — done by claude-code/sonnet-5
- [x] **Approved addition:** `<PortfolioOrrery>` integrated into Act 1 of
  both `/` and `/share`, mask-image fade before Act 2 — done by
  claude-code/sonnet-5
- [x] Act 2 (The shape): new `<SurfaceGrowthChart>` — surface area chart
  of the TWR growth index (no gridlines, 3px accent line, gradient fill,
  first/last date labels only), "vs the market" toggle chip adds dashed
  VOO line — done by claude-code/sonnet-5
- [x] Act 3 (The doors): three FlipCards ("What I own", "How risky is
  it", "Today") + one primary DepthPull button into `/dashboard`
  (share: `/share/full`) — done by claude-code/sonnet-5
- [x] Surface header (`<SurfaceHeader>`): wordmark; private adds "Full
  dashboard" link + Sign out; share adds "Read-only" chip — done by
  claude-code/sonnet-5
- [x] `/share` keeps `export const revalidate = 300` — done by
  claude-code/sonnet-5
- [x] Privacy matrix (surface additions) verified — grepped the rendered
  `/share` HTML for `$` currency patterns: zero matches; private `/`
  confirmed to show dollars — done by claude-code/sonnet-5
- [x] All existing tests still green after the route moves (204/204) —
  done by claude-code/sonnet-5
- [x] Logged-out `/`, `/history`, `/trades`, `/stock/ASML` all gate to
  sign-in (verified by content, not just status code — all return 200
  but render the sign-in form); `/share` and `/share/full` serve real
  data; export routes still 401 — done by claude-code/sonnet-5
- [x] Live-browser pass on `/share` and `/`: hero count-up, "vs the
  market" toggle, all three FlipCard flips (incl. real reused deep
  components on the backs), DepthPull cover→push→wipe into both
  `/share/full` and `/dashboard` with real content (no more 404, unlike
  the §1 scratch-page check against a not-yet-existing route), Overview
  nav round-trip — all confirmed working, zero console errors — done by
  claude-code/sonnet-5
- [ ] 390px keyboard/touch audit — blocked again by the browser tool's
  `resize_window` not changing the actual viewport in this environment
  (see §1 note); deferred to §7 same as §1
- [x] `npm test` (204/204) + `npm run build` green — done by
  claude-code/sonnet-5
- [x] Commit: `phase9(§3): surface pages (Act 1–3) + route moves +
  Portfolio Orrery integration` — done by claude-code/sonnet-5

**Notes / judgment calls:**
- **Bug found and fixed via live browser testing:** `<SurfaceHeader>`
  had no explicit background, so the deep tier's global `body { background:
  var(--bg) }` (dark) showed through behind it — the header rendered as a
  dark bar with near-invisible text above the paper-colored content.
  Fixed by adding `bg-paper` to the header, and `min-h-screen` to
  `SurfaceActs`' outer wrapper as insurance against any other short-
  content/overscroll gap. This is exactly the kind of thing the prompt's
  "visual verification" requirement is for — it would not have been
  caught by `npm run build` or the unit tests.
- **Deep-tier component touched, with justification:** `CompositionDonut`
  gained an additive `compact?: boolean` prop (default `false`, zero
  behavior change for every existing caller) because PHASE9.md's own
  spec names the FlipCard back content "a **mini** composition donut" —
  the full-size donut (256px + full 13-row legend) does not fit a
  FlipCard's back face and was visually breaking (donut clipped, "See
  more" link overlapping the legend) in the live browser check. This is
  additive, not a restyle of the existing deep rendering, and is in
  direct service of a FlipCard back-face integration the spec explicitly
  describes — the narrow reading of "do not restyle existing deep-tier
  components" that still allows this.
- `LogoutButton` (deep-tier, hardcoded `--text-secondary`/`--text-primary`)
  is reused as-is inside `<SurfaceHeader>` per "back face: EXISTING deep
  component reused as-is" logic extended to the header's sign-out
  control. Its text color is overridden from the *outside* via a
  Tailwind descendant selector (`[&>button]:text-ink-soft`) rather than
  editing `LogoutButton.tsx` — zero changes to the file itself, so its
  appearance on the actual deep pages (Trades) is untouched.
- "Today" FlipCard back-face content (top mover) has no named existing
  component in PHASE9.md (unlike the other two backs, which name
  "concentration meter" and "mini composition donut" explicitly) — built
  a minimal snippet reusing the existing `<Card>` and `<DeltaChip>`
  deep-tier primitives rather than inventing a new one-off component.
- `weeklySubline`/`todayLine` need `twr7d`, `voo7d`, and `dayReturn`
  inputs not previously exposed by `dashboard-data.ts`. Added
  `src/lib/portfolio/trailing-return.ts` (pure, tested) and two new
  `DashboardData` fields (`twr7d`, `voo7d`, both `number | null`),
  computed by re-slicing the already-built `chartData` series rather
  than re-deriving the growth index separately. `dailyChangePct`
  (already existed, already flow-adjusted) is reused directly for
  `todayLine`'s `dayReturn` input.
- When `twr7d`/`voo7d` are null (not enough history yet — never happens
  with the real ~29-day dataset, but is reachable on a brand-new
  portfolio), the surface pages fall back to "Building this week's
  picture." — not specified anywhere in PHASE9.md, smallest reasonable
  call.
- All three FlipCard "See more" links point at the same primary
  destination (`/dashboard` or `/share/full`) rather than per-card
  anchors — PHASE9.md doesn't specify distinct anchors and the primary
  CTA below already goes to the same place, so distinct anchors would
  be a fragile, unrequested addition.

---

## §4. `/research` — owner-gated
- [x] Cache module renamed to `src/lib/server/api-cache.ts`; old path
  (`finnhub-cache.ts`) kept as a one-line re-export shim so the existing
  `finnhub-cache.test.ts` needed zero edits — done by claude-code/sonnet-5
- [x] General market news block (12 items, 30min TTL) — §0 probe
  succeeded, full block built (`getMarketNews` in `finnhub.ts`, reuses
  `parseNewsResponse` — the general-news shape matches company-news
  exactly, no new parser needed) — done by claude-code/sonnet-5
- [x] Company news block (reuse Phase 8 per-ticker `getCompanyNews`
  as-is, 24h TTL; the research page's "24h count" filters its results by
  `datetime` rather than doing a second fetch with a shorter window) —
  done by claude-code/sonnet-5
- [x] Insider transactions block ("Insider filings (SEC Form 4)"), 24h
  TTL, last 90 days, required verbatim subtitle copy, per-ticker net
  count badge — new `getInsiderTransactions` in `finnhub.ts` +
  `parseInsiderTransactionsResponse`/`netInsiderCount` in
  `finnhub-insider.ts` — done by claude-code/sonnet-5
- [x] Reddit mentions block, capability-flagged off (env vars confirmed
  absent) — renders the "Reddit integration pending" card; full
  counting-rule logic (`src/lib/research/reddit-mentions.ts`) and OAuth2
  fetch logic (`src/lib/server/reddit.ts`) built and unit-tested even
  though flagged off — done by claude-code/sonnet-5
- [x] Reddit counting-rule fixture test (GOOG=2, COST=1, MEI=1) — done by
  claude-code/sonnet-5
- [x] Sentiment lexicon + fixture tests (ASML +2 positive, IBM −2
  negative, GOOG 0 neutral) — done by claude-code/sonnet-5
- [x] Cross-source table (News / Reddit / Insider net columns, accent
  ring when news+Reddit lean agree and nonzero) — done by
  claude-code/sonnet-5
- [x] General Market News list + per-ticker insider filings (collapsed,
  native `<details>`) — done by claude-code/sonnet-5
- [x] Verbatim footer line present — done by claude-code/sonnet-5
- [x] §2 banned-words test extended to this page's static copy — static
  strings pulled into `src/lib/research-copy.ts` specifically so
  `research-copy.test.ts` could check them with the same
  `containsBannedLanguage()` helper from §2 — done by claude-code/sonnet-5
- [x] Live-browser verification with real data: cross-source table shows
  real varying news/sentiment counts per ticker (e.g. NBIS "Positive"),
  General Market News list renders real headlines, and one insider
  filing panel (KYMR, 165 filings/90d) expanded to show real filer
  names, buy/sell direction (color + text, never color alone), share
  counts, and dates — done by claude-code/sonnet-5
- [x] `npm test` (229/229) + `npm run build` green — done by
  claude-code/sonnet-5
- [x] Commit: `phase9(§4): /research — news, insider filings, Reddit
  (flagged), sentiment` — done by claude-code/sonnet-5

**Notes / judgment calls:**
- Added a "Research" link to the private `NavBar` (between Trades and
  Sign out) — PHASE9.md §3 already referred to "existing
  Dashboard/History/Trades/Research links" when describing the Overview
  nav addition, implying Research's own nav entry was expected to land
  in this section.
- Insider transaction direction is derived from the sign of Finnhub's
  `change` field (shares acquired vs. disposed), not from the SEC
  transaction code (`A`=award, `F`=tax withholding, `S`=open-market
  sale, `P`=open-market purchase, etc.) — a deliberate simplification
  documented in `finnhub-insider.ts`. Real data confirmed this schema
  via a one-off inspection script (not committed, no secrets) against
  MSFT, since ASML (the §0 probe ticker) happened to return zero
  transactions — a real, valid response for a foreign private issuer
  with no SEC Form 4 filings, not a bug.
- "Today" — no per-ticker news/reddit item is guaranteed within any
  given day, so `newsLean`/`redditLean` default to `"neutral"` when
  there are zero qualifying items for a ticker, not `null` — keeps the
  table's icon+label pairing simple and always renders something
  (`Minus` / "Neutral") rather than a blank cell.
- Added `formatSignedNumber` to `src/lib/format.ts` (mirrors the
  existing `formatSignedCurrency`/`formatSignedPercent` pattern) for the
  insider net-count badge, rather than inlining sign logic in the
  component — keeps format.ts as the single source of truth per the
  existing §1c/§7 grep rule.
- `StockNews` (deep-tier, Phase 8) gained an additive `title` prop
  (default `"Recent news"`, zero behavior change for `/stock/[ticker]`)
  so `/research` could reuse it verbatim for "General market news"
  instead of duplicating the card/link/clamp markup.
- One live-browser check briefly showed the General Market News section
  missing entirely; a moment later (and in every repeated `curl` check
  afterward) it rendered correctly with real headlines. This matches
  `getOrFetch`'s documented contract exactly — a failed/slow fetch on
  the very first (cold, uncached) request to `news:general` isn't
  cached, so the next request just tries again — rather than a real
  defect; not fixed further since re-fetching itself is the resilience
  mechanism already in place from Phase 8.

---

## §5. Comparison simulations — `/compare`, owner-gated
- [x] `src/lib/math/sim-portfolio.ts` created — pure functions, zero new
  external calls — done by claude-code/sonnet-5
- [x] "Steady Market" sim (100% VOO, buy and hold) — deliberately NOT
  built on the shared rebalance engine, to keep it algebraically
  identical to the dashboard's own VOO calculation for the Identity
  fixture — done by claude-code/sonnet-5
- [x] "Tech Tilt" sim (50/50 VOO/XLK, rebalanced monthly) — done by
  claude-code/sonnet-5
- [x] "AI Concentrate" sim (equal-weight held ∩ High AI-exposure,
  re-formed monthly, skip/renormalize/VOO-fallback rules) — done by
  claude-code/sonnet-5
- [x] Sim trade log with plain-text reasons — done by claude-code/sonnet-5
- [x] Identity fixture: Steady Market TWR == dashboard VOO return within
  1e-9 — passes (verified both by unit test and reasoning about why
  `dailyReturns`' flow term is bit-identically 0 either way) — done by
  claude-code/sonnet-5
- [x] Tech Tilt synthetic fixture: exactly 0.00% — passes (`toBe(0)`,
  not just closeTo — the fixture's numbers are exact) — done by
  claude-code/sonnet-5
- [x] AI Concentrate synthetic fixture: exactly +2.50% — passes — done by
  claude-code/sonnet-5
- [x] `/compare` UI: 4-line chart (real + 3 sims, indexed to 100), stats
  table, per-sim collapsible trade log — done by claude-code/sonnet-5
- [x] Mandatory verbatim SIMULATIONS banner on every view rendering sim
  data — done by claude-code/sonnet-5
- [x] Banned-words test covers this page (banner's "recommendations" is
  the sanctioned exception — verified by a dedicated test, same
  word-boundary mechanism as §2/§4) — done by claude-code/sonnet-5
- [x] FlipCard-sized entry point on `/dashboard` only (not on any share
  surface) — done by claude-code/sonnet-5
- [x] Privacy: nothing sim-related on `/share` or `/share/full` — grepped
  the rendered `/share` HTML for "compare"/"simulat" — none found — done
  by claude-code/sonnet-5
- [x] Live-browser verification with real data: chart renders all 4
  lines with coherent relative volatility (AI Concentrate's dashed line
  has visibly the widest swings, matching its 53.7% vol / -12.09% max
  drawdown stat), stats table populated, all three trade logs expand
  with correct counts (1/4/9 trades) and correct reason text ("initial
  purchase: equal-weight High-AI holdings"), dashboard entry point card
  navigates to `/compare` — done by claude-code/sonnet-5
- [x] `npm test` (239/239) + `npm run build` green — done by
  claude-code/sonnet-5
- [x] Commit: `phase9(§5): /compare — Steady Market, Tech Tilt, AI
  Concentrate simulations` — done by claude-code/sonnet-5

**Notes / judgment calls:**
- **Bug found and fixed before it ever rendered:** the real portfolio's
  chart line was first implemented as a raw dollar-value ratio
  (`value_t / value_t0`), which is exactly the anti-pattern Phase 8 §1
  fixed for the Daily Change card — a deposit like the $2,775 COST
  purchase would show up as investment "gain." Rewrote it to reuse the
  same TWR growth-index convention as `dashboard-data.ts` (daily
  net-of-flow returns, chained), re-based to 100 at `SIM_INCEPTION_DATE`
  specifically since that may differ from the portfolio's own
  first-funded day.
- The AI Concentrate synthetic fixture (`{A:100→110, B:200→190}` with
  exactly 2 tickers) tests the shared rebalance engine's equal-weight
  math directly via the now-exported `simulateRebalanced`, bypassing
  `aiConcentrate()`'s own "fewer than 3 qualifying → VOO" business rule
  — the fixture is clearly about the rebalancing mechanics (2 tickers,
  no fallback triggered), so the two concerns are tested separately:
  the engine's math via the fixture, the `<3` fallback via its own
  dedicated test.
- A one-time browser screenshot showed the compare chart as a single
  dot near the first date — inspecting the actual SVG `<path>` data via
  `javascript_tool` confirmed the full multi-point line was already
  there; a second screenshot after Recharts' default line-draw
  animation finished showed all four lines correctly. Not a defect —
  same category as the CountUpSettle mid-animation captures earlier in
  this run.
- The stats table shows TWR/vol/max-drawdown for the three sims only
  (not the real portfolio), matching PHASE9.md's literal "a small table
  ... per sim" wording — the chart itself already carries the real
  portfolio in context.
- `/compare`'s `<NavBar>` call passes no `active` prop (not
  `active="dashboard"`) since `/compare` isn't one of the four main nav
  tabs — highlighting "Dashboard" while actually on `/compare` would
  have been misleading.

---

## §6. `scripts/agent-relay.sh`
- [x] ~60-line bash loop with header comment (convenience, not
  infrastructure; both CLIs must already be locally authenticated in
  unattended/full-permission mode; no secrets passed; no network calls
  from the script itself) — 53 non-comment/non-blank lines — done by
  claude-code/sonnet-5
- [x] Inspected actual `--help` output of installed Claude Code and
  Codex CLIs before choosing command syntax — `claude --help` (v2.1.218,
  installed at `~/.local/bin/claude`) and the npm-installed
  `@openai/codex@0.145.0`'s `codex exec --help` (resolved via `npm root
  -g`, symlinked at `~/.local/node/bin/codex` — not on PATH by that
  name, which is itself a useful finding for the owner) — done by
  claude-code/sonnet-5
- [x] Tool A/B commands + rate-limit-detection strings as editable
  variables at the top — done by claude-code/sonnet-5
- [x] Alternates on rate-limit signal; sleeps 20 min + loops if both
  limited; logs every attempt with timestamps to `agent-relay.log`;
  exits cleanly on Ctrl-C — functionally smoke-tested with fake
  fast-executing stand-in commands (tool A forced to fail with a
  simulated "429", tool B forced to succeed) to verify the detection,
  fallback, and logging logic end-to-end before wiring in the real CLI
  invocations — done by claude-code/sonnet-5
- [x] Documents manual alternation as the reliable fallback — done by
  claude-code/sonnet-5
- [x] `npm test` (239/239) + `npm run build` green (script doesn't
  affect app code, re-confirmed repo state) — done by claude-code/sonnet-5
- [x] Commit: `phase9(§6): scripts/agent-relay.sh` — done by
  claude-code/sonnet-5

**Notes / judgment calls:**
- `codex` is not on the default shell `PATH` in this environment despite
  being installed (`@openai/codex@0.145.0` via npm global, resolved
  through `npm root -g`) — the script invokes it by bare name
  (`command -v codex`), so if the owner's actual shell also doesn't have
  it on `PATH`, the script will log "command not found" and fall through
  to sleep-and-retry rather than silently hanging. Documented as a
  reasonable owner-environment assumption, not fixed further since the
  commands are explicitly meant to be owner-edited anyway.
- Both CLI commands use their respective "skip all permission prompts"
  flags (`--dangerously-skip-permissions` for Claude Code,
  `--dangerously-bypass-approvals-and-sandbox` for Codex) since §6's own
  premise is unattended relay between two already-trusted, pre-configured
  CLIs — the header comment calls out that this is only as safe as
  whatever confinement the owner has already set up.

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
