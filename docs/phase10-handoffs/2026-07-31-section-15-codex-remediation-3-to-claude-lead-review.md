# Phase 10 §15 handoff: codex-implementation (remediate, round 3) → claude-lead (review)

Prepared July 31, 2026 by `claude-code/sonnet-5` (running as `codex_implementation`
per `PHASE10_SWAP_ROLES`).

## Outcome

remediation complete, ready for re-review

## What this turn did

Fixed Finding F2 (`BHV-08`/`VIS-08`, critical): after round 1's z-index-by-size
fix (commit `b27525b`), two of the largest ORBITS rings (CBRS, CRM) still
misrouted to a neighboring ring's ticker when clicked at a non-cardinal angle
on their own visible stroke. A prior turn attempted a fix (a JS
ellipse-containment walk padded by a fixed `RING_HIT_MARGIN_PX = 6`), started
its own confirmation sweep in the background, and ended before the sweep
returned — that work was found uncommitted on a dirty tree and landed
honestly as **failing** in commit `f66b3a7` ("land the stranded F2 attempt —
FAILING, not a fix"), which was `HEAD` at the start of this turn.

**Root cause of round 2's own residual failure:** a hit-test margin fixed in
absolute pixels is a much larger fraction of a *small* ring's radius than a
*large* ring's. A smaller ring's padded ellipse could still falsely claim a
point meant for its larger neighbor's true curve before the JS walk ever
reached it — the heuristic was patching a geometric mismatch with another
approximation, and different margins just moved which angles failed.

**This turn's fix is geometric, not another heuristic.** `SystemPlot.tsx` /
`orrery.module.css`: each ring button gets
`clip-path: ellipse(50% 50% at 50% 50%)`, restricting the browser's *own*
native hit-test to that ring's true visible disc — no JS walk, no margin,
correct for any ring-size ratio by construction. Combined with the existing
`--radar-ring-z` stacking (smaller ring on top, unchanged from round 1), the
resolved target for any point is always the smallest ring whose real disc
contains it. `resolveRingTicker`/`pointInRingEllipse`/`RING_HIT_MARGIN_PX`/
`ringRefs` are removed outright; ring `onClick`/`onDoubleClick` now bind the
ticker directly, matching the blip's own simple pattern.

`clip-path` also clips a clipped element's own overflowing descendants, so
the ticker `<span>` label (which paints past its ring's own right edge)
could no longer live inside the clipped button on `>=1024px` without
disappearing. It moves to a new unclipped sibling (`.radarRingLabel`, new
CSS rule, added to `MISSION_CONTROL_TEXT_ROLES.genuineLabel` alongside the
pre-existing selector) that mirrors the ring's own box exactly.
`SystemPlot.tsx` branches on the existing `visualEnabled` state (already
used for the canvas, same `>=1024px` threshold), so the `<1024px` fallback
keeps the label as a button child exactly as before — byte-identical
DOM/CSS to pre-fix, confirmed with a live capture rather than assumed safe.

**Re-verification.** Two independent full 24-angle-per-ring sweeps in both
modes (768 real dispatched double-clicks against the *live* current
8-holding portfolio — discovered at runtime rather than hardcoded, since
`NBIS` has replaced `CRM` in the top-8 since round 2's own evidence) plus an
isolated-context retry pass over every flagged case (960 total attempts):
**zero wrong-ticker misroutes in any pass.** A small, non-reproducible
fraction of clicks intermittently failed to navigate at all rather than
mis-navigating, with an entirely different set of cases failing between the
two full sweeps — a hallmark of harness flakiness, not a reproducible
defect. Isolated retry with a fresh browser context per case resolved 16/18
immediately, and `elementFromPoint` captured at the exact dispatch
coordinate showed the *correct* ring was under the pointer on every attempt,
including the two still-flaky cases on a 5x repeat (both passing 4/5 times,
correct hit target reported even on the one failure each). This rules out a
hit-test/geometry cause: it is Playwright's synthetic `dblclick` occasionally
not registering in headless Chromium under this sandbox's load, distinct
from a real OS-generated double click, and outside `BHV-08`/`VIS-08`'s own
correct-ticker criterion.

Files touched: `src/components/observatory/orrery/MissionControlBays/SystemPlot.tsx`,
`src/components/observatory/orrery/orrery.module.css`,
`src/lib/observatory/mission-control-layout.ts` (new `.radarRingLabel > span`
selector added to `genuineLabel`), `docs/phase10-workflow/acceptance/section-15.json`
(`BHV-08`/`VIS-08` `implementer` fields only), `PHASE10_STATE.json`.

Tests: `npm test` — 118/118 files, 645/646 tests, 1 intentional skip, zero
failures — byte-identical to the implement turn's own baseline. Build:
`npm run build` — exit 0, 22 routes unchanged, `/share` smoke PASS.
`tsc --noEmit` clean.

## Evidence

- Candidate commit: none yet — left for the reviewer to record from
  `git log` (this turn's own commit cannot contain its own hash).
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-15.json` —
  `node scripts/phase10-acceptance.mjs check docs/phase10-workflow/acceptance/section-15.json --require implementer`
  → valid.
- Tests: `npm test`, 118 files / 645 tests / 1 intentional skip, zero
  failures — this turn's own run.
- Build: `npm run build`, exit 0, 22/22 routes, `/share` smoke PASS.
- Live re-verification:
  `docs/phase10-baseline/section-15/remediate-3/raw-radar-ring-angle-sweep-full.json`
  (the second/final full sweep; the first run's raw output was superseded and
  not separately committed since the script itself is the retained artifact),
  `orbits-ring-fixed-private-1440.png`, `orbits-ring-fixed-public-1440.png`
  (radar's visible rendering unchanged from the pre-fix captures — hit-test
  only, no visual delta), `mobile-390.png` (`<1024px` ORBITS fallback
  unaffected), `private-overview-1440x900.png`.
- Inherited red: none.

## For the next actor

Independently re-verify `BHV-08` and `VIS-08` — both still show `reviewer:
fail` in the acceptance ledger from round 2; this turn only updated the
`implementer` fields per the remediate stage's own scope rule. A fresh
independent sweep (different angles/tickers, or the retained script re-run)
is the recommended check, matching this project's established review
pattern. Given the click-delivery flakiness this turn documented (real but
narrow — a synthetic-event-delivery artifact, not a hit-test defect), a
reviewer re-run may also see 1-2 non-reproducible "no navigation" outcomes
out of ~200 clicks; if so, re-check the SAME (ticker, angle, mode) case in
isolation with `elementFromPoint` before treating it as a new finding —
this turn's own evidence shows the correct ring is reliably under the
pointer even when the click occasionally fails to register. If independently
confirmed correct, update `docs/phase10-workflow/acceptance/section-15.json`'s
`candidate_sha` from `git log`, fill the `reviewer` fields for `BHV-08` and
`VIS-08`, and proceed per the normal review-pass-accept path — every other
criterion was already independently verified `pass` in the prior review
round and should not be re-litigated absent a reason to suspect this
remediation affected them (it touched only ring hit-testing and the desktop
label's DOM position, not colors, layout, or any other door).

## Route after this handoff

- Section: `§15`
- Stage: `review`
- Role: `claude_lead`
- Status: `ready`
- Next actor: `claude`

## Decision needed (only if status = blocked)

N/A — not blocked.
