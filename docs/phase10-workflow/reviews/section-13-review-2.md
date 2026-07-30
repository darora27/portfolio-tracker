# §13 review round 2 — BLOCKED

Reviewer: `claude-code/sonnet-5` (Claude Lead), 2026-07-30.
Candidate: `b05c9c86e5459d739eec1b1874aa62207fda5a79` (HEAD at turn start,
`phase10(§13): remediate 2 bounded findings`).
Ledger: `docs/phase10-workflow/acceptance/section-13.json` (15 criteria).

## Independent verification performed

- `npm test`: 112 test files, 583 passed, 1 skipped (intentional), zero
  failures. Matches the implementer's own run exactly.
- `npm run build`: exit 0, 18 routes, unchanged route list, `/share` smoke
  PASS. Matches the implementer's own run exactly.
- Read the full remediation diff (`git diff 60fd380 b05c9c8`): a single
  one-line CSS selector change
  (`.missionControl nav a[aria-current="page"]` →
  `.missionControl .missionStrip nav a[aria-current="page"]`), a matching
  fix to the section's own capture script's selector bug, and the new
  `f2-investigation/` evidence tree. No other application source touched —
  matches the remediation's own stated scope exactly (only F1/F2 in bounds).
- Independently launched Chromium directly against a freshly built
  production server (`npm run build && npm run start -p 3100`), per
  `AGENTS.md`, and wrote a fresh reviewer-owned script (not reused from
  round 1 or the implementer) at
  `docs/phase10-baseline/section-13/review-scripts-2/verify-f1-vis10.mjs`.
- Independently read the full F2 evidence tree (`raw-f2-investigation.json`,
  `asml-cost-clearance-frame-log.json`) and viewed all three marked
  sampled-pixel crops (ASML, COST, IBM) directly.

## Finding 1 (`VIS-10`) — RESOLVED

Live computed style, all 8 tabs, this turn's own fresh capture:

| Tab | `aria-current` | `border-bottom-width` | `border-bottom-color` |
|---|---|---|---|
| ORBITS | `page` | `2px` | `rgb(255, 240, 207)` (cream) |
| HOLDINGS, RETURNS, RISK, CORRELATION, NEWS, TRADES, EARNINGS | — | `1px` | `rgba(213, 186, 140, 0.28)` |

The active tab now visibly and measurably differs from every inactive tab.
The re-scoped selector's specificity `(0,3,2)` beats the previously-colliding
nested rule `(0,2,2)`, exactly as the remediation intended. **`VIS-10`:
PASS.**

## Finding 2 (`TST-03`/`VIS-04`) — genuinely re-investigated, still fails the
literal gate, now a design-vs-verification-methodology call for Devan

The remediation did what round 1's finding required: it did not restate the
three-ticker clamp-collision theory for ASML and COST. It produced new,
falsifiable, per-ticker evidence, independently checked here:

- **MSFT/INTC/CBRS** — unchanged. All three still pin to the identical
  brightest ramp stop under the (unmodified, out-of-scope) 12% clamp
  ceiling; the additive-glow bleed explanation from round 1 stands and was
  not re-argued.
- **ASML** — `raw-f2-investigation.json` and the per-frame clearance log
  independently confirm: the sample point's clearance to ASML's own planet
  disc is **negative in all 16 sampled frames** (-10.75px to -5.38px), and
  even a fresh, independent 150-second full sampler run's single best frame
  only reaches +3.78px. This is not intermittent contamination from the
  sun's glow/aurora/docking ring (checked and ruled out as the direct
  contact source) — it is ASML's own tight orbit (~80px from the sun) and
  comparatively large disc (radius ~20.8px, one of the largest of the 8)
  structurally leaving too little clearance at any point in its orbit.
  Viewing `asml-sampled-pixel-marked.png` directly: there is no visible
  sample-point marker at all in the crop, because it sits behind/inside the
  overlapping sun-and-planet silhouette — visually corroborating the
  negative-clearance measurement rather than merely asserting it.
- **COST** — moon/label/graticule proximity hypotheses are ruled out by
  direct measurement (zero overlapping label boxes; nearest moon 194px
  away; the graticule ring sits at 608–675px from the sun vs. COST's
  ~127px orbit). COST's own clearance from its own planet is a comfortable
  ~42px in this turn's re-read of the frame log (round 1 estimated
  29–40px; consistent), ruling out self-occlusion. Viewing
  `cost-sampled-pixel-marked.png` against `ibm-sampled-pixel-marked.png`
  directly: COST's marker sits near the trail ribbon's antialiased edge,
  while IBM's near-identical-magnitude marker sits centered in a wide,
  evenly lit ribbon — a plausible, specific, checkable mechanism for
  COST's near-correct hue (0.636°) but excess ΔE (driven by
  luminance/chroma loss from partial ribbon coverage, not a hue-shifting
  contaminant).

Both mechanisms are genuinely distinct from each other and from the
clamp-collision cause, and both trace to the same underlying tooling fact:
`TRAIL_SAMPLE_FRACTION = 0.62` (`scene-model.ts:26`) is a single fixed
sampling rule applied uniformly across 8 holdings with different
orbit-radius/disc-size combinations, and it does not guarantee a
comfortably-clear sample point for every one of them.

**Why this is not resolved by a third remediation round, and not
self-authorized here:**

- Changing `TRAIL_SAMPLE_FRACTION` (or the clearance-search window/step) is
  a verification-methodology decision that would also move the sample point
  for the 3 currently-*passing* tickers (GOOG, IBM, CRM) — there is no way
  to bound-verify "no regression" for those three inside this remediation's
  own scope without re-running and re-judging the entire 8-ticker gate,
  which is a scope expansion the remediation correctly declined to take
  unilaterally.
- The alternative — widening ASML's orbital clearance — means touching
  `ORRERY_MIN_RADIUS`/`ORRERY_MAX_RADIUS` or the orbit-gap constants, both
  of which `FB-01` (this same section) explicitly froze this turn on the
  owner's own confirmed-proportions instruction ("do NOT re-derive the
  ratios — he has explicitly blessed the proportions").
- `FB-26`'s own scope boundary (spec §2.1, §2.6) forbids touching
  `MIN_RETURN_MAGNITUDE`/`MAX_RETURN_MAGNITUDE`, the ramp functions, or the
  arc-length formulas — the actual encoding is not implicated by either
  ASML's or COST's mechanism.

This is the same shape as the `TST-03`/`BLD-04`/`DEF-02` precedent from §10
round 5: a real, reproducible measurement failure whose fix requires a scope
or tooling decision reserved for the owner, not a remaining implementation
gap inside this section's bounds. Per that precedent and per this
workflow's Universal rule ("Anything genuinely ambiguous becomes a precise
blocked handoff to Devan"), routing a third remediation round here would
almost certainly reproduce the same, now-doubly-confirmed, correct refusal
rather than close the gap — so this turn stops at a blocked handoff instead
of spending a round-trip on a foregone conclusion.

`TST-03` and `VIS-04` are recorded `blocked` in the ledger (not `fail`,
which was accurate for round 1's under-investigated state, and not `pass`
or `carried_by_owner`, which only Devan can authorize). No gate is
weakened, redefined, or baseline-subtracted; the literal ΔE≤8 gate remains
unweakened and the 5/8 failure count is reported honestly.

## Owner feedback ledger

Two rows close on committed capture alone, per their own objective
(non-taste) closes-when text, matching the `FB-19`/`FB-20` precedent:

- **`FB-31`** ("gone from a capture") — closed. This turn's own fresh,
  independent capture confirms no orange background on any tab and a
  visibly distinct active-tab underline.
- **`FB-22`** ("it is gone from a capture") — closed. Round 1's
  independently reviewer-verified `VIS-06` capture already showed a clean
  sun silhouette with no yellow/gold haze; unchanged and unaffected by this
  round's remediation.

All other rows this section touches (`FB-01`, `FB-02`, `FB-05`, `FB-17`,
`FB-23`, `FB-24`, `FB-25`, `FB-26`) have a `he`-phrased, taste-oriented
closes-when and stay open pending Devan's own sentence, unchanged from
round 1.

## Result

13 of 15 criteria: **pass** (11 unchanged reviewer-passes from round 1 plus
`VIS-10`, newly resolved and independently re-verified this round). 2
criteria: **blocked** (`TST-03`, `VIS-04`) — routed to Devan, not remediate,
per the reasoning above.

Routing to `stage: review` (unchanged — the validator does not require a
stage change for `blocked`), `role: claude_lead` (unchanged), `status:
blocked`, `next_actor: devan`.
