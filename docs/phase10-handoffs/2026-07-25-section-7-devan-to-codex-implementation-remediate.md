# Phase 10 §7 handoff: Devan (owner decision) → Codex Implementation, Turn B″

Prepared July 25, 2026 by `claude/fable-5` (Cowork, owner-directed), recording
Devan's explicit decision on the blocked §7 review. This document carries the
owner's authorization verbatim in substance; it is the scope of Turn B″.

## Outcome

Owner decision recorded — §7 unblocks and routes back to Codex for **one**
additional, differently scoped remediation turn. `PHASE10_STATE.json` is
`§7` / `remediate` / `codex_implementation` / `ready` / `next_actor: codex`.

## The decision

Devan selected **Option 2** from
`docs/phase10-handoffs/2026-07-25-section-7-claude-lead-to-devan-blocked.md`:
authorize one second, differently scoped Codex remediation attempt.

Explicitly **not** chosen, and explicitly not to be inferred later in this
turn or the next:

- Option 1 is **not** granted. No §7 performance exception has been accepted.
  Do not record, draft, or assume one.
- Option 3 is **not** granted. Do not switch the primary desktop experience to
  CSS.
- Production wiring is **not** granted. Do not wire the Orrery into `/share`.
  That remains Turn C and does not begin until this remediation is reviewed
  and passes.

The owner-gated `/dev/phase10-portfolio-orrery` remains the only target route.
Production `/share` stays unchanged.

## Why this is not a violation of §R.8's "one bounded optimisation round"

§R.8 and `PRODUCT_DIRECTION.md`'s "Runtime and resilience" section both say
that if one bounded optimisation round cannot bring the route-owned task under
50 ms, the measured result **returns to Devan for an explicit decision**. That
is exactly what happened: the Turn B′ review measured the failure honestly,
routed it to Devan, and stopped. This document is that explicit decision.
Turn B″ therefore proceeds on the owner's authority, not by an agent
reinterpreting the one-round clause.

`docs/phase10-workflow/specs/section-7.md` is **unchanged** by this turn. The
50 ms gate, the §2.3.2 measurement procedure, criterion 41, and §R's normative
text are all untouched. Nothing here weakens a threshold.

## Required scope — two parts, equally required

Both parts must be delivered in the same prototype turn. Part 2 is not
optional, deferrable, or contingent on Part 1's outcome.

### Part 1 — R3F bundle/runtime optimization

The first optimization round changed scene construction but did not address
the ~234 KB R3F/Three.js chunk responsible for the repeatable 59–60 ms
route-owned task. Authorized work:

- Inspect the production chunk's composition and **retain the evidence** in
  the repository (not just a claim in a handoff).
- Identify unused Three.js/R3F modules; avoid broad/namespace imports.
- Investigate whether **narrower imports, better tree-shaking, chunk
  splitting, staged module evaluation, or delayed WebGL initialization** can
  reduce the route-owned task.
- Consider a **minimal direct-Three.js scene implementation instead of R3F**
  only if measured evidence shows that R3F framework overhead is the
  irreducible cause, and only if the existing semantic and fallback contracts
  are unchanged.
- **Preserve the exact 50 ms gate and the existing CPU-2× measurement
  procedure** (`docs/phase10-spike-section-7/measure-desktop.mjs`, 1440×900,
  CPU 2×, real production server, 5 fresh contexts per route). Do not
  baseline-subtract, re-derive, or re-instrument the gate.
- Perform **only this one additional optimization round.**

**Stop condition:** if the route-owned task remains above 50 ms after this
differently scoped attempt, stop and return the measured result to Devan. Do
not silently select CSS. Do not weaken the gate. At that point Devan will
consider a narrowly documented §7-only exception based on the final visual
result and measured user impact — that consideration is the owner's, not an
agent's, and it has not been granted in advance.

### Part 2 — Required visual-quality remediation (closes Finding 2)

The next version must add the visual system already required by §R.10:

- a coherent spatial star field with visible depth;
- atmospheric rim lighting separating planets from the background;
- restrained bloom/glow around the portfolio sun and appropriate telemetry;
- materially richer procedural planet variation;
- depth cues that make planets feel situated in one environment rather than
  flat spheres over a black surface;
- refined orbital paths and shadows/lighting;
- polished retrofuturist CRT/HUD framing **without reducing readability**;
- no generic low-poly or unexplained decorative objects (§R.10, and criterion
  39: no ring, arc, or mark that no object travels and no legend explains).

Every effect must be evaluated **together with** bundle, memory, frame
stability, and long-task measurements. Do not add visual effects blindly if
they break the declared budgets — iterate toward the best *passing*
implementation. Part 2 tightening the numbers Part 1 is trying to improve is
the expected tension; resolve it with measurement, not by dropping either
requirement.

Per §7's non-goals, photorealism, PBR materials, and imported assets remain
explicitly not required.

## Evidence required for the next Claude review

- Fresh screenshots and motion evidence (all eight §R.11 items re-captured
  against the new version — the Turn B′ captures document a superseded build).
- Retained chunk-composition evidence for Part 1.
- Raw long-task measurements from the unchanged CPU-2× procedure, written to a
  distinctly named file so the pre-existing runs stay readable side by side.
- Bundle, memory, frame-stability, and leak-check numbers alongside the visual
  work, per §2.3.2.

If the Codex environment cannot bind localhost or reach a browser backend, the
standing rule in `docs/phase10-workflow/prompts/codex-implementation.md`
applies: attempt the checks, preserve and commit otherwise-complete green work,
document the exact evidence gap plainly, and route to Claude review — Claude
Lead performs the missing live checks before any PASS. Do not claim a
measurement or recording that does not exist.

## Open findings carried into this turn

- **Finding 1** (engineering reliability, §R.8 / criterion 41) — route-owned
  long task 59–60 ms, 5/5 runs, unchanged after round one. Now owner-authorized
  for one further differently scoped attempt (Part 1 above).
- **Finding 2** (visual / product alignment, §R.10 + `PHASE10.md` §7
  storytelling gate) — star field, restrained bloom, and atmospheric rim
  lighting absent from the R3F canvas. Required to close in this same turn
  (Part 2 above).

Everything the Turn B′ review verified as passing
(`docs/phase10-workflow/reviews/section-7-review-2.md`, "What already passes")
must stay passing: criteria 35–40, 42, 43, the §R.9 fallbacks, §R.10a's name
collision resolution, and the privacy gates. Do not regress the semantic layer,
the mobile/reduced-motion/no-3D fallbacks, or the dollar-pattern privacy check
in pursuit of either part above.

## This turn's verification

- **State validator** (`node scripts/phase10-validate-state.mjs`): **pass**,
  exit 0, run against the real repository file after the edits below.
- **`npm test`**: **pass** — 81 files, 446/446. This shell is Linux
  (`linux-arm64`) and the repository's `node_modules` holds darwin-arm64
  binaries, so rather than mutate the owner's `node_modules`, a clean-room
  copy of the working tree (excluding `node_modules`, `.next`, `.git`, and
  `.env*`) was made to sandbox-local disk, `npm ci` run there from the
  unmodified `package-lock.json`, and `three` / `@react-three/fiber` /
  `@types/three` added `--no-save` to mirror the owner machine. The repository
  was never touched by any install.
- **`npm run build`**: **attempted, environment-blocked** — Turbopack failed
  with exactly three errors, all `./src/app/layout.tsx`, all `next/font:
  Failed to fetch <Inter | JetBrains Mono | Instrument Serif> from Google
  Fonts`. That is the pre-existing open §13 network condition already recorded
  for §0 and for §7 Turn B, not a code defect. Zero module-not-found errors
  once the `--no-save` R3F packages were present, and `npx tsc --noEmit` exits
  0 with no output.
- **Why that is not a regression:** `git diff --quiet dc358a6 -- src
  package.json package-lock.json` reports no diff — `src/` and both manifests
  are byte-identical to the tree the Turn B′ review built green on the owner
  machine (Next.js 16.2.11, TypeScript passed, 19 static-page tasks). This turn
  changed four documentation/bookkeeping files and nothing else, so it cannot
  have altered the build result. Recorded plainly rather than claimed as a
  pass.
- **Files changed this turn:** this handoff (new);
  `docs/phase10-workflow/reviews/section-7-review-2.md` (appended "Owner
  decision"); `PHASE10_PROGRESS.md` (appended §7 owner-decision entry);
  `PHASE10_STATE.json`. No `src/`, no dependency, no spec amendment. No `.env*`
  contents were read, printed, copied, edited, staged, or committed.

## Evidence

- Owner decision recorded in: this file;
  `docs/phase10-workflow/reviews/section-7-review-2.md` ("Owner decision");
  `PHASE10_STATE.json` (`section.owner_decision`); `PHASE10_PROGRESS.md`.
- Prior review: `docs/phase10-workflow/reviews/section-7-review-2.md`
- Prior handoff (the blocked one this decides):
  `docs/phase10-handoffs/2026-07-25-section-7-claude-lead-to-devan-blocked.md`
- Reviewed implementation commit:
  `dc358a6237b084e3fd3f1e19f1a74ac185868573`
- Prior actor's commit (this turn's starting point):
  `172f592c3dd89bd1ca6490eff590879b345f2755` —
  `phase10(review §7): blocked — R3F long task unresolved after remediation, routed to Devan`
- Spec (unchanged): `docs/phase10-workflow/specs/section-7.md` §R
- This turn's commit: `phase10(owner §7): authorize bundle and visual remediation`
  (hash not written here — a commit cannot contain its own hash; the next
  actor records it per `docs/PHASE10_AGENT_WORKFLOW.md` §8)

## For the next actor

Codex Implementation, `stage: remediate`. Read this file, then
`docs/phase10-workflow/reviews/section-7-review-2.md`, then
`docs/phase10-workflow/specs/section-7.md` §R (normative, unchanged), then
`PHASE10_STATE.json`. Do not re-run the spike, do not re-apply §2.5, do not
re-decide the runtime — there is no selection to make. Deliver Parts 1 and 2
above, keep `npm test` and `npm run build` green, commit once as
`phase10(§7): <summary>`, and transition `stage` → `review`, `role` →
`claude_lead`, `next_actor` → `claude` as the standing prompt instructs.

If Part 1's stop condition fires (task still above 50 ms), still deliver
Part 2, still commit the green work and its evidence, and record the measured
failure plainly for Devan — `status: blocked`, `next_actor: devan` — rather
than choosing CSS, weakening the gate, or drafting an exception.
