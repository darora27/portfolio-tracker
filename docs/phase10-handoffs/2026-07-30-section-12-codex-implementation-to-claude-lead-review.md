# Phase 10 §12 handoff: Codex Implementation → Claude Lead (review)

Prepared July 30, 2026 by `claude-code/sonnet-5` (running the `codex_implementation` role under `single_provider_mode`, per `PHASE10_STATE.json`).

## Outcome

implementation ready for review

## What this turn did

Preflight in order: no `STOP`; `PHASE10_LOCK` present with `owner=codex`; clean tree; read `AGENTS.md`, `workflow.json`, `PHASE10_STATE.json`, `ACTIVE_CONTEXT.md`, the §12 spec, design proof, and handoff; `npm run phase10:validate` clean; confirmed `role=codex_implementation`, `stage=implement`, `status=ready`, `next_actor=codex`; recorded `prev_actor_commit` `6a9eeb64e0f2e41d0a8a5504927c4f3f6d5acf6f`.

Implemented all eleven §12a ledger rows in spec order (Phase A → B → C), then the BLD-04 re-measurement:

- **FB-19** (`SystemsManual`/`.inspector` overlap): raised `.inspector`'s approach-camera `top` from 5.75rem to 10rem, clearing `.manualButton`'s bounding box with margin at every `--panel-width`.
- **FB-20** (orphaned overview labels): added a `bodyVisible` flag (depth range + viewport-frame test on the body's own projection, not the label's offset position) to `scene-model.ts`'s `layoutOverviewLabels` and its `OrreryScene.tsx` caller; a label is now culled with its body rather than clamped to the frame edge.
- **FB-05** (type-ramp roles): added `MISSION_CONTROL_TEXT_ROLES` (role→token map) to `mission-control-layout.ts`; remapped the wrong-token CSS selectors (`.plotChassis > header`, `.bayQuestion`, `.briefingPaper`, `.radarDetailCard`, `.radarManifest > li > button`, `.manifestHeader`, `.holdingsTable thead th`) to their correct role token; new rendered test `mission-control-text-roles.test.tsx` (not source-parse-only, per the spec's explicit anti-regression requirement).
- **FB-01** (spacing/pull-back): `ORRERY_MIN_RADIUS`/`MAX_RADIUS` → 0.62/1.35, gap formula → `1.75×(rᵢ+rᵢ₊₁)+0.55`, `OVERVIEW_BELT_SPAN_PCT` → 0.80 (`orrery.ts`, `scene-model.ts`); corrected the stale-constant test debt in `orrery.test.ts` and `scene-model.test.ts` the spec named explicitly.
- **FB-17** (panel-width variants): `--panel-width` moved to inherit from `.world` (was redeclared on `.inspector`, shadowing ancestor overrides); added a capture-only `?panelWidth=` override in `OrreryWorld.tsx`. Default behavior (no param) is unchanged.
- **FB-08+FB-15** (tab-strip variants): added a capture-only `?stripVariant=a|b|c` override threaded into `MissionControl.tsx`; built all three (no-tabs-folded-chips, boxless black rail, vertical index edge) as real, keyboard-operable markup. Default (no param) is byte-identical to before.
- **FB-09** (exit receipt + regrouped terminal): the semantic fallback nav is now four `<details>` groups (BODIES/INSTRUMENTS/BELT/ENCODING, accordion — at most one open); a programmatic return from Mission Control/approach shows a 4-line/17-word receipt instead of springing the terminal open, fading after 4s (persists until interaction under reduced motion). Added a CSS override so the sub-1024px fallback renders byte-identical to before (MOB-01).
- **FB-12** (DraftRig): motion now defaults off unconditionally (media query only ever forces it off, never on) and the switch is disabled while reduced motion matches; dish-lap speed rescaled 9–28s → 30–90s (same formula family, same 10%-weekly-return saturation point); DRAFT latch added to the strip nav (owner-only, same gate as the footer's) plus a session-scoped first-open coach line.
- **FB-11** (correlation sentence): `mostCorrelatedPair` now compares by `|r|` rather than raw `r` (the spec's "top |r| pair" requirement — a strong negative correlation is a real, decision-relevant relationship); added `correlationPairSentence` (banded template, ≤14 words) and wired it into `MissionControlRoomContent.tsx` beneath the existing paragraph.
- **FB-21** (Mission Control width): `.missionDescent` → `min(1400px, 96vw)`; `.missionDescentSection` padding → `clamp(1rem, 1.3vw, 1.6rem)` (resolves back to the old 1rem at mobile widths — no regression there).
- **BLD-04**: re-ran the unmodified `docs/phase10-baseline/section-11/scripts/measure-long-tasks.mjs` against this candidate's production build — **0ms max across all 5 fresh 1440×900 CPU-2×contexts, PASS**. Not carried again.

Added regression coverage for **MOB-01** (mobile fallback unaffected) and **PRV-01** (no new public route/field/dollar figure) — both pass.

Evidence capture: this sandbox launches Chromium directly (confirmed per `AGENTS.md`); ran a purpose-built script (`docs/phase10-baseline/section-12/scripts/capture-section-12.mjs`) against a real production build/server on the public `/share` route, producing every required screenshot and raw geometry/measurement JSON named in the acceptance ledger, except **VIS-08** (DraftRig — see below).

`npm test`: 112 files, 582 passed, 1 skipped (intentional). `npm run build`: exit 0, 18 routes unchanged. `tsc --noEmit`: clean throughout.

## Evidence

- Candidate commit: not yet made — will be this turn's own commit; recorded in the commit message, not in this ledger (a commit cannot contain its own hash). Reviewer: fill `candidate_sha` in `docs/phase10-workflow/acceptance/section-12.json` and `section.implementation_commit` in `PHASE10_STATE.json` from `git log -1`.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-12.json` — all 19 criteria have `implementer.status` filled; 18 `pass`, 1 (`VIS-08`) `deferred_to_reviewer`. Validated: `node scripts/phase10-acceptance.mjs check docs/phase10-workflow/acceptance/section-12.json --require implementer` → valid.
- Tests: `npm test` — 112 files, 582 passed, 1 skipped, this turn's own implementation run. Raw: `docs/phase10-baseline/section-12/raw-npm-test.txt`.
- Build: `npm run build` — exit 0, 18 routes. Raw: `docs/phase10-baseline/section-12/raw-npm-build.txt`.
- Screenshots: all under `docs/phase10-baseline/section-12/` (flat, matching each criterion's `required_artifacts` path exactly) — `systems-manual-1440x900.png`, `label-culling-1440x900.png`, `overview-1440x900.png`, `panel-width-{600,660,720}.png`, `tab-strip-{a,b,c}.png`, `exit-receipt-1440x900.png`, `exit-terminal-grouped-1440x900.png`, `mission-control-1440x900.png`, `mission-control-before-1120-1440x900.png`, `correlation-1440x900.png`, `fallback-390x844.png`.
- Spec / design proof: `docs/phase10-workflow/specs/section-12.md`, `docs/phase10-workflow/design-proofs/section-12.md` (unchanged this turn).
- Inherited red: none. `main` was green at section start and remains green.

## For the next actor

Claude Lead, `stage: review`, `current_section: §12`. Independently re-verify `npm test`/`npm run build` against this turn's commit before filling any `reviewer` ledger results (per `G-VERIFY`).

- **VIS-08 is the one gap**: DraftRig lives on the owner-gated `/` route (`mode === "private"`), reachable only with an authenticated session (`POST /api/auth/login` with the real `OWNER_PASSWORD`). This agent has no such credential and must not read `.env*` to find one (`G-SECRETS`). All 3 of FB-12's *behavioral* fixes are verified structurally (`BHV-02`, 8/8 rendered unit tests against the real component) — only the **visual capture** of the rendered result is missing. If you (Claude Lead) also cannot authenticate, this is a genuine `needs-capture` item for Devan: `npm run build && npm run start`, sign in at `/`, open a portfolio with exactly 8 holdings, click `DRAFT · 🚀`, screenshot at 1440×900. Do not accept the section with VIS-08 still `deferred_to_reviewer` — either capture it or route to `needs-capture`/`devan` per `AGENTS.md`'s camera protocol.
- **BLD-04 caveat**: this turn's PASS is a single invocation (one batch of 5 contexts). §11's history recorded intermittent single-batch breaches (57–64ms) against ~77 clean runs elsewhere in that section's life. Consider re-running `docs/phase10-baseline/section-11/scripts/measure-long-tasks.mjs` once more independently before treating BLD-04 as durably closed, given its carry history.
- **FB-11 changed `mostCorrelatedPair`'s tie-break semantics** (now compares `|r|`, not raw `r`) — re-check this against the existing `StructureChapter.tsx` consumer (unrelated route, §7-era) if you want extra confidence nothing there regressed; the existing test suite for it still passes unchanged (all-positive fixture, so the behavior change was untriggered there).
- **Variant C's fixed vertical index** (`.missionIndexEdge`, FB-08+FB-15) visually sits close to the sticky "MISSION CONTROL" title bar at 1440×900 — noted honestly in the ledger as a rough edge in a parked, no-ranking experimental variant, not a build defect. All of VIS-06's actual machine-checked invariants (0 console errors, all 7 destinations + EARNINGS reachable) pass for all three variants.
- Phase D (assemble `REVIEW_SITTING.md` and the contact sheet, route to `stage: owner-sitting`) is your job per the spec §7, not this turn's.

## Route after this handoff

- Section: `§12`
- Stage: `review`
- Role: `claude_lead`
- Status: `ready`
- Next actor: `claude`
