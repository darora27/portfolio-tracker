# Phase 10 §15 handoff: claude-lead (review) → codex-implementation (remediate)

Prepared July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `review` stage).

## Outcome

review returned 1 bounded finding (covering 2 critical criteria)

## What this turn did

Independently reviewed candidate `9c04ab4af96322f5603f72a5e01f0f4941af863f`
against `docs/phase10-workflow/specs/section-15.md`. Re-ran `npm test`
(118/118 files, 645/646 tests, zero failures) and `npm run build` (exit 0,
22 routes, `/share` smoke PASS), both byte-identical to the implementer's own
runs. Read the complete `71fbf94..9c04ab4` diff against the spec. Launched
Chromium directly against a freshly built production server on a different
port (3416) with a fresh reviewer-owned script
(`docs/phase10-baseline/section-15/review/review-script.mjs`) that
deliberately exercised different tickers/controls than the implementer's own
evidence (a different HOLDINGS row, `GOOG` instead of `IBM` for `FULL
ANALYSIS ▸`, `XLK` instead of `VTI`, the Beta disclosure instead of
Volatility) to avoid rubber-stamping coincidentally-correct evidence. That
strategy caught a real bug: the ORBITS **ring** click (`BHV-08`/`VIS-08`,
both critical) does not resolve to the correct real ticker.

19 of 21 criteria independently verified `pass` and recorded in
`docs/phase10-workflow/acceptance/section-15.json`'s `reviewer` fields.
`BHV-08` and `VIS-08` recorded `fail`. Full review doc:
`docs/phase10-workflow/reviews/section-15-review.md`.

## Evidence

- Candidate commit: `9c04ab4af96322f5603f72a5e01f0f4941af863f` —
  `phase10(§15): implement Mission Control content rework`.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-15.json` —
  `node scripts/phase10-acceptance.mjs check docs/phase10-workflow/acceptance/section-15.json`
  → valid.
- Tests: `npm test`, 118 files / 645 tests / 1 intentional skip, zero
  failures — this turn's own independent run, byte-identical to the
  implementer's.
- Build: `npm run build`, exit 0, 22/22 routes, `/share` smoke PASS — this
  turn's own independent run.
- Screenshots/traces: `docs/phase10-baseline/section-15/review/` —
  `overview-1440x900.png`, `mobile-390.png`,
  `orbits-ring-overlap-1440.png`, `raw-independent-review.json`,
  `raw-radar-ring-hittest.json`, `raw-radar-ring-vs-blip-routing.json`, plus
  four diagnostic scripts under `review/scripts/`.
- Review doc: `docs/phase10-workflow/reviews/section-15-review.md`.
- Inherited red: none.

## For the next actor

Fix Finding F1 (`PHASE10_STATE.json`'s `section.findings`): the ORBITS
**ring** click affordance (`SystemPlot.tsx`'s `.radarRingTarget` buttons,
distinct from the `.radarBlipTarget` dot, which is unaffected and already
correct) does not resolve to the ticker a user actually clicks, in either
mode. Root cause: every ring is absolutely centered on the identical pixel
regardless of size (`orrery.module.css`), and `border-radius` does not
restrict the button's hit-test area to its visible stroke — the full square
bounding box is clickable, so concentric rings nest and ordinary DOM-order
stacking (not visual position) decides which ring wins a click near the
shared center. Reproduced 5/5 with the current portfolio's rings: any ring
except the last-rendered one (`CRM`) routes to `CRM` instead of itself.

This is scoped narrowly: fix the ring's own click hit-testing so it resolves
to its own ticker, in both public and private mode. The blip dot, the
radar's visual rendering, the canvas sweep animation, and every other
section's content are untouched by this finding — do not restyle or
otherwise touch anything beyond what's needed to make ring clicks resolve
correctly. The mechanism (pointer-events scoping, `clip-path`, reordering
`z-index` so inner/smaller rings sit on top of outer/larger ones, or an
equivalent) is your own judgment call.

Re-verify `BHV-08` and `VIS-08` with a script that clicks a **named**
ring/blip (not `.first()` on an ambiguous attribute selector) and asserts
the resulting destination contains that same ticker, for more than one
ticker, in both modes.
`docs/phase10-baseline/section-15/review/scripts/radar-blip-check.mjs` is a
usable starting point for the pattern, not a required file to reuse or
preserve.

Every other criterion (`BHV-01`–`07`, `PRV-01`, `VIS-01`–`07`, `MOB-01`,
`ACC-01`, `TST-01`, `TST-02`, `BLD-01`) is independently verified `pass` —
do not re-litigate them; a remediation round changes only the bounded
finding.

## Route after this handoff

- Section: `§15`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`

## Decision needed (only if status = blocked)

N/A — not blocked.
