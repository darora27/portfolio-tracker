# Phase 10 §10 handoff: Claude Lead → Devan, blocked after review round 5

Prepared July 29, 2026 by `claude-code/opus-5`.

## Outcome

Blocked — see Decision needed.

Review round 5 FAILS. Both bucket-A remediations you authorised reached the
shipped artifacts, and neither moved its measurement out of failure. In both
cases the round-4 diagnosis that justified calling them bucket A is disproven by
this round's measurements. Your bounded triage rule stopped §10 remediation
after the round-4 review, so this turn routes one scope decision to you rather
than a sixth remediation round. No exception is recorded or self-authorised and
no gate is weakened.

## What this turn did

Graded candidate `3d85341` against the full §10 acceptance ledger. Filled only
reviewer results. Changed no application source.

- Ran `npm test` and `npm run build` independently — both green.
- Ran every relevant retained §10 verifier unmodified.
- Wrote three new review-only probes to test round 4's two mechanisms, after
  both authorised fixes came back unmoved.
- Recorded a mid-turn repository event (below), corrected nothing.

## Evidence

- Candidate commit: `3d853411651217ef18e9480b725b3289848b4d27` —
  `phase10(§10): remediate trail width and mark chirality` — graded by
  claude-code/opus-5.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-10.json`,
  reviewer column filled; `candidate_sha` set to the candidate. 71 pass, 3 fail,
  3 blocked — the same distribution as round 4.
- Tests: `npm test` — independent review run — 99/99 files, 527/527 tests, zero
  failures.
- Build: `npm run build` — exit 0, Next.js 16.2.11, route list unchanged,
  `/share` 200, Mission Control manifest 200.
- Review doc: `docs/phase10-workflow/reviews/section-10-review-5.md`.
- Evidence directory: `docs/phase10-baseline/section-10/claude-review-5/`
  (README indexes every file and probe).
- Verifier integrity: `git diff 3bdf468 3d85341 --
  docs/phase10-baseline/section-10/scripts/` is empty.
- Inherited red: none. §9's two carried failures are closed at this candidate —
  `totalBytes` 22,803,051 against the raised 30 MB ceiling, minimum
  `luminanceStdDev` 0.106628 against the 0.1 floor.

## The two results you need

### F1 / `TST-03` — the fix landed, the attributed cause was wrong

The taper floor did rise and it did reach the render: every ribbon widened
1.89×, and IBM improved from ΔE 3.522 to 0.396. NBIS moved 33.846 → 30.522 and
the verifier still aborts at ΔE 33.123.

Round 4 said NBIS was a sub-pixel ribbon partly covering its pixel. It is not.
The raw cross-section perpendicular to the ribbon at NBIS's published sample
point is a ~12-pixel band that peaks at red **93** against the model's **179**,
with zero pixels within 2 of the model anywhere across 49 pixels. INTC — same
expected colour, same verifier — shows a 14-pixel plateau at exactly 179. A
partly-covered thin ribbon gives a bright line against the void; this is a wide
band that never reaches the colour, so the opaque core is not there at all.

Nothing is drawn over it — `elementsFromPoint` returns only the canvas over
`MAIN`, and the panel-free pixel is identical to the shipped one. And the same
NBIS arc *does* reach ΔE 3.44 of the model, 165 px away along the arc.

So the real mechanism is a **registration error between the published
`data-trail-sample-x/y` and where the opaque core renders on the outermost
orbit** — in the sample-point projection or the ribbon's angular sweep, not in
`trailRibbonHalfWidths`.

### F3b / `DEF-02` — the fix landed, the verifier cannot see it

The flop landed: it changes the generator's mark alpha by MAD 113.3 (MSFT) and
74.9 (CBRS) out of 255, the two shipped thumbnails changed while untouched
GOOG's is byte-identical at 0.000, and six KTX2 maps changed.

The panel-free chirality margin moved 0.018 (MSFT) and 0.021 (CBRS). The five
untouched worlds drift 0.002–0.011 between rounds. The two flipped worlds moved
the same amount as the noise **and did not invert sign**. Mirroring a mark must
invert a correlation that reads that mark.

The verifier's column-mean greyscale profile across the equatorial band is
dominated by macro terrain, and the carved capital — which `VIS-02` deliberately
requires to share the terrain's lighting and be edge-eroded — sits at or below
that noise. The correlation cannot discriminate handedness, so it substantiates
neither a pass nor a fail, for any world.

This is the fourth consecutive round in which `DEF-02` was attributed to texture
generation and a texture regeneration moved the number by less than the noise.
Your own round-4 standing lesson applies to round 4: a measurement can fail for
reasons unrelated to the thing being measured.

## Unchanged — no decision needed

- **F2 / `BLD-04`**: 65/57/58/58/57 ms against the unchanged 50 ms ceiling, five
  of five breaching, unmoved across five rounds. Still your approved §11 carry;
  measurement refreshed at this candidate so §11 acceptance attaches a current
  figure.
- **F3a**, with `VIS-02` and `BHV-05`: shipped-view chirality still fails the
  same 6 of 8 with margins moved under 0.006; the inspector still covers
  96.8–100% of the sampled band. Still your approved §11 carry.
- **No regressions**: `VIS-01` all eight equatorial means in the 0.16–0.55
  window, `DEF-03` flat token at ΔE 0, `DEF-01` trail-behind intact.

## Mid-turn repository event

Preflight found a clean tree at `3d85341` and a valid `PHASE10_LOCK` with
`owner=claude`. While this review's live measurements were running, your commit
`c0beef68` (`owner: single-provider mode…`) landed on the same tree and swept
this review's then-uncommitted round-5 evidence into itself.

Recorded, not corrected — nothing reverted or rewritten. It does not affect the
verdict: `c0beef68` changes no application source, `single_provider_mode.active`
is `false`, and `stage`/`role`/`next_actor` were unchanged. Some of this
review's evidence simply carries your commit rather than this one.

Flagging it because `G-SERIAL` assumes one writer at a time. It held for the
agents; a mid-turn commit could as easily have landed on a file this turn was
mid-write on.

## Route after this handoff

- Section: `§10`
- Stage: `review`
- Role: `claude_lead`
- Status: `blocked`
- Next actor: `devan`

## Decision needed

Both bucket-A items were classified achievable-inside-§10 on diagnoses this
round disproves. Both now have a *new*, measured mechanism, and neither is the
one you authorised. Two calls:

**1. `TST-03` / NBIS.** The fix is bounded and specific — sample-point
registration on the outermost orbit — but it is new work, and authorising it
reopens §10 for a sixth round. Options: authorise it as bounded new work inside
§10; carry it to §11 with the measurement attached; or record an exception with
the full measurement retained. It does not qualify as bucket C on the evidence:
the criterion is clearly satisfiable, since seven of eight holdings satisfy it
and NBIS's own arc reaches ΔE 3.44 of the model 165 px from the sample point.

**2. `DEF-02`.** Nothing inside §10's scope makes this criterion measurable. A
verifier that samples the mark directly instead of a terrain-dominated
equatorial column profile would be new verifier work — which a review may not
design and a remediation may not introduce. This is the closest thing §10 has
produced to a genuine bucket-C candidate, but on a different basis than round 3
argued: not "the criterion is unsatisfiable" but "the declared verifier cannot
measure it." That distinction is yours to rule on.

**Why this turn could not resolve either itself.** Your triage rule stopped §10
remediation after the round-4 review and reserves bucket assignment and any
exception to you; `single_provider_mode` separately lists granting a gate
exception as something that must not proceed without the second model. A review
may not introduce criteria or verifiers. So the honest move is to hand you two
measured mechanisms and no self-authorised scope change.

**One planning note.** `single_provider_mode.activate_when` reads "§10 is
accepted," and its reasoning spends the remaining OpenAI credits on the premise
that §10's two authorised bucket-A fixes finish the section. Neither worked, so
that premise no longer holds and the activation trigger may need revisiting
alongside these two decisions.
