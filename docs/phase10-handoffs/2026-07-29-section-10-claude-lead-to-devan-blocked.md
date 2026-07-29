# Phase 10 §10 handoff: Claude Lead → Devan, triage classification

Prepared July 29, 2026 by `claude-code/opus-5`.

## Outcome

Blocked — see **Decision needed**. Round-4 review FAILED with three findings.
This is the review turn `docs/phase10-workflow/SECTION_10_TRIAGE.md` names, so
remediation on §10 stops here and every open finding is classified for your
approval.

## What this turn did

A full independent review of candidate `0ef1433`, then the bounded triage.

**The live matrix ran.** Chromium launched normally from the repo's own
Playwright against a real GPU, so the `MachPort 1100` block Codex hit does not
apply to this host. Every verifier ran unmodified — `git diff 3bdf468 HEAD --
docs/phase10-baseline/section-10/scripts/` is empty.

Files touched: the round-4 review document, the acceptance ledger's reviewer
column, this handoff, `PHASE10_STATE.json`, the regenerated context, and the new
evidence directory. **No application source changed.**

## Evidence

- Candidate commit: `0ef1433b51e18d772156ccc8be9d3ed077bc6d34` — *owner(§10):
  bounded triage rule — stop remediating after the next review*. Application
  source is byte-identical to the round-3 remediation `6388123` you routed here.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-10.json` —
  reviewer column complete. **71 pass, 3 fail, 3 blocked, 0 not_run.**
- Tests: `npm test` — independent review run, 99/99 files, **527/527**, 0 failures.
- Build: `npm run build` — exit 0, route list unchanged, `/share` 200 and Mission
  Control manifest 200.
- Screenshots and raw output: `docs/phase10-baseline/section-10/claude-review-4/`
  (five probe scripts and their raw JSON, plus all 16 regenerated `after/`
  surfaces and both `mobile/` captures).
- Review doc: `docs/phase10-workflow/reviews/section-10-review-4.md`
- Inherited red: none. §9's inherited red stays closed.

## What moved

**F4 / `VIS-12` is closed.** All seven bays now render their question exactly
once, and the contribution numerals keep 0 px overlap with their bars across all
13 rows.

**F1 / `TST-03` nearly closed.** Round 3 failed 7 of 8 holdings; round 4 fails 1.
Five holdings now sample at ΔE **exactly 0**. Ordering is monotonic and ASML's
misplaced sample point is fixed. Only NBIS fails.

**Every criterion that had never been performed is now graded** — all fifteen of
them, including the belt bodies, the sun/ASML occlusion, the radar encoding, the
Mission Control layout and word budget, texture streaming, and the cursor
exhaust. Privacy was re-checked live as well as by canary: an owner cookie
presented to `/share` returns a byte-identical public response.

## The one thing worth your attention

`DEF-02`'s chirality gate has failed for three rounds and been blamed on texture
generation. It is not a texture problem.

The verifier crops at the planet's published centre. At the approach camera the
opaque holding inspector covers **96.8–100%** of the band it samples for the six
failing worlds — MSFT's crop is the SCOPE chart and TELEMETRY row, with no planet
pixel in it. That is why regenerating all 24 texture maps moved the numbers by
less than 0.02.

The published geometry is correct: with overlays hidden, MSFT renders exactly
where the scene says it does. The planet is simply underneath the panel.

This is also a product fact, not only a measurement one. §10's carved brand marks
sit on the hemisphere facing the camera, and for six of eight holdings that
hemisphere is behind the panel. It is the same thing you reported as *"the planet
panel is slightly too big."*

Recomputed with the panel out of the way, two of the six failures reverse to
pass — but MSFT and CBRS still fail decisively, so a genuine mirrored mark exists
underneath the contamination.

## Route after this handoff

- Section: `§10`
- Stage: `review`
- Role: `claude_lead`
- Status: `blocked`
- Next actor: `devan`

## Decision needed

The classification below is handed to you. **No exception was self-authorised, no
gate was weakened, redefined, or baseline-subtracted, and no criterion was moved
to a bucket without the evidence the triage rule requires.**

### Bucket A — achievable inside §10

| Finding | Why |
|---|---|
| **F1 / `TST-03`** — NBIS trail pixel | One holding. Its 9×9 neighbourhood is a uniform field at 0.52× the model colour with hue lock passing: partial pixel coverage on the outermost orbit. The fix already exists in the code — `trailRibbonHalfWidths`' taper floor closed six holdings this round — and needs to reach one more orbit. **Round 3's bucket-C nomination is disproven:** CBRS, the holding it named as structurally impossible, now passes at ΔE 2.10. |
| **F3b / `DEF-02`** — MSFT and CBRS marks | Panel-free, these two still fail at −0.519/+0.132 and −0.595/+0.380 with strong signal. Genuinely mirrored. Bounded texture work. |

### Bucket B — belongs to §11, carried not closed

| Finding | Named §11 work that resolves it |
|---|---|
| **F2 / `BLD-04`** — 56–60 ms long task | *"Remove the embedded legacy dashboard … deleted, not restyled, and takes its Recharts instances with it,"* plus pausing the off-screen radar and lazy-mounting below-fold sections. That removes exactly the material and program permutations round 3's CPU profile named. Four attempts against a correct attribution have not moved it. |
| **F3a / `DEF-02`** — panel-occluded measurement | *"The planet panel, rebuilt. The planet stays visible on the left; the panel occupies a fixed rail on the right and is smaller than the mock's."* Once the planet is not behind the panel, `DEF-02`, `VIS-02` and `BHV-05` all become measurable in the shipped view. |

### Bucket C — none

§10 ends with no criterion demonstrated to be unsatisfiable. The one candidate
round 3 proposed was tested this round and did not hold up.

### What I need from you

1. **Approve or amend the classification.**
2. **If approved, authorise one bounded bucket-A remediation:** the NBIS trail
   width floor, and MSFT/CBRS mark chirality. Both have a named mechanism; this
   is not an investigation.
3. **Decide whether §11 formally adopts F2 and F3a into its acceptance
   criteria.** The triage rule requires that a bucket-B finding be added to §11's
   acceptance rather than dropped.
4. Note that `VIS-04`, `VIS-02` and `BHV-05` are blocked only as consequences of
   the above and are not separate work.

Why this turn could not resolve it itself: the triage rule reserves the
classification decision, any bucket-B adoption into §11, and any further
remediation authorisation to you, and explicitly forbids the triage turn from
self-authorising an exception.
