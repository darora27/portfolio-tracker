# Phase 10 §9 — acceptance record

Accepted by: `claude-code/opus-5` (Claude Lead, `accept` stage), July 28, 2026.

## Result: ACCEPTED at `589be88`, under an explicit owner decision

§9 "Universe craft and depth" is accepted at
`589be88fa40bf42566c3834ae72fdd3923335511` —
`phase10(§9): remediate production-weight planet scale`.

This acceptance does **not** rest on a PASS review doc, and that deviation is
deliberate and recorded here rather than glossed. The latest and authoritative
review for §9 is `docs/phase10-workflow/reviews/section-9-review-5.md`, whose
recorded result is **BLOCKED — owner decision required**, not `pass`. Review 5
resolved the last open finding against the implementation (F9) and then stopped,
because three §9 acceptance criteria were red on the tree for a cause outside
the implementation under review.

Devan resolved that block by owner decision on July 28, 2026, recorded in
`docs/phase10-handoffs/2026-07-28-section-9-devan-to-claude-lead-resume.md` and
in `PHASE10_STATE.json`'s `section.owner_decision`: **Option 1 — accept §9 at
`589be88` and let §10 own the texture work.** The owner's decision is the
authority under which this turn accepts; the standing `accept`-stage
precondition ("the latest review doc must read `pass`") is satisfied in
substance — zero findings remain against §9's implementation — but not in form,
and the form matters enough to state plainly.

## Why the accepted commit is not HEAD

HEAD at this acceptance turn is `dd20717` (`owner(§9): accept at 589be88, §10
owns the texture regressions`). §9 is accepted five commits behind it.

`589be88` is the last commit at which §9's implementation satisfies §9's own
acceptance criteria. Every commit after it is owner-directed work, not
implementation:

| Commit | Subject | Nature |
|---|---|---|
| `6ee69a8` | `chore: real brand marks…` | owner |
| `ced5bfd` | `chore: regenerate planet textures with real composited brand marks` | owner |
| `5ca385d` | `chore: halo-backed brand marks and a texture budget that fits them` | owner — **breaks criteria 48 and 55** |
| `f3e1294` | `owner: round-3 colour design, protected brand marks, regenerated textures` | owner |
| `87bfc89` | `owner: insert §10 Universe colour and material, renumber §11–§16` | roadmap amendment creating §10 |
| `11b7e19` | `phase10(review §9): blocked on owner texture commits…` | review-only |
| `dd20717` | `owner(§9): accept at 589be88…` | the owner decision this turn executes |

Accepting at HEAD would mean accepting a tree that fails its own gates.
Accepting at `589be88` records what §9 actually built.

**The implementation is identical either way.** Verified independently by this
turn: `git diff --name-only 589be88 HEAD -- src/` is **empty**. Not one line of
application source changed between the accepted commit and HEAD. The geometry,
scene model, and every behavior §9 was reviewed on are byte-identical at both.
The five owner commits touch only `public/textures/planets/`,
`assets/planet-textures/marks/`, and documentation. This follows §8's precedent,
where the accepted commit was likewise verified `src`-identical to the reviewed
one with the reasoning written into the acceptance record.

## Verification at acceptance, re-run independently on the current tree

Run by this turn, not carried over from any prior turn's claim:

- `npm run build`: **PASS.** Next.js 16.2.11 production build compiled; 18
  static-page tasks completed; 24 route entries emitted with `/` and `/share`
  both still dynamic; post-build smoke `Share route smoke: PASS (/share 200;
  Mission Control manifest 200)`.
- `npm test`: **FAIL — 2 failed / 497 passed of 499**, 1 failed test file of 94.
  Both failures are in `src/lib/observatory/planet-textures.test.ts` and are the
  two known, owner-caused, §10-owned regressions described below. No other test
  fails.

The repository is therefore accepted **red on `npm test`** — the first section
in Phase 10 accepted in that state. See "Known-red state" below for the owner's
explicit authorization and rationale.

### Criteria 48 and 55 verified green at the accepted commit

This turn confirmed independently — not on the review's word — that the two red
assertions pass at `589be88`, by reading the manifest and the on-disk tree at
each commit directly:

| Measurement | `589be88` (accepted) | `HEAD` (`dd20717`) |
|---|---|---|
| `texture-manifest.json` `totalBytes` | 11,727,680 — **≤ 15,000,000 ✓** | 22,450,706 — **over by 49.7% ✗** |
| Git tree bytes under `public/textures/planets` | 11,727,680 (33 files) — matches manifest exactly | 22,450,706 (33 files) — matches manifest exactly |
| Minimum `luminanceStdDev` | 0.101584 (CBRS) — **≥ 0.1 ✓** | 0.093008 (CBRS) — **✗** |
| Tickers below the 0.1 floor | **none** | INTC 0.098092, CBRS 0.093008 |

All three assertions in the failing test file therefore pass at `589be88`,
including the `directoryBytes === manifest.totalBytes` equality. The remaining
93 test files depend on `src/`, which is identical at both commits. §9's
criterion 53 (`npm test` and `npm run build` green) held at the accepted commit.

## Known-red state on `main`, and who owns it

Two failing assertions, both attributable to owner commits, both owned by §10:

1. **Criterion 55** — on-disk texture total 22,450,706 > 15,000,000. Caused by
   the owner raising `BYTE_BUDGET` 15 MB → 30 MB in `5ca385d` and regenerating.
   `PHASE10.md` §10's Build dimension already states the payload is measured
   "against a **30 MB** ceiling," which supersedes §9's figure for the same
   directory. §10 must update `planet-textures.test.ts` to that ceiling as part
   of its texture-regeneration step. 22.45 MB is comfortably inside 30 MB.
2. **Criterion 48** — INTC `luminanceStdDev` 0.098092 and CBRS 0.093008, below
   the 0.1 floor. Caused by the halo/glow layer added behind each brand mark in
   `5ca385d`, which reduces local contrast around the mark. INTC and CBRS are
   both on §10's relight list; raising value structure is expected to resolve
   this, and **§10 must verify that it does rather than assume it**.

Together these break criterion 53. `planet-textures.test.ts` has not been
modified since `bc1b79c` — the owner's commits changed the textures the test
measures without changing the test.

**These are inherited, not defects in §10's implementation. Do not raise them as
findings against §10's implementer. Closing them is §10 work item 5.**

This is a deliberate, documented, time-boxed exception to the standing "leave
the repo green" rule, taken by the owner with the alternative (reverting the
texture commits to restore the 11.73 MB set) explicitly offered and declined:
the owner wants the composited brand marks visible while §10 is built, and §10
regenerates those textures regardless, so a revert would remove working assets
to buy roughly three turns of green. **No precedent** — this does not generalize
to any future section, and §10 closes it.

## F9 verification evidence carried into the record

F9 was the last open finding against §9's implementation. It required the
OVERVIEW composition to satisfy criterion 18 on the *production* weight
distribution while criterion 17 and spec §4.2's spacing rule continued to hold,
and required the gate to be moved somewhere it can actually fail. Review 5
verified it twice, independently of Codex:

| Criterion | Requirement | Model, 360° sweep | Live, 24 samples at 1440×900 | Result |
|---|---|---|---|---|
| 1 | Eight tags legible at rest, fully inside frame | 0 clipped label frames in 360 | 8/8 inside, 0 hidden | **PASS** |
| 17 | Belt spans 85–92% of viewport width; nothing clipped | 88.001% constant; 0 clipped planet frames in 360 | 8/8 planets inside | **PASS** |
| 18 | Heaviest ≈ 68 px; lightest ≥ 22 px | 64.27–71.21 px (midpoint 67.74); smallest 25.73 px | ASML mean 66.85 px; smallest CBRS 26.57 px | **PASS** |
| spec §4.2 | Ring spacing ≥ 1.6× adjacent radius sum | exactly 1.600 at every phase | — | **PASS** |

Both binding constraints held: the belt was not narrowed and the camera was not
moved in (span unchanged at 88.00% from review 4), and no criterion was traded
against another. The gate is no longer pinned at saturation — the fixture's
heaviest weight is 26.5%, strictly below the 35% `MAX_WEIGHT` at which
`radiusForWeight` saturates, so it can now fail on a regression. D1's
trail/orbit sign→colour and sign→direction mapping is untouched (zero
colour/hex/sign/direction hits in the full `589be88` source diff).

Retained evidence:

- `docs/phase10-baseline/section-9/claude-review/raw-overview-fit-review-5.json`
- `docs/phase10-baseline/section-9/claude-review/overview-1440x900-review-5.png`
  (`sips`-verified 1440×900, zero console errors)

## The outstanding `after/` frame

`docs/phase10-baseline/section-9/after/overview-1440x900.png` is **still the
pre-F7 frame** and is deliberately not recaptured. Any capture now renders the
owner's round-3 textures from `f3e1294`, which are §10 work in flight; filing
that as §9's "after" image would misrepresent §9's accepted state. The owner
endorsed this decision explicitly. `claude-review/overview-1440x900-review-5.png`
stands as §9's visual record instead, labelled for what it is, and §10's own
1440×900 evidence requirement supersedes the frame.

## Section history

§9 ran one implementation round, five review rounds, four remediation rounds,
and one owner decision. Findings F1–F6 (review 1), F7 (review 2), F8 (review 3)
and F9 (review 4) were each resolved and independently confirmed; review 5
closed F9 and blocked on the owner texture commits. Full detail in
`section-9-review.md` through `section-9-review-5.md` and in
`PHASE10_STATE.json`'s `section.resolved_findings`.

Two owner observations remain carried forward unclosed from §8 and are not §9
defects: **D1** (unreproduced green-trail report — do not change colour logic
until a contradicting ticker is named) and **D2** ("website is still relatively
confusing"). Ten further owner defects reported live against §9 are recorded in
`PHASE10.md` §10's "Owner defects to close in this section" rather than
reopening §9.

## Next

§10 "Universe colour, material, and command structure" is initialized at
`stage: specify`, `role: claude_lead`, `next_actor: claude`. Its authoritative
direction documents are `UNIVERSE_IDEAS_3.md` (round-3 design, revision 2) and
`UNIVERSE_PALETTE_3.html`, both committed. No §10 work was done in this turn —
initializing its state is the full extent of the accept turn.

— acceptance recorded by claude-code/opus-5
