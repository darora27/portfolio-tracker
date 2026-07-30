# §13 review round 3 — BLOCKED

Reviewer: `claude-code/sonnet-5` (Claude Lead), 2026-07-30.
Candidate: `33789eebeb170c1c60a833b5d963bbadbb64f2f7` (HEAD at turn start,
`phase10(§13): sampler walks the trail for a valid sample point` — the
codex_implementation turn that implemented Devan's owner ruling `ee7f12b`,
"sampler searches for a valid point; no threshold moves").
Ledger: `docs/phase10-workflow/acceptance/section-13.json` (15 criteria).

## Independent verification performed

- `npm test`: 112 test files, 583 passed, 1 skipped (intentional), zero
  failures. Matches the implementer's own run exactly.
  (`docs/phase10-baseline/section-13/raw-npm-test-review3.txt`)
- `npm run build`: exit 0, 18 routes, unchanged route list, `/share` smoke
  PASS. Matches the implementer's own run exactly.
  (`docs/phase10-baseline/section-13/raw-npm-build-review3.txt`)
- Read the full diff (`git diff b05c9c8 HEAD`): scoped exactly to what the
  handoff claims — `scene-model.ts` adds
  `buildTrailSampleSearchFractions()`/`TRAIL_SAMPLE_SEARCH_FRACTIONS` (an
  ordered ±0.08 walk from the unchanged `TRAIL_SAMPLE_FRACTION = 0.62`,
  clamped to `[0.2, 0.92]`) and a `sampleSearchFractions` field on
  `SceneModel.trails[]`; `OrreryScene.tsx` adds one publish
  (`data-trail-sample-candidates`, a JSON array of `{fraction, x, y}`
  projected every frame) alongside the pre-existing, unchanged single
  `data-trail-sample-x/y`. No rendering, geometry, colour, ramp, clamp, or
  arc constant touched — confirmed by reading every changed line, not just
  the notes. No other application source file differs from `b05c9c8`.
- Independently launched Chromium directly against a freshly built
  production server (`npm run build && npm run start -p 3200`), per
  `AGENTS.md`, and wrote a fresh reviewer-owned script (not reused from
  round 2 or the implementer) at
  `docs/phase10-baseline/section-13/review-scripts-3/verify-tst03-vis04.mjs`
  — independently re-derived from the spec's own gate description (CIE76
  ΔE in Lab space, HSL-style hue/chroma, WCAG relative luminance, the
  candidate-walk-within-frame-before-advancing-frame method), not copied.
- Ran the independent script **twice** against the same live build (see
  "Reproducibility" below) — `docs/phase10-baseline/section-13/review-scripts-3/out/review3-tst03-vis04.json`
  holds the second (final) run.

## Finding (`TST-03`/`VIS-04`) — method correctly implemented; ASML is a
confirmed, reproducible, genuine residual failure; overall pass/fail is an
owner call, not a reviewer call

**The owner's ruling was implemented correctly.** The diff does exactly what
`ee7f12b` authorized and nothing else: `TRAIL_SAMPLE_FRACTION` (0.62) is
retained as the search base, not moved; the search walks outward in the
specified ±0.08 steps clamped to `[0.2, 0.92]`; every existing gate
(ΔE≤8, hue distance ≤10°, chroma >0.3, clearance ≥1px) is byte-for-byte
unchanged; no geometry constant (`ORRERY_MIN_RADIUS`/`MAX_RADIUS`, the
FB-01 gap coefficients) was touched.

**GOOG, IBM, and CRM (the three previously-passing tickers) still pass**,
confirmed independently — the ruling's explicit non-regression requirement
is satisfied.

**ASML is a genuine, reproducible, structural failure**, not a fluke or an
artifact of one run. Three independent runs (the implementer's own, and my
two fresh runs against a separately-built production server) all found the
same result: ASML's best achievable ΔE is **9.436**, against the unweakened
≤8 gate — identical to three decimal places across runs that sampled
different frames at different real-time offsets, which is only possible if
the true best-achievable point is a stable, geometry-determined ceiling
rather than a timing-dependent miss. This matches the round-2 root cause
(the sample point sits inside or immediately adjacent to ASML's own disc for
its entire orbit, a consequence of ASML's tight-orbit/large-disc geometry
that FB-01 explicitly froze this same section) and is not resolved by the
positional search, exactly as the owner's ruling anticipated ("if none
exists for a ticker, that is a reportable failure, not a silent skip").

**Reproducibility — a nuance the implementer's single run did not surface.**
Running my independently-authored script twice against the same live build
produced different passing sets:

| Run | Passing | Failing |
|---|---|---|
| Implementer (`raw-trail-sampler-TST-03.json`) | 7/8 | ASML (9.436) |
| Reviewer run 1 | 6/8 | ASML (9.436), INTC (8.81) |
| Reviewer run 2 | 7/8 | ASML (9.436) |

ASML's number is stable across all three runs (9.436, 9.436, and the
implementer's own 9.436) — strong independent confirmation it is a
structural ceiling, not sampling noise. INTC, by contrast, passed easily in
the implementer's run (ΔE 1.398) and in my second run (ΔE 3.492), but missed
narrowly in my first run (ΔE 8.81, over the gate by 0.81 after 1,529
candidates tried across the full 150-second window) — a real,
timing-dependent difference in which live orbital/camera frame the temporal
search happens to land on, not a script bug (both scripts implement the
same formulas from the same spec description; I re-derived mine
independently rather than reusing the implementer's, and cross-checked the
Lab/hue math by hand on a few sample RGB triples before trusting either
script's output).

**Practical read:** ASML is the one ticker whose failure is dependable and
attributable to a specific, already-understood, already-frozen geometry
constraint. The other seven tickers pass reliably within the 150-second
search window under normal operation, with INTC occasionally landing close
enough to the gate boundary that an unlucky run can miss it. Neither
observation is new information the owner's ruling didn't already anticipate
in kind — but the exact count (7/8 vs. potentially 6/8 on an unlucky run)
was not something the implementer's single run could have shown, and it
matters for whether "7/8, one known structural failure" is the right way to
describe this row to Devan.

**Minor evidence-quality note (not scored, not blocking):** the committed
`raw-trail-sampler-TST-03.json`'s `rootCauseFinding` field is a hardcoded
string from the sampler script (`sample-live-rgb.mjs`) that still describes
the *round-1* MSFT/INTC/CBRS clamp-collision theory, even though the same
file's own `samples` array shows all three of those tickers now passing and
ASML — never mentioned in that string — as the actual sole failure. The
underlying pass/fail numbers I independently reproduced are correct and
match the implementer's; only this one prose field is stale. Worth a
one-line fix (`rootCauseFinding` should describe whichever tickers are
actually in `gateStatus: "fail"` in that run) whenever this row is next
touched — not raised as a bounded finding requiring its own remediation
round, since it doesn't affect any criterion's pass/fail determination.

## Why this is not resolved here, and not a repeat of round 2's question

Round 2 asked Devan a methodology question: how should the sampler look for
a valid point. He answered it (`ee7f12b`) — decisively, with an explicit
non-generalizing scope, and with two explicit refusals: don't move ASML's
orbit, and don't carry `TST-03`/`VIS-04` forward un-resolved a third time
("That would defer the same broken sampler a third time.").

That ruling has now been implemented exactly as specified, and the sampler
is no longer broken — it finds valid points wherever the geometry allows
one, and honestly reports where it cannot. What remains is a different,
narrower question the ruling's own text does not settle: **given a
correctly-implemented sampler still cannot find a valid point for ASML,
does that residual, single-ticker, structurally-explained failure count as
closing this row (with the state honestly showing 7/8, occasionally 6/8),
or does it require an explicit, documented owner exception before `TST-03`
and `VIS-04` can be marked anything other than failing?**

I am not deciding this myself for two reasons. First, `TST-03` is
`critical` risk and both criteria gate financial/visual encoding
correctness — per this workflow's own boundary rule, correctness outranks
convenience, and a reviewer manufacturing a passing status for a criterion
whose literal text ("for every holding") is not met by the evidence would
be exactly the kind of self-authorized scope decision this workflow
reserves for the owner. Second, every acceptance of a section with a
residual failing critical/high criterion in this project's history (§10's
six carried criteria, §11's BLD-04 carry, §1's long-task exception) required
Devan's own explicit sign-off naming the exception — none was ever granted
unilaterally by a reviewer, and the owner explicitly refused the one
mechanism (`carried_by_owner`) this project has used for that pattern
before. Given he refused "carry," the available paths are (a) an explicit,
documented, non-generalizing owner exception (matching the §1 precedent's
shape, not the carry precedent's), or (b) something else only he can
specify — not a reviewer's unilateral pick between the two.

`TST-03` and `VIS-04` are recorded `blocked` in the ledger (unchanged status
from round 2 — still not `pass`, which the literal gate does not support;
still not `fail`, which would misrepresent a row whose method is now
correctly implemented and whose sole failure is fully explained and
reproducible; still not `carried_by_owner`, which the owner explicitly
refused as a resolution path for this exact row).

## All other criteria — unaffected by this turn's diff, reviewer status
unchanged from round 2

The diff touches only `scene-model.ts`'s trail-sample-search fractions and
`OrreryScene.tsx`'s one new data-attribute publish (see above) plus the
section's own scripts/evidence. No file backing `VIS-01` (FB-01 geometry),
`TST-01`/`VIS-02` (FB-05 type scale), `VIS-03` (FB-17 panel width),
`VIS-05` (FB-02 sky), `VIS-06`/`VIS-07` (FB-22/23), `BHV-01`/`VIS-08`
(FB-24), `VIS-09` (FB-25), `VIS-10` (FB-31), `MOB-01`, or `PRV-01` changed.
This turn's own independent `npm test`/`npm run build` runs re-cover
`TST-01`, `BHV-01`, `PRV-01`, `TST-02`, and `BLD-01` directly (all still
pass). The remaining visual criteria's round-2 reviewer verdicts stand
unchanged.

## Result

13 of 15 criteria: **pass** (unchanged from round 2). 2 criteria:
**blocked** (`TST-03`, `VIS-04`) — routed to Devan with a narrower, new
question than round 2's, since the owner's own method ruling has now been
implemented and independently confirmed correct; only the
accept-with-known-residual-failure decision remains open.

Routing to `stage: review` (unchanged), `role: claude_lead` (unchanged),
`status: blocked`, `next_actor: devan`.
