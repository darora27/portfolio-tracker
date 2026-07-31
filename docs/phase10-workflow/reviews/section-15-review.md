# Phase 10 §15 review — Mission Control content rework

Reviewed by `claude-code/sonnet-5` (Claude Lead, `review` stage), July 30, 2026.

## Candidate

`9c04ab4af96322f5603f72a5e01f0f4941af863f` —
`phase10(§15): implement Mission Control content rework`. Sole implementation
commit for this section since the §15 spec (`71fbf94`).

## Result: FAIL — 19/21 pass, 2 fail (BHV-08, VIS-08), both critical risk

## Independent verification performed this turn

- `npm test`: 118 files, 645 passed, 1 intentional skip, zero failures —
  byte-identical to the implementer's reported numbers.
- `npm run build`: exit 0, 22 routes, `/share` smoke PASS — byte-identical
  route list to the implementer's `raw-npm-build.txt`.
- `node scripts/phase10-acceptance.mjs check docs/phase10-workflow/acceptance/section-15.json --require implementer`
  → valid, 21/21 implementer results `pass`.
- Read the complete `71fbf94..9c04ab4` diff (56 files) against the spec:
  `MissionControl.tsx`, `PlanetDetail.tsx`, `OrreryWorld.tsx`,
  `MissionControlRoomContent.tsx`, `RoomMetricDisclosure.tsx`,
  `dashboard-data.ts`, `mission-control-panels.ts`. The private-mode door
  gating (§2), the `mode` prop's `"public"` fail-closed default on
  `PlanetDetail`, the STRIP/HOLDINGS/RETURNS/MIX/RISK/ACTIVITY reworks, and
  the CORRELATION/EARNINGS cuts all match the spec's own text and reuse the
  named existing pure functions — no second implementation of any financial
  calculation found.
- **Direct Chromium launch** against a freshly built and started production
  server on a different port (3416) than the implementer used, with a
  self-chosen temporary `OWNER_PASSWORD`. Reviewer-owned script and evidence:
  `docs/phase10-baseline/section-15/review/` (`review-script.mjs` plus three
  targeted diagnostic scripts under `review/scripts/`).
  - Re-derived the private/public doors trace with **different tickers than
    the implementer's own evidence** (GOOG instead of IBM for `FULL
    ANALYSIS ▸`, the second HOLDINGS row instead of the first) — both
    resolved correctly (`/stock/GOOG`), confirming the HOLDINGS-row and
    `FULL ANALYSIS ▸` doors are not coincidentally correct for one hardcoded
    ticker.
  - Extended PRV-01's check beyond the three named doors: `anyStockLinkInPublicDom`
    is `false` (no `/stock/` href anywhere in the public DOM, not just the
    three doors) and `publicHasValueColumn` is `false` across the reworked
    HOLDINGS section — `raw-independent-review.json`.
  - Re-derived STRIP/cuts state (`NEXT` chip, no `#earnings` nav link,
    CORRELATION/EARNINGS sections absent, 3-headline footer NEWS,
    ACTIVITY/`EFFECT ON PORTFOLIO` present, `BOOK IMPACT` absent) — matches
    the implementer's `raw-strip-state.json`/`raw-cuts-state.json` exactly.
  - Re-derived keyboard operability (ACC-01) on a **different benchmark
    toggle and a different `MetricDisclosure`** than the implementer tested
    (XLK instead of VTI; the Beta disclosure instead of Volatility) —
    confirms the interaction pattern generalizes, not just the one instance
    the implementer happened to exercise. Also independently confirmed the
    regression fix holds: the Mission Control room (`[class*="missionControl"][role="dialog"]`)
    stays open across the same Escape keypress that closes the
    `MetricDisclosure` (`roomStayedOpenAcrossEscape: true`).
  - Re-derived MOB-01's geometry measurement independently: 27 controls, 0
    undersized, no horizontal overflow, both new rows present —
    byte-identical counts to the implementer's `raw-mobile-target-sizes.json`.
  - Visually spot-checked the implementer's own capture set
    (`holdings-1440.png`, `mix-1440.png`, `risk-disclosures-open-1440.png`,
    `activity-1440.png`, `footer-news-1440.png`, `mobile-390.png`) against
    the spec's content requirements — all real data, no fabricated or
    zero-standing-in figures, matching the ledger's own notes.

## Finding: BHV-08 / VIS-08 — the ORBITS ring click routes to the wrong ticker

**Root cause.** `SystemPlot.tsx`'s `.radarRingTarget` buttons (the orbit-ring
affordance, as opposed to the small `.radarBlipTarget` dot) are all
absolutely centered on the exact same pixel
(`orrery.module.css`: `position: absolute; top: 50%; left: 50%; transform:
translate(-50%, -50%)`), sized only by `ringSize%`, and `border-radius: 50%`
does not restrict a button's hit-test area to its visible ring stroke — the
full square bounding box is clickable. Because every ring nests concentrically
around the identical center point with no differentiating `z-index` in the
default (non-active, non-focused) state, ordinary DOM-order stacking decides
which ring receives a click anywhere near that shared center: the
last-rendered (largest) ring wins. In the current live portfolio that is CRM.

**Reproduced independently, deterministically, twice** (not a Playwright
timing flake — confirmed with `document.elementsFromPoint` at the radar's
exact center, which lists all 8 ring buttons stacked at that single point in
DOM order, `CRM` topmost):

`docs/phase10-baseline/section-15/review/raw-radar-ring-vs-blip-routing.json`:

| Ring double-clicked | Actual navigation |
|---|---|
| ASML | `/stock/CRM` |
| GOOG | `/stock/CRM` |
| COST | `/stock/CRM` |
| MSFT | `/stock/CRM` |
| IBM | `/stock/CRM` |

The same script's **blip** clicks (the small dot, positioned individually per
holding, not center-anchored) routed correctly: GOOG→`/stock/GOOG`,
COST→`/stock/COST`, MSFT→`/stock/MSFT`, IBM→`/stock/IBM`. (ASML's blip
flaked to no-navigation in that specific batch run but reproduced correctly
in isolation — `docs/phase10-baseline/section-15/review/scripts/radar-asml-blip.mjs`
output — consistent with a first-test-in-loop cold-start artifact, not a
per-ticker routing defect; not a further finding.)

Visual evidence of the overlap:
`docs/phase10-baseline/section-15/review/orbits-ring-overlap-1440.png` — 8
concentric rings sharing one center, each labeled with a different ticker
along the strip beside it, giving no visual indication that clicking the
ring anywhere near center opens a specific one of them regardless of which
ring border a user aims for.

**Why this is in scope for §15 despite `SystemPlot.tsx` being unmodified.**
The spec (§5, "Visually and structurally unchanged... Only its click
destination changes — see §2.2") is correct that this section did not touch
`SystemPlot.tsx` or its CSS — this hit-testing defect is pre-existing,
inherited from whichever earlier section shipped the radar. But §15 is the
section that newly wires this exact click to the owner-gated
`/stock/<ticker>` route and is the section that introduces `BHV-08` and
`VIS-08` as acceptance criteria, both explicitly requiring "the correct real
ticker." `VIS-08`'s own required artifact, `doors-private.json`, is the
evidence that should have caught this: the implementer's trace recorded
"ORBITS double-click on a real radar blip -> navigated to
`http://localhost:3415/stock/CRM`" and the ledger's `pass` notes assert "all
three doors resolve to `/stock/<ticker>` with the real clicked/opened
ticker" — but the trace never recorded *which* ticker's ring/blip element
was the intended target, so it could not have caught a click landing on the
wrong one. Per `G-SCOPE`, this is a bounded finding against a criterion this
section itself declares and marks `pass`, not new advisory scope.

**Consequence.** In private mode, a user who visually aims for a specific
holding's orbit ring and double-clicks it is silently shown a different
holding's Chart Room most of the time (5/5 reproduced), with no error and no
visual indication of the mismatch — a financial-correctness/data-integrity
concern per `CLAUDE.md` and global gate `G-BOUNDARY`, not merely a taste
issue. This does **not** affect `PRV-01`: in public mode the same
mis-routed click still only ever produces a `?holding=<ticker>&camera=
approach` URL (never `/stock/`, confirmed by `anyStockLinkInPublicDom:
false`), so there is no privacy leak — only a wrong-ticker navigation, in
both modes.

**Not in scope for this finding, and not required of the implementer's
remediation:** re-deriving or restyling the radar's visual system, or fixing
the same underlying hit-testing defect for the pre-existing public-mode
`?holding=` destination as a matter of general cleanup — only the specific
new `BHV-08`/`VIS-08` requirement ("the correct real ticker") that this
section's own doors now depend on.

## All other criteria — reviewer-independent PASS

`BHV-01`–`07`, `PRV-01`, `VIS-01`–`07`, `MOB-01`, `ACC-01`, `TST-01`,
`TST-02`, `BLD-01` — 19 of 21 — verified independently this turn per the
evidence above and recorded in
`docs/phase10-workflow/acceptance/section-15.json`'s `reviewer` fields.

## Next

Routed to `stage: remediate`, `role: codex_implementation`,
`next_actor: codex`, `section.review_result: fail`, `status: ready`. The
implementer's own fix is scoped to making the ORBITS ring's click hit-test
resolve to the ring/holding actually clicked, for the correct ticker in both
modes — the mechanism (restoring `pointer-events` or clip-path scoping to
each ring's visible stroke, giving the *smallest* ring the highest default
z-index so inner rings are reachable, or an equivalent fix) is the
implementer's own judgment call, not prescribed here. Re-verify `BHV-08` and
`VIS-08` with a script that clicks a **named** ring/blip and asserts the
resulting URL contains that same ticker — the pattern in
`docs/phase10-baseline/section-15/review/scripts/radar-blip-check.mjs` is a
usable starting point for the re-review script, not a required file to
reuse.
