# Phase 10 §15 handoff: codex-implementation (remediate) → claude-lead (review)

Prepared July 31, 2026 by `claude-code/sonnet-5` (running as `codex_implementation`
per `PHASE10_SWAP_ROLES`).

## Outcome

remediation complete, ready for re-review

## What this turn did

Fixed Finding F1 (`BHV-08`/`VIS-08`, critical): the ORBITS **ring** click
resolved to the wrong ticker. Root cause: every `.radarRingTarget` button
shared the identical center pixel (`orrery.module.css`: `top:50%; left:50%;
transform:translate(-50%,-50%)`) and its full square bounding box — not just
its visible circular stroke — was clickable, so plain DOM-order stacking (the
last-rendered/largest ring) decided every click regardless of which ring a
user actually clicked.

Fix, scoped narrowly to the ring's own hit-testing per the finding's
instruction not to touch anything else:

- `SystemPlot.tsx` sets a `--radar-ring-z` custom property on each ring
  button (`holdings.length - index`). Ring size grows monotonically with
  index, so this reliably stacks smaller rings above larger ones.
- `orrery.module.css` moves the ring's `border`/`border-radius` to a
  `pointer-events:none` `::before` pseudo-element (position/size unchanged,
  `inset:0`), so the button itself becomes an invisible hit-box whose
  `z-index` now comes from that custom property. The ticker `<span>` label
  stays exactly where it was — a direct child of the button, required by
  `mission-control-layout.ts`'s own `.radarRingTarget > span` text-role
  selector.
- `.radarTargets` gained `isolation:isolate` so the new z-index ordering is
  self-contained.
- `.radarBlipTarget`'s z-index moved from 2/3 to 1000/1001 so blips
  (independently positioned, unaffected by this fix) stay reliably above the
  new ring z-index range.
- The pre-existing `<1024px` fallback override needed one addition
  (`.radarRingTarget::before { border-radius: 2px }`) since the flat-row
  swatch's corner rounding no longer lives on the button itself.

`clip-path` was considered and rejected: it would also clip the child label
span, since `clip-path` constrains an element's entire painted subtree
regardless of a descendant's own position/offset — confirmed by tracing where
the label's existing `right:-0.2rem` + `translate(55%,-50%)` positioning
places it, outside the button's own box.

Re-verified with a new script,
`docs/phase10-baseline/section-15/remediate/scripts/radar-ring-named-click.mjs`,
that clicks each of the 8 real portfolio tickers on the radar (ASML, GOOG,
COST, MSFT, INTC, IBM, CBRS, CRM) at a point on that ring's own stroke,
confirms via `elementFromPoint` that the correct ring's own button is what's
actually under the pointer before dispatching a real double-click, and
asserts the resulting destination. All 8/8 resolve to their own
`/stock/<ticker>` in private mode; all 8/8 retain their unchanged
`?holding=<ticker>&camera=approach` destination with no `/stock/` substring
in public mode.

The script's first draft used a rightward (0°) click point and got 7/8
correct, with ASML failing — root-caused (not a fix defect) via
`docs/phase10-baseline/section-15/remediate/scripts/debug-asml.mjs`: index
0's own blip sits at `angle = 0*0.89 = 0°` by the pre-existing blip-placement
formula, so a rightward ring-click point coincidentally lands inside index
0's own blip's independent hit area too. Switching to a leftward (180°)
point, which for an 8-ring radar is never within 27° of any blip's angle,
removed the collision.

Files touched: `src/components/observatory/orrery/MissionControlBays/SystemPlot.tsx`,
`src/components/observatory/orrery/orrery.module.css`,
`docs/phase10-workflow/acceptance/section-15.json` (BHV-08/VIS-08
`implementer` fields only), `PHASE10_STATE.json`.

Tests: `npm test` — 118/118 files, 645/646 tests, 1 intentional skip, zero
failures — byte-identical to the implement turn's own baseline. Build:
`npm run build` — exit 0, 22 routes unchanged, `/share` smoke PASS.

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
  `docs/phase10-baseline/section-15/remediate/raw-radar-ring-named-click.json`
  (8/8 private, 8/8 public), `orbits-ring-fixed-private-1440.png`,
  `orbits-ring-fixed-public-1440.png` (radar's visible rendering unchanged
  from the pre-fix captures — confirms this was hit-test-only, no visual
  delta).
- Diagnostic (root-causing the test script's own ASML miss, not a code
  defect): `docs/phase10-baseline/section-15/remediate/scripts/debug-asml.mjs`.
- Inherited red: none.

## For the next actor

Independently re-verify `BHV-08` and `VIS-08` — both still show `reviewer:
fail` in the acceptance ledger from the prior round; this turn only updated
the `implementer` fields per the remediate stage's own scope rule. Consider
exercising a different subset of tickers and/or a different click-angle
approach than this turn's own script to avoid rubber-stamping (matching this
project's own established review pattern). If independently confirmed
correct, update `docs/phase10-workflow/acceptance/section-15.json`'s
`candidate_sha` from `git log`, fill the `reviewer` fields for `BHV-08` and
`VIS-08`, and proceed per the normal review-pass-accept path — every other
criterion (`BHV-01`–`07`, `PRV-01`, `VIS-01`–`07`, `MOB-01`, `ACC-01`,
`TST-01`, `TST-02`, `BLD-01`) was already independently verified `pass` in
the prior review round and should not be re-litigated absent a reason to
suspect this remediation affected them (it did not touch anything outside
`SystemPlot.tsx`/`orrery.module.css`'s ring styling).

## Route after this handoff

- Section: `§15`
- Stage: `review`
- Role: `claude_lead`
- Status: `ready`
- Next actor: `claude`

## Decision needed (only if status = blocked)

N/A — not blocked.
