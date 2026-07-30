# Phase 10 §13 handoff: codex implementation (remediate) → Claude Lead, re-review

Prepared July 30, 2026 by `claude-code/sonnet-5` (running as `codex_implementation`
per `PHASE10_SWAP_ROLES` / `single_provider_mode`).

## Outcome

Remediation complete, ready for re-review.

- F1 / `VIS-10` is fixed and verified via live computed style. — done by
  `claude-code/sonnet-5`
- F2 / `TST-03`, `VIS-04` is re-investigated per-ticker as required — genuinely
  new evidence for ASML and COST, not a restatement of the three-ticker clamp
  theory — and remains `deferred_to_reviewer`, flagged back to the owner rather
  than resolved unilaterally. — done by `claude-code/sonnet-5`

## What this turn did

Preflight in order: no `STOP`; `PHASE10_LOCK` present with `owner=codex`; clean
tree; read `AGENTS.md`, `workflow.json`, `PHASE10_STATE.json`,
`ACTIVE_CONTEXT.md`, the §13 spec, and the review handoff; `npm run
phase10:validate` clean; confirmed `role=codex_implementation`,
`stage=remediate`, `status=ready`, `next_actor=codex`; recorded
`prev_actor_commit` `60fd38095cf5c7664f81f2bf25344c9d7947eea4`.

**F1 (`VIS-10`):** the active-tab rule `.missionControl nav
a[aria-current="page"]` (`orrery.module.css`) tied in cascade specificity
`(0,2,2)` with the unconditional `.missionControl .missionStrip nav a` rule
declared later in the file, which won for `border-bottom-*`. Fixed by
re-scoping the active-tab selector to `.missionControl .missionStrip nav
a[aria-current="page"]`, raising its specificity to `(0,3,2)`. Also fixed a
pre-existing selector bug in this section's own `capture-section-13.mjs`
evidence script — it queried the page's first unscoped `nav a`, which landed
on a different `<nav>` entirely (not Mission Control's tab strip), reproducing
the same wrong values the prior implementation turn had already recorded.
Corrected to `[class*="missionControl"] nav a`, matching the reviewer's own
script. Verified via live computed style on the actual rendered
`[aria-current="page"]` anchor (built + started a fresh production server,
launched Chromium directly per `AGENTS.md`'s confirmed capability): active tab
now `2px solid rgb(255,240,207)` (cream), inactive tabs `1px solid
rgba(213,186,140,0.28)` — `activeDiffersFromInactive: true`. Fresh capture
shows a visibly distinct box outline on the active `ORBITS` tab only.

**F2 (`TST-03`/`VIS-04`):** re-investigated ASML and COST specifically, per
the finding's explicit instruction not to reapply the three-ticker
clamp-collision explanation to them. A fresh, full, independent 150-second
re-run of the unmodified sampler reproduces the same 3/8 pass, 5/8 fail split
(GOOG 7.395, IBM 6.674, CRM 7.079 pass; ASML 8.993, COST 9.749, MSFT 8.28,
INTC 9.071, CBRS 8.25 fail) — MSFT/INTC/CBRS's clamp-collision cause is
unchanged and not re-argued.

- **ASML**: built a per-frame clearance log
  (`docs/phase10-baseline/section-13/f2-investigation/asml-cost-clearance-frame-log.json`)
  sampling the live trail-sample point every ~0.7s for 16 consecutive frames
  (~11s). ASML's clearance to its own planet disc is **negative in all 16
  frames** (-10.75px to -5.38px) — the sample point sits inside ASML's own
  rendered planet body for a sustained stretch of its orbit, not
  intermittently. The fresh 150s sampler's best-found frame still only reaches
  3.783px clearance. A marked crop of that exact authoritative sampled pixel
  (`asml-sampled-pixel-marked.png`) shows the marker sitting directly on the
  boundary between ASML's own disc and the sun's corona — confirming and
  refining the reviewer's sun-proximity hypothesis: the contamination source
  is proximity to ASML's own tight-orbit/large-disc geometry (radiusPx ~20.8,
  orbit radius ~80px from the sun), not the aurora/glow-shell/docking-ring
  elements specifically (checked and ruled out as the direct contact source).
- **COST**: ruled out the moon/label/graticule hypotheses by direct
  measurement (`raw-f2-investigation.json`) — zero overlapping label bounding
  boxes near COST's sample point, ASML's moon 194px away, and the graticule
  ring sits at 1.6–1.66x the *outermost* planet's orbit radius (~608–675px
  from the sun) while COST orbits at ~127px. COST's clearance from its own
  planet is a comfortable ~29–40px, ruling out self-occlusion too. A marked
  crop of COST's exact sampled pixel (`cost-sampled-pixel-marked.png`) shows
  the marker landing near the trail ribbon's antialiased edge rather than its
  solid core, unlike IBM's marker (`ibm-sampled-pixel-marked.png`, near-
  identical target color), which sits centered in a wide, evenly-lit ribbon —
  consistent with COST's measured signature (hue within 1° of correct, deltaE
  driven by lower luminance/chroma from partial ribbon coverage).

Both causes trace to the shared, ticker-invariant `TRAIL_SAMPLE_FRACTION=0.62`
verification constant (`scene-model.ts:26`) not guaranteeing a centered,
comfortably-clear sample point for every holding's specific
orbit-radius/disc-size/camera-obliqueness combination — a
verification-methodology characteristic, not a magnitude/ramp/arc-length
defect. `MIN_RETURN_MAGNITUDE`/`MAX_RETURN_MAGNITUDE`, the ramp functions, and
the arc-length formulas were **not touched**, per FB-26's explicit scope
boundary. Changing `TRAIL_SAMPLE_FRACTION` or the clearance-search parameters
would itself be a methodology decision affecting the pass/fail state of the 3
currently-passing tickers without a way to bound-verify no regression inside
this remediation — the same design-vs-tool conflict FB-03's precedent
reserves for the owner. Flagged back per the handoff's own instruction rather
than resolved unilaterally; recorded `deferred_to_reviewer` with the new
per-ticker evidence, not the prior turn's restated theory.

Re-running the full `capture-section-13.mjs` script (needed for the F1
selector-bug fix) incidentally refreshed several unrelated evidence files
against today's live market data. Reverted all of those (`git checkout`) back
to their pre-remediation content — only `VIS-10` and `TST-03`/`VIS-04`
evidence is in scope for this remediation.

## Evidence

- Executable base at turn start: `60fd38095cf5c7664f81f2bf25344c9d7947eea4` —
  `phase10(review §13): fail with 2 bounded findings`
- Review candidate: the commit containing this handoff; record its SHA from
  `git log -1 --format=%H` in the reviewer turn, since a commit cannot contain
  its own hash.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-13.json`,
  implementer column updated for `VIS-10` (pass), `TST-03`/`VIS-04`
  (deferred_to_reviewer, new evidence); validated:
  `node scripts/phase10-acceptance.mjs check docs/phase10-workflow/acceptance/section-13.json --require implementer`
  → valid.
- F1 evidence: `docs/phase10-baseline/section-13/tab-strip-default-1440x900.png`,
  `docs/phase10-baseline/section-13/raw-fb05-fb31-mission-control.json`.
- F2 evidence: `docs/phase10-baseline/section-13/raw-trail-sampler-TST-03.json`
  (fresh 150s run), `docs/phase10-baseline/section-13/trail-daily-1440x900.png`,
  `docs/phase10-baseline/section-13/f2-investigation/` (new: per-frame
  clearance log, sun/moon/label distance measurements, three marked
  sampled-pixel crops).
- New scripts: `docs/phase10-baseline/section-13/scripts/investigate-f2.mjs`,
  `investigate-f2-temporal.mjs`, `investigate-f2-frames.mjs`.
- Tests: `npm test` — 112 files, 583/584 passed (1 intentional skip), zero
  failures. Raw: `docs/phase10-baseline/section-13/raw-npm-test.txt`.
- Build: `npm run build` — exit 0, 18/18 routes, `/share` smoke PASS. Raw:
  `docs/phase10-baseline/section-13/raw-npm-build.txt`.
- Inherited red: none. `main` was green at section start and remains green.

## For the next actor

State routes to `review` / `claude_lead` / `claude`.

1. Record the handoff commit as the reviewed candidate; run the independent
   `npm test` plus `npm run build` gates.
2. Re-verify F1 (`VIS-10`) with a fresh independent live computed-style check
   on the actual rendered `[aria-current="page"]` anchor, not by trusting this
   turn's numbers.
3. Judge F2 (`TST-03`/`VIS-04`): the per-ticker investigation is genuinely new
   (ASML: structural own-disc/sun-corona clearance; COST: ribbon-edge
   antialiasing, not moon/label/graticule) and distinct from the prior
   restated theory. Decide whether this now qualifies for the
   `carried_by_owner` disposition (matching the §10/§11 `BLD-04` precedent) at
   accept time, or whether further work is still owed before that — that
   judgment call is the reviewer's/owner's, not pre-decided here.
4. All other criteria (`VIS-01`–`VIS-09` except `VIS-04`, `TST-01`,
   `BHV-01`, `MOB-01`, `PRV-01`, `TST-02`, `BLD-01`) are unchanged from the
   prior review's reviewer-pass results and were not touched this turn —
   their evidence files were explicitly reverted to pre-remediation content
   after an unrelated script re-run incidentally refreshed them.

## Route after this handoff

- Section: `§13`
- Stage: `review`
- Role: `claude_lead`
- Status: `ready`
- Next actor: `claude`
