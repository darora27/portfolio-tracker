# Phase 10 §7 Turn B′ review — Portfolio Orrery remediation

Reviewed by: `claude-code/sonnet-5` (Claude Lead, `review` stage, second
pass on this section — the first was Turn B's spike-rejection review).

Reviewed commit: `dc358a6237b084e3fd3f1e19f1a74ac185868573`
(`phase10(§7): remediate R3F and build Portfolio Orrery`), diffed against
`prev_actor_commit` `6926fd3959f67b92528b1d789f68c8953af5d7b2` (Turn B's own
review commit).

Spec: `docs/phase10-workflow/specs/section-7.md` §R (normative), §0's
Turn B′ subsection.

Prior review: `docs/phase10-workflow/reviews/section-7-review.md` (result:
FAIL, no winner — target replaced with the Portfolio Orrery).

Handoff reviewed: `docs/phase10-handoffs/2026-07-25-section-7-codex-implementation-remediate-to-claude-lead.md`.

## Result: BLOCKED — one finding requires Devan's decision per §R.8; one
additional bounded finding for whichever turn resumes implementation

This is not a pass, and it is not routed back to Codex as an ordinary
`remediate` loop. §R.8 and `PRODUCT_DIRECTION.md`'s "Runtime and
resilience" section both specify, in advance, exactly what happens if the
one authorized optimisation round does not bring the R3F long task under
50 ms: **stop and return the measured result to Devan for an explicit
decision.** That is what independent re-measurement shows happened, so
this turn does what the spec anticipated rather than guessing — see
`docs/phase10-handoffs/2026-07-25-section-7-claude-lead-to-devan-blocked.md`
for the decision request.

## Scope of this review

Per §0's Turn B′ subsection, this reviews whether the remediation's outcome
is "one variant passes and is selected" (→ `implement`/Turn C) or requires
further bounded work (→ `remediate`, another Turn B′-equivalent pass) —
plus, per §R.8's explicit escape hatch, a third possibility neither generic
outcome covers: the long-task gate fails after the one authorized
optimisation round, which requires Devan, not Codex or Claude alone, to
decide. The diff was confirmed (`git diff --stat` since `prev_actor_commit`)
to touch only spike/remediation files and the new
`/dev/phase10-portfolio-orrery` route — no production Observatory file
(`ObservatoryShell.tsx`, `ChapterOrbit.tsx`, `/share`) — so this is not Turn
D, and the full §8 criteria set (all 34 items) is not yet in scope; §R's
own criteria 35–43 are.

## Independent verification performed

- `npm test`: reran myself on this machine — 81 files, 446/446 passed.
- `npm run build`: reran myself — Next.js 16.2.11 compiled, TypeScript
  passed, 19 static-page tasks generated, `/dev/phase10-portfolio-orrery`
  present. (The handoff's environment could not complete this; it completes
  cleanly here.)
- Started a real production server (`next start -p 3100`) with a task-only
  `OWNER_PASSWORD` process override (never read from `.env*`); authenticated
  via `/api/auth/login`, matching the standing local-auth pattern from every
  prior section.
- Read every changed source file directly: `src/lib/observatory/orrery.ts`
  and its tests, `src/lib/dashboard-data.ts`'s new
  `publicOrreryHoldings` projection, `OrreryWorld.tsx`, `OrreryScene.tsx`,
  `OrrerySceneLoader.tsx`, `page.tsx`/`page.test.tsx`, and the remediated
  `R3fScene.tsx`/`R3fSceneLoader.tsx`/`R3fWorld.tsx`.
- Re-ran `docs/phase10-spike-section-7/measure-desktop.mjs` (as
  `measure-desktop-turn-bprime.mjs`, output path only difference) against
  the live server: 5 fresh contexts per route, 1440×900, CPU 2×.
- Captured all eight §R.11 visual-evidence items plus two additional
  verification passes (Orrery-route parallax, R3F-spike-route parallax) with
  Playwright, described fully in
  `docs/phase10-baseline/section-7/README.md`'s "Turn B′ review evidence"
  section.

## Finding 1 (blocking — routed to Devan, not Codex) — the R3F long task is
unchanged after the described optimisation round

- **Category:** engineering reliability
- **Criterion:** §R.8 ("If one bounded optimisation round cannot bring it
  under the gate, return the measured result to Devan for an explicit
  decision — do not silently select CSS") and criterion 41 ("The R3F
  route-owned long task is under 50 ms on the §2.3.2 rig, **or** the
  measured failure has been returned to Devan for an explicit decision. It
  is not resolved by changing the threshold.").
- **Evidence:** re-measured `/dev/phase10-spike-r3f-world` five times on the
  identical rig Turn B used (1440×900, CPU 2×, fresh context per run):
  `59, 59, 60, 59, 59` ms, one route-owned long task per run, 5/5 — byte-for-
  byte the same result Turn B recorded before remediation (`59, 60, 60, 59,
  59`). Baseline and CSS are both `0/5` on the identical rig, confirming
  this is still route-owned, not shared bootstrap. Raw:
  `docs/phase10-spike-section-7/raw/desktop-scene-turn-bprime.json`. The
  handoff's described changes (removed `import * as THREE`, reused camera
  vectors, `icosahedronGeometry` detail `1`→`0`, `dpr={1}`, and deferring the
  lazy scene request across two `requestAnimationFrame` boundaries) are real
  and independently confirmed in the diff, but none of them reduce the
  duration of the task once it executes — they only change when the
  now-identically-expensive task is scheduled. This is consistent with the
  cost being dominated by parsing/evaluating the ~234 KB three.js/R3F chunk
  and initializing the WebGL context and shader compilation under CPU 2×
  throttling, which the attempted changes do not touch.
- **What should have happened, per §R.8, and did not:** the spec's
  optimisation clause is conditioned on the result — "if one bounded
  optimisation round cannot bring it under the gate... return the measured
  result to Devan for an explicit decision" — before proceeding further.
  Turn B′ instead treated the optimisation attempt as sufficient on its own
  and went on to build the full Portfolio Orrery on R3F. The Orrery build
  itself is authorized scope (Turn B's Finding 3) and is not being
  unwound — but the runtime it was built on has not cleared its own gate,
  and only Devan can decide what happens next (a precise parallel to the
  §1 precedent: `docs/phase10-handoffs/2026-07-24-section-1-claude-refiner-to-devan-blocked.md`).
- **Required next step:** Devan's explicit decision (options laid out in the
  handoff to Devan). Not a further Codex remediation attempt on this
  specific finding — the one authorized round already ran.

## Finding 2 (bounded, fixable by Codex once Devan's Finding 1 decision is
known) — §R.10's required visual system is largely absent from the R3F
canvas

- **Category:** visual / product alignment
- **Criterion:** §R.10 ("Procedurally varied planet materials, an emissive
  sun, atmospheric rim lighting, depth, restrained bloom, and a coherent
  star field — replacing the generic low-poly placeholder spheres that
  failed review") and the storytelling gate (`PHASE10.md` §7 Section gate 2:
  "a technically clean but non-immersive result fails §7... the technically
  cleaner variant is never promoted by default").
- **Evidence:** direct source read of
  `src/app/dev/phase10-portfolio-orrery/OrreryScene.tsx` — zero occurrences
  of `star`, `bloom`, or `rim` (case-insensitive grep). The only lighting is
  one ambient light, one directional light, and one point light at the sun;
  the only glow treatment is a single enlarged (`scale={1.16}`),
  low-opacity (`0.12`) transparent sphere around the sun. Confirmed live in
  `docs/phase10-baseline/section-7/screenshots/orrery-turn-bprime/01-initial-solar-system-entry.png`:
  the canvas background is flat dark fog with no star field, and the
  planets show only a basic specular highlight with no rim/edge glow. The
  DOM `.starField`/`.scanlines` layers exist in `orrery.module.css`, but
  `.starField` sits at `z-index: -3`, entirely behind the opaque canvas
  (`z-index: 1`) whenever R3F is enabled (desktop, no reduced motion, no
  forced fallback) — i.e. on precisely the "visually dominant desktop
  approach" (§R.9) the star field is supposed to be part of. Per-planet
  material variation (color/metalness/roughness by index) is present and
  functioning, and the emissive sun is present and functioning — those two
  named elements of §R.10's list are genuinely satisfied. Note per §7 §7
  non-goals: photorealistic/PBR materials and imported assets are
  explicitly *not* required, and flat/gradient primitive geometry is
  explicitly sufficient *if* it satisfies the storytelling rubric — this
  finding is not asking for photorealism, it is that three of §R.10's six
  explicitly named elements (star field, bloom, rim lighting) are absent
  rather than restrained.
- **Why this matters given what failed before:** Turn B's Finding 1 (the
  reason both original prototypes were rejected) was specifically that
  "R3F reads as low-quality generic spheres. The moving bodies do not have
  an understandable portfolio purpose." The *portfolio purpose* half of
  that defect is now clearly fixed — every planet is legended, labelled,
  inspectable, and tied to real weight/return data, which is the
  correction §R and this review's other checks confirm works well. But the
  *generic spheres* half of the original complaint is still visually
  present in the canvas itself: solid-color spheres with a highlight, on a
  starless dark background, is materially close to what was already
  rejected once on visual grounds. §R.10 names three specific techniques
  (star field, bloom, rim lighting) precisely to prevent that look from
  recurring, and none of the three render.
- **Required change:** add a coherent star field, restrained bloom, and
  atmospheric rim lighting to the R3F canvas itself (not only the DOM
  layer, which is invisible whenever the canvas is active) — via any
  reasonable technique (a `Points`/particle field for stars, an emissive
  Fresnel-style rim shader or `meshStandardMaterial` emissive edge
  treatment per planet, and either bloom post-processing or a better
  manual glow approximation than the current single low-opacity halo
  sphere). This does not require photorealism or imported assets, matching
  §7 non-goals.

## What already passes (verified independently, not merely accepted from
the handoff)

- **Criterion 35 (sun):** activatable by click and (confirmed via focus
  management code and live `Tab`/`Enter` equivalent — `router.push`-based
  navigation) keyboard; opens the portfolio-level summary
  (`?focus=portfolio`) with composition/return/market-relative/top-two
  content; zero `$[0-9,]+\.[0-9]{2}` matches anywhere on the sun-selected
  page, authenticated or not.
- **Criterion 36 (planet set):** `publicOrreryHoldings` is derived from the
  same `positions` the rest of `/share`/`/dashboard` already use; grep
  confirms no `shares`/`costBasis`/`totalCost`/`totalValue` reference
  anywhere under `src/app/dev/phase10-portfolio-orrery/` or
  `src/lib/observatory/orrery.ts`.
- **Criterion 37 (encodings):** `radiusForWeight`, `directionForWeeklyReturn`,
  `angularSpeedForWeeklyReturn` are pure, deterministic, and unit-tested
  against both clamp boundaries, the flat/unavailable case (explicit
  epsilon), and monotonicity across five magnitudes — read and independently
  re-run (`npm test`), not merely trusted from the handoff.
- **Criterion 38 (legend + text):** the on-screen legend explains radius,
  clockwise/counterclockwise/neutral, and speed; every holding's weight,
  weekly return, direction, and (in the inspector) volatility/beta exist as
  text in the semantic layer independent of the canvas.
- **Criterion 39 (no unexplained marks):** the one ring per planet is drawn
  at the same `orbitRadius` its `orbitRef` group rotates around, inside the
  same tilted parent group — it is the real path, not a decorative mark;
  visually confirmed idle.
- **Criterion 40 (interaction/inspector):** hover and focus set `stabilized`
  (verified in `OrreryScene.tsx`'s `Planet` component, which snaps
  `orbit.rotation.z` back toward `initialAngle` when stabilized); selection
  opens an inspector with all six-plus required fields; `?holding=ASML` and
  `?focus=portfolio` are URL-restorable and independently verified with
  live `goBack()`/`goForward()`.
- **Criterion 42 (parallax):** live computed-style verification on both the
  Orrery route and `/dev/phase10-spike-r3f-world` shows at least two layers
  offsetting by different, non-zero magnitudes at multiple pointer
  positions — see README. This closes the "entirely missing pointer
  parallax" half of Turn B's Finding 2.
- **§R.9 fallbacks:** reduced motion, forced `?no3d=1`, and mobile (390px
  and 320px) all measured `canvas` count `0`; zero horizontal overflow at
  either mobile width; zero links under 44px tall at 320px; the mobile
  layout is a genuinely reflowed list (legend → sun → holdings → inspector
  placeholder), not a cropped desktop scene.
- **§R.10a (name collision):** the new component is named `OrreryScene`;
  `src/components/surface/PortfolioOrrery.tsx` is untouched (confirmed:
  absent from the diff's file list).
- **Privacy:** unauthenticated request to
  `/dev/phase10-portfolio-orrery` renders the sign-in form and never calls
  `getDashboardData` (confirmed by `page.test.tsx` and by source); zero
  console errors across every captured route/viewport/mode this turn.
- **Criterion 43 (R.11 evidence):** all eight items are now committed under
  `docs/phase10-baseline/section-7/` (see README) — this was the one item
  the handoff explicitly could not do itself and asked Claude Lead to
  complete; it is now closed regardless of Finding 1's outcome.

## What this means for `PHASE10_STATE.json`

`status` → `blocked`, `next_actor` → `devan`, `stage`/`role` stay `review`/
`claude_lead` (the validator does not require a stage change for `blocked`).
`section.findings` records both findings above. This is not a normal
`review`-stage fail-to-`remediate` transition, because Finding 1 is not
something Codex can resolve by trying again — the one authorized round
already ran and the result is unchanged. Finding 2 remains open and should
be folded into whatever remediation round follows Devan's Finding 1
decision, so it is recorded now rather than surfaced piecemeal later.

## Repository hygiene

New retained evidence/tooling this turn: `docs/phase10-spike-section-7/capture-orrery-evidence.mjs`,
`docs/phase10-spike-section-7/verify-r3f-parallax.mjs`,
`docs/phase10-spike-section-7/measure-desktop-turn-bprime.mjs`, and their
outputs under `docs/phase10-baseline/section-7/` and
`docs/phase10-spike-section-7/raw/desktop-scene-turn-bprime.json`. Turn B's
original evidence (`raw/desktop-scene.json`,
`screenshots/{css,r3f}-world-idle.png`, etc.) is untouched — the new
measurement was written to a distinctly named file rather than overwritten,
so both the pre- and post-remediation long-task evidence remain readable
side by side. A stale `next-server` process from an earlier session (started
08:35, unrelated to this turn, serving a build that 404'd on the new route)
was found listening on port 3100 during preflight and stopped before this
turn's own server was started; no repository state was affected.

No production application code changed this turn (`src/` is untouched by
this review; only `docs/` evidence/tooling was added) — the same "review-only,
no implementation-source change" pattern as Turn B's own review commit.
