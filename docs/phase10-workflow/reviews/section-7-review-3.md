# Phase 10 §7 Turn B″ review — Portfolio Orrery bundle/runtime and visual remediation

Reviewed by: `claude-code/sonnet-5` (Claude Lead, `review` stage, third pass on
this section).

Reviewed commit: `5f89a9bbdb7e7fbded6432af9c0adac136c8bda4`
(`phase10(§7): remediate runtime chunk and Orrery visual system`), diffed
against `prev_actor_commit` `3afb4ea8c870fb972ff3a8fd40d90eafdf355720`
(`phase10(owner §7): authorize bundle and visual remediation`).

Spec: `docs/phase10-workflow/specs/section-7.md` §R (normative), §0's Turn B′
subsection (this pass is the Turn B″ review the owner decision in
`section-7-review-2.md` authorized).

Prior review: `docs/phase10-workflow/reviews/section-7-review-2.md` (result:
BLOCKED — Finding 1 routed to Devan, Finding 2 bounded).

Owner decision: recorded in `section-7-review-2.md`'s "Owner decision" section
and `docs/phase10-handoffs/2026-07-25-section-7-devan-to-codex-implementation-remediate.md`
— authorized one further remediation turn (Turn B″) addressing both findings.

Handoff reviewed:
`docs/phase10-handoffs/2026-07-26-section-7-codex-implementation-remediate-to-claude-lead.md`.

## Result: PASS — both findings resolved; route to Turn C

Turn B″'s implementation genuinely resolves both findings from the prior
review. The Codex environment could not run a live browser (`listen EPERM:
operation not permitted 0.0.0.0:3100`), so per the standing environment-only
browser-evidence rule, every live check below was performed independently on
this machine, not accepted from the handoff's claims.

## Scope of this review

Per §0's Turn B′ subsection (this is a second iteration of that same
remediate/review loop before Turn C), this review verifies whether Finding 1
(the R3F route-owned long task) and Finding 2 (the missing §R.10 visual
system) are resolved, and re-confirms every item `section-7-review-2.md`'s
"What already passes" section previously verified is still true. The diff
(`git diff --stat` since `prev_actor_commit`) touches only
`docs/phase10-spike-section-7/**`, `docs/phase10-baseline/section-7/**`, and
the two dev routes (`src/app/dev/phase10-portfolio-orrery/**`,
`src/app/dev/phase10-spike-r3f-world/**`) — no production Observatory file
(`ObservatoryShell.tsx`, `ChapterOrbit.tsx`, `/share`) — so this is not Turn D
and the full §8 criteria set is not yet in scope; §R's criteria 35–43 are.

## Independent verification performed

- `npm test`: reran myself — 81 files, 448/448 passed.
- `npm run build`: reran myself — Next.js 16.2.11 compiled, TypeScript
  passed, 19 static-page tasks generated.
- Started a real production server (`next start -p 3100`) with a task-only
  `OWNER_PASSWORD` process override (never read from `.env*`), stopped
  cleanly at the end of this review.
- Independently inspected `.next/static/chunks/*.js` after my own build: no
  chunk contains `react-three-fiber` or `@react-three` signatures; the one
  `extend(` match in `3hdj40qmts5sf.js` is `Selection.extend()` (a DOM API),
  not `extend(THREE)`. The shared heavy chunk (`3c2h0fp_tgndt.js`) gzips to
  133,633 bytes on this machine — matching the retained claim of 134,184
  bytes closely enough to confirm the same build, not a discrepancy.
- Reran the unchanged `measure-desktop.mjs` (§2.3.2, 1440×900, CPU 2×, 5
  fresh contexts) as `raw/desktop-scene-turn-bdoubleprime.json`.
- Reran the unchanged `measure-phone.mjs` (§2.3.1, Moto G4, CPU 4×, Slow 4G,
  5 fresh contexts) as `raw/mobile-fallback-turn-bdoubleprime.json`.
- Captured all eight fresh §R.11 evidence items via
  `capture-orrery-evidence.mjs` (tag `turn-bdoubleprime`) and visually
  inspected every screenshot and filmstrip frame directly.
- Reran `verify-r3f-parallax.mjs` against the live server.
- Wrote and ran four small, retained verification scripts for checks the
  existing tooling didn't already cover: console/page-error sweep across
  desktop/mobile/reduced-motion/forced-r3f-spike
  (`console-check-turn-bdoubleprime.mjs`), mobile canvas/overflow/target-size
  sweep at 390px and 320px (`mobile-check-turn-bdoubleprime.mjs`), canvas
  presence under `?no3d=1`/reduced-motion/normal
  (`fallback-check-turn-bdoubleprime.mjs`), and inspector URL-restorability
  plus dollar-pattern checks on the sun/holding views
  (`inspector-check-turn-bdoubleprime.mjs`,
  `inspector-debug-turn-bdoubleprime.mjs`).
- Read the changed source directly: `OrreryScene.tsx` (full shader and
  disposal code), `orrery.module.css` (new CRT/HUD framing, star-field
  layer, canvas alpha/clear-color), `OrreryScene.source.test.ts`,
  `R3fScene.tsx`'s new `pointermove` listener.
- `git diff --quiet package.json package-lock.json`: clean, confirmed no
  dependency-manifest change.
- `git diff --stat` on `src/components/surface/PortfolioOrrery.tsx`: empty,
  confirming the §R.10a name-collision file remains untouched.

## Finding 1 — RESOLVED: the R3F route-owned long task is now 0/5

- **Prior evidence:** `59, 59, 60, 59, 59` ms, 5/5 runs, byte-for-byte
  unchanged from before Turn B′'s first optimisation attempt.
- **This turn's independent re-measurement**, identical rig (1440×900, CPU
  2×, fresh context per run), fresh output at
  `docs/phase10-spike-section-7/raw/desktop-scene-turn-bdoubleprime.json`:

  | Route | Long tasks (5 runs) | Over 50 ms |
  |---|---|---|
  | baseline | `[]`×5 | 0/5 |
  | CSS | `[]`×5 | 0/5 |
  | R3F (`phase10-spike-r3f-world`) | `[]`×5 | **0/5** |

- **Why:** Turn B″ replaced the `@react-three/fiber` reconciler path (whose
  entry module imports `* as THREE` and calls `extend(THREE)`, registering
  the entire Three namespace and defeating tree-shaking) with a bounded
  direct-Three implementation using named imports, shared geometry, one
  raycaster, and one render loop, in both `OrreryScene.tsx` and
  `R3fScene.tsx`. This shrank the shared heavy chunk 42.37% gzip
  (232,821 → 134,184 bytes, independently reconfirmed at 133,633 bytes on
  this build) and removed the parsing/compilation cost that was producing
  the task — not merely rescheduled it, which is what Turn B′'s first
  attempt had done.
- Every other §2.3.2 row on the same fresh run passes: added initial JS
  ~760 B (≤ 51,200 B budget), R3F lazy chunk ~136.8 KB transferred (≤
  266,240 B budget, 0 B of the initial bundle), load ~625–646 ms (≤ 3000 ms),
  0 idle dropped frames, 100% of transition frames ≤ 33.4 ms (≥ 90%
  required), added heap ~2.2–3.3 MB (≤ 40 MB), and the 20-transition leak
  check plateaus (largest cycle-1→cycle-4 growth ≈ 0.23 MB, well under the
  10 MB ceiling; two runs even showed net negative growth).
- **Known, unchanged measurement artifact (not a new finding):** the
  interaction-latency row (~970–1018 ms across all three routes, including
  baseline) still exceeds its 900 ms threshold on every route, exactly the
  invalid-as-instrumented fixed-wait artifact Turn B already identified and
  excluded from scoring (the untouched baseline fails it identically). Not
  re-litigated here; carried forward unchanged.
- **Criterion 41 is satisfied** by the first clause directly (under 50 ms on
  the rig) — the owner-directed stop condition does not apply and no
  exception, threshold change, or Devan escalation is needed.

## Finding 2 — RESOLVED: §R.10's visual system is present in the R3F canvas

- **Prior evidence:** zero `star`/`bloom`/`rim` matches in `OrreryScene.tsx`;
  a single low-opacity halo sphere as the only glow; the DOM `.starField`
  layer invisible behind the opaque canvas.
- **This turn's independent source read** of `OrreryScene.tsx` confirms all
  three previously-missing elements are now genuinely implemented, not
  merely named:
  - **Star field:** `createStarField()` builds a real `Points`/
    `BufferGeometry` field with per-point phosphor/amber/white coloring,
    rendered inside the canvas and subtly parallaxed with pointer/time.
  - **Rim lighting:** both the planet and sun fragment shaders compute a
    Fresnel-style rim term (`pow(1.0 - dot(normal, viewDirection), n)`) and
    blend an accent color at grazing angles — a real, non-decorative
    lighting technique, not a static edge outline.
  - **Restrained bloom/glow:** `glowInner`/`glowOuter`, two
    `AdditiveBlending` meshes scaled and pulsed around the sun, plus the sun
    shader's own plasma/rim terms.
  - **Procedural planet variation:** the planet fragment shader computes a
    seeded band/cell pattern per-planet (`uSeed`-driven), so each planet's
    surface pattern is genuinely distinct, not a shared texture.
  - The renderer now uses `alpha: true` / `setClearColor(..., 0)`, so the
    canvas is transparent and the DOM `.starField` CSS gradient composes
    with the in-canvas particle field instead of being occluded by an
    opaque canvas — this also resolves the prior "invisible DOM layer"
    defect structurally, not just by duplicating stars in-canvas.
  - `OrreryScene.source.test.ts` gained a dedicated test
    (`"builds the required star, rim, glow, and procedural-material
    system"`) asserting `createStarField`, the shader rim/pattern terms,
    `AdditiveBlending`, and `glowOuter` are present in source, plus a
    disposal test covering every new GPU resource.
- **Live visual confirmation:** inspected all eight fresh §R.11 screenshots
  and both filmstrips directly (not summarized from the handoff). The idle
  first viewport shows a visible star field, procedurally distinct
  wave-pattern planets, a plasma-textured sun with a soft multi-layer glow,
  and edge-lit rim highlighting on planets against the dark environment —
  materially different from the flat solid-color spheres on a starless
  background that failed the prior review. The idle-orbit filmstrip
  (`frame-00.png` → `frame-07.png`) shows several planets having visibly
  moved in different rotational senses between frames, confirming
  simultaneous clockwise/counterclockwise motion (§R.11 item 3) is real, not
  a static composite.
- No post-processing library, imported texture/model, or physics engine was
  added (confirmed by `OrreryScene.source.test.ts`'s existing
  `not.toMatch(/postprocessing|physics|textureLoader|useLoader/i)`
  assertion and by direct source read) — the visual system is achieved with
  shaders and primitive geometry only, consistent with §7's non-goals.

## What already passes — re-verified independently this turn, not merely carried forward

- **Criterion 35 (sun):** zero `$[0-9,]+\.[0-9]{2}` matches on both the
  logged-out page and the authenticated `?focus=portfolio` view (checked
  live this turn).
- **Criterion 36 (planet set):** unchanged since Turn B′; `publicOrreryHoldings`
  source unchanged by this diff (only `OrreryScene.tsx`/`.css`/test files
  and the R3F spike changed).
- **Criterion 37 (encodings):** unchanged; `npm test` reconfirms the
  existing fixture tests pass.
- **Criterion 38 (legend + text):** reconfirmed live via screenshots — the
  "ORBIT ENCODING" legend and every holding's weight/return/direction/ω are
  visible as text independent of the canvas.
- **Criterion 39 (no unexplained marks):** the orbit rings are still drawn
  at each planet's own `orbitRadius` (unchanged code path); visually
  confirmed idle.
- **Criterion 40 (interaction/inspector):** live-verified this turn —
  `?holding=ASML` renders the full inspector text (ticker, company name,
  portfolio weight +28.8%, trailing week +0.5%, vs. portfolio, annualized
  volatility, beta vs. VOO, orbit state, and an `/stock/ASML` deep link);
  `goBack()`/`goForward()` correctly restore `?holding=ASML` and
  `?focus=portfolio` respectively.
- **Criterion 42 (parallax):** reran `verify-r3f-parallax.mjs` live —
  `.atmosphere` and the canvas stage offset by different magnitudes
  (roughly 2×) at two distinct pointer positions.
- **§R.9 fallbacks:** live-verified this turn, not assumed — `canvas` count
  is `0` under `?no3d=1` and under `prefers-reduced-motion: reduce`, and `1`
  under normal desktop conditions; `390px`/`320px` both show `0` canvases,
  zero horizontal overflow (`scrollWidth === clientWidth`), and zero
  interactive targets under 44×44 CSS px.
- **§R.10a (name collision):** `src/components/surface/PortfolioOrrery.tsx`
  is absent from this turn's diff (`git diff --stat` confirms zero changes).
- **Privacy:** the unauthenticated `/dev/phase10-portfolio-orrery` request
  returns the sign-in form only (title and "Sign in"/password field), no
  holding or dollar data, confirmed by direct HTML inspection this turn.
- **Console cleanliness:** zero console/page errors across five
  route/viewport/mode combinations checked this turn (desktop normal,
  desktop reduced-motion emulation, 390px, 320px, and the R3F spike route).
- **Criterion 43 (R.11 evidence):** all eight items recaptured fresh this
  turn under the `turn-bdoubleprime` tag and inspected directly (not
  accepted from the handoff, which could not produce them).

## Repository hygiene

New retained evidence/tooling this turn, all under `docs/phase10-spike-section-7/`:
`console-check-turn-bdoubleprime.mjs`, `mobile-check-turn-bdoubleprime.mjs`,
`fallback-check-turn-bdoubleprime.mjs`, `inspector-check-turn-bdoubleprime.mjs`,
`inspector-debug-turn-bdoubleprime.mjs`, and their raw outputs
(`raw/desktop-scene-turn-bdoubleprime.json`,
`raw/mobile-fallback-turn-bdoubleprime.json`). All prior turns' evidence
(`raw/desktop-scene-turn-bprime.json`, the Turn B′ screenshots/filmstrips,
etc.) is untouched — every new file uses the `turn-bdoubleprime` tag so all
three rounds of long-task evidence remain readable side by side. No stale
server process was found on port 3100 before this turn's own server started;
the server was stopped cleanly at the end of this review.

No production application code changed this turn (`src/` is untouched by
this review — only `docs/` evidence/tooling was added), the same
"review-only, no implementation-source change" pattern as every prior
review-stage commit in this section.

## What this means for `PHASE10_STATE.json`

Both findings are resolved. Per §0's Turn B′ subsection, "one variant passes
and is selected" does **not** mean `stage` → `accept` here — no production
Observatory file (`ObservatoryShell.tsx`, `ChapterOrbit.tsx`, `/share`) has
been touched yet, so accepting now would incorrectly mark §7 complete.
Instead: `stage` → `implement`, `role` → `codex_implementation`,
`next_actor` → `codex`. The selected/authorized runtime is **R3F** (per the
owner's direct authorization in `PHASE10.md` §7's amendment terms and
`section-7-review-2.md`'s owner decision, not a fresh §2.5 scoring pass,
since §R replaced the original CSS-vs-R3F Phase A/B target). Turn C's scope
is wiring the now-passing `/dev/phase10-portfolio-orrery` implementation into
production `/share` per §R and the base document's §5 mounting instructions,
adapted to the Orrery (not the original five-chapter `SpatialScene`).
`section.findings` are marked resolved; `section.owner_decision.stop_condition`
no longer applies (the route-owned task is under 50 ms, so the escape hatch
was never triggered).
