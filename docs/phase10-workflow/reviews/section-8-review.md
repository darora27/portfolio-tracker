# Phase 10 §8 — Claude Lead review (The Stock Market Universe — `/share` rebuilt)

**Result: FAIL — 2 bounded findings.**

Reviewer: claude-code/sonnet-5 (Claude Lead, `review` stage), July 27, 2026.
Reviewed commit: `2962c866aa0b8a5cd2bab907827c44564c1eb353` —
`phase10(§8): rebuild share as Stock Market Universe`.
Spec: `docs/phase10-workflow/specs/section-8.md`.
Implementation evidence: `docs/phase10-baseline/section-8/README.md`.
Implementation handoff:
`docs/phase10-handoffs/2026-07-27-section-8-codex-implementation-to-claude-lead.md`.

The `portfolio-ux` skill was applied via the normal `Skill` tool invocation
before this review.

## Why this review required independent live-browser work

Codex Implementation's sandbox could not bind a local server (`listen EPERM`
on both `0.0.0.0:3100` and `127.0.0.1:3100`), so every live/visual/interaction
criterion in the spec was explicitly deferred to this review, per the
implementation handoff's "Environment-only live evidence gap" section. This
review ran a real production server (`npm run build && npm run start` on
`localhost:3100`) and independently exercised the implementation with
Playwright — this is not a re-statement of Codex's own claims.

## What was verified and passed

- `npm test`: 85 files, 466/466 passed.
- `npm run build`: Next.js 16.2.11 (Turbopack), compiled clean, 19 routes
  generated — no DNS/font workaround needed in this environment.
- Texture budget: 24 KTX2 maps, 247,022 bytes total, 21,234-byte max —
  independently re-measured with `stat`, matches the declared ≤300,000/≤24,000
  byte budgets (criterion 44).
- Route-owned long task: 5 fresh-context runs at 1440×900 / CPU 2× throttle
  (Chrome DevTools Protocol `Emulation.setCPUThrottlingRate`), zero long tasks
  observed in any run — clears the unweakened 50ms §2.3.2 gate by a wide
  margin (criterion 43).
- Encoding functions (`orbitRadiusForRank`, `axialSpinForDayReturn`,
  `healthScalarForPortfolio`, `sunspotIntensityForDrawdown`,
  `resolveBeltMembership`) independently hand-checked against
  `orrery.test.ts`'s fixtures — all match the spec's required hand-computed
  values, including clamp boundaries and the churn fixture (criteria 34–35).
- Financial honesty (criteria 30–33): `healthScalarForPortfolio` is fed only
  `data.dailyChangePct`/`data.twr7d` (both TWR-consistent); sunspot intensity
  only `data.allTimeHigh.pct`; belt/planet rank only `weight`. No dollar or
  since-purchase field reaches any of them.
- Live desktop OVERVIEW (1440×900, full motion): 8 identifiable planets with
  always-visible ticker labels, readable comet trails (taper/length/color),
  no planet overlap or clipping, sun renders name + day % with no facial
  anatomy, milestone/health shading present. Screenshot:
  `docs/phase10-baseline/section-8/claude-review/overview-1440x900.png`.
- Live lock-on/APPROACH: selecting MSFT settles the camera, dims the rest of
  the scene, and draws the holding inspector (weight/today/trailing
  week/vs. portfolio/volatility/beta) — screenshot:
  `approach-msft-1440x900.png`.
- Live belt panel, keyboard `Tab`→`Enter` (reaches planets in true
  weight-rank DOM order, confirmed heaviest-first), `Escape` back to
  OVERVIEW, direct-link (`?holding=`) and browser back/forward all worked
  correctly with zero console warnings/errors in this pass.
- 320×844 and 390×844 (ordinary, full-motion mobile): `canvas` count 0, no
  horizontal overflow, no touch target under 44px, genuinely reflowed
  semantic list — criteria 19–21 pass in this state. Screenshot:
  `mobile-fallback-390x844.png`.

## Findings

### Finding 1 — `?no3d=1` (any viewport) and `prefers-reduced-motion: reduce` (≥1024px) both render `/share` almost entirely blank

- **Category:** behavioral / accessibility / product alignment
- **Criteria violated:** §14 items 22 ("`?no3d=1` still forces the flat
  fallback at any viewport width, unchanged in contract"), 23 ("legend
  content... remains the accessible source of truth... exists as real text
  somewhere in reading order"), 24 ("reduced motion freezes... while
  preserving every encoding as static, readable state"), 25 (visually-hidden
  list must remain reachable), and by consequence every Behavioral item (1–8)
  that depends on any content being visible or operable in these two states.
  Also `PRODUCT_DIRECTION.md` design principle 6 ("reduced motion preserves
  the same hierarchy and navigation without spatial travel").
- **Root cause:** `orrery.module.css`'s `@media (min-width: 1024px)` block
  clips `.semanticMap` to a 1×1px `sr-only` box (`clip: rect(0 0 0 0)`,
  intentional and correct — that's what makes the list invisible-but-
  accessible on the *ordinary* desktop/full-motion path, where the WebGL
  scene is the visible presentation). The **only** rule that reverses this
  clip is the combined selector
  `@media (max-width: 1023px), (prefers-reduced-motion: reduce)`. That
  selector is `OR`-only on viewport width and motion preference — it has no
  `[data-force-no-3d="true"]` clause. Two real states fall through the gap:
  1. **`/share?no3d=1` at ≥1024px, ordinary motion.** `[data-force-no-3d]
     .canvasLayer { display: none }` correctly hides the WebGL canvas, but
     the combined query never fires (viewport is wide, motion isn't
     reduced), so `.semanticMap` stays clipped to nothing. The page renders
     as the header plus a small sun readout — no holdings, no sun link, no
     belt, no manual. Reproduced live with a plain desktop browser context,
     no OS accessibility setting needed. Screenshot:
     `docs/phase10-baseline/section-8/claude-review/BUG-no3d-desktop-blank-1440x900.png`.
  2. **`prefers-reduced-motion: reduce` at ≥1024px** (a real, common OS
     setting, reproduced here via Playwright's `reducedMotion: "reduce"`
     context emulation, not simulated by hand). `canRenderOrrery()` correctly
     disables the canvas (pre-existing, unmodified §7 gate, per spec §13),
     but the same combined-query gap leaves `.semanticMap` clipped. The same
     media query additionally forces
     `.missionControl, .manualBackdrop, .orientation, .manualButton,
     .beltButton { display: none }` **regardless of viewport width**, so even
     though the "SUN / PORTFOLIO" link element is technically present, the
     entire retained five-chapter analysis (Mission Control — this section's
     own stated purpose per `PHASE10.md`: *"the analysis... moves into the
     dashboard that opens when the sun is selected"*) becomes permanently
     unreachable for any desktop visitor with reduced motion enabled.
     Verified two ways: (a) navigating directly to
     `/share?focus=portfolio&camera=command` under `reducedMotion: "reduce"`
     renders Mission Control in the DOM (`count: 1`) but `visible: false`,
     vs. `visible: true` under ordinary motion at the identical URL; (b) a
     full-page screenshot of the bare `/share` route under reduced motion at
     1440×900 shows only the header and sun readout — everything else is
     invisible. Screenshot:
     `docs/phase10-baseline/section-8/claude-review/BUG-reduced-motion-desktop-blank-1440x900.png`.
- **Evidence method:** real Chromium (Playwright) against the actual
  production build on `localhost:3100`, not source inspection alone —
  computed-style dump confirmed `.semanticMap`'s rendered box stays at
  `width: 2px, height: 2px, clip: rect(0px, 0px, 0px, 0px)` in both states,
  and `elementFromPoint`/`isVisible()` checks confirm no user-operable path
  exists to the content in either state.
- **Required change:** make the "restore the flat fallback" CSS (or the
  equivalent JS-level presentation logic) trigger on *any* condition that
  removes the WebGL canvas — `max-width: 1023px`, `prefers-reduced-motion:
  reduce`, **and** `[data-force-no-3d="true"]` — not only the first two. Mission
  Control, the manual, and the belt button must remain reachable in the
  `prefers-reduced-motion` state (they are ordinary DOM/CSS, not 3D content,
  and nothing in the spec authorizes hiding them under reduced motion —
  only the WebGL canvas itself has an existing, spec-authorized reduced-
  motion gate). Re-verify live (not only by source reading) at ≥1024px with
  `?no3d=1`, and at ≥1024px with `prefers-reduced-motion: reduce`, that: the
  holdings list, sun link, belt button, manual button, and Mission Control
  are all visible and operable.

### Finding 2 — Criterion 37's dashboard-data test coverage is a source-string check, not a behavioral test

- **Category:** tests
- **Criterion violated:** §14 item 37 — *"`dashboard-data.test.ts` (or
  equivalent...) covers: `publicOrreryHoldings[].dayReturn` populated
  correctly from `positionRows`; `orreryBelt` correctly reflects a synthetic
  prior-snapshot fixture."*
- **Evidence:** `src/lib/dashboard-data.source.test.ts` (the file added for
  this criterion) only does `expect(source).toContain(...)` assertions against
  the raw text of `dashboard-data.ts` (e.g. asserting the string
  `"positionRows.find"` appears). It never calls `getDashboardData()` with a
  mocked Supabase client and a synthetic prior-snapshot fixture, so it cannot
  actually verify that `dayReturn` is populated correctly or that
  `orreryBelt` correctly reflects a synthetic prior snapshot — a
  refactor that keeps those exact substrings but breaks the join/date-filter/
  weight-computation logic would still pass this test. No other test file
  exercises `getDashboardData`'s new query logic with fixture data (checked:
  every other test importing `getDashboardData` mocks the whole function and
  consumes the static `dashboardTestFixture`, which was hand-edited to
  include plausible `dayReturn`/`orreryBelt` values rather than computed by
  the code under test).
- **Required change:** add a real behavioral test (fixture-driven, mocking
  the Supabase client calls `getDashboardData` makes) that constructs a
  synthetic prior-snapshot with known `snapshot_positions` rows and asserts
  the resulting `orreryBelt` matches the expected top-eight set, and asserts
  `publicOrreryHoldings[].dayReturn` matches the corresponding
  `positionRows[].dayPct` for a synthetic current-day fixture. The existing
  source-string test may remain as a supplementary guard but does not by
  itself satisfy criterion 37.

## Scope discipline

No other criteria were found failing. This review did not introduce taste-only
or unbounded findings — both findings above cite an exact §14 criterion
number and were independently reproduced (Finding 1 live in a real browser;
Finding 2 by reading the actual test file's assertions).
