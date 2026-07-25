# Phase 10 §7 — Spatial Observatory

Written by: claude-code/sonnet-5 (Claude Lead, `specify` stage)

Authority, in order when anything here seems to conflict: `PRODUCT_DIRECTION.md`
→ `PHASE10.md` §7 (as amended July 25, 2026) → `docs/PHASE10_UX_ARCHITECTURE.md`
§§1, 3, 8 → this document. This document exists to make those concrete and
checkable for this one section; it does not override them. The `portfolio-ux`
skill was consulted while writing this spec: it directs "prefer resilient
CSS-based dimensionality unless an accepted technical decision authorizes
something heavier," "spatial bodies, depth, planes, and motion must represent
real chapters, relationships, or states," "use one or two orchestrated motion
moments," "preserve the accepted visual system and tokens — do not restyle
completed surfaces merely to demonstrate creativity," and "a beautiful orbit
that does not structure navigation is decoration." Those four rules directly
shaped this spec's central architectural decision in §3 below: §7 extends the
already-accepted, already-tested §1 `ObservatoryShell`/`ChapterOrbit` CSS 3D
shell rather than replacing it, regardless of which runtime the spike selects.

## 1. Scope — the smallest complete vertical slice

Two strictly sequenced phases, both required for this section, run in one
implementation turn (mirroring how §1's Builder pass covered spike-then-shell
in a single pass, and how §9's Phase A/B split works within one section):

- **Phase A (spike):** build two isolated, non-production, owner-gated dev
  routes that push the *first-viewport arrival + chapter-travel* experience
  to its expressive ceiling once in pure CSS and once in a bounded, lazy
  React Three Fiber layer; measure both against declared performance budgets
  and a declared storytelling rubric (§4); record the decision with evidence
  before any production dependency is added (§7's Section gate 1).
- **Phase B (production):** wire the selected treatment into the existing,
  already-accepted `ObservatoryShell` (mounted at both `/` and `/share` via
  its existing `mode`/`basePath` props — no route-specific work needed,
  since both routes already share this one component) as three additive
  layers — a one-time entrance sequence, camera-like chapter-travel motion,
  and pointer-driven parallax depth — without touching the shell's existing
  URL state, focus restoration, public/private isolation, or its
  already-accepted 2D/reduced-motion/forced-no-3D fallback path, all of
  which stay structurally untouched and continue to pass their existing
  tests unmodified.

### In scope

- `docs/phase10-spike-section-7/` — spike routes, decision record, raw
  measurement data, adapted measurement script (§2).
- `src/components/observatory/ObservatoryEntrance.tsx` +
  `.module.css` + `.test.tsx` — new, one-time arrival sequence (§5.1).
- CSS 3D ceiling push inside `ChapterOrbit.tsx`/`observatory.module.css`:
  a camera-like stage transform on chapter change and a pointer-parallax
  atmosphere layer (§5.2), built **either** as the sole production runtime
  (if Phase A selects CSS) **or** as the unconditional interactive baseline
  underneath a decorative R3F layer (if Phase A selects R3F) — see §3.
- Conditionally, only if Phase A selects R3F: `three`, `@react-three/fiber`,
  and `@types/three` as production dependencies (bounded, lazy-loaded, no
  post-processing/physics — §5.3), and
  `src/components/observatory/SpatialScene.tsx` (+ a small lazy-loading
  wrapper).
- `ObservatoryShell.tsx` edit: mount `ObservatoryEntrance` and the new
  camera-stage/parallax/scene layer inside `.stage` alongside the existing
  `ChapterOrbit`/`plateWrap` — additive, does not remove or restructure
  either.
- Updated/new tests per §7's acceptance criteria (§8) and updated
  `observatory-fallback.test.ts` fallback-parity assertions covering the
  new elements.
- Before/after screenshots at 1440×900 and 390×844 against the pre-§7
  `ObservatoryShell` (§9).

### Explicitly out of scope for this section (do not touch)

- `chapters.ts`, `resolveObservatoryChapter`, `observatoryChapterHref`,
  `ChapterFocusManager.tsx` — the five-chapter identity, URL-state
  contract, and focus-restoration mechanism are already accepted (§1) and
  correct; §7 adds motion and depth around them, it does not change what a
  chapter *is* or how chapter state is addressed.
- Any chapter's content component (`PulseChapter`, `ForcesChapter`,
  `StructureChapter`, `TimelineChapter`, `LabChapter`, `BriefingChapter`) —
  unchanged. §7 is the shell's spatial presentation, not chapter content.
- `DepthPullProvider`/`DepthPull.tsx`/`useDepthPull` — the existing
  route-tier transition wipe (used elsewhere for navigating between
  surfaces) is a different mechanism for a different job (a route change,
  not a world-arrival moment or a within-shell chapter change) and is not
  modified, reused as the entrance's implementation, or removed.
- `/dashboard`, `/compare`, `/research`, `/history`, `/trades`,
  `/stock/[ticker]` — unaffected; none of these mount `ObservatoryShell`.
- `metric-explanations.ts`, `MetricExplain.tsx`, any `src/lib/math/*` file —
  unchanged, per `CLAUDE.md`'s "no rewrite of the proven financial math
  merely to support a new layout."
- The concentric-map/flat-list fallback layout itself
  (`@media (max-width: 767px)` block, `[data-force-no-3d="true"]` block,
  `.concentricMap`/`.concentricRing`) — structurally unchanged. §7's new
  entrance/camera/parallax layers are gated off entirely inside this
  fallback (§6), never adapted to run inside it.
- Audio of any kind (`PRODUCT_DIRECTION.md`'s existing "no automatic audio"
  plus §7's own stricter "no audio at all").
- `/dev/observatory-shell`, `/dev/phase10-spike-css` (§1's routes) —
  untouched; §7's spike routes are new, separately named (§2).

## 2. Phase A — spike

### 2.1 Routes (new, owner-gated exactly like `/dev/phase10-spike-css` and
`/dev/observatory-shell` — `LoginForm` on an invalid/missing session, zero
dollar-currency patterns in unauthenticated HTML)

- `src/app/dev/phase10-spike-css-world/page.tsx` — the CSS-only ceiling
  variant.
- `src/app/dev/phase10-spike-r3f-world/page.tsx` — the bounded R3F variant.
  Depends on `three`/`@react-three/fiber`/`@types/three` installed
  temporarily via `npm install --no-save` (§1's exact precedent for
  provably not touching `package.json`/`package-lock.json` until/unless
  Phase A selects R3F).

Both routes render the **same** synthetic content: the five real
`OBSERVATORY_CHAPTERS` (id, number, label, question — imported, not
duplicated) with placeholder freshness/body text, no network/API calls, no
portfolio data. Both must satisfy, independently of which wins:

- max five spatial objects (one per chapter — the existing §1 ceiling,
  unchanged);
- no post-processing or physics;
- keyboard, touch, and screen-reader operability of all five chapter
  destinations via real anchors (`next/link` or plain `<a>`);
- a reduced-motion variant (static, no camera/parallax/entrance);
- a forced-failure variant: `?no3d=1` for the CSS route (same query-hook
  convention as `/dev/observatory-shell`), and a forced
  `WebGL context creation failure` variant for the R3F route (mock/throw
  from `canvas.getContext`, per the UX architecture's "forced-WebGL-failure
  states" spike requirement);
- a no-JavaScript check: with JS disabled, all five chapter links and their
  labels/questions are present and operable in server-rendered HTML.

### 2.2 What each variant must attempt (the actual comparison)

Both variants build the same three additive treatments from §5 (entrance,
camera-like chapter travel, parallax depth) against the same synthetic
content, so the comparison is apples-to-apples on the *specific* feature
set §7 will ship, not a generic "which is prettier" comparison:

- **CSS variant:** extends today's `.orbitWrap`/`.orbit`/`.body` transform
  system (observatory.module.css) with (a) a full-viewport atmospheric
  background layer, (b) a stage-level transform transition keyed to the
  active chapter (not per-body transform recomputation alone — see §5.2),
  (c) pointer-driven parallax across at least two independent layers, (d)
  one entrance sequence.
- **R3F variant:** a `<Canvas>` (react-three-fiber) rendering five simple
  non-physical meshes (e.g., extruded plates or icosahedra — no imported 3D
  assets, no textures beyond flat color/gradient materials) positioned to
  echo the same five-chapter arrangement, an animated camera that moves
  between chapters on change, a background gradient/starfield, and the
  same entrance sequence concept realized via camera fly-in. `aria-hidden`
  on the `<Canvas>`; the same five real `next/link` anchors from the CSS
  variant render as the actual semantic/interactive control layer
  underneath or beside the canvas (this is not optional exploration — it
  is required in the spike itself, because it is the architecture Phase B
  will ship if R3F wins; see §3).

### 2.3 Performance budgets (declared before measuring, per `CLAUDE.md`'s
"write unit tests... BEFORE wiring" discipline extended to spike measurement)

Reuse the exact measurement rig §1's acceptance-remediation-round-2 pass
established and had independently Codex-verified as correct
(`docs/phase10-spike-section-1/measure-phone-v2.mjs`, Moto G4 device
profile, CDP CPU 4x throttling, Slow 4G network throttling, real production
server, 5 fresh-context repetitions per route) — adapt, do not
re-derive from scratch, and do not repeat §1's original measurement bugs
(the withdrawn `performance.memory` metric, the withdrawn absolute
whole-page long-task budget, the withdrawn literal-16.7ms-per-sample frame
predicate). Baseline for every "added" comparison below is the pre-§7
`ObservatoryShell` as it exists today (i.e., the accepted §1–§6 shell with
zero §7 changes), not an empty page.

| Metric | Threshold | Basis |
|---|---|---|
| Bundle: added gzip JS over the pre-§7 baseline, for JS that ships in the initial route bundle (i.e., excludes anything genuinely lazy-loaded post-mount) | ≤ 50 KB | §1's decorative-layer precedent, appropriate since Phase B's CSS-side additions (entrance, camera-stage, parallax) are small client components, not a new heavy dependency. |
| Bundle: R3F lazy chunk (only relevant to the R3F variant; loaded strictly post-mount, only when viewport ≥ 1024px, motion is not reduced, and a WebGL context is available) | ≤ 260 KB gzip | §1 measured `three`+`@react-three/fiber` alone at 233 KB gzip; 260 KB gives headroom for this section's scene code while keeping the same order of magnitude §1 already characterized. This chunk must be 0 B of the *initial* route bundle regardless of size — see the bundle row above. |
| Load (`goto` → `networkidle`) on the phone profile | ≤ 5000 ms, no regression vs. the pre-§7 baseline | Unchanged from §1's RAIL-based threshold; the lazy R3F chunk (if applicable) must not be requested during this window at all — verified via the network log. |
| Long tasks during load and during one chapter-travel transition, measured as **added time over the pre-§7 baseline** (§1's round-2 corrected differential methodology, not an unworkable whole-page absolute) | 0 tasks > 50 ms of added time | RAIL's "Response" guideline, applied differentially per §1's corrected precedent. |
| Frame stability, idle (1 s sample, post-settle, post-entrance) | 0 dropped frames (> 33.4 ms) | §1's corrected dropped-frame predicate (the literal ≤16.7ms/sample predicate was proven unachievable by ordinary timer jitter in §1 round 2 and formally replaced). |
| Frame stability, during the chapter-travel transition itself (one full transition, from click to settle) | ≥ 90% of frames ≤ 33.4 ms | A transition is a brief, intentionally busier animation; a slightly looser bound than idle is appropriate and must be stated as looser, not silently weakened. |
| Memory: added CDP `Performance.getMetrics` `JSHeapUsedSize` over the pre-§7 baseline | ≤ 5 MB added | §1's precedent, reused verbatim (the CDP metric §1 switched to after finding `performance.memory` uninformative on this Chromium build — do not revert to that metric). |
| Interaction latency: click a chapter body → the new chapter's content plate heading is focused (§1's existing `ChapterFocusManager` contract) and the camera-travel transition has visually settled | ≤ 1200 ms | Derived from this spec's own declared 400–900 ms camera-transition duration ceiling (§5.2) plus ordinary focus-manager/paint overhead on the phone profile; tighter than §1's generic 2000 ms full-navigation bound because chapter travel here is a client-side transition, not a document reload. |

### 2.4 Storytelling rubric (declared before measuring; required, ranked
equal to performance per the owner amendment — a technically clean but
non-immersive result fails §7 regardless of the table above)

Each of `PHASE10.md`'s six named criteria, restated as a concrete,
checkable requirement. Evaluate both variants against every row; a variant
that fails a row does not automatically lose (weigh alongside §2.3), but a
row failed by **both** variants means neither may be selected as-built —
the implementation must be revised until at least one variant passes all
six before Phase A's decision is recorded.

1. **Coherent world:** a single continuous atmospheric background persists
   unbroken across the entrance and every chapter transition (it does not
   reset, flash, or reload between chapters) — verified by direct
   observation across at least three chapter changes in a row.
2. **Camera-like movement:** chapter navigation animates a transform
   (translate and/or scale, optionally rotate) on a dedicated stage/camera
   element keyed to the active chapter, running 400–900 ms — verified by
   source (a CSS `transition`/`animation` or an R3F camera tween keyed to
   `activeChapterId`, not an instant swap or opacity-only crossfade) and by
   a captured before/mid/after frame sequence showing continuous
   intermediate motion.
3. **Spatial composition:** at least three distinguishable depth layers are
   simultaneously visible in the 1440×900 first viewport — background
   atmosphere, the orbit/chapter-body layer, and the foreground content
   plate — each a distinct stacking-context element in the DOM/CSS, visibly
   non-coplanar in the screenshot (not flush or overlapping without visual
   separation).
4. **Layered depth (parallax):** on desktop, non-touch, motion not reduced,
   pointer movement measurably offsets at least two of the three layers
   from row 3 by different magnitudes — verified live by reading computed
   transform values at two distinct pointer positions and confirming they
   differ between layers.
5. **Discovery:** hovering or keyboard-focusing a non-active chapter body
   reveals a lightweight preview affordance (a subtle lift/scale plus a
   one-line echo of that chapter's `question`) not present in the idle
   state — purely additive to the existing real anchor (no new focus stop,
   no navigation on hover) — verified live and by an idle/hovered
   screenshot pair.
6. **Memorable transitions:** the entrance sequence and the chapter-travel
   transition are visually distinct from each other and from the existing
   `obs-enter` fade-scale keyframe already shipped in §1 — each
   independently identifiable in a captured frame sequence, so §7
   demonstrably adds motion vocabulary beyond what already existed before
   this section.

### 2.5 Decision procedure

Following `docs/PHASE10_UX_ARCHITECTURE.md` §8's existing rule, restated for
§7: **select R3F only if it passes every §2.3 budget row it is subject to
AND passes every §2.4 storytelling row AND creates a material
storytelling advantage over the CSS variant that the CSS variant cannot
match while also meeting its own budgets and storytelling rows. Otherwise
select CSS.** Record the decision, full measured tables for both variants,
and this reasoning in `docs/phase10-spike-section-7/DECISION.md`, following
`docs/phase10-spike-section-1/DECISION.md`'s existing format (methodology,
declared thresholds before measuring, results table, reasoning, screenshots
index). If R3F is selected, keep it installed for Phase B (do not
round-trip an install/uninstall like §1's temporary spike pattern, since
§7's R3F — unlike §1's — is being kept as a production dependency). If CSS
is selected, remove `three`/`@react-three/fiber`/`@types/three` and
`src/app/dev/phase10-spike-r3f-world/` entirely, and confirm their absence
the same way §1 did (`git diff --quiet package.json package-lock.json`,
direct `node_modules` inspection).

## 3. Central architecture decision (binding on Phase B regardless of
Phase A's outcome — record this reasoning in the decision doc, do not
rediscover it later)

The already-accepted `ObservatoryShell`/`ChapterOrbit` CSS 3D shell (§1,
tested, reviewed, in production at `/` and `/share` today) remains the
**one true interactive structure** in both possible outcomes:

- **If CSS wins:** §7 extends that same shell's own CSS further (entrance,
  camera-stage transform, parallax atmosphere) — no new runtime, no new
  dependency, no architecture change, only visual/motion depth added to
  code that already passed every accessibility/privacy/fallback
  requirement.
- **If R3F wins:** the R3F `<Canvas>` is added as a **purely decorative,
  `aria-hidden`, lazy-loaded atmosphere/camera layer on top of the same
  unchanged, unremoved CSS shell** — it never replaces `ChapterOrbit`'s
  real anchors, never becomes the thing keyboard/touch/screen-reader users
  must operate, and if it fails to acquire a WebGL context, the page simply
  continues showing the already-complete CSS shell with no visible
  degradation (the "no-WebGL fallback" *is* the pre-existing accepted
  shell, not a new fallback that must be separately built and tested).

This resolves the apparent tension between `PRODUCT_DIRECTION.md` principle
3 ("if a spatial object can be removed without changing navigation or
comprehension, it is decoration and does not qualify as the product
signature") and §7's accessibility requirement that the canvas be
`aria-hidden`: principle 3 is about whether an object maps to a real
destination/state, not about screen-reader exposure. Every R3F mesh still
maps 1:1 to a real chapter and its position/camera state is driven by the
same `activeChapterId` the real nav uses — it is `aria-hidden` because the
identical information and full interactivity are already, always, and
independently available through the semantic `ChapterOrbit` nav beneath it,
exactly the same accessibility pattern §1's already-accepted concentric-map
fallback already established (`aria-hidden`, decorative, additive, zero
duplicate focus stops) — this is precedent reuse, not a new exception.
This architecture also means Phase B carries materially lower engineering
risk than a shell rewrite would: every one of §1's existing passing tests
(`ObservatoryShell.test.tsx`, `ChapterOrbit.test.tsx`,
`ChapterFocusManager.test.tsx`, `observatory-fallback.test.ts`,
`observatory-contrast.test.ts`) continues to describe real, unchanged
behavior after §7 ships, in either outcome.

## 4. (reserved — storytelling rubric is §2.4, applied identically to the
spike and to the shipped production result in review)

## 5. Phase B — production build

### 5.1 `ObservatoryEntrance` (new; shared by both outcomes)

New `src/components/observatory/ObservatoryEntrance.tsx` +
`observatory-entrance.module.css` + `.test.tsx`. Client component, mounted
once inside `ObservatoryShell` (alongside `ChapterFocusManager`, not
replacing it).

```ts
export type ObservatoryEntranceProps = {
  /** Distinct sessionStorage key per mode so a private-mode visit and a public-mode visit each get their own one-time arrival — mirrors ObservatoryShell's existing mode isolation. */
  mode: "public" | "private";
};
```

Behavior:

- On mount, reads `sessionStorage.getItem(`observatory-entrance-seen-${mode}`)`.
  If already set, or if `usePrefersReducedMotion()` is `true`, or if the
  viewport is narrower than the existing `.stage` desktop breakpoint
  (1024px — the same threshold `.stage`'s own `@media (max-width: 1023px)`
  rule already uses), render nothing and do nothing further. This is the
  exact same gating condition §6 requires for camera/parallax — the
  entrance is one instance of that same rule, not a separate one.
- Otherwise, render a full-viewport `aria-hidden` overlay that plays one
  arrival animation (400–900 ms, matching §2.4 row 6/row 2's duration
  range) and a real, visible, focusable **"Skip intro"** `<button>`
  (minimum 44×44 CSS px) positioned over the overlay. The overlay never
  gates the content beneath it: the full shell (`h1`, freshness, nav,
  plate) is present and interactive in the DOM from the first paint,
  exactly as it is today — the entrance is a pure visual overlay, not a
  loading gate (same non-blocking posture `DepthPullProvider`'s existing
  overlay already establishes, applied to a new occasion, not the same
  component).
- Ends on: the animation's natural completion, a click/tap anywhere, any
  keydown, or the Skip button. On end, sets the sessionStorage flag and
  unmounts the overlay (the button and overlay are removed from the DOM,
  not merely hidden, so they never become a stray focus stop afterward).
- No-JS: this component never hydrates, so no overlay ever renders — the
  shell is immediately fully visible and operable, satisfying "never
  blocking content" trivially for the no-JS case.

### 5.2 Camera-like chapter travel + parallax atmosphere — CSS path (built
in either outcome per §3; the sole runtime if CSS wins, the interactive
baseline underneath the canvas if R3F wins)

Edits to `ChapterOrbit.tsx` and `observatory.module.css` (no new
component — this is the existing orbit's own ceiling being pushed, per
§3's "extend, don't replace" decision):

- New `.atmosphere` layer: a full-bleed `aria-hidden` `<div>` behind
  `.orbitWrap`, styled with a CSS gradient/radial-composition background
  (no image assets — matches the existing shell's zero-asset-dependency
  posture). Rendered unconditionally at desktop widths; hidden entirely
  under the existing `@media (max-width: 767px)` and
  `[data-force-no-3d="true"]` fallback blocks (extend those blocks'
  existing selector lists, do not create parallel ones —
  `observatory-fallback.test.ts` already asserts every fallback class
  appears in both blocks in parity, and this section's new classes must be
  added to that same parity list, not exempted from it).
- Stage-level camera transform: wrap `.orbit`'s existing per-body
  `translate3d` positions (unchanged) in an outer `.orbitCamera` element
  that receives one `transform: translate3d(...) scale(...)` transition
  (400–900 ms, `var(--ease-depth)` — reuse the existing token from
  `globals.css` rather than inventing a new easing curve) keyed to
  `activeChapterId`, so the *whole* stage appears to shift/refocus toward
  the newly active body rather than only that body's own tile changing
  style. Under reduced motion or the fallback breakpoint, this transform is
  `none` and the transition is `none` (same pattern as `.plateWrap`'s
  existing reduced-motion rule).
- Parallax: a `pointermove` listener (desktop, non-touch — check
  `matchMedia("(pointer: fine)")`, not just viewport width, so touch
  laptops with fine pointers still degrade sensibly) offsetting
  `.atmosphere` and `.orbitCamera` by different, small magnitudes (e.g.
  `.atmosphere` moves less than `.orbitCamera`) via CSS custom properties
  set from JS (`--parallax-x`/`--parallax-y`), consumed by each layer's own
  `transform`. Disabled under reduced motion and under the fallback
  breakpoint (no listener attached at all — not merely a no-op, to avoid
  any wasted work on mobile).
- Discovery affordance (§2.4 row 5): non-active `.body` elements gain a
  `:hover`/`:focus-visible` rule that lifts/scales them slightly and
  reveals a small `aria-hidden` label showing that chapter's `question`
  (positioned near the body, not overlapping the real link's own visible
  label/number). This is additive CSS/markup on the existing anchor — no
  new interactive element, no new focus stop.

### 5.3 `SpatialScene` — R3F path (built only if Phase A selects R3F)

New `src/components/observatory/SpatialScene.tsx`, loaded via
`next/dynamic(() => import("./SpatialScene"), { ssr: false })` from
`ObservatoryShell.tsx`, itself gated by a small client check (viewport ≥
1024px, `usePrefersReducedMotion()` is `false`, and a real
`canvas.getContext("webgl2") ?? canvas.getContext("webgl")` probe succeeds)
so the import is never requested at all outside that condition — this is
what makes it genuinely lazy per §7's Build acceptance criteria, not merely
code-split-but-still-eagerly-requested.

- Renders a `<Canvas aria-hidden="true">` positioned behind `.orbitWrap`
  (replacing the CSS `.atmosphere` layer's job, not stacking on top of
  it — one atmosphere layer exists at a time), five simple meshes echoing
  chapter positions, and a camera that animates toward the active
  chapter's mesh on change (same 400–900 ms range, same
  `activeChapterId`-keyed trigger as §5.2's CSS transform, so the budget
  and rubric rows in §2 apply identically regardless of which layer is
  doing the animating).
- No post-processing passes, no physics engine, no imported textures/models
  — flat/gradient materials and primitive geometry only (same bound the
  spike already proved out in §2.2).
- `ChapterOrbit`'s real anchors and `.orbitCamera`/parallax-on-`.orbitCamera`
  from §5.2 remain exactly as built — the R3F canvas adds atmosphere and a
  second, richer camera-move visualization; it does not remove or replace
  the CSS stage transform, so the "no-WebGL fallback" requirement is
  satisfied for free (§3).
- On WebGL probe failure or lazy-import failure (network/chunk error),
  render nothing extra — the CSS `.atmosphere`/`.orbitCamera` layer from
  §5.2 remains visible underneath, unchanged, satisfying "must fall back
  completely if WebGL/context/loading fails."

### 5.4 `ObservatoryShell.tsx` edit

Mount `ObservatoryEntrance` (passing `mode`) and, inside `.stage` before or
alongside `ChapterOrbit`, the CSS atmosphere layer (§5.2, always) and
`SpatialScene` (§5.3, conditionally, only if Phase A selected R3F). No
other prop, structure, or behavior in this file changes — `chapterContent`,
`ownerSlot`, `freshness`, `forceNo3d`, and the existing `data-mode`/
`data-force-no-3d` attributes are untouched.

## 6. Fallbacks (all reuse existing, already-accepted mechanisms — no new
fallback system is introduced)

- **Mobile (< 1024px):** `ObservatoryEntrance` renders nothing;
  `.atmosphere`/`.orbitCamera` transform/transition are `none`; the
  `pointermove` listener is never attached; `SpatialScene` (if applicable)
  is never imported (the ≥1024px gate in §5.3 already excludes it). The
  existing flat concentric/list fallback (`@media (max-width: 767px)`) is
  completely unaffected by any §7 file. Between 768–1023px, the shell
  already uses its existing `.stage` column-stack layout (§1); §7's motion
  layers are inert there too per the 1024px gate above, so this band shows
  the same static desktop-body composition it does today, just without
  camera/parallax/entrance — no new state to design or test beyond
  confirming that inertness.
- **Reduced motion:** `ObservatoryEntrance` never renders; `.orbitCamera`
  transform/transition are `none`; parallax listener never attached;
  `SpatialScene`'s gate (`usePrefersReducedMotion() === false`) excludes it
  entirely. Matches the UX architecture §3 "Reduced motion" section's
  existing rule set verbatim, extended to the three new layers.
- **No-WebGL (R3F outcome only):** covered by §5.3 — the CSS shell remains
  fully visible and functional; nothing is separately built for this case
  beyond the probe-and-skip-import gate already specified.
- **No-JavaScript:** `ObservatoryEntrance`, the parallax listener, and
  `SpatialScene` are all client-only and never render/execute without JS;
  `.orbitCamera`'s transform still requires the `activeChapterId`-keyed
  class from server-rendered markup, so with JS disabled the stage renders
  in its resting (non-transitioning) position for whichever chapter the
  server rendered — identical to today's no-JS behavior, since chapter
  changes are already full document navigations without JS.
- **Keyboard-only:** all five chapter anchors, the Skip-intro button, and
  every existing shell control remain real, tab-reachable elements exactly
  as before; nothing in §7 removes or reorders a tab stop; the discovery
  hover affordance (§5.2) also triggers on `:focus-visible`, so keyboard
  users reach the same preview state sighted mouse users do.

## 7. Non-goals (explicitly not required by this section, so review does
not invent them as findings)

- §7 does not require a second orchestrated motion moment beyond entrance
  + chapter-travel (`PRODUCT_DIRECTION.md` principle 6 caps this at "one or
  two").
- §7 does not require touch-driven parallax (§5.2 explicitly scopes
  parallax to non-touch pointers); touch users get the stage-transform
  chapter-travel motion but not pointer-follow parallax, which is
  intentional, not a gap.
- §7 does not require the discovery hover affordance to appear on touch
  devices without a hover concept; its keyboard/`:focus-visible` path is
  the touch-accessible equivalent, per §6.

## 8. Acceptance criteria

### Behavioral

1. Phase A's decision is recorded in
   `docs/phase10-spike-section-7/DECISION.md` with full measured tables for
   both variants against every §2.3 and §2.4 row, before any production
   dependency (`three`/`@react-three/fiber`/`@types/three`) appears in
   `package.json` (only applicable if R3F is selected — if CSS is selected,
   confirm those packages are absent from `package.json`,
   `package-lock.json`, and `node_modules`).
2. Entering `/` or `/share` for the first time in a browser session plays
   the entrance sequence exactly once; a second page load or chapter
   change in the same tab/session does not replay it; a fresh
   `sessionStorage` (new tab) replays it again.
3. The entrance is skippable by the Skip-intro button, any click/tap, or
   any keydown, and never delays the shell's semantic content, controls, or
   `h1` from being present and operable from first paint.
4. All five chapter destinations work by click, keyboard, and touch exactly
   as they did before §7 (real `next/link` anchors, stable
   `?chapter=`/URL state, `aria-current`, browser back/forward, focus
   restoration via the unmodified `ChapterFocusManager`) — no essential
   navigation depends on `ObservatoryEntrance`, the CSS camera/parallax
   layer, or `SpatialScene`.
5. Chapter-to-chapter navigation visibly animates a camera-like stage
   transform (§5.2, and §5.3's camera move if R3F was selected) rather than
   an instant swap.
6. Non-active chapter bodies show the discovery preview affordance on
   hover/focus and do not navigate or steal focus on hover alone.
7. If R3F was selected: on a forced WebGL-context-failure, the shell
   remains fully navigable and visually complete via the unchanged CSS
   shell, with no error state, blank region, or broken layout.

### Visual (storytelling gate — required, equal in rank to performance)

8. The shipped production result independently passes all six §2.4 rubric
   rows (re-verified live on the actual production build, not only on the
   winning spike route) at 1440×900.
9. Real 1440×900 before (pre-§7 `ObservatoryShell`, i.e. today's committed
   state) and after screenshots exist under `docs/phase10-baseline/section-7/`,
   covering: idle first viewport, mid-entrance (or immediately
   post-skip), a chapter-travel transition in progress, a settled new
   chapter, and the discovery-hover state.
10. The ~60/40 polished-to-playful balance is evident: no added element
    (entrance overlay, atmosphere, discovery label, or — if applicable —
    `SpatialScene` meshes/materials) uses cartoon styling, emoji, or
    playful iconography; the existing plate/typography/copy visual
    language is unchanged and undiluted by the new motion layers.
11. `grep` across every file this section adds/edits confirms zero
    `<audio>` elements, zero Web Audio API usage, and no autoplay media of
    any kind.

### Mobile

12. At 390×844 and 320px, the shell is byte-for-byte the same fallback
    layout as before §7 (no entrance overlay, no camera transform, no
    parallax, no `SpatialScene` import) — verified live and by screenshot
    against the pre-§7 mobile baseline, confirming zero visual diff.
13. No horizontal page overflow at 390×844/320px
    (`document.documentElement.scrollWidth === clientWidth`, verified
    live), and no control smaller than 44×44 CSS px, including the
    Skip-intro button on any viewport where it can render.
14. 390×844 before/after screenshots exist under
    `docs/phase10-baseline/section-7/` (the "after" is expected to be
    visually identical to "before" per item 12 — capture both to prove
    that identity, not to show a difference).

### Accessibility

15. `ObservatoryEntrance`'s overlay is `aria-hidden`; the Skip-intro button
    is a real, visibly labeled, focusable `<button>`; focus lands somewhere
    sensible (the shell's existing focus behavior, e.g. the `h1` or active
    chapter heading) once the entrance ends, never trapped inside the
    (now-unmounted) overlay.
16. `.atmosphere` and (if applicable) `SpatialScene`'s `<Canvas>` are
    `aria-hidden`; screen-reader reading order and content are unaffected
    by their presence (verified by confirming they contribute zero
    accessible-tree nodes).
17. The discovery hover/focus affordance's revealed label is `aria-hidden`
    (the information it echoes — the chapter's `question` — is already
    exposed accessibly via the existing `.inspectorQuestion` element for
    the active chapter and via the link's own visible text for every
    chapter) and introduces zero new focus stops.
18. `observatory-fallback.test.ts`'s existing parity assertions (every
    fallback class present in both the reduced-motion media query and the
    `[data-force-no-3d="true"]` block) are extended to cover every new
    class this section adds (`.atmosphere`, `.orbitCamera`, and any
    discovery-affordance class) and continue to pass.
19. Contrast of any new text (the discovery label, the Skip-intro button)
    against the real dark surface it renders on meets 4.5:1, verified the
    same way `observatory-contrast.test.ts` already verifies
    `--obs-ink-faint` (computed WCAG relative-luminance ratio from source
    tokens, not eyeballed).

### Tests

20. `ObservatoryEntrance.test.tsx`: renders nothing when
    `sessionStorage` already has the seen-flag, when reduced motion is
    preferred, and below the 1024px gate; renders the overlay and
    Skip-intro button otherwise; ends and sets the flag on button click,
    document click, and keydown; content beneath is present/queryable
    throughout (never removed while the overlay is showing).
21. `ChapterOrbit.test.tsx` (extended): the new discovery affordance
    appears on hover/focus of a non-active body and introduces no new
    element with a non-negative `tabIndex` or its own `href`; the
    `.orbitCamera` transform class/attribute updates when
    `activeChapterId` changes.
22. `observatory-fallback.test.ts` (extended): per item 18.
23. If R3F was selected: a `SpatialScene` test (new) asserting the lazy
    import is not requested when the viewport/motion/WebGL gate fails, and
    a component-level test confirming `<Canvas>` renders with
    `aria-hidden="true"`.
24. `ObservatoryShell.test.tsx` (extended): confirms `ObservatoryEntrance`
    and the new atmosphere layer mount without altering any existing
    assertion about `h1`, freshness, owner slot, or chapter content
    rendering.
25. Full existing suite remains green — no existing Phase 10 test
    (`ChapterFocusManager.test.tsx`, `observatory-contrast.test.ts`, every
    `/share`/`/`/`/dashboard` test, every math/fixture test) is weakened,
    skipped, or deleted.

### Build

26. `npm run build` passes. If R3F was selected, its production dependency
    is present in `package.json`/`package-lock.json`; if CSS was selected,
    those packages are absent (confirmed by `git diff --quiet` and direct
    `node_modules` inspection, per §2.5).
27. The R3F chunk (if applicable) is confirmed, via a real network-log
    check against a running production server, to not be requested during
    initial load of `/` or `/share` — only after the client-side gate in
    §5.3 passes.
28. Every §2.3 budget row passes on the shipped production build (not only
    on the winning spike route), measured with the same adapted
    Moto G4/CPU4x/Slow4G rig, against the pre-§7 baseline.
29. No route outside `/`, `/share`, `/dev/observatory-shell`, and the two
    new §7 spike routes references or imports any §7 file — `/dashboard`
    and every other route remain byte-identical in their own bundle
    composition.

### Privacy

30. `/dev/phase10-spike-css-world` and `/dev/phase10-spike-r3f-world` (the
    latter only during Phase A, or permanently if kept as a reference route
    per §2.5) gate behind `isValidSession` exactly like every other `/dev/*`
    route, with zero dollar-currency patterns in unauthenticated HTML.
31. `ObservatoryEntrance`, `.atmosphere`/`.orbitCamera`, and `SpatialScene`
    contain no portfolio data of any kind — they are pure presentation
    driven only by `activeChapterId`/`mode`, never by `chapterContent` or
    any dollar/holding value; this is verifiable by direct source read
    (none of these files import `DashboardData` or any owner-only type).
32. Public/private render isolation is re-verified on the full shipped
    shell: `mode="public"` never renders `ownerSlot`, and none of §7's new
    elements differ in content (only possibly in nothing, since they carry
    no data) between public and private mode — confirmed by re-running
    `ObservatoryShell.test.tsx`'s existing public/private isolation
    assertions against the post-§7 component.

## 9. New/changed files (minimum)

Phase A:
- `src/app/dev/phase10-spike-css-world/page.tsx` (new)
- `src/app/dev/phase10-spike-r3f-world/page.tsx` (new; removed before
  final commit if CSS wins, per §2.5)
- `docs/phase10-spike-section-7/DECISION.md` (new)
- `docs/phase10-spike-section-7/measure-phone.mjs` (new, adapted from
  `docs/phase10-spike-section-1/measure-phone-v2.mjs`)
- `docs/phase10-spike-section-7/raw/*.json` (new)

Phase B:
- `src/components/observatory/ObservatoryEntrance.tsx` + `.module.css` +
  `.test.tsx` (new)
- `src/components/observatory/ChapterOrbit.tsx` (edit, per §5.2)
- `src/components/observatory/ChapterOrbit.test.tsx` (edit, per item 21)
- `src/components/observatory/observatory.module.css` (edit, per §5.2)
- `src/components/observatory/observatory-fallback.test.ts` (edit, per
  item 18)
- `src/components/observatory/observatory-contrast.test.ts` (edit if any
  new text token is added, per item 19)
- `src/components/observatory/ObservatoryShell.tsx` (edit, per §5.4)
- `src/components/observatory/ObservatoryShell.test.tsx` (edit, per item
  24)
- Only if R3F selected: `src/components/observatory/SpatialScene.tsx` (+
  test), `package.json`/`package-lock.json` (edit)
- `docs/phase10-baseline/section-7/README.md` (new, evidence)

## 10. Evidence to capture and commit

- `docs/phase10-spike-section-7/DECISION.md`: full §2.3/§2.4 tables for
  both variants, the decision, and reasoning per §2.5.
- `docs/phase10-baseline/section-7/README.md`: before/after screenshots per
  items 9 and 14; console warning/error count; a live confirmation of the
  entrance's session-scoped once-only behavior; a live confirmation of
  item 27's network-log check (R3F outcome only).
- Record this spec's §3 architecture decision's rationale is not
  duplicated in the evidence doc (it lives here and in `DECISION.md`) —
  the evidence doc only needs to link back to both, not restate them.
