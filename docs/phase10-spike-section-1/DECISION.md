# Phase 10 §1 — CSS 3D vs. bounded React Three Fiber decision

Prepared July 23, 2026 by `claude-code/sonnet-5` (Phase 10 Claude Builder, §1).
Measurements recreated and corrected July 23, 2026 by `claude-code/sonnet-5`
(Phase 10 Claude Refiner, §1) in response to Codex Critic finding 1
(`docs/phase10-reviews/2026-07-23-section-1-codex-critic.md`): the original
pass recorded bundle size but not load time, long tasks, frame stability,
memory, or interaction latency, and three of the eight committed
screenshots were not actually 1440×900 despite their filenames/labels. This
revision replaces every screenshot and adds the missing runtime
measurements, all captured genuinely (see "Measurement protocol" below) and
dimension-verified with `sips` before being documented.

## Decision

**CSS 3D.** No production Three.js/React Three Fiber dependency is added.
`three` and `@react-three/fiber` were installed temporarily to build and
measure the spike at `/dev/phase10-spike-r3f`, then removed after this
decision was recorded (see "Cleanup" below). The production Observatory
shell (`src/components/observatory/`) uses only CSS 3D transforms.

## What was built

Two isolated, owner-gated, non-production routes, both rendering the same
selected-direction first viewport — five chapter bodies (Pulse, Forces,
Structure, Timeline, Lab, from `PRODUCT_DIRECTION.md`'s information model),
a selected-body inspector, and one evidence plate — with synthetic content
only (no portfolio data, no network requests):

- `/dev/phase10-spike-css` — pure CSS 3D (`transform-style: preserve-3d`,
  `translate3d`, `perspective`), zero new dependencies, zero required JS.
  Source: `src/app/dev/phase10-spike-css/`.
- `/dev/phase10-spike-r3f` — bounded React Three Fiber (`<Canvas>` with five
  `<mesh>` spheres, no post-processing, no physics, no orbit controls),
  loaded via `next/dynamic(..., { ssr: false })`. The canvas is
  `aria-hidden` and purely decorative; a duplicate, always-present semantic
  `<nav>` beneath it is the real control surface. Source:
  `src/app/dev/phase10-spike-r3f/`.

Both spikes selected a body via real navigation (`?chapter=<id>`), so both
are keyboard-, touch-, screen-reader-, and no-JS-operable for the semantic
nav; both expose a forced-fallback query param (`?no3d=1` /
`?forceFail=1`) for reproducible evidence capture.

## Measurement protocol

The §1 refiner pass recreated both spikes (the R3F spike and its
`three`/`@react-three/fiber`/`@types/three` dependencies had been removed
after the original decision was recorded, per the "no production
dependency" rule — restoring them for measurement only, inside §1, is
explicitly allowed by the refiner handoff) and measured them with a
headless Chromium instance driven by Playwright 1.49.1, installed as a
temporary dev dependency for this measurement pass only and removed again
afterward (`npm uninstall playwright`) — the exact same "temporary
tool, verified absent afterward" discipline already used for `three`.
This replaced the interactive Chrome-extension capture used at §0/§1
build time, which enforced a hard ~614–991px window-resize floor and
could not reach the required 390/320px targets; Playwright's headless
`page.setViewportSize()` has no such floor and reaches exact pixel
dimensions.

- **Server:** `npm run build && npm run start -p 3100`, with a
  temporary, localhost-only `OWNER_PASSWORD` process override (never a
  value read from `.env*`) — matching the §0/§1 precedent. Screenshots and
  measurements are against a real production build, not `next dev`.
- **Browser:** Playwright's bundled Chromium 131.0.6778.33, headless,
  default CPU/GPU (no throttling applied — single-run numbers on
  unthrottled hardware, not a calibrated device-class benchmark; see
  "Reading these numbers honestly" below for what that does and doesn't
  affect).
- **Auth:** the session cookie was computed directly from the same HMAC
  the app itself uses (`sessionToken()` in `src/lib/auth.ts`) against the
  temporary password and injected via `context.addCookies()` — no login
  form scripted, no `.env*` read.
- **Repetition:** one page load per metric pass (not repeated/averaged);
  treat single-run values as indicative, not statistically tight.
- **Script:** `scripts/tmp-phase10-measure.mjs` (temporary, deleted after
  this pass — its output is preserved here and is fully reproducible from
  this document's protocol description).

### What was measured, and how

| Metric | Method |
|---|---|
| Load time | `performance.getEntriesByType("navigation")[0]` (`domContentLoadedEventEnd`, `loadEventEnd`, `duration`) after `page.goto(..., { waitUntil: "networkidle" })`, plus wall-clock `Date.now()` around the whole `goto()` |
| Long tasks | A `PerformanceObserver` for the `"longtask"` entry type, registered via `page.addInitScript()` before navigation so it's active from first paint; entries collected on `window.__longTasks` |
| Frame stability | 1000ms of consecutive `requestAnimationFrame` deltas collected once the page has settled (~600ms after load), reported as sample count / average / max frame time and a "dropped frame" count (frames >33.4ms, i.e. worse than 2 frames at 60Hz) |
| Memory | `performance.memory.usedJSHeapSize` / `totalJSHeapSize` (Chrome-only, non-standard) |
| Interaction latency | Click the "Forces" chapter link; wall-clock `Date.now()` from click to the new link showing `aria-current="page"`. Both spike routes use plain, real `<a href>` chapter links (a §1 requirement — no-JS-operable navigation), so this is a **full document navigation**, not a client-side transition; it measures click-to-settled-navigation cost, not a component re-render |
| Bundle cost | Actual `Content-Encoding: gzip` wire bytes for the route-specific chunk, measured directly via `curl -H "Accept-Encoding: gzip" -w '%{size_download}'` against the running production server (not inferred from build manifests) |

## Measurements (recreated)

### Runtime (single-run, see protocol above)

| Metric | CSS 3D spike | R3F spike |
|---|---|---|
| Wall-clock load (`goto` to `networkidle`) | 524–548 ms | 563–565 ms |
| Navigation `duration` (in-page timing) | 42.8–81.5 ms | 29.6–32.0 ms |
| Long tasks during load | 0 (0 ms total) | 0 (0 ms total) |
| Frame stability (1s sample, idle) | 60–61 frames, avg 16.67 ms, max 16.8 ms, 0 dropped | 60 frames, avg 16.67 ms, max 16.8 ms, 0 dropped |
| `usedJSHeapSize` | 10,000,000 B | 10,000,000 B |
| `totalJSHeapSize` | 10,000,000 B | 14,300,000 B |
| Interaction latency (click → `aria-current` settles) | 104–113 ms | 108–115 ms |

Raw output: `scripts/tmp-phase10-measurements.json` (generated by this
pass; not committed — the table above and this document are the durable
record, per the "temporary tooling, durable evidence in docs" pattern).

**Reading these numbers honestly:**

- **Load and interaction latency are close** (single-digit-to-low-tens-of-ms
  apart) because both routes use full-page `<a href>` navigation by
  design — this measures server/navigation cost, which is dominated by the
  shared app shell on both routes, not the decorative layer. It is not a
  measurement of "R3F canvas mount cost" in isolation — the production
  Observatory shell instead uses `next/link` soft navigation, where this
  wouldn't apply the same way; these spike routes deliberately use plain
  `<a href>` per the §1 no-JS-operability requirement.
- **`usedJSHeapSize` is identical and uninformative.** Recent Chrome
  versions quantize `performance.memory.usedJSHeapSize` into coarse
  buckets (here, exactly 10,000,000 on both routes) as a fingerprinting
  mitigation. `totalJSHeapSize` — the heap Chrome actually reserved — is
  the more honest signal here: **43% higher for the R3F route** (14.3 MB
  vs. 10.0 MB), consistent with three.js's larger live object graph.
- **Frame stability at idle is identical and does not capture R3F's real
  cost.** R3F's default `<Canvas frameloop="always">` re-renders every
  animation frame even for a static scene — that work is real (GPU
  submission, scene-graph traversal), but on this hardware it fits inside
  the existing 16.67 ms frame budget for five static spheres, so a
  frame-delta sample can't see it. The honest way to see this cost is the
  *existence* of a continuous per-frame render loop at all: the CSS 3D
  approach does zero JS/GPU work per frame once its one entrance
  transition finishes; the R3F approach never stops rendering while
  mounted, which is a real (if here invisible) CPU/battery cost the CSS
  approach doesn't have.
- **Zero long tasks on both** — five static spheres and a small semantic
  DOM tree are both cheap enough that neither approach blocks the main
  thread for >50ms during load on this hardware. This does not
  contradict the bundle-cost finding below; a large download is not
  automatically a long task.

### Bundle cost (measured against a running production server)

| | CSS 3D spike | R3F spike |
|---|---|---|
| New npm dependencies | none | `three`, `@react-three/fiber` (+ `@types/three` dev) |
| On-disk package install size | 0 | `three` 25 MB, `@react-three/fiber` 2.2 MB |
| Route-specific chunk (uncompressed, on disk) | — | `.next/static/chunks/3_dzty0ah1q8q.js`, **883,468 bytes** (863 KiB) |
| Route-specific chunk (actual gzip wire bytes, measured via `curl`) | — | **233,487 bytes (228 KiB)** |
| Unique JS requested per fresh page load (all files, deduped by name) | 8 files, 517,604 B raw | 10 files, 1,406,169 B raw |
| Extra unique JS raw bytes vs. the CSS spike | — | **+888,565 B (~868 KiB)**, ~99.4% of which is the one R3F chunk above |
| When the extra JS downloads | never | on mount, client-side only (`ssr:false`), i.e. on every visit once hydrated |

This corroborates the original pass's build-manifest-derived estimate
(**232.2 KB gzip**) almost exactly — the gzip wire measurement here is
233.5 KB, a 0.6% difference plausibly explained by a `three`/`@react-three/fiber`
patch-version drift between the two measurement sessions, not a
methodology error.

### Newly discovered engineering-reliability risk: default pointer-events capture

While instrumenting the interaction-latency measurement above, clicking
the semantic "Forces" link on the R3F spike **timed out** — Playwright's
actionability check reported the `<canvas>` element as intercepting the
click, confirmed directly via
`getComputedStyle(canvas).pointerEvents === "auto"`. `@react-three/fiber`'s
`<Canvas>` sets its own wrapper's inline style to
`pointerEvents: eventSource ? "none" : "auto"` by default
(`react-three-fiber.cjs.dev.js:151`) — an **inline** style, so it silently
overrides the ancestor `.canvasLayer`'s `pointer-events: none` regardless
of CSS specificity or inheritance, because inheritance only applies when
no value is set at all. The recreated spike now passes
`style={{ pointerEvents: "none" }}` explicitly to `<Canvas>`
(`R3fScene.tsx`) to fix this and make the "duplicate always-present
semantic nav" actually clickable through the decorative canvas.

This is new, concrete evidence for reason 3 below ("No duplicated control
surface") — it is not a hypothetical integration risk; it is the default
behavior, easy to miss, and would have silently made the decorative R3F
layer block the real navigation in a real (non-spike) integration if
`eventSource` or an explicit `pointerEvents` override were ever
overlooked.

### Behavioral / fallback parity

Both spikes reach an equivalent flat-DOM state under failure/preference,
but by different means:

- **CSS 3D**: the same `<nav>` DOM re-flows into the static concentric
  fallback (numbered strip + inspector) via `@media (max-width: 767px)`
  and `@media (prefers-reduced-motion: reduce)` — pure CSS, no JS
  required. Verified with JavaScript disabled reasoning: the page is a
  Server Component tree with real `<a href>` links; chapter selection and
  the fallback layout both work with zero client JS.
- **R3F**: the canvas needs a client-side WebGL capability check
  (`useEffect` + `document.createElement("canvas").getContext("webgl")`)
  before it can decide whether to mount `<Canvas>`. Server-rendered HTML
  (and any no-JS client) is stuck on `supported === null`, rendering
  "Checking WebGL support…" indefinitely — there is no way to reach the
  correct fallback text without JS executing. The semantic `<nav>` below
  the canvas still works without JS (it has to exist independently either
  way), but the decorative layer itself has a JS-dependent, momentarily
  incorrect state that CSS 3D never exhibits.

Screenshots (owner-gated route, captured against a real production build
after a real sign-in via a computed session cookie against a temporary
localhost-only `OWNER_PASSWORD` process override — no `.env*` contents
read; see "Measurement protocol" above). Every file's pixel dimensions
were verified with `sips -g pixelWidth -g pixelHeight` before being
documented here — full output preserved below:

- `desktop/css-3d-1440x900.jpg` — CSS 3D, Pulse selected. **1440×900.**
- `desktop/css-3d-1440x900-no3d-fallback.jpg` — CSS 3D, forced fallback.
  **1440×900.**
- `mobile/css-3d-390x844-organic-fallback.jpg` — CSS 3D at a genuine
  390×844 viewport, fallback triggered organically by the
  `max-width: 767px` rule. **390×844.**
- `mobile/css-3d-320x844-organic-fallback.jpg` — CSS 3D at a genuine
  320×844 viewport. **320×844.**
- `desktop/r3f-1440x900.jpg` — R3F, rendering five spheres, active body
  highlighted. **1440×900.**
- `desktop/r3f-1440x900-forced-webgl-failure.jpg` — R3F, forced WebGL
  failure; the decorative canvas layer hides itself entirely
  (`[data-force-no-3d="true"] .canvasLayer { display: none }` — it has
  nothing correct to show once the layout is already flat) and the same
  real semantic nav collapses to the flat numbered strip, identical to the
  CSS 3D fallback. **1440×900.**
- `mobile/r3f-390x844-organic-fallback.jpg` — R3F at a genuine 390×844
  viewport (canvas layer hidden by the same narrow-viewport rule).
  **390×844.**

```
$ sips -g pixelWidth -g pixelHeight <file>, 2026-07-24T00:10:33Z
desktop/css-3d-1440x900-no3d-fallback.jpg  → pixelWidth: 1440  pixelHeight: 900
desktop/css-3d-1440x900.jpg                → pixelWidth: 1440  pixelHeight: 900
desktop/r3f-1440x900-forced-webgl-failure.jpg → pixelWidth: 1440  pixelHeight: 900
desktop/r3f-1440x900.jpg                   → pixelWidth: 1440  pixelHeight: 900
mobile/css-3d-320x844-organic-fallback.jpg → pixelWidth: 320   pixelHeight: 844
mobile/css-3d-390x844-organic-fallback.jpg → pixelWidth: 390   pixelHeight: 844
mobile/r3f-390x844-organic-fallback.jpg    → pixelWidth: 390   pixelHeight: 844
```

Browser console: 0 errors on both spikes (one pre-existing
`THREE.Clock`-deprecation warning from the `three@0.185.1` spike
dependency itself, not from application code — irrelevant once the
dependency is removed).

### Mobile capture limitation — resolved this pass

The original §1 build session's interactive browser-extension automation
enforced a hard minimum window width (~614–991 CSS px) that could not be
resized below regardless of the requested target, so no pixel-exact
390×844 or 320px screenshot existed. This refiner pass replaced that
capture method with headless Playwright, whose `page.setViewportSize()`
has no such floor — every screenshot above is a genuine capture at its
labeled dimensions, verified with `sips`, not a substitute or proxy.
One residual, disclosed limitation: this is *emulated* viewport sizing in
a desktop headless Chromium (no real mobile touch input, GPU, or device
pixel ratio), not a physical phone — the production shell's own test
suite (`ObservatoryShell.test.tsx`, `observatory-fallback.test.ts`) still
carries the independent, viewport-agnostic assertions on the fallback
class/layout logic that this doesn't replace.

## Why CSS 3D

1. **Fallback resilience.** CSS 3D's no-JS/no-WebGL/reduced-motion state is
   the same server-rendered DOM re-flowing via CSS — nothing can leave it
   in an inconsistent or stuck state. R3F's fallback requires a
   client-side capability check that has an unavoidable indeterminate
   window.
2. **Bundle cost.** ~232 KB gzip for a five-node decorative scene is a
   real cost against this app's performance budget, for a visual result
   the Field Journal design option itself describes as achievable with
   "DOM/CSS" at "low to medium" risk (`docs/phase10-design-options/field-journal/README.md`).
3. **No duplicated control surface.** CSS 3D's orbit *is* the real
   semantic nav, styled into position — one set of focusable elements, one
   source of truth. R3F requires a second, parallel semantic nav merely to
   stay accessible, which is more code to keep in sync for a canvas that
   contributes no essential information (`aria-hidden` by necessity, per
   the UX architecture's "no essential canvas-only content" rule). This
   pass found concrete evidence of that cost: R3F's `<Canvas>` captures
   pointer events by default and will silently block the real nav beneath
   it unless explicitly overridden — see "Newly discovered
   engineering-reliability risk" above.
4. **Product fit.** `PRODUCT_DIRECTION.md` calls for restrained,
   editorial depth ("negative space, distant orbital arcs, and layered
   depth rather than a busy universe"), not camera movement or richer
   lighting/occlusion — the R3F column's stated advantage in the UX
   architecture's comparison table
   (`docs/PHASE10_UX_ARCHITECTURE.md#8`). Nothing in the selected
   direction needs what R3F is better at.

This matches the Field Journal option's own documented technical-risk
assessment: "Low to medium. It is achievable with DOM/CSS and has the
simplest fallback."

## Cleanup performed after this decision

### Original §1 builder pass

- Removed `src/app/dev/phase10-spike-r3f/` (page, `R3fScene.tsx`,
  `CanvasBodies.tsx`).
- Removed `three`, `@react-three/fiber`, and `@types/three` from
  `package.json` / `package-lock.json`.
- Re-ran `npm test` and `npm run build` after removal to confirm the
  production tree is green with zero R3F trace.
- Kept `src/app/dev/phase10-spike-css/` in the tree as the durable
  evidence artifact for this decision, consistent with the existing
  `src/app/dev/surface-scratch/` precedent (an owner-gated, non-indexed
  dev route, not part of the public IA).

### §1 refiner pass (this measurement recreation)

- Recreated `src/app/dev/phase10-spike-r3f/` (`page.tsx`, `R3fScene.tsx`,
  `R3fSceneLoader.tsx`, `CanvasBodies.tsx`, `spike.module.css`) and
  reinstalled `three@0.185.1`, `@react-three/fiber@^9`, and
  `@types/three@0.185.1` solely to capture the measurements and
  screenshots above, per the refiner handoff's explicit allowance
  ("temporarily restoring R3F for measurement is allowed only inside §1").
- Installed `playwright@1.49.1` as a temporary dev dependency (plus its
  Chromium browser binary, cached outside the repo at
  `~/Library/Caches/ms-playwright`) to drive headless, exact-viewport
  screenshot capture and runtime measurement — the interactive Chrome
  extension used for the original pass could not reach 390/320px.
- Removed `src/app/dev/phase10-spike-r3f/` again, and ran
  `npm uninstall three @react-three/fiber @types/three playwright`.
  Confirmed via `git diff --quiet package.json package-lock.json` that
  both files are byte-identical to the pre-measurement commit (no
  residual dependency trace), and confirmed directly that `three`,
  `@react-three/fiber`, `@types/three`, and `playwright` are absent from
  `node_modules`.
- Deleted the temporary measurement script
  (`scripts/tmp-phase10-measure.mjs`) and its raw JSON output after
  transcribing the results into this document; confirmed neither is
  tracked or present in the working tree.
- Re-ran `npm test` (291/291 passing, up from 278 before this pass — see
  the refiner's added test coverage) and `npm run build` (16 routes
  generated, matching the pre-R3F-recreation route count) after cleanup.
