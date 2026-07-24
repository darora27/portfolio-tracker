# Phase 10 §1 Codex Acceptance review

Reviewed July 24, 2026 by `codex/gpt-5`.

Scoped commits:

- Builder: `507265d6e3427a414f2e2844d8513243ef348198`
- Critic: `bb57bd8eb26ea1c1889e34a961575e839aee57fe`
- Refiner implementation: `3887bed60aea9ee82bae0a8f3c58f627a5d6e1d0`
- Refiner bookkeeping/handoff: `6f92aaa3ce0425efc02aaa7e60dbc477905fb751`

Commits `9cf4ee3` and `bf98491` are unrelated post-handoff work. They were
excluded from §1 credit and judgment. Current-HEAD tests and build necessarily
include them and are labeled separately below.

## Result

**FAIL — return one bounded engineering-evidence finding to Claude Refiner.
Do not begin §2.**

The refined implementation passes behavioral, visual, mobile, accessibility,
privacy, test, and compile checks. Four of the five original critic findings
are fully closed, and the implementation portion of finding 1 is closed:
all 13 screenshots now have genuine labeled dimensions and the final tree is
free of R3F/Three.js/Playwright code and dependencies.

Finding 1 is not fully closed because the runtime comparison still does not
meet the specification's representative-phone, recorded-budget, and
reproducibility requirements.

## Original finding disposition

| Original finding | Result | Acceptance evidence |
|---|---|---|
| 1. Spike measurements and screenshot evidence | **FAIL (bounded remainder)** | All 13 images pass `sips` dimension checks and the documented desktop measurements cover every named metric. The performance run was on unthrottled desktop Chromium, however, not a representative phone profile; explicit load/interaction/memory/bundle pass thresholds are absent; and the R3F source, measurement script, and raw run output were deleted, so the reported ranges cannot be independently reproduced. |
| 2. Chapter links drop `mode` / `no3d` | PASS | Live navigation from `mode=private&chapter=structure&no3d=1` preserved `mode=private&no3d=1` on all five hrefs, click navigation, back, and forward. Active state, content, owner mode, fallback state, and focus remained synchronized. |
| 3. Retained CSS spike links to removed R3F route | PASS | The authenticated retained route contains historical non-interactive text, no R3F href, and `/dev/phase10-spike-r3f` returns 404. |
| 4. Freshness-label contrast | PASS | Live computed colors are `rgb(132, 126, 115)` over `rgb(11, 11, 14)` at 12.8px/400; independent WCAG calculation is 4.879:1. The stale value color is 6.357:1. |
| 5. Static concentric fallback | PASS | Forced desktop and organic 390/320 fallback states show the concentric map; exactly one ring reflects the active chapter; the map is `aria-hidden` and contains zero focusable descendants; the five real links remain the only controls. |

## §1 acceptance dimensions

| Dimension | Result | Evidence |
|---|---|---|
| Behavioral | PASS | Five real chapter links and stable URL states; direct links, click navigation, back/forward, focus restoration, public/private state, forced fallback, and no-JavaScript anchors verified. |
| Visual | PASS | CSS 3D desktop orbit, selected-body inspector, observation plate, and Field Journal/Night Orbit hybrid are recognizable. Every dimensional object maps to a real chapter. All indexed images were visually inspected. |
| Mobile | PASS | Live 390×844 and 320×844 checks have matching client/scroll widths, vertical 2D composition, visible concentric map, transforms disabled after layout settles, and five 44px-high targets. A 720px-wide 200%-zoom layout proxy also has no overflow. |
| Accessibility | PASS | One `h1`, one named chapter navigation landmark, five native anchors, one active article, one `aria-current`, visible 2px focus outline, focused active `h2` after click/history navigation, reduced-motion/forced-fallback CSS parity, no duplicate focus stops, and passing contrast. |
| Tests | PASS | Exact `6f92aaa` archive: 53 files and 291/291 tests passed. Current HEAD: 54 files and 310/310 tests passed; the extra 19 tests belong to the two excluded post-handoff commits and receive no §1 credit. |
| Build | **FAIL (performance-evidence subcriterion only)** | Current HEAD compiled with Next.js 16.2.11, TypeScript passed, and 16 static-page tasks generated. The chosen production tree has no R3F dependency. The required claim that the approach meets recorded phone performance/bundle budgets is not provable because the phone run and explicit thresholds are missing. |
| Privacy | PASS | Both retained routes gate logged out, unauthenticated raw HTML contains zero strict two-decimal currency values and no owner marker, public mode never renders the owner slot, private mode does, and no `.env*` contents were accessed or output. |

An additional exact-tree build attempt from a temporary `git archive` was
discarded before source compilation because Turbopack rejects a
`node_modules` symlink that points outside the archive root. This was a
temporary harness limitation, not a product-build result. The supported
workspace build above passed, and the two excluded commits do not touch §1
files or package manifests.

## Scorecard

| Category | Result | Diagnostic | Evidence |
|---|---|---:|---|
| Product alignment | PASS | 5/5 | The five questions, Field Journal shell, Night Orbit orbit/inspector/static fallback, public/private boundary, and observation-not-advice scope all match the selected direction. |
| Hierarchy | PASS | 4/5 | One selected chapter, one inspector, and one active observation plate dominate; supporting state is subordinate and the shell is not a card wall. |
| Usefulness | PASS | 5/5 | URL state is durable, relevant query state persists, every retained control has a valid destination, and freshness/scope are visible. |
| Originality | PASS | 4/5 | Dimensionality is the real chapter navigation, specific to the Observatory, with no copied branding, assets, layout, voxel art, or audio. |
| Accessibility and mobile | PASS | 5/5 | Semantic current state, visible focus, genuine 390/320 layouts, 44px targets, reduced-motion/no-3D parity, and the non-focusable concentric fallback pass. |
| Engineering reliability | **FAIL** | 3/5 | Source, tests, build, privacy, cleanup, console, and image dimensions pass. Required representative-phone measurements, explicit budgets, and independently reproducible raw/source evidence do not. |

## Blocking finding

### 1. The runtime comparison is not a representative, budgeted, reproducible phone measurement

- **Category:** Engineering reliability
- **Criterion:** `PHASE10.md` §1 requires representative-phone behavior and
  the chosen approach to meet recorded performance/bundle budgets.
  `docs/PHASE10_UX_ARCHITECTURE.md` §8 requires JS bytes, load time, long
  tasks, frame stability, memory, and interaction latency on a representative
  phone. The original critic additionally required a reproducible protocol
  with repetition count, actual values, budgets, and limitations.
- **Evidence:** `DECISION.md` explicitly records Playwright's headless
  Chromium on default, unthrottled desktop CPU/GPU and says it is not a
  physical phone and has no real touch input, mobile GPU, or device pixel
  ratio. Exact viewport size proves layout, not representative phone
  performance. The document supplies no concrete load, interaction, memory,
  or bundle thresholds against which CSS and R3F receive pass/fail results;
  the only numeric budget mentioned is a 16.67ms frame interval. It also says
  the measurement script, raw JSON, temporary R3F route source, and
  dependencies were removed. The table reports ranges despite describing one
  page load per metric pass, without retaining per-run values or mapping a
  sample count to each range.
- **Impact:** The CSS decision remains technically plausible and is supported
  by bundle/fallback evidence, but acceptance cannot verify the required phone
  performance or the claim that the chosen approach meets recorded budgets.
  The measurements cannot be independently rerun against the same prototype.
- **Required change:** Recreate both isolated spikes only long enough to:
  1. declare concrete pass/fail thresholds for bundle, load, long tasks,
     frame stability, memory, and interaction latency;
  2. rerun every metric on a documented representative phone environment
     (physical device or a named device profile with viewport, DPR, touch,
     CPU/network throttling, browser, GPU limitations, and repetition count);
  3. record per-run or summarized values with sample counts and a result
     against each threshold; and
  4. retain sanitized raw output plus sufficient reproduction material
     (measurement script and isolated source/patch/archive) without importing
     R3F into production or leaving its dependencies installed.
  Then remove the live R3F route/dependencies again, rerun tests/build/privacy
  checks, and stop. Do not recapture the already-valid screenshots unless the
  prototype visuals change.
- **Verification:** A reviewer can rerun the retained procedure, obtain the
  same class of metrics, see a pass/fail result for every budget, confirm the
  representative phone profile, and verify `three`,
  `@react-three/fiber`, `@types/three`, and temporary runner dependencies are
  absent from the production package/build afterward.

## Preserved passing evidence

- 13/13 screenshot files match their documented 1440×900, 390×844, or
  320×844 dimensions.
- Live shell checks passed at 1440×900, 390×844, 320×844, and a 720×450
  zoom-layout proxy with no page-level horizontal overflow.
- Desktop targets are 96px (104px for the scaled active link); 390px targets
  are 350×44px; 320px targets are 280×44px.
- Browser console: zero warnings and zero errors during retained-route checks.
- Logged-out `/dev/observatory-shell` and `/dev/phase10-spike-css` render the
  password form; `/dev/phase10-spike-r3f` returns 404.
- `npm ls three @react-three/fiber @types/three playwright --depth=0` is empty;
  the names are absent from `package.json`, `package-lock.json`, and
  `node_modules`.
- No implementation file was changed during acceptance review. §2 was not
  started.
