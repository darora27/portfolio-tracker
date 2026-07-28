# Phase 10 §9 handoff: Claude Lead review → Codex Implementation, remediation 3

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

Review returned 1 bounded finding. **F7 is resolved and confirmed live.** One
new bounded finding, **F8**, against acceptance criterion 18.

## What this turn did

Changed no application source. Verified the F7 remediation at commit `78da83f`
against the spec's acceptance criteria only, running `npm test` and
`npm run build` myself and performing the live 1440×900 measurement that the
prior turn's environment blocked.

Files touched: `docs/phase10-workflow/reviews/section-9-review-3.md` (new),
`PHASE10_STATE.json`, this handoff, and three review-evidence files under
`docs/phase10-baseline/section-9/`.

## Evidence

- Reviewed commit: `78da83f16c0f4bbb0b6dc6962186a92f8501285c` —
  `phase10(§9): remediate overview viewport fit`
- Tests: `npm test` PASS — 94 test files, 499/499 tests
- Build: `npm run build` PASS — Next.js 16.2.11, TypeScript clean, 18
  static-generation tasks, post-build smoke `Share route smoke: PASS (/share
  200; Mission Control manifest 200)`
- Live measurement: `docs/phase10-baseline/section-9/scripts/measure-overview-fit.mjs`
  (`node --check` passes), raw output
  `docs/phase10-baseline/section-9/claude-review/raw-overview-fit-review-3.json`
- Screenshot: `docs/phase10-baseline/section-9/claude-review/overview-1440x900-review-3.png`,
  `sips`-verified at exactly 1440×900
- Review doc: `docs/phase10-workflow/reviews/section-9-review-3.md`

## F7 — resolved

Measured live at exactly 1440×900, 24 samples over 12 seconds, against a
production server I started myself: **8/8 tags and 8/8 planets fully inside the
viewport**, zero hidden labels, zero console errors. `NBIS`, previously at label
bottom 935 and label left −8 with its sphere 10 px off the left edge, is now
wholly inside. Criterion 1 passes; criterion 17's clipping clause passes.

Criterion 17's belt-span clause also passes and is now genuinely assertable —
`belt.viewportSpanPct` is computed from the real projection at **88.00%**
(86.4 → 1353.6 px). I confirmed the live renderer actually sits at that fitted
camera rather than merely being described by it: the rendered sun disc measures
55 px across, giving 21.5 px per world unit against 21.97 predicted from the
descriptor — 2% agreement.

The new tests are real coverage: a 360-step orbital phase sweep asserting every
planet and label bounding box against the frame, and a parity test that projects
through an actual three.js `PerspectiveCamera` and matches the pure model to
eight decimals. Neither is a constant checked against itself.

## For the next actor

`PHASE10_STATE.json` is at `stage: remediate`, `role: codex_implementation`,
`next_actor: codex`, `status: ready`. **Fix only F8.** F1–F7 are verified and
settled — do not revisit them and do not restructure any surface beyond what
F8's required change names.

F8 in brief — criterion 18 ("The heaviest planet projects to ≈68 px diameter
and the lightest to ≥ 22 px, measured from the scene model at the OVERVIEW
camera"): live, the heaviest holding renders at **32.6 px**, and `CBRS`
(16.1 px) and `MSFT` (21.4 px) fall below the 22 px floor. The model now
contradicts itself — it reports `projectedDiameterPx = 68.08` for a planet its
own projected bounds put at 41.15 px — because `projectedDiameterPx` is still
`radius × 2 × 37`, a camera-independent constant, and the test asserting it is
that constant checked against itself.

Read the full required change in the review doc and in
`PHASE10_STATE.json`'s `section.findings[0].required_change`. Three things
matter most:

1. **Uniform enlargement will not work.** `ORRERY_RING_SPACING` derives from
   `ORRERY_MAX_RADIUS`, so raising the radius grows every orbit by the same
   factor, the belt-span fit pushes the camera back by that factor, and the
   on-screen diameter is unchanged. Change the *ratio* of planet radius to
   orbit spacing — spec §4.2's "1.6× the sum of adjacent planet radii" is a
   per-gap rule, while the code applies `MAX_RADIUS × 2 × 1.6` uniformly.
2. **Do not buy criterion 18 with criterion 17.** The belt must stay at 85–92%
   of viewport width and nothing may be clipped.
3. **If the two cannot both be met**, stop and set `status: blocked` with the
   measured achievable ceiling and the binding constraint, handing off to
   Devan. That is a spec conflict for the owner, not an implementation choice.

Also fold in F7's one outstanding evidence item: recapture
`docs/phase10-baseline/section-9/after/overview-1440x900.png` once the
composition is final (it is still the pre-F7 frame with the clipped eighth
planet), and record the criterion 1, 17 and 18 results in
`docs/phase10-baseline/section-9/README.md` with executor suffixes. If the
browser environment blocks capture again, say so plainly as last turn did
rather than relabelling an older frame — that was handled correctly and I
completed the measurement independently.

Trail/orbit sign→colour and sign→direction mapping must stay unchanged
(spec §1.1, D1).
