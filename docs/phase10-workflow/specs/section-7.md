# Phase 10 §7 — Spatial Observatory

Written by: claude-code/sonnet-5 (Claude Lead, `specify` stage). Revised
July 25, 2026 by claude-code/sonnet-5 under an owner-directed correction
(see "Owner correction" below). `PHASE10_STATE.json` remains at
`§7` / `implement` / `codex_implementation` / `ready` / `next_actor: codex`
— this is a specification correction made before Codex's implementation
turn begins, not a reopened specify-stage handoff.

Authority, in order when anything here seems to conflict: `PRODUCT_DIRECTION.md`
→ `PHASE10.md` §7 (as amended July 25, 2026) → `docs/PHASE10_UX_ARCHITECTURE.md`
§§1, 3, 8 → this document. This document exists to make those concrete and
checkable for this one section; it does not override them. The `portfolio-ux`
skill was consulted while writing this spec and again for this correction. It
directs "prefer resilient CSS-based dimensionality unless an accepted
technical decision authorizes something heavier," "spatial bodies, depth,
planes, and motion must represent real chapters, relationships, or states,"
"use one or two orchestrated motion moments," "preserve the accepted visual
system and tokens — do not restyle completed surfaces merely to demonstrate
creativity," and "a beautiful orbit that does not structure navigation is
decoration." Those rules still shape this spec: CSS remains the default entry
point and the tie-breaker of last resort (§2.5), but §3 below no longer
confines a winning R3F result to a decorative afterthought. It separates the
semantic layer (always the shell, §3.1) from the visual composition (open to
recomposition, §3.2) — consistent with the skill's own rule, since §3.4's
mesh/link synchronization is exactly what makes a dominant R3F scene
structure real navigation rather than decorate it.

## Owner correction (July 25, 2026)

The first version of this spec was reliability-strong but too conservative to
guarantee the immersive spatial result the owner asked for: it could pass
every criterion while shipping what is still, visually, a CSS-styled
dashboard with a decorative canvas parked behind it. Devan directed nine
corrections before Codex begins implementation. This revision applies all
nine directly in the sections below rather than layering a changelog on top
of unrevised text. Net effect:

1. If R3F wins Phase A, it may be the visually dominant production spatial
   runtime — `aria-hidden` means the canvas's information is accessibly
   duplicated elsewhere, not that the canvas is visually subordinate or
   merely decorative (§3.3).
2. Semantic HTML remains the source of truth for headings, chapter links,
   content, keyboard navigation, URL state, and fallbacks (§3.1) — but the
   desktop visual composition may be substantially recomposed around a
   spatial scene; the first viewport is not required to stay visually
   unchanged (§3.2).
3. If R3F wins, its five spatial bodies may respond to pointer hover and
   activation by synchronizing with the corresponding semantic chapter
   link; DOM navigation remains fully, independently usable (§3.4, §5.3).
4. The selection procedure is now neutral: mandatory gates first, then an
   equally weighted performance/storytelling score, with CSS only as the
   tie-breaker (§2.5).
5. The storytelling rubric is strengthened so gradients, translated layers,
   and hover labels alone cannot pass it (§2.4).
6. Screenshot filmstrips or short recordings are required for world entry,
   pointer exploration, chapter travel, and settled states, because static
   before/after screenshots cannot prove camera movement (§2.4, §10).
7. The performance methodology now separates a mobile-fallback confirmation
   (Moto G4/Slow 4G — proves the fallback never requests R3F and does not
   regress) from an actual desktop WebGL-scene measurement (1440×900,
   CPU-throttled, with declared memory/lazy-chunk budgets and a
   repeated-transition leak check) — the phone profile is never used as a
   hidden R3F disqualifier (§2.3).
8. The world-entry sequence may run longer than the chapter-travel
   transition if the extra length is justified and the sequence stays
   skippable; chapter navigation itself must remain quick and responsive
   (§5.1).
9. No audio, desktop-only immersive runtime, mobile/reduced-motion/
   no-WebGL/no-JS fallbacks, zero essential canvas-only information,
   privacy boundaries, lazy loading, and the 60/40 balance are all
   unchanged and still binding (§6, §7, §8).

Items 1-9 are requirements Phase A/B must satisfy before §7 can be accepted,
not "if there's time" scope.

## 1. Scope — the smallest complete vertical slice

Two strictly sequenced phases, both required for this section, run in one
implementation turn (mirroring how §1's Builder pass covered spike-then-shell
in a single pass, and how §9's Phase A/B split works within one section):

- **Phase A (spike):** build two isolated, non-production, owner-gated dev
  routes that push the *first-viewport arrival + chapter-travel* experience
  to its expressive ceiling once in pure CSS and once in a bounded, lazy
  React Three Fiber layer; measure both against declared performance budgets
  (§2.3) and a declared storytelling rubric (§2.4); apply the neutral
  selection procedure (§2.5); record the decision with evidence before any
  production dependency is added (§7's Section gate 1).
- **Phase B (production):** wire the selected treatment into the existing,
  already-accepted `ObservatoryShell` (mounted at both `/` and `/share` via
  its existing `mode`/`basePath` props — no route-specific work needed,
  since both routes already share this one component). The semantic layer
  (§3.1) stays structurally untouched and keeps passing its existing tests
  unmodified in both outcomes; the desktop *visual* composition is not fixed
  in advance — see §3 for exactly what is and isn't open.

### In scope

- `docs/phase10-spike-section-7/` — spike routes, decision record, raw
  measurement data (both the mobile-fallback confirmation and the desktop
  WebGL measurement — §2.3), adapted measurement scripts, and the required
  filmstrip/recording evidence (§2.4, §10).
- `src/components/observatory/ObservatoryEntrance.tsx` +
  `.module.css` + `.test.tsx` — new, one-time arrival sequence, its own
  duration decoupled from chapter-travel's (§5.1).
- CSS 3D ceiling push inside `ChapterOrbit.tsx`/`observatory.module.css`:
  a camera-like stage transform on chapter change and a pointer-parallax
  atmosphere layer (§5.2), built **either** as the sole production runtime
  (if Phase A selects CSS) **or** as the always-present, always-operable
  interactive/fallback baseline the semantic anchors live inside (if Phase A
  selects R3F — see §3 for how visually dominant the canvas is allowed to be
  in that outcome).
- Conditionally, only if Phase A selects R3F: `three`, `@react-three/fiber`,
  and `@types/three` as production dependencies (bounded, lazy-loaded, no
  post-processing/physics — §5.3), and
  `src/components/observatory/SpatialScene.tsx` (+ a small lazy-loading
  wrapper), including its pointer hover/activation synchronization with the
  real chapter links (§3.4, §5.3).
- `ObservatoryShell.tsx` edit: mount `ObservatoryEntrance` and the new
  camera-stage/parallax/scene layer inside `.stage` alongside the existing
  `ChapterOrbit`/`plateWrap`. The semantic anchors, `chapterContent`,
  `ownerSlot`, `freshness`, and URL/focus contracts are unchanged (§3.1); the
  visual arrangement of `.stage`'s contents is open to the recomposition
  §3.2 permits.
- Updated/new tests per §7's acceptance criteria (§8) and updated
  `observatory-fallback.test.ts` fallback-parity assertions covering the new
  elements.
- Real evidence at 1440×900 and 390×844 against the pre-§7
  `ObservatoryShell`: still-image before/after screenshots **plus** the
  filmstrip/recording evidence required by §2.4 and §10 (world entry,
  pointer exploration, chapter travel, settled states) — static before/after
  alone does not satisfy this section.

### Explicitly out of scope for this section (do not touch)

- `chapters.ts`, `resolveObservatoryChapter`, `observatoryChapterHref`,
  `ChapterFocusManager.tsx` — the five-chapter identity, URL-state contract,
  and focus-restoration mechanism are already accepted (§1) and correct; §7
  adds motion, depth, and possibly a dominant visual scene around them — it
  does not change what a chapter *is*, how chapter state is addressed, or
  which layer is authoritative for navigation (§3.1).
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
  entrance/camera/parallax/scene layers are gated off entirely inside this
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
  temporarily via `npm install --no-save` (§1's exact precedent for provably
  not touching `package.json`/`package-lock.json` until/unless Phase A
  selects R3F).

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
  labels/questions are present and operable in server-rendered HTML;
- for the R3F variant only: pointer hover/activation synchronization
  between each mesh and its corresponding real chapter anchor, per §3.4 —
  this is required in the spike itself, not deferred to Phase B, because it
  is binding architecture if R3F wins.

### 2.2 What each variant must attempt (the actual comparison)

Both variants build the same three additive treatments from §5 (entrance,
camera-like chapter travel, parallax depth) against the same synthetic
content, so the comparison is apples-to-apples on the *specific* feature set
§7 will ship, not a generic "which is prettier" comparison:

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
  between chapters on change, a background gradient/starfield, and the same
  entrance sequence concept realized via camera fly-in. Each mesh responds
  to pointer hover and click/tap activation by synchronizing with its
  corresponding real chapter anchor (hover mirrors the anchor's own
  hover/focus-visible state; activation triggers the same navigation the
  anchor performs) — this hover/activation synchronization is part of the
  spike itself, not deferred to Phase B, because §3.4 makes it binding
  architecture if R3F wins. `aria-hidden` on the `<Canvas>` per §3.3's
  corrected meaning (accessible duplication, not visual subordination); the
  same five real `next/link` anchors from the CSS variant render as the
  actual semantic/interactive control layer, present in the DOM regardless
  of how visually dominant the canvas is (this is not optional exploration —
  it is the architecture Phase B will ship if R3F wins; see §3).

### 2.3 Performance budgets (declared before measuring, per `CLAUDE.md`'s
"write unit tests... BEFORE wiring" discipline extended to spike measurement)

Corrected July 25, 2026 (correction 7): the original version of this section
measured everything — including the desktop WebGL scene itself — on a single
phone-class profile. Because the production R3F scene only ever loads at
viewport ≥ 1024px with motion not reduced and a real WebGL context (§5.3's
gate), a Moto G4 phone measurement never exercises that code path in
production; using it to judge or disqualify the desktop scene was a hidden,
irrelevant gate. Two separate profiles now exist for two separate purposes.

#### 2.3.1 Mobile-fallback confirmation (Moto G4 / Slow 4G — proves the
fallback, not the scene)

Reuse the exact measurement rig §1's acceptance-remediation-round-2 pass
established and had independently Codex-verified as correct
(`docs/phase10-spike-section-1/measure-phone-v2.mjs`, Moto G4 device
profile, CDP CPU 4x throttling, Slow 4G network throttling, real production
server, 5 fresh-context repetitions per route) — adapt, do not re-derive
from scratch. This profile's sole purpose is to confirm the mobile/narrow/
reduced-motion/no-WebGL fallback path behaves correctly; it is never used to
score or disqualify the desktop WebGL scene.

| Check | Requirement |
|---|---|
| R3F lazy-chunk network request | Zero requests to the R3F chunk's file path during load of either spike route or the shipped shell at this profile's viewport (< 1024px) — verified via the network log, not inference. |
| Load (`goto` → `networkidle`) on the CSS-fallback path | ≤ 5000 ms, no regression vs. the pre-§7 baseline (unchanged from §1's threshold). |
| Long tasks (added over baseline) on the CSS-fallback path | 0 tasks > 50 ms of added time (§1's corrected differential methodology). |
| Frame stability, idle, on the CSS-fallback path | 0 dropped frames (> 33.4 ms). |

A failure here means the *fallback* regressed, not that R3F should lose the
Phase A comparison — treat it as its own pass/fail check, independent of
§2.3.2 and the decision procedure in §2.5.

#### 2.3.2 Desktop WebGL-scene measurement (1440×900, CPU-throttled — proves
the actual scene)

Representative desktop profile: 1440×900 viewport, CDP CPU 2× throttling (a
mid-range-laptop-class throttle, distinct from and lighter than the
phone-class 4× used in §2.3.1 — do not reuse the phone multiplier here), no
network throttling (desktop broadband is the realistic target environment
for this scene), real production server, 5 fresh-context repetitions per
route. Baseline for every "added" row is the pre-§7 `ObservatoryShell` as it
exists today, measured on this same desktop profile — not the phone
baseline, and not an empty page.

| Metric | Threshold | Basis |
|---|---|---|
| Bundle: added gzip JS over the pre-§7 baseline, for JS that ships in the initial route bundle (excludes anything genuinely lazy-loaded post-mount) | ≤ 50 KB | Unchanged — small client components, not a new heavy dependency, regardless of runtime. |
| Bundle: R3F lazy chunk (R3F variant only; loaded strictly post-mount, only when viewport ≥ 1024px, motion is not reduced, and a WebGL context is available) | ≤ 260 KB gzip | §1 measured `three`+`@react-three/fiber` alone at 233 KB gzip; 260 KB gives headroom for this section's scene code. Must be 0 B of the *initial* route bundle regardless of size. |
| Load (`goto` → `networkidle`) on this desktop profile | ≤ 3000 ms, no regression vs. the pre-§7 desktop baseline | Tighter than the phone budget because desktop load is materially faster; still RAIL-based. |
| Long tasks during load and during one chapter-travel transition, added over the pre-§7 desktop baseline | 0 tasks > 50 ms of added time | Same differential methodology as §1, applied on this profile. |
| Frame stability, idle (1 s sample, post-settle, post-entrance) | 0 dropped frames (> 33.4 ms) | Unchanged predicate. |
| Frame stability, during the chapter-travel transition itself (one full transition, click to settle) | ≥ 90% of frames ≤ 33.4 ms | Unchanged — a transition is a brief, busier animation. |
| Memory: added CDP `Performance.getMetrics` `JSHeapUsedSize` over the pre-§7 desktop baseline, measured once mounted and settled | ≤ 40 MB added | Declared before measuring, desktop-appropriate (not the old 5 MB phone figure): a handful of low-poly meshes, materials, and one camera easily exceed 5 MB; 40 MB is a realistic ceiling for this section's bounded scene (no imported textures/models, no post-processing/physics per §5.3), not a rubber-stamped default. |
| Repeated-transition leak check (NEW): cycle through all five chapters four times in a row (20 total transitions), measuring added `JSHeapUsedSize` immediately after each cycle's fourth chapter settles | Growth from cycle 1's post-settle measurement to cycle 4's post-settle measurement ≤ 10 MB | Operationalizes "no leak": undisposed geometries/materials/textures from repeated mount/unmount of chapter meshes show up as monotonic growth across cycles; a bounded, disposable scene should plateau, not climb. |
| Interaction latency: click a chapter body → the new chapter's content plate heading is focused (§1's existing `ChapterFocusManager` contract) and the camera-travel transition has visually settled | ≤ 900 ms | Tighter than the old phone-based 1200 ms bound; desktop focus-manager/paint overhead is materially lower. |

Every row in this table applies to whichever runtime is being evaluated; the
R3F-specific rows (lazy chunk, leak check) are only applicable to the R3F
variant. All rows in §2.3.1 and §2.3.2 are mandatory-gate reliability checks
(§2.5) — a variant that fails any of them is disqualified from selection
outright, regardless of its storytelling score.

### 2.4 Storytelling rubric (declared before measuring; strengthened July
25, 2026 per owner correction 5 — required, and, per `PHASE10.md`'s Section
gate 2, a technically clean but non-immersive shipped result fails §7
regardless of which runtime was selected)

The original six rows could be satisfied by gradients, translated flat
layers, and hover-triggered labels without ever producing the experience
`PHASE10.md` §7 asks for — a coherent world, camera-like movement, spatial
composition, layered depth, discovery, and memorable transitions that read
as entering a place, not decorating a dashboard. The rows below restate and
strengthen each named criterion as a concrete, checkable requirement; none
of them can be satisfied by decoration alone, and several are phrased so
that decoration-only implementations fail by construction (rows 2, 6, and 8
in particular require a *change* — continuity, occlusion, or anchoring —
that a flat gradient or translate cannot produce).

Evaluate both variants against every row below; a variant that fails a row
does not automatically lose (weigh alongside §2.3 and the procedure in
§2.5), but a row failed by **both** variants means neither may be selected
as-built — the implementation must be revised until at least one variant
passes all eleven rows before Phase A's decision is recorded.

1. **World-entry legibility:** shown the idle 1440×900 first viewport alone,
   with no caption or narration, an unprimed viewer describes it within five
   seconds as entering or being inside a spatial environment or world — not
   as a styled dashboard with layered cards or panels. Verified with at
   least two people who have not seen the pre-§7 shell; their verbatim first
   reactions are recorded in the decision doc.
2. **Continuous environment:** the five spatial chapter-objects and the
   atmosphere read as occupying one shared, continuous environment (a
   consistent horizon, lighting direction, and depth framing) rather than
   independent shapes floating over an unrelated flat backdrop — verified
   by direct observation that no object appears merely pasted on top
   without a shared spatial frame of reference.
3. **Coherent world persistence:** a single continuous atmospheric
   background persists unbroken across the entrance and every chapter
   transition (it does not reset, flash, or reload between chapters) —
   verified by direct observation across at least three chapter changes in
   a row.
4. **Camera-like movement with real perspective change:** chapter
   navigation animates a transform (translate and/or scale, optionally
   rotate) on a dedicated stage/camera element keyed to the active chapter,
   AND produces a visible change in at least two of {perspective, scale,
   parallax offset, occlusion} between the resting state before and after
   the transition — a flat translate or opacity-only crossfade does not
   satisfy this row even if it runs 400-900 ms. Verified by source (a CSS
   `transition`/`animation` or an R3F camera tween keyed to
   `activeChapterId`) and by a captured before/mid/after frame sequence
   showing continuous intermediate motion and at least one of the required
   changes.
5. **Spatial composition:** at least three distinguishable depth layers are
   simultaneously visible in the 1440×900 first viewport — background
   atmosphere, the orbit/chapter-body/scene layer, and the foreground
   content plate — each a distinct stacking-context element, visibly
   non-coplanar in the screenshot.
6. **Layered depth with occlusion (parallax):** on desktop, non-touch,
   motion not reduced, pointer movement measurably offsets at least two of
   the three layers from row 5 by different magnitudes, AND at least one
   pair of objects/layers changes their relative front/back occlusion (one
   object partially covering or uncovering another) as the viewpoint shifts
   — layer offset without any occlusion change does not satisfy this row.
   Verified live by reading computed transform/position values at two
   distinct pointer positions and observing the occlusion change.
7. **Chapter selection feels like travel:** watching one chapter-to-chapter
   transition without narration, an unprimed observer describes it using
   movement/travel language ("moved to," "flew to," "arrived at") rather
   than "switched" or "faded to." Verified with at least two observers;
   verbatim reactions recorded.
8. **Foreground anchored in the world:** the foreground content plate
   (headline, facts) reads as positioned within the spatial scene —
   attached to, floating near, or docked against a spatial object or plane
   with shared depth/light cues — rather than a flat card independently
   overlaid on an unrelated background. Verified by direct observation of
   shared shadow, light, or perspective cues between the plate and the
   scene behind it.
9. **Discovery:** hovering or keyboard-focusing a non-active chapter body
   reveals a lightweight preview affordance (a subtle lift/scale plus a
   one-line echo of that chapter's `question`) not present in the idle
   state — purely additive to the existing real anchor (no new focus stop,
   no navigation on hover) — verified live and by an idle/hovered
   screenshot pair.
10. **Memorable, blind-comparable transitions:** the entrance sequence and
    the chapter-travel transition are visually distinct from each other and
    from the existing `obs-enter` fade-scale keyframe already shipped in
    §1, AND a blind before/after comparison (the pre-§7 committed shell vs.
    the shipped §7 result, same chapter, same viewport, shown without
    narration) elicits an unprompted description using world-scale language
    ("different world," "immersive," "like a different place") rather than
    "shinier" or "has more effects." Verified by a captured frame sequence
    per transition and at least two recorded blind-comparison reactions.
11. **Captures y-n10.com's transferable qualities without copying it:** a
    direct, named side-by-side comparison against `https://y-n10.com/`
    (recorded in the decision doc, never copying its branding, voxel
    assets, layout, or color system) concludes the shipped result shares
    its transferable qualities — entering a world, camera-like movement,
    discovery, and one coherent set of spatial rules — not merely that it
    "also has 3D."

### 2.5 Decision procedure (corrected July 25, 2026 — neutral, not
CSS-favoring)

The original procedure ("select R3F only if... otherwise select CSS") made
CSS the presumed winner and let a merely-adequate CSS result block a
materially better R3F result by default. The corrected procedure removes
that bias:

**Step 1 — mandatory gates (pass/fail, no scoring).** A variant advances to
Step 2 only if it passes all four of:

- **Accessibility gate:** all five chapter destinations operable by
  keyboard, touch, and screen reader via real anchors; the reduced-motion
  variant is static; contrast of any new text meets 4.5:1; `aria-hidden`
  usage matches §3.3 (every piece of information the hidden layer conveys
  has an accessible textual equivalent elsewhere in the DOM).
- **Privacy gate:** the spike route is owner-gated exactly like
  `/dev/phase10-spike-css` and `/dev/observatory-shell`; zero
  dollar-currency patterns in unauthenticated HTML; no portfolio data
  referenced by any spike file.
- **Fallback gate:** the forced-failure variant (`?no3d=1` for CSS, forced
  WebGL-context failure for R3F) leaves all five chapter links fully
  operable with no broken layout; the no-JavaScript check passes (all five
  chapter links and labels present and operable in server-rendered HTML).
- **Reliability gate:** every row in §2.3.1 and §2.3.2 passes (both the
  mobile-fallback confirmation and the desktop WebGL-scene measurement,
  including the repeated-transition leak check where applicable).

A variant that fails any mandatory gate is disqualified from selection, full
stop — no score can rescue it.

**Step 2 — equal-weighted score among gate-passing variants.** For each
variant that passed Step 1:

- **Performance score (0-10):** headroom against the §2.3.2 budgets that
  aren't pass/fail cliffs — added bundle size, added memory, and
  interaction latency, each scored as `10 × (1 − measured/budget)` and
  averaged (floor at 0, cap at 10). A variant with no applicable R3F-only
  rows (i.e. CSS) scores those rows as fully passing (10) rather than N/A,
  so the two variants remain comparable on the same 0-10 scale.
- **Storytelling score (0-10):** count of the eleven §2.4 rows fully
  satisfied (1 point each, 0.5 for partial), scaled to a 0-10 range
  (`points × 10 / 11`).
- **Combined score:** performance score + storytelling score (equal
  weight, out of 20 total).

**Step 3 — select.** The variant with the higher combined score is
selected. If the combined scores are equal, CSS is selected as the
tie-breaker — CSS is never the presumed winner, only the tie-breaker.

Record the full Step 1 gate results, Step 2 scores with their arithmetic,
and the Step 3 selection in `docs/phase10-spike-section-7/DECISION.md`,
following `docs/phase10-spike-section-1/DECISION.md`'s existing format
(methodology, declared thresholds before measuring, results table,
reasoning, screenshots/filmstrip index). If R3F is selected, keep it
installed for Phase B (do not round-trip an install/uninstall, since §7's
R3F — unlike §1's — is being kept as a production dependency). If CSS is
selected, remove `three`/`@react-three/fiber`/`@types/three` and
`src/app/dev/phase10-spike-r3f-world/` entirely, and confirm their absence
the same way §1 did (`git diff --quiet package.json package-lock.json`,
direct `node_modules` inspection).

## 3. Central architecture decision (binding on Phase B regardless of Phase
A's outcome — record this reasoning in the decision doc, do not rediscover
it later)

Amended July 25, 2026 (owner-directed correction): the original version of
this section made the CSS 3D shell's *visual* composition the permanent
ceiling in both outcomes and demoted any R3F result to a background
decoration. That satisfied every gate on paper while still risking a shipped
result indistinguishable from a CSS-styled dashboard with a canvas parked
behind it — precisely what the owner's amendment forbids. The corrected rule
below separates two things the original conflated: (1) which layer is the
*source of truth* for structure, semantics, keyboard/touch operation, and
URL state — this is fixed and never reopened — and (2) which layer is the
*dominant visual composition* the desktop viewport actually shows — this is
open, and may be substantially recomposed around a winning R3F scene.

### 3.1 What never changes, regardless of which runtime wins

The already-accepted `ObservatoryShell`/`ChapterOrbit` semantic layer —
`chapters.ts`, `resolveObservatoryChapter`, `observatoryChapterHref`,
`ChapterFocusManager`, the five real chapter `<a>`/`next/link` anchors,
`aria-current`, URL state, browser back/forward, and the complete
2D/reduced-motion/forced-no-3D fallback path — remains the **one true
interactive and semantic structure**. It is never removed, replaced, or made
secondary as the thing keyboard, touch, and screen-reader users operate.
Every one of §1's existing passing tests continues to describe real,
unchanged behavior in both outcomes. This is what "semantic HTML remains the
source of truth" means for §7: a structural and operational guarantee, not a
visual one.

### 3.2 What is open: the desktop visual composition

- **If CSS wins:** §7 extends the shell's own CSS further (entrance,
  camera-stage transform, parallax atmosphere), per §5.2. No new runtime, no
  new dependency.
- **If R3F wins:** the R3F `<Canvas>` may become the visually dominant
  production spatial scene on desktop — the primary thing a sighted desktop
  visitor sees and reads as "the world" — not a decorative layer confined to
  sitting behind the existing orbit's own visual presentation. §5.2's CSS
  `.atmosphere`/`.orbitCamera` treatment is not required to remain the
  visually primary layer in this outcome; it may be visually subordinated
  to, replaced in appearance by, or reserved as the fallback-only
  presentation under the R3F scene, at the implementer's discretion,
  provided §3.1 holds and §6's fallback behavior is intact. The existing
  first viewport's visual composition is explicitly **not** required to
  remain unchanged if R3F wins — a materially different, more immersive
  desktop composition is the point of this section, not a risk to avoid.

### 3.3 What `aria-hidden` means here (correction to the original text)

`<Canvas aria-hidden="true">` (and the CSS `.atmosphere`/discovery-label
elements) are marked `aria-hidden` because raw canvas pixels and duplicate
decorative markup are not meaningfully parseable by assistive technology,
and because every piece of information they convey must already exist,
accessibly, somewhere else in the DOM — this is **accessible duplication**,
not a statement about visual importance or subordination. `aria-hidden`
never means "this is the minor, decorative version while the real
experience lives in the semantic DOM"; the semantic DOM is the operational
and structural source of truth (§3.1) independent of which layer is more
visually prominent. Concretely: the active chapter's identity, every
chapter's label/question, and the discovery-hover text must each have a
real, accessible textual equivalent already rendered by
`ChapterOrbit`/`ChapterFocusManager` (unchanged from §1) — the R3F scene may
look like the dominant experience while contributing zero accessible-tree
nodes of its own, because nothing it shows is exclusive information.

### 3.4 Five spatial bodies as real, activatable controls when R3F wins
(correction 3)

If R3F wins, `SpatialScene`'s five meshes are not inert decoration once the
runtime is dominant: each mesh corresponds 1:1 to a real chapter and
responds to pointer hover and click/tap activation by synchronizing with —
never replacing — the corresponding semantic chapter link (see §5.3 for the
exact mechanism). Hovering a mesh drives the same hover/active-preview state
the real link's own `:hover`/`:focus-visible` rule would; activating
(clicking/tapping) a mesh triggers the same navigation the real link
performs (by invoking the link's existing navigation, e.g. programmatically
following its `href` through the same router call `ChapterOrbit` already
uses — not a second, parallel navigation implementation). The semantic DOM
navigation remains fully, independently usable by keyboard, touch, and
screen reader without the canvas ever being touched — mesh interactivity is
an additive convenience for pointer users on top of the one real navigation
mechanism, not a second one.

### 3.5 Fallback posture (unchanged obligation, restated)

If R3F fails to acquire a WebGL context or its lazy import fails, the page
falls back completely to the §5.2 CSS treatment with no visible degradation
— this remains true regardless of §3.2's new permission for R3F to be
visually dominant when it works. Because the CSS variant is pushed to its
own genuine expressive ceiling in §5.2 (not merely retained as a bare pre-§7
shell), this fallback is a full, still-immersive presentation on its own
terms, not a downgrade to "the old dashboard."

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
  rule already uses), render nothing and do nothing further.
- Otherwise, render a full-viewport `aria-hidden` overlay that plays one
  arrival animation. Corrected July 25, 2026 (owner correction 8): the
  entrance's duration is no longer tied to the 400-900 ms chapter-travel
  range — it may run longer (up to 3000 ms) if the extra length is spent on
  genuine world-arrival storytelling (e.g., a camera fly-in, a reveal of the
  full environment) rather than padding, provided it remains fully
  skippable and never delays the shell's semantic content, controls, or
  `h1` from being present and operable from first paint. Chapter-to-chapter
  navigation itself is a different, quicker interaction and keeps its own
  separate 400-900 ms budget (§5.2/§5.3, §2.3.2's interaction-latency row)
  — entrance length must never be allowed to slow down or gate ordinary
  chapter travel. A real, visible, focusable "Skip intro" `<button>`
  (minimum 44×44 CSS px) is positioned over the overlay throughout. The
  overlay never gates the content beneath it: the full shell (`h1`,
  freshness, nav, plate) is present and interactive in the DOM from the
  first paint, exactly as it is today — the entrance is a pure visual
  overlay, not a loading gate (same non-blocking posture
  `DepthPullProvider`'s existing overlay already establishes, applied to a
  new occasion, not the same component).
- Ends on: the animation's natural completion, a click/tap anywhere, any
  keydown, or the Skip button. On end, sets the sessionStorage flag and
  unmounts the overlay (the button and overlay are removed from the DOM,
  not merely hidden, so they never become a stray focus stop afterward).
- No-JS: this component never hydrates, so no overlay ever renders — the
  shell is immediately fully visible and operable, satisfying "never
  blocking content" trivially for the no-JS case.

### 5.2 Camera-like chapter travel + parallax atmosphere — CSS path (built
in either outcome per §3; the sole runtime and primary visual composition
if CSS wins, the always-present real-anchor layer and complete fallback
composition if R3F wins)

Edits to `ChapterOrbit.tsx` and `observatory.module.css` (no new component —
this is the existing orbit's own ceiling being pushed). This treatment is
built in either outcome. If CSS wins Phase A, it is the sole production
runtime and the primary visual composition. If R3F wins, it remains the
always-present real-anchor layer and the complete fallback composition
(§3.5) — §3.2 permits R3F to visually dominate the desktop viewport in that
outcome, so this CSS treatment's own visual prominence relative to the
canvas is an implementation choice, not a fixed requirement, as long as
§3.1's structural guarantees hold:

- New `.atmosphere` layer: a full-bleed `aria-hidden` `<div>` behind
  `.orbitWrap`, styled with a CSS gradient/radial-composition background (no
  image assets — matches the existing shell's zero-asset-dependency
  posture). Rendered unconditionally at desktop widths; hidden entirely
  under the existing `@media (max-width: 767px)` and
  `[data-force-no-3d="true"]` fallback blocks (extend those blocks' existing
  selector lists, do not create parallel ones — `observatory-fallback.test.ts`
  already asserts every fallback class appears in both blocks in parity, and
  this section's new classes must be added to that same parity list, not
  exempted from it).
- Stage-level camera transform: wrap `.orbit`'s existing per-body
  `translate3d` positions (unchanged) in an outer `.orbitCamera` element
  that receives one `transform: translate3d(...) scale(...)` transition
  (400-900 ms, `var(--ease-depth)` — reuse the existing token from
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
- Discovery affordance (§2.4 row 9): non-active `.body` elements gain a
  `:hover`/`:focus-visible` rule that lifts/scales them slightly and
  reveals a small `aria-hidden` label showing that chapter's `question`
  (positioned near the body, not overlapping the real link's own visible
  label/number). This is additive CSS/markup on the existing anchor — no
  new interactive element, no new focus stop. If R3F is selected, this same
  rule also keys off the shared `hoveredChapterId` state described in
  §5.3/§5.4, so hovering the corresponding mesh previews this affordance
  too.

### 5.3 `SpatialScene` — R3F path (built only if Phase A selects R3F;
corrected July 25, 2026 to allow visual dominance and mesh interactivity per
owner corrections 1 and 3)

New `src/components/observatory/SpatialScene.tsx`, loaded via
`next/dynamic(() => import("./SpatialScene"), { ssr: false })` from
`ObservatoryShell.tsx`, itself gated by a small client check (viewport ≥
1024px, `usePrefersReducedMotion()` is `false`, and a real
`canvas.getContext("webgl2") ?? canvas.getContext("webgl")` probe succeeds)
so the import is never requested at all outside that condition — this is
what makes it genuinely lazy per §7's Build acceptance criteria, not merely
code-split-but-still-eagerly-requested.

- Renders a `<Canvas aria-hidden="true">` occupying the primary spatial
  stage — it may be the visually dominant layer the sighted desktop visitor
  perceives as "the world" (§3.2); it is not required to sit passively
  behind `.orbitWrap` as a mere backdrop. Five simple meshes echo chapter
  positions (extruded plates, icosahedra, or similar low-poly primitives —
  no imported 3D assets, no textures beyond flat color/gradient materials,
  no post-processing, no physics), and a camera animates toward the active
  chapter's mesh on change (same 400-900 ms chapter-travel range as §5.2,
  triggered by the same `activeChapterId`).
- `ChapterOrbit`'s real anchors remain mounted, in the DOM, in tab order,
  with real `href`s and `aria-current` — this is fixed (§3.1) regardless of
  how the canvas is visually composed. Their own CSS may be adjusted so
  their visual footprint coexists with the dominant canvas (for example:
  positioned to coincide with their corresponding mesh, reduced to a
  minimal always-present hit target with a visible focus style, or
  otherwise integrated into the composition) — what must not change is that
  they remain real, independently operable links with a visible focus
  indicator and a 44×44 CSS px target.
- **Hover/activation synchronization (§3.4):** a small piece of lifted
  state — `hoveredChapterId` and `activeChapterId`, owned by
  `ObservatoryShell` or a lightweight context it provides — is read and
  written by both layers:
  - `SpatialScene`'s meshes call `onPointerOver`/`onPointerOut` to
    set/clear `hoveredChapterId`; `ChapterOrbit`'s discovery-affordance CSS
    (§5.2) keys off this same state (in addition to its own native
    `:hover`/`:focus-visible`), so hovering a mesh visually previews the
    corresponding real chapter body exactly as hovering the real anchor
    would.
  - `ChapterOrbit`'s real anchors, on `:hover`/`:focus-visible`, set the
    same `hoveredChapterId`, so keyboard/focus users driving the real
    anchors also drive the mesh's preview state in the canvas —
    synchronization is bidirectional.
  - A mesh's `onClick`/`onPointerUp` invokes the exact navigation call
    `ChapterOrbit`'s own anchor performs for that chapter (the same
    `observatoryChapterHref`-built URL through the same router call) — it
    does not implement a second, parallel navigation path. The real anchor
    remains independently clickable/keyboard-activatable without ever
    touching the canvas.
  - Unlike §1's spike finding (where an R3F `<Canvas>` capturing pointer
    events blocked the real anchors beneath it from being *mouse*-clickable
    at all), that concern does not reappear here in the same form: pointer
    users clicking through the canvas trigger mesh `onClick` handlers that
    perform the identical navigation the real anchor would, so canvas
    pointer capture is intentional, not a regression. Keyboard operation of
    the real anchors (Tab, Enter/Space) and screen-reader access to them
    are unaffected by DOM stacking order or `pointer-events`, since those
    interactions do not depend on hit-testing coordinates.
- On WebGL probe failure or lazy-import failure (network/chunk error),
  render nothing extra — the CSS `.atmosphere`/`.orbitCamera` layer from
  §5.2 remains visible underneath as the complete fallback composition
  (§3.5), unchanged, satisfying "must fall back completely if
  WebGL/context/loading fails."
- No post-processing passes, no physics engine, no imported textures/models
  — flat/gradient materials and primitive geometry only (same bound the
  spike already proved out in §2.2).

### 5.4 `ObservatoryShell.tsx` edit

Mount `ObservatoryEntrance` (passing `mode`) and, inside `.stage` before or
alongside `ChapterOrbit`, the CSS atmosphere layer (§5.2, always) and
`SpatialScene` (§5.3, conditionally, only if Phase A selected R3F). If R3F
is selected, also provide the small `hoveredChapterId`/`activeChapterId`
shared state §5.3 requires (a `useState`/lightweight context lifted no
higher than `ObservatoryShell` — no new global store). No other prop,
structural contract, or behavior in this file changes — `chapterContent`,
`ownerSlot`, `freshness`, `forceNo3d`, and the existing `data-mode`/
`data-force-no-3d` attributes are untouched; the *visual* arrangement of
`.stage`'s children is open per §3.2.

## 6. Fallbacks (all reuse existing, already-accepted mechanisms — no new
fallback system is introduced)

- **Mobile (< 1024px):** `ObservatoryEntrance` renders nothing;
  `.atmosphere`/`.orbitCamera` transform/transition are `none`; the
  `pointermove` listener is never attached; `SpatialScene` (if applicable)
  is never imported (the ≥1024px gate in §5.3 already excludes it). The
  existing flat concentric/list fallback (`@media (max-width: 767px)`) is
  completely unaffected by any §7 file. Between 768-1023px, the shell
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
- **No-WebGL (R3F outcome only):** covered by §5.3/§3.5 — the CSS shell
  remains fully visible and functional as a complete presentation, not a
  downgrade; nothing is separately built for this case beyond the
  probe-and-skip-import gate already specified.
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
  users reach the same preview state sighted mouse users do. Mesh
  hover/activation synchronization (§5.3) is an additive convenience for
  pointer users on top of this — it introduces no keyboard-only requirement
  of its own, since the real anchors remain the complete keyboard path
  regardless of whether a canvas is present or which layer is visually
  dominant.

## 7. Non-goals (explicitly not required by this section, so review does
not invent them as findings)

- §7 does not require a second orchestrated motion moment beyond entrance +
  chapter-travel (`PRODUCT_DIRECTION.md` principle 6 caps this at "one or
  two").
- §7 does not require touch-driven parallax (§5.2 explicitly scopes
  parallax to non-touch pointers); touch users get the stage-transform
  chapter-travel motion but not pointer-follow parallax, which is
  intentional, not a gap.
- §7 does not require the discovery hover affordance to appear on touch
  devices without a hover concept; its keyboard/`:focus-visible` path is
  the touch-accessible equivalent, per §6.
- §7 does not require photorealistic rendering, physically-based materials,
  or imported 3D assets even where R3F is visually dominant (§3.2) —
  flat/gradient materials and primitive geometry remain sufficient to
  satisfy the storytelling rubric (§2.4), per §5.3's bounded-scene
  requirement.
- §7 does not require mesh hover/activation synchronization (§3.4) to work
  on touch devices without a hover concept; touch users activate a mesh via
  tap (equivalent to click) and use the real anchors directly for
  everything else, per §6.

## 8. Acceptance criteria

### Behavioral

1. Phase A's decision is recorded in `docs/phase10-spike-section-7/DECISION.md`
   with the full Step 1 gate results, Step 2 scores and arithmetic, and
   Step 3 selection from §2.5, plus complete measured tables for both
   variants against every §2.3.1, §2.3.2, and §2.4 row, before any
   production dependency (`three`/`@react-three/fiber`/`@types/three`)
   appears in `package.json` (only applicable if R3F is selected — if CSS
   is selected, confirm those packages are absent from `package.json`,
   `package-lock.json`, and `node_modules`).
2. Entering `/` or `/share` for the first time in a browser session plays
   the entrance sequence exactly once; a second page load or chapter change
   in the same tab/session does not replay it; a fresh `sessionStorage`
   (new tab) replays it again.
3. The entrance is skippable by the Skip-intro button, any click/tap, or
   any keydown, and never delays the shell's semantic content, controls, or
   `h1` from being present and operable from first paint, regardless of how
   long the entrance itself runs (up to the 3000 ms ceiling in §5.1).
4. All five chapter destinations work by click, keyboard, and touch exactly
   as they did before §7 (real `next/link` anchors, stable
   `?chapter=`/URL state, `aria-current`, browser back/forward, focus
   restoration via the unmodified `ChapterFocusManager`) — no essential
   navigation depends on `ObservatoryEntrance`, the CSS camera/parallax
   layer, or `SpatialScene`.
5. Chapter-to-chapter navigation visibly animates a camera-like stage
   transform (§5.2, and §5.3's camera move if R3F was selected) that
   produces a visible change in at least two of {perspective, scale,
   parallax, occlusion} rather than an instant swap, and remains within its
   own 400-900 ms chapter-travel budget regardless of how long the entrance
   sequence ran.
6. If R3F was selected: each mesh responds to pointer hover and activation,
   synchronized bidirectionally with its corresponding semantic chapter
   link per §3.4/§5.3 — hovering a mesh previews the same chapter-body
   state hovering/focusing the real anchor would, and activating a mesh
   triggers the same navigation as the real anchor. The semantic DOM
   navigation remains fully operable independent of any pointer/canvas
   interaction.
7. Non-active chapter bodies show the discovery preview affordance on
   hover/focus and do not navigate or steal focus on hover alone.
8. If R3F was selected: on a forced WebGL-context-failure, the shell
   remains fully navigable and visually complete via the unchanged CSS
   fallback composition (§3.5/§5.2), with no error state, blank region, or
   broken layout.

### Visual (storytelling gate — required, equal in rank to performance)

9. The shipped production result independently passes all eleven §2.4
   rubric rows (re-verified live on the actual production build, not only
   on the winning spike route) at 1440×900, including the named
   blind-comparison and y-n10.com-comparison rows (10, 11) recorded with
   verbatim reactions, not summarized impressions.
10. Real 1440×900 before (pre-§7 `ObservatoryShell`, i.e. today's committed
    state) and after screenshots exist under
    `docs/phase10-baseline/section-7/`, covering: idle first viewport,
    mid-entrance (or immediately post-skip), a chapter-travel transition in
    progress, a settled new chapter, and the discovery-hover state — AND
    filmstrip/short-recording evidence per §2.4 and §10 for world entry,
    pointer exploration, chapter travel, and settled states. A static
    before/after screenshot pair alone does not satisfy this item — it
    cannot show the continuous motion rows 4 and 6 of §2.4 require evidence
    for.
11. The ~60/40 polished-to-playful balance is evident: no added element
    (entrance overlay, atmosphere, discovery label, or — if applicable —
    `SpatialScene` meshes/materials) uses cartoon styling, emoji, or
    playful iconography; the existing plate/typography/copy visual language
    is unchanged and undiluted by the new motion layers.
12. `grep` across every file this section adds/edits confirms zero
    `<audio>` elements, zero Web Audio API usage, and no autoplay media of
    any kind.

### Mobile

13. At 390×844 and 320px, the shell is byte-for-byte the same fallback
    layout as before §7 (no entrance overlay, no camera transform, no
    parallax, no `SpatialScene` import) — verified live and by screenshot
    against the pre-§7 mobile baseline, confirming zero visual diff.
14. No horizontal page overflow at 390×844/320px
    (`document.documentElement.scrollWidth === clientWidth`, verified
    live), and no control smaller than 44×44 CSS px, including the
    Skip-intro button on any viewport where it can render.
15. 390×844 before/after screenshots exist under
    `docs/phase10-baseline/section-7/` (the "after" is expected to be
    visually identical to "before" per item 13 — capture both to prove
    that identity, not to show a difference).

### Accessibility

16. `ObservatoryEntrance`'s overlay is `aria-hidden`; the Skip-intro button
    is a real, visibly labeled, focusable `<button>`; focus lands somewhere
    sensible (the shell's existing focus behavior, e.g. the `h1` or active
    chapter heading) once the entrance ends, never trapped inside the
    (now-unmounted) overlay.
17. `.atmosphere` and (if applicable) `SpatialScene`'s `<Canvas>` are
    `aria-hidden`; screen-reader reading order and content are unaffected
    by their presence (verified by confirming they contribute zero
    accessible-tree nodes); and, per §3.3's corrected meaning, every piece
    of information the hidden layer conveys — active chapter identity,
    every chapter's label/question, and the discovery-hover text — has a
    real, accessible textual equivalent already rendered by
    `ChapterOrbit`/`ChapterFocusManager`, verified by direct source read,
    not asserted.
18. The discovery hover/focus affordance's revealed label is `aria-hidden`
    (the information it echoes — the chapter's `question` — is already
    exposed accessibly via the existing `.inspectorQuestion` element for
    the active chapter and via the link's own visible text for every
    chapter) and introduces zero new focus stops.
19. `observatory-fallback.test.ts`'s existing parity assertions (every
    fallback class present in both the reduced-motion media query and the
    `[data-force-no-3d="true"]` block) are extended to cover every new
    class this section adds (`.atmosphere`, `.orbitCamera`, and any
    discovery-affordance class) and continue to pass.
20. Contrast of any new text (the discovery label, the Skip-intro button)
    against the real dark surface it renders on meets 4.5:1, verified the
    same way `observatory-contrast.test.ts` already verifies
    `--obs-ink-faint` (computed WCAG relative-luminance ratio from source
    tokens, not eyeballed).
21. If R3F was selected: mesh hover/activation synchronization (§3.4/§5.3)
    introduces zero new focus stops and zero new accessible-tree nodes of
    its own; keyboard-only operation of all five chapters is independently
    provable with the canvas's own event handlers disabled/erroring (i.e.,
    the real anchors alone remain sufficient for full keyboard/
    screen-reader navigation).

### Tests

22. `ObservatoryEntrance.test.tsx`: renders nothing when `sessionStorage`
    already has the seen-flag, when reduced motion is preferred, and below
    the 1024px gate; renders the overlay and Skip-intro button otherwise
    (asserting its duration stays within the declared ≤3000 ms ceiling and
    is always skippable); ends and sets the flag on button click, document
    click, and keydown; content beneath is present/queryable throughout
    (never removed while the overlay is showing).
23. `ChapterOrbit.test.tsx` (extended): the new discovery affordance
    appears on hover/focus of a non-active body and introduces no new
    element with a non-negative `tabIndex` or its own `href`; the
    `.orbitCamera` transform class/attribute updates when `activeChapterId`
    changes; if R3F was selected, `ChapterOrbit` correctly reads/writes the
    shared `hoveredChapterId`/`activeChapterId` state from §5.3/§5.4.
24. `observatory-fallback.test.ts` (extended): per item 19.
25. If R3F was selected: a `SpatialScene` test (new) asserting the lazy
    import is not requested when the viewport/motion/WebGL gate fails, a
    component-level test confirming `<Canvas>` renders with
    `aria-hidden="true"`, a test asserting a mesh's `onClick` invokes the
    identical navigation call the corresponding real anchor performs (not
    a separate implementation), and a test asserting mesh
    `onPointerOver`/`onPointerOut` correctly set/clear the shared hover
    state.
26. `ObservatoryShell.test.tsx` (extended): confirms `ObservatoryEntrance`
    and the new atmosphere layer mount without altering any existing
    assertion about `h1`, freshness, owner slot, or chapter content
    rendering.
27. Full existing suite remains green — no existing Phase 10 test
    (`ChapterFocusManager.test.tsx`, `observatory-contrast.test.ts`, every
    `/share`/`/`/`/dashboard` test, every math/fixture test) is weakened,
    skipped, or deleted.

### Build

28. `npm run build` passes. If R3F was selected, its production dependency
    is present in `package.json`/`package-lock.json`; if CSS was selected,
    those packages are absent (confirmed by `git diff --quiet` and direct
    `node_modules` inspection, per §2.5).
29. The R3F chunk (if applicable) is confirmed, via a real network-log
    check against a running production server, to not be requested during
    initial load of `/` or `/share` — only after the client-side gate in
    §5.3 passes.
30. Every §2.3.1 and §2.3.2 budget row passes on the shipped production
    build (not only on the winning spike route) — the mobile-fallback rig
    for §2.3.1, the CPU-2× desktop rig for §2.3.2 including the
    repeated-transition leak check — measured against the pre-§7 baseline
    on each rig's own profile.
31. No route outside `/`, `/share`, `/dev/observatory-shell`, and the two
    new §7 spike routes references or imports any §7 file — `/dashboard`
    and every other route remain byte-identical in their own bundle
    composition.

### Privacy

32. `/dev/phase10-spike-css-world` and `/dev/phase10-spike-r3f-world` (the
    latter only during Phase A, or permanently if kept as a reference route
    per §2.5) gate behind `isValidSession` exactly like every other `/dev/*`
    route, with zero dollar-currency patterns in unauthenticated HTML.
33. `ObservatoryEntrance`, `.atmosphere`/`.orbitCamera`, and `SpatialScene`
    contain no portfolio data of any kind — they are pure presentation
    driven only by `activeChapterId`/`hoveredChapterId`/`mode`, never by
    `chapterContent` or any dollar/holding value; this is verifiable by
    direct source read (none of these files import `DashboardData` or any
    owner-only type).
34. Public/private render isolation is re-verified on the full shipped
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
- `docs/phase10-spike-section-7/DECISION.md` (new — records Step 1 gates,
  Step 2 scores, and Step 3 selection per §2.5)
- `docs/phase10-spike-section-7/measure-phone.mjs` (new, adapted from
  `docs/phase10-spike-section-1/measure-phone-v2.mjs` — §2.3.1
  mobile-fallback confirmation only)
- `docs/phase10-spike-section-7/measure-desktop.mjs` (new — §2.3.2 desktop
  WebGL-scene measurement, CPU 2× throttle, includes the
  repeated-transition leak-check routine)
- `docs/phase10-spike-section-7/raw/*.json` (new — both profiles' raw
  per-run data plus the leak-check cycle data)

Phase B:
- `src/components/observatory/ObservatoryEntrance.tsx` + `.module.css` +
  `.test.tsx` (new)
- `src/components/observatory/ChapterOrbit.tsx` (edit, per §5.2/§5.3's
  shared hover/active state)
- `src/components/observatory/ChapterOrbit.test.tsx` (edit, per item 23)
- `src/components/observatory/observatory.module.css` (edit, per §5.2)
- `src/components/observatory/observatory-fallback.test.ts` (edit, per
  item 19)
- `src/components/observatory/observatory-contrast.test.ts` (edit if any
  new text token is added, per item 20)
- `src/components/observatory/ObservatoryShell.tsx` (edit, per §5.4)
- `src/components/observatory/ObservatoryShell.test.tsx` (edit, per item
  26)
- Only if R3F selected: `src/components/observatory/SpatialScene.tsx` (+
  test), `package.json`/`package-lock.json` (edit)
- `docs/phase10-baseline/section-7/README.md` (new, evidence)
- `docs/phase10-baseline/section-7/filmstrips/` (new — world-entry,
  pointer-exploration, chapter-travel, and settled-state evidence per
  §2.4/§10; short recordings if the environment supports capturing them,
  evenly-spaced screenshot filmstrips otherwise)

## 10. Evidence to capture and commit

- `docs/phase10-spike-section-7/DECISION.md`: full §2.3.1/§2.3.2/§2.4
  tables for both variants, the Step 1/2/3 procedure and arithmetic from
  §2.5, and the named-reaction rows (§2.4 rows 1, 7, 10) recorded verbatim,
  not summarized.
- `docs/phase10-baseline/section-7/README.md`: before/after screenshots per
  items 10 and 15; console warning/error count; a live confirmation of the
  entrance's session-scoped once-only behavior; a live confirmation of item
  29's network-log check (R3F outcome only).
- `docs/phase10-baseline/section-7/filmstrips/`: for both the winning spike
  variant and the shipped production result, capture one of (a) a short
  screen recording (~5-15s) or (b) a screenshot filmstrip of at least six
  evenly spaced frames (every 150-250ms across a 1-2s window), for each of:
  world entry (cold load through entrance completion or skip), pointer
  exploration (parallax/hover discovery over continuous pointer movement),
  one full chapter-travel transition (click to settle), and the settled
  new-chapter state. A single before/after screenshot pair does not satisfy
  this requirement — it cannot show continuous motion, which is exactly
  what rows 4 and 6 of §2.4 require evidence for. If recording tooling is
  unavailable in the environment, say so explicitly and use the filmstrip
  alternative; do not claim a recording was captured when only a screenshot
  pair exists.
- Record this spec's §3 architecture decision's rationale is not duplicated
  in the evidence doc (it lives here and in `DECISION.md`) — the evidence
  doc only needs to link back to both, not restate them.
