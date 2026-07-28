# Phase 10 §9 handoff: Devan (owner decision) → Claude Lead

Prepared July 28, 2026 by `claude/fable-5` (Cowork, owner-directed), resolving
the block recorded in
`docs/phase10-handoffs/2026-07-28-section-9-claude-lead-to-devan-blocked.md`.

## Outcome

Owner selected **option 1**: accept §9 at `589be88fa40bf42566c3834ae72fdd3923335511`
and let §10 own the texture work. §9 returns to `accept` stage.

## The decision

The review turn was correct on every point, including attribution. The two
failing tests in `planet-textures.test.ts` were broken by **owner texture
commits**, not by Codex:

| Failure | Criterion | Cause |
|---|---|---|
| `manifest.totalBytes` 22,450,706 > 15,000,000 | 55 | Owner raised `BYTE_BUDGET` 15 MB → 30 MB in `5ca385d` and regenerated |
| INTC 0.098092, CBRS 0.093008 < 0.1 `luminanceStdDev` | 48 | The halo/glow layer added behind each brand mark in `5ca385d` reduces local contrast around the mark |

Both were green at and through `589be88` (11.73 MB, min stdDev 0.101584). The
test file is unchanged since `bc1b79c`, and none of the owner commits touched
`src/`. `npm run build` is green throughout.

## Why §9 accepts at `589be88` rather than at HEAD

`589be88` is the last commit at which §9's implementation satisfies §9's own
acceptance criteria. Everything after it — `5ca385d`, `ced5bfd`, `f3e1294`,
`87bfc89` — is **owner-directed §10 work that landed early**, plus the roadmap
amendment that created §10. Accepting §9 at the commit where it was green is
the honest record; accepting it at HEAD would mean accepting a tree that fails
its own gates.

This mirrors §8's precedent, where the accepted commit was verified to be
identical under `src/` to the reviewed one, with the reasoning written into the
acceptance record rather than left implicit.

## Known-red state on `main`, and who owns it

`main` at HEAD carries **two failing tests**, both listed above, both
attributable to owner commits, both owned by §10:

- §10's spec already sets a **30 MB** ceiling (`PHASE10.md` §10, Build), which
  supersedes §9's 15 MB figure for the same directory. §10's implementation
  must update `planet-textures.test.ts` to that ceiling as part of its texture
  regeneration step.
- §10 relights the five dark worlds — **INTC and CBRS are both on that list**.
  The relight raises value structure, which raises `luminanceStdDev`. The
  criterion-48 failure is expected to resolve as a side effect, and §10 must
  verify that it does rather than assume it.

This is a deliberate, documented, time-boxed exception to the standing
"leave the repo green" rule, taken by the owner with the alternative
(reverting the textures) explicitly considered and declined — the owner wants
the composited brand marks visible while §10 is built, and §10 regenerates
those textures regardless, so a revert would remove working assets to buy
roughly three turns of green.

**Do not treat these two failures as new findings against §10's
implementation.** They are inherited, and closing them is §10 work item 5.

## What was verified before this decision

The review's F9 resolution was checked and stands:

- Pure model, independent sweep instrument, all 360 integer degrees at
  1440×900 on production weights: heaviest 64.27–71.21 px (midpoint 67.74
  against a ~68 target), smallest 25.73 px, belt span 88.001% constant,
  minimum spacing ratio exactly 1.600, zero clipped frames.
- Live at `127.0.0.1:3141`: 8/8 labels inside and none hidden, 8/8 planets
  inside, ASML mean 66.85 px, smallest CBRS 26.57 px, zero console errors.
- The gate now runs against a 26.5% fixture, below the 35% saturation point,
  so it can actually fail.
- The belt was not narrowed, the camera was not moved in, and D1's
  sign→colour mapping is untouched.

The reviewer's decision not to overwrite §9's `after/overview-1440x900.png` is
endorsed — any capture now renders round-3 textures, and filing that as §9's
"after" frame would misrepresent it. `claude-review/overview-1440x900-review-5.png`
stands as the record instead.

## For the next actor

Claude Lead, `stage: accept`. Accept §9 at `589be88fa40bf42566c3834ae72fdd3923335511`,
recording in the acceptance doc: the accepted commit and why it is not HEAD,
the two known-red tests with their attribution and their §10 owner, and F9's
verification evidence above.

Then initialize §10 (`PHASE10.md` §10, "Universe colour, material, and command
structure") at `stage: specify`. Its direction documents are
`UNIVERSE_IDEAS_3.md` and `UNIVERSE_PALETTE_3.html`, both committed, and its
ten carried owner defects are listed in `PHASE10.md` §10.

Do not chain stages — initializing §10's state is the full extent of the accept
turn.
