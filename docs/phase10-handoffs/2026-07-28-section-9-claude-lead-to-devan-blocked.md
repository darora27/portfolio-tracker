# Phase 10 §9 handoff: Claude Lead → Devan, blocked

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

blocked — see Decision needed.

**The good news first: F9 is resolved.** The OVERVIEW composition now satisfies
criteria 1, 17 and 18 on the real production weights, verified twice
independently of Codex — in the pure model across a full 360° orbital sweep,
and live at exactly 1440×900 against a production server I started myself.
That was the last open finding on §9's own implementation.

**The blocker is not in the implementation.** `npm test` is red at HEAD
(2 failed / 497 passed of 499) because your four texture commits landed on top
of the reviewed implementation and break two §9 acceptance criteria that §10
was chartered to redefine.

## What this turn did

- Verified F9 independently: my own 360° sweep instrument against
  `buildOverviewSceneModel` (written, run, then deleted), plus the retained
  live measurement script at 1440×900, 24 samples, against a real production
  server on `127.0.0.1:3141`.
- Captured the current OVERVIEW frame and raw live measurement into
  `docs/phase10-baseline/section-9/claude-review/` (review-5 files).
- Traced the two test failures commit by commit to their origin.
- Wrote `docs/phase10-workflow/reviews/section-9-review-5.md`.
- Changed no application source. Changed no acceptance criterion, no test, and
  no texture.

## Evidence

- Reviewed implementation commit: `589be88` —
  `phase10(§9): remediate production-weight planet scale` (8 lines of source
  across `orrery.ts`, plus test changes)
- HEAD at review: `87bfc89` — `owner: insert §10 Universe colour and material`
- Tests: **FAIL** — 2 failed / 497 passed of 499, both in
  `src/lib/observatory/planet-textures.test.ts`
- Build: PASS — Next.js 16.2.11, TypeScript clean, 23 route tasks, post-build
  smoke `/share` 200 and Mission Control manifest 200
- Live evidence:
  `docs/phase10-baseline/section-9/claude-review/raw-overview-fit-review-5.json`,
  `docs/phase10-baseline/section-9/claude-review/overview-1440x900-review-5.png`
  (`sips`-verified 1440×900, zero console errors)
- Review doc: `docs/phase10-workflow/reviews/section-9-review-5.md`

### F9 result

| Criterion | Model, 360° sweep | Live, 24 samples | Result |
|---|---|---|---|
| 1 — eight tags legible at rest, inside frame | 0 clipped label frames | 8/8 inside, 0 hidden | PASS |
| 17 — belt 85–92% of width, nothing clipped | 88.001% constant, 0 clipped | 8/8 planets inside | PASS |
| 18 — heaviest ≈68 px, lightest ≥ 22 px | 64.27–71.21 px; smallest 25.73 px | ASML mean 66.85 px; smallest CBRS 26.57 px | PASS |
| spec §4.2 — spacing ≥ 1.6× adjacent radius sum | exactly 1.600 at every phase | — | PASS |

The belt was not narrowed and the camera was not moved in. Trail/orbit
sign→colour and sign→direction (D1) are untouched.

## Decision needed

### The blocker

Two assertions in `src/lib/observatory/planet-textures.test.ts` fail at HEAD:

1. `luminanceStdDev` — INTC 0.098092 and CBRS 0.093008, against a ≥ 0.1 floor.
   This is §9 **criterion 48**.
2. On-disk texture total — **22,450,706 bytes** against a ≤ 15,000,000 cap.
   This is §9 **criterion 55**. (The manifest total and the on-disk total still
   match each other exactly; only the cap is exceeded.)

Together they break §9 **criterion 53** (`npm test` green).

Both were green at and through the reviewed implementation commit `589be88`
(11,727,680 bytes, minimum stdDev CBRS 0.101584) and broke at your
`5ca385d` "chore: halo-backed brand marks and a texture budget that fits them",
which took the directory to 22,660,766 bytes. `f3e1294` kept it at 22,450,706.
The test file itself has not changed since `bc1b79c`. None of your four commits
touched `src/`.

### Why it needs you and not Codex

`PHASE10.md` §10's Build dimension already says the texture payload is
"measured at each regeneration gate against a **30 MB** ceiling", and §10's
step 5 is texture regeneration to relight the dark worlds into a measured
luminance window. The shipped 22.45 MB is comfortably under §10's ceiling and
50% over §9's. Your commit subject — "a texture budget that fits them" — reads
like that call was already made; it just was not recorded in §9's criteria or
test.

So the repository currently states two different binding numbers for the same
directory, and I would have to pick one to close §9. Sending it to Codex as a
§9 finding would fault the implementer for your commits and duplicate work §10
will redo anyway. Changing the criterion myself is not authorized.

### Options

1. **Accept §9 against `589be88` and carry the texture regressions into §10.**
   §9's own implementation satisfied every criterion including 48, 53 and 55;
   the red tests belong to §10's chartered scope and its 30 MB ceiling. If you
   pick this, say so explicitly and I will record §9 accepted at `589be88` with
   the two red assertions named as §10's opening work — but note the repo will
   sit with `npm test` red until §10 fixes it, which no prior section has done.
2. **Amend §9's criteria 48 and 55 to §10's numbers now** (30 MB ceiling, and a
   luminance floor consistent with §10's `[0.16, …]` window), update the test
   accordingly, then re-review. This is an owner amendment to accepted criteria,
   so it needs your explicit direction; I will not infer it.
3. **Revert the texture commits until §10 runs**, restoring the 11.73 MB set,
   accept §9 clean, then land round-3 textures inside §10 where their budget and
   luminance window are defined together. Cleanest test history; costs you the
   textures in the working tree for now.

My recommendation: **option 1**, with §10 opening on the texture work. It is
honest about what §9 built, it does not rewrite accepted criteria after the
fact, and the fix is already the first thing §10 does. Option 3 is the right
call instead if you want `main` green at every commit.

### One smaller thing to fold into your decision

`docs/phase10-baseline/section-9/after/overview-1440x900.png` is still the
pre-F7 frame. I did not overwrite it, because any capture now shows your
round-3 textures — §10 work in flight — and filing that as §9's "after" image
would misrepresent §9's state. My current frame is in `claude-review/` instead.
Whichever option you choose, tell me whether §9's `after/` frame should be
recaptured at the accepted composition or left for §10 to supersede.

## For the next actor

`PHASE10_STATE.json` is `status: blocked`, `next_actor: devan`, stage still
`review` for §9. Nothing proceeds until you choose one of the three options
above. When you do, the runner can hand back to Claude Lead (`review` →
`accept`, or `review` → `remediate` if you pick option 2) or to Codex.
