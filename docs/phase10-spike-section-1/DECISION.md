# Phase 10 §1 — CSS 3D vs. bounded React Three Fiber decision

Prepared July 23, 2026 by `claude-code/sonnet-5` (Phase 10 Claude Builder, §1).

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

## Measurements

### Bundle cost (measured from a real `next build` with both spikes present)

Using the Next.js 16.2.11 Turbopack build's client-reference and
react-loadable manifests for each route (`.next/server/app/dev/phase10-spike-*`):

| | CSS 3D spike | R3F spike |
|---|---|---|
| New npm dependencies | none | `three`, `@react-three/fiber` (+ `@types/three` dev) |
| On-disk package size | 0 | `three` 25 MB, `@react-three/fiber` 2.2 MB (install footprint, not shipped as-is) |
| Route-specific JS beyond the app's shared baseline | ~0 KB | 1 eager wrapper chunk (5.4 KB) + 1 loader chunk (1.7 KB) + 1 lazy canvas chunk (**861.5 KB** uncompressed / **232.2 KB gzip**) |
| When the extra JS downloads | never | on mount, client-side only (`ssr:false`), i.e. on every visit once hydrated |

The lazy canvas chunk (three.js + the R3F reconciler + our scene code) is
gzip ~232 KB — larger than this app's entire current client JS for a
single decorative first-viewport element.

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

Screenshots (owner-gated route, captured after a real sign-in, temporary
localhost-only `OWNER_PASSWORD` override — no `.env*` contents read):

- `desktop/css-3d-1440x900.jpg` — CSS 3D, Pulse selected.
- `desktop/css-3d-1440x900-no3d-fallback.jpg` — CSS 3D, forced fallback.
- `mobile/css-3d-614x667-organic-fallback.jpg` — CSS 3D at a real narrow
  window (614×667 — see "Mobile capture limitation" below), fallback
  triggered organically by the `max-width: 767px` rule, not the forced
  flag.
- `desktop/r3f-1440x900.jpg` — R3F, rendering five spheres, active body
  highlighted.
- `desktop/r3f-1440x900-forced-webgl-failure.jpg` — R3F, forced WebGL
  failure, flat fallback.

Browser console: 0 errors on both spikes (one pre-existing
`THREE.Clock`-deprecation warning from the `three@0.185.1` spike
dependency itself, not from application code — irrelevant once the
dependency is removed).

### Mobile capture limitation

This session's browser automation environment enforces a hard minimum
window width (~614 CSS px) that could not be resized below regardless of
the requested target, so a pixel-exact 390×844 (or 320px) screenshot of
the spikes was not captured live. In its place: (a) the 614×667 capture
above exercises the *same* `max-width: 767px` rule a 390px viewport would
hit — there is no separate breakpoint between 390 and 767, so this is the
real code path, not a proxy for a different one; (b) the `?no3d=1` /
`?forceFail=1` forced-fallback screenshots show the identical fallback
markup at 1440×900; (c) the production shell's own test suite
(`ObservatoryShell.test.tsx`) mocks `matchMedia` to assert the fallback
class/layout logic directly, independent of any live viewport. The
production shell's real 390×844 and 320px screenshots (captured the same
way, with the same limitation and the same mitigations) are recorded
separately in `docs/phase10-baseline/section-1/`.

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
   the UX architecture's "no essential canvas-only content" rule).
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
