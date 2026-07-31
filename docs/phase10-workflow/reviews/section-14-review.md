# Phase 10 §14 review — The Chart Room, stage one

Reviewed by `claude-code/sonnet-5` (Claude Lead, `review`-stage direct
accept path), July 30, 2026.

## Candidate

`739049dbb72c0ba426ed668c24ae65442d62beaf` —
`phase10(§14): implement The Chart Room, stage one -- the page`. This is the
sole implementation commit for this section; `git diff --name-only
4423a96 739049d -- src/ public/ package.json package-lock.json scripts/`
confirms the only prior commits touching those paths since §13's accepted
HEAD are this section's own spec (`4423a96`, docs-only) and this candidate.

## Result: PASS — 20/20 criteria, zero fail/blocked/carried

All 20 acceptance criteria (5 behavioral, 9 visual, 1 mobile, 1
accessibility, 1 privacy, 2 tests, 1 build) resolved `pass` on independent
reviewer verification. No finding, no owner exception, no carry.

## Independent verification performed this turn

- `npm test`: 118 files, 631 passed, 1 intentional skip, zero failures —
  byte-identical to the implementer's reported numbers
  (`docs/phase10-baseline/section-14/raw-npm-test.txt`, re-run and matched).
- `npm run build`: exit 0, route list diffed byte-for-byte against the
  implementer's `raw-npm-build.txt` — identical (23 routes including 6
  `/dev/*` scratch routes and the 18-page static-generation count both
  quote; `/stock/[ticker]` reused, not duplicated), `/share` smoke PASS.
- Targeted re-runs: `src/app/stock` (3/3, PRV-01), `chart-room-window.test.ts`
  + `chart-room-layout.test.ts` (25/25, TST-01), and the five
  `src/components/observatory/chart-room` test files together (45/45,
  BHV-01–05/VIS-08) — every count matches the implementer's claim exactly.
- **Direct Chromium launch** (this sandbox launches it fine, confirmed again
  this turn — no camera daemon needed) against a **freshly built and
  started** production server on a different port (3401) than the
  implementer used, with a self-chosen temporary `OWNER_PASSWORD` process
  env override (no `.env*` read, matching this project's established
  precedent).
  - Fresh desktop capture (1440×900, real IBM data):
    `docs/phase10-baseline/section-14/review/overview-1440x900.png`. The
    live `graphState` (`raw-independent-review.json`) reproduces the
    implementer's title (`"30 DAYS · ▼ 22.5%"`), 21-point trace, and
    `vooOverlayRendered:true` exactly. Visually confirmed all six benches
    render with real, non-fabricated figures matching the implementer's
    reported stamps (DISTRIBUTION σ/vol, VS MARKET slope/fit, DEPTH
    worst/off-high, MOVES WITH bars + sentence, CONTRIBUTION ranking +
    four owner tiles, THE COMPANY facts/consensus/news).
  - Fresh mobile capture (390×844):
    `docs/phase10-baseline/section-14/review/mobile-390.png`. Independent
    DOM measurement: 12 interactive buttons, 0 undersized (<44×44),
    `horizontalOverflow:false`. Single-column stack confirmed in source
    order per spec §8.
  - **Re-derived the VIS-06 bug-fix independently**, not just trusted the
    screenshot: a dedicated `contributionOverflowCheck` (bounding-rect
    comparison of the CONTRIBUTION SVG against its section) shows
    `svgOverflowsSection:false` on desktop; a zoomed crop of the mobile
    capture confirms no label/tile overlap at 390px either. The fix holds.
  - **Re-derived ACC-01 independently** with a fresh script exercising real
    keyboard interaction (not `.click()`): `.focus()` on the 7D button,
    `getComputedStyle` confirms `outlineStyle:"solid"` at focus (the
    `:focus-visible` rule fires, not suppressed), and `.press("Enter")`
    flips `aria-pressed` from `"false"` to `"true"`. Screenshot of the
    visible focus ring: `docs/phase10-baseline/section-14/review/
    keyboard-focus-7d.png`.
  - **Spot-checked PRV-01 live**, not just the regression test: an
    unauthenticated request to `/stock/IBM` against the same fresh server
    contains zero occurrences of "CHART ROOM" in the rendered body text and
    shows a login/password prompt instead.

All review evidence is under `docs/phase10-baseline/section-14/review/`
(and the two capture scripts, `docs/phase10-workflow's` sibling files
`review-script.mjs`/`review-kbd.mjs`), created and captured during this
turn only, per the camera protocol's "only files created under this
section's baseline directory during this run" rule.

## Judgment calls checked against the spec (per implementer's handoff request)

- **DISTRIBUTION/DEPTH use since-buy-sliced `dailyReturns`.** Spec §6.1
  explicitly left this as an implementer choice (mock doesn't specify, no
  owner sentence either way). Confirmed reasonable: since-buy is the same
  window the DEPTH bench's own mock stamp names ("SINCE BUY"), and matches
  the header strip's own "SINCE BUY" framing elsewhere on the page — a
  consistent window choice, not an arbitrary one.
- **CONTRIBUTION bench's dynamic SVG height.** Not in the original spec,
  found and fixed during the implementer's own evidence capture. Reviewed
  against the design proof's negative list ("a rebuild of the four named
  dashboard components' math" / "a second CSS custom-property namespace" /
  "wiring the doors") — none of those apply. This is a layout-geometry fix
  (`Math.max(120, 20 + ranked.length*15)` viewBox height plus `min-width:0`
  on a CSS Grid item) required for the page to render correctly against
  the *real* 13-holding portfolio rather than the mock's ~7-holding
  assumption. It does not restyle the bench, change its data, or introduce
  new visual language — ordinary defect remediation within spec, not a new
  creative direction requiring owner scope.

## One observation, not a finding

The full-scale graph's header carries a second line, `"the full-scale
graph — window in the title, answer beside it"`, reproduced verbatim from
`UNIVERSE_STOCK_LAB.html` line 143 (confirmed by source comparison). Unlike
the six benches' plain-English questions (`"is today normal?"`, etc.), this
line describes the graph's own layout mechanics to the reader rather than
posing a genuine question — it reads more like a design annotation than
end-user copy, and the design proof's own stated intent for
first-five-second comprehension names the graph's `<h2>` title
(`<WINDOW> · <RETURN>`), not this span, as the answer-bearing element.
No acceptance criterion addresses this line's copy one way or the other,
the design proof's "annotated references" table explicitly authorizes
borrowing the mock's full-scale-graph structure verbatim, and G-SCOPE bars
this review from turning it into a new finding outside a declared
criterion — so it does not block this section. Worth a taste sentence from
Devan if he notices it; recording it here rather than silently.

## Freeze boundary held

No stage-two work (HOLDINGS row click, ORBITS click, `FULL ANALYSIS ▸`)
appears in the candidate. Confirmed by reading the diff and by the absence
of any such control in both live captures.

## Next

§14 accepted at `739049d`. §15 ("Mission Control content rework, plus the
Chart Room's stage two — the doors") is initialized at `stage: specify`,
`role: claude_lead`, `next_actor: claude`, `status: ready`. **No §15 work
was done in this turn.** The next specify turn must resolve
`PHASE10_STATE.json`'s top-level `roadmap_numbering_conflict` (the
duplicate `## §15.` heading in `PHASE10.md`) before writing anything, per
that key's own `must_resolve_before` field — this review turn did not touch
it, since fixing the roadmap numbering is itself an owner-adjacent
structural edit, not review or acceptance work.
