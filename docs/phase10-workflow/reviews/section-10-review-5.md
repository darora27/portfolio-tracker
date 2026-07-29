# Phase 10 §10 review, round 5 — FAIL, and §10 remediation is exhausted

Reviewer: `claude-code/opus-5` (Claude Lead). July 29, 2026.

- Candidate: `3d853411651217ef18e9480b725b3289848b4d27` — `phase10(§10): remediate
  trail width and mark chirality`, the HEAD at this turn's start.
- Prior review: `docs/phase10-workflow/reviews/section-10-review-4.md`.
- Owner triage approval:
  `docs/phase10-handoffs/2026-07-29-section-10-devan-to-codex-triage-approved.md`.
- Evidence: `docs/phase10-baseline/section-10/claude-review-5/`.
- Live rig: production build served by `npx next start -p 3141`, real GPU,
  headless Chromium from the repo's own Playwright, 1440×900.

## 1. Verdict

**FAIL.** Both owner-authorised bucket-A remediations changed the shipped
artifacts, and neither moved its own measurement out of failure.

`TST-03` and `DEF-02` remain red. `BLD-04` remains red at its owner-approved
bucket-B carry. `VIS-04`, `VIS-02` and `BHV-05` remain ungraded for the reasons
round 4 established. Nothing regressed: 71 of 77 criteria pass, the same 71 as
round 4.

The material finding is not that two fixes failed. It is that **round 4's
diagnosis of both bucket-A items is disproven by this round's measurements**, by
exactly the standard round 4 applied to round 3. Under the owner's bounded
triage rule, §10 remediation has stopped, so this review does not route another
remediation. It routes one decision to Devan.

## 2. Independent gates

Both run by the reviewer at the candidate, not carried from the implementer.

| Gate | Result |
|---|---|
| `npm test` | **PASS** — 99/99 files, 527/527 tests, zero failures |
| `npm run build` | **PASS** — exit 0, Next.js 16.2.11, route list unchanged, `/share` 200, Mission Control manifest 200 |
| `phase10:acceptance --require implementer` | **PASS** |
| Verifier integrity | `git diff 3bdf468 3d85341 -- docs/phase10-baseline/section-10/scripts/` is empty — every retained verifier ran unmodified |

Raw output: `claude-review-5/raw-gates.txt`.

§9's inherited red is closed at this candidate: `totalBytes` 22,803,051 against
§10's raised 30 MB ceiling, minimum `luminanceStdDev` 0.106628 (CBRS) against
the 0.1 floor, maximum `seamMaxDeltaE` 0.00.

## 3. F1 / `TST-03` — the fix landed; the attributed cause was wrong

`sample-live-rgb.mjs`, unmodified, still aborts:

```
Error: NBIS deltaE 33.123 > 8
```

The non-throwing full table shows the remediation **did** reach the render —
this is not a fix that failed to apply:

| Holding | round 4 ΔE | round 5 ΔE |
|---|---|---|
| IBM | 3.522 | **0.396** |
| CBRS | 2.103 | 2.103 |
| ASML, GOOG, COST, MSFT, INTC | 0 | 0 |
| **NBIS** | **33.846** | **30.522** |

Hue lock passes on all eight and same-direction magnitude ordering is monotonic.
Raising the taper floor from 0.45 to 0.85 widened every ribbon by 1.89× and
pushed IBM to near-zero. It moved NBIS by 3.3 ΔE out of 33.

### The measured mechanism

Round 4 attributed NBIS to *partial pixel coverage where the ribbon's projected
width falls under one pixel*. Three measurements refute that.

**The ribbon is not thin.** The raw red-channel cross-section perpendicular to
the ribbon at each published sample point (`raw-remediation-landed.json`):

```
INTC  expected #b3241d, model red 179
  8   8  23  69 100 130 130 130 186 154 195 179 179 179 179 179 179 179 168 [168] 179 179 179 179 182 154 130 130 100 68 38 7 7
NBIS  expected #b3241d, model red 179
  1   1   1   1   1   1   1   2  17  33  33  91  91  92  86 [93]  93  93  64  34  34   2   1   2   1   2   1   2   1  2  1 2 2
```

INTC — the same expected colour, the same verifier — shows a 14-pixel plateau at
exactly the model red. NBIS's ribbon is ~12 pixels wide and **peaks at 93 against
179**, with zero pixels anywhere in a 49-pixel cross-section within 2 of the
model. A partly-covered sub-pixel ribbon produces a thin bright line against the
void; this is a wide band that never reaches the colour. The opaque core is not
at this location at all — only the glow shoulders are.

**Nothing is drawn over it.** `elementsFromPoint` at NBIS's sample point returns
only the canvas over `MAIN` at `rgb(1,5,4)` — no scrim, no gradient, no
`mix-blend-mode`, no filter. The panel-free pixel is `#5d1511`, identical to the
shipped pixel (`raw-trail-overlay.json`).

**The trail itself is correct.** Searching NBIS's whole arc, the ribbon does
reach `#aa231b` — ΔE 3.44 from the model — 165 px along the arc from the
published sample point (`raw-trail-mechanism.json`). The material colour, the
colour management and the ramp are all right.

So `TST-03`'s remaining failure is a **registration error between the published
`data-trail-sample-x/y` and where the opaque core actually renders on the
outermost orbit** — not width, not colour, not texture. Round 3 blamed
sub-pixel width and nominated bucket C; round 4 disproved that via CBRS and
re-classified as bucket A on the same width theory; round 5 disproves the width
theory outright.

## 4. F3b / `DEF-02` — the fix landed; the verifier cannot see it

`capture-live-sphere-strip.mjs`, unmodified, still aborts on COST. The shipped
view still fails the same 6 of 8, with every margin moved by under 0.006 — the
known F3a panel occlusion, unchanged and still the owner-approved §11 carry.

The bucket-A half was MSFT and CBRS mark handedness. **The flop landed:**

- The generator's mark alpha changes by MAD 113.3 (MSFT) and 74.9 (CBRS) out of
  255 when `.flop()` is applied — a large change, not a subtlety.
- The shipped 32×16 base thumbnails changed for exactly those two worlds;
  untouched GOOG's is byte-identical at 0.000.
- Six KTX2 maps and the manifest chirality strings changed accordingly.

**The measurement did not follow:**

| World | r4 panel-free margin | r5 panel-free margin | texture flipped |
|---|---|---|---|
| ASML | 0.1575 | 0.1539 | no |
| GOOG | 0.0204 | 0.0184 | no |
| COST | −0.0354 | −0.0365 | no |
| IBM | 0.0453 | 0.0525 | no |
| INTC | 0.0693 | 0.0680 | no |
| NBIS | −0.0029 | −0.0029 | no |
| **MSFT** | **−0.6505** | **−0.6685** | **yes** |
| **CBRS** | **−0.9742** | **−0.9948** | **yes** |

The five untouched worlds drift 0.002–0.011 between rounds, which is this
measurement's noise floor. The two flipped worlds moved 0.018 and 0.021 — the
same order — **and did not invert sign**. Mirroring a mark must invert a
correlation that reads that mark. It did not.

The reason is visible in `panel-free-msft.png` and `panel-free-cbrs.png`: the
verifier's column-mean greyscale profile across the equatorial band is dominated
by macro terrain — continents, ring roads, grain — and the carved capital, which
`VIS-02` deliberately requires to share the terrain's lighting and be
edge-eroded, contributes at or below that noise.

**The correlation is not sensitive to mark handedness.** It therefore cannot
substantiate a pass *or* a fail for any world, and round 4's conclusion that
MSFT and CBRS "carry genuinely mirrored marks" is not supported. This is the
fourth consecutive round in which DEF-02 was attributed to texture generation
and a texture regeneration moved the number by less than the noise.

Round 4's own standing lesson applies to round 4: *a measurement can fail for
reasons unrelated to the thing being measured.*

## 5. F2 / `BLD-04` — owner-approved carry, measurement refreshed

`measure-long-tasks.mjs`, unmodified, five fresh 1440×900 CPU-2× contexts, not
baseline-subtracted: **65 / 57 / 58 / 58 / 57 ms**. Five of five breach the
50 ms ceiling, unmoved across five rounds (57–61, 56–62, 55–61, 56–60, 57–65).

Carried to §11, not closed, per the owner's approved triage. Refreshed here so
§11 acceptance attaches a current figure. No threshold weakened or subtracted.

## 6. No regressions

- `VIS-01`: all eight equatorial luminance means stay in the 0.16–0.55 window
  (0.2162–0.4619). CBRS moved 0.2639 → 0.3172 after its regeneration; no world
  approaches a bound.
- `DEF-03`: COST (null weekly) still samples the flat token `#e3b65c` at ΔE 0 —
  the 1.89× wider taper did not suppress the clamp-floor trail.
- `DEF-01`: trail-behind geometry green in the model test and visible in the
  round-5 overview capture.
- The remaining 51 passing criteria are carried unchanged from round 4 at
  `0ef1433`. Stated plainly rather than silently: the round-5 delta is confined
  to `trailRibbonHalfWidths`' taper floor, the MSFT and CBRS texture maps, and
  their tests. `git diff 0ef1433 3d85341 -- src/ scripts/` touches only
  `scene-model.ts`, `generate-planet-textures.mjs` and two test files. Those 51
  criteria do not depend on any of it. Each such ledger entry now says so.

## 7. Why this routes to Devan and not to another remediation

The owner's bounded triage rule (`SECTION_10_TRIAGE.md`, approved
2026-07-29) is explicit: after the next review turn, remediation on §10 stops.
That review was round 4; the owner approved exactly one bucket-A remediation;
this review grades it. There is no authorisation for a sixth round, and the rule
forbids self-authorising a bucket-C exception. `single_provider_mode` in state
also lists "weakening, redefining, or granting an exception to any gate" as
something that must not proceed without the second model.

So this turn stops at `status=blocked`, `next_actor=devan`, with no further
work performed and no gate touched.

### What the owner is being asked to decide

Both bucket-A items were classified achievable-inside-§10 on diagnoses that this
round's measurements disprove. Both now have a *new* mechanism that is measured
rather than argued, and neither new mechanism is the one that was authorised:

1. **`TST-03` / NBIS.** Not ribbon width. The published trail sample point and
   the rendered opaque core are not registered with each other on the outermost
   orbit. The fix would be in the sample-point projection or the ribbon's
   angular sweep, not in `trailRibbonHalfWidths`. Bounded and specific, but it
   is new work, and authorising it reopens §10.

2. **`DEF-02`.** Not the textures. The chirality correlation cannot discriminate
   handedness, demonstrated by flipping two marks and watching the score not
   move. Nothing in §10's scope makes this criterion measurable; a verifier that
   samples the mark directly — rather than a terrain-dominated equatorial column
   profile — would be new verifier work, which this section's rules put outside
   a review's authority to design or a remediation's authority to introduce.

3. **`BLD-04`, `F3a`, `VIS-02`, `BHV-05`** are unchanged and remain the
   owner-approved §11 carries. They need no new decision.

A note on cost, since the owner's `single_provider_mode` record budgets the
remaining OpenAI credits on the premise that "§10's two authorised bucket-A
fixes" finish the section: that premise no longer holds. Neither fix worked, and
`activate_when` is written as "§10 is accepted."

The reviewer makes no recommendation between reopening §10, carrying these two
to §11 alongside the existing carries, or recording exceptions. Each is a scope
decision, and the triage rule reserves it to the owner.

## 8. Mid-turn repository event, recorded

This turn's preflight found a clean tree at `3d85341` and a valid
`PHASE10_LOCK` with `owner=claude`. While the review's live measurements were
running, commit `c0beef68` — `owner: single-provider mode for the OpenAI outage,
armed but not active` — was authored by Devan against the same working tree. It
swept this review's then-uncommitted round-5 evidence files into itself along
with the owner's own changes.

Recorded, not corrected. Nothing was reverted or rewritten. The consequences for
this review:

- `c0beef68` changes no application source:
  `git diff --name-only 3d85341 c0beef68 -- src/ public/ scripts/ package.json package-lock.json`
  is empty. The candidate under review is unaffected and remains `3d85341`.
- `single_provider_mode.active` is `false` and `stage`/`role`/`next_actor` were
  not changed, so this turn's mandate is unchanged.
- Part of this review's evidence therefore has `c0beef68` as its commit rather
  than this review commit. The files are the ones this turn produced.

`G-SERIAL` assumes one actor at a time. It held for agents; the owner wrote to
the tree concurrently. Worth avoiding, because a mid-turn commit could as easily
have landed on a file the turn was mid-write on.
