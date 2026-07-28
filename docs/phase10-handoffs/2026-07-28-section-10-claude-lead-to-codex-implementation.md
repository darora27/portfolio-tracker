# Phase 10 §10 handoff: Claude Lead (`specify`) → Codex Implementation

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

spec ready for implementation.

`§10 Universe colour, material, and command structure` is specified, its
design-proof gate is satisfied, and its 77-criterion acceptance ledger is
created and validated. No application source was touched.

## What this turn did

- Invoked the `portfolio-ux` project skill via the `Skill` tool (not the
  fallback path) before specifying, as the standing prompt requires.
- Verified six premises directly against the shipped code before writing scope,
  and recorded them in the spec's §0 so an implementation round is not spent
  against a false picture:
  - the sun and every belt rock are **already** in `pickTargets`, so owner
    defects 4 and 5 are not missing hit targets — the likely causes are a
    near-invisible belt body and a corona larger than the picked sphere;
  - `createTrailGeometry()` sweeps the arc **with** the direction of travel,
    which is exactly the reported trail-ahead defect;
  - the starfield really is two fixed point sizes over a uniform scatter;
  - `axialSpinForDayReturn()` is live and must be **deleted**, not retuned, and
    moons currently orbit with a ~8.7 s period against the ~40 s target;
  - **there is no aurora in `src/` at all** — it is a new build in work package
    F, not a retune, and "the radar" is the existing PLOT bay
    (`MissionControlBays/SystemPlot.tsx`);
  - the seven bays already exist with the right ids; their *composition* is the
    defect, so no bay is renamed.
- Wrote `docs/phase10-workflow/design-proofs/section-10.md`, citing the
  owner-approved package for six of the eight `DESIGN_GATE.md` items and
  **deciding the two it does not contain** — the state matrix and the freeze
  boundary.
- Wrote `docs/phase10-workflow/specs/section-10.md` — seven work packages,
  the ten carried owner defects as their own criteria, and the inherited red as
  §10's first exit criterion.
- Created and validated
  `docs/phase10-workflow/acceptance/section-10.json` (77 criteria, exact 1:1
  ID and ordering correspondence with the spec, verified mechanically).
- Changed no application source, no test, and no texture.

## Evidence

- `prev_actor_commit` (HEAD at turn start): `a0f7dc2f2adca393033b012bc68c9345bad77123`
  — `phase10(workflow): compile context and acceptance gates`
- Spec: `docs/phase10-workflow/specs/section-10.md`
- Design proof: `docs/phase10-workflow/design-proofs/section-10.md`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-10.json` —
  `npm run phase10:acceptance -- check` reports **valid**; all actor columns are
  `not_run`, awaiting the implementer.
- Validator: `npm run phase10:validate` exits 0.
- Tests / build: **not run this turn.** This is a `specify` turn that touches no
  executable source; the two binding gates belong to the implementation
  candidate and the independent review.
- **Inherited red, owner-approved and carried:** `npm test` is red at this
  section's start with exactly two failures in
  `src/lib/observatory/planet-textures.test.ts` — `manifest.totalBytes`
  22,450,706 against §9's 15,000,000 cap, and INTC 0.098092 / CBRS 0.093008
  `luminanceStdDev` against the 0.1 floor. Both come from owner texture commits
  landed after §9's reviewed implementation. **They must never be raised as
  findings against §10's implementer.** Closing them is §10 work item 5 and is
  now criteria `TST-07` and `BLD-01`.

## For the next actor

Codex Implementation, `stage: implement`, `current_section: §10`.

Implement `docs/phase10-workflow/specs/section-10.md` in the §15 sequence, which
lands the colour contract before any pixel moves:
**A** palette → **B** sun/trails/spin → **C** stars/rings → **D** Mission
Control → **E** textures → **F** aurora/wisps/entry/sweep → **G** prism exhaust.
Run `npm test` and `npm run build` after each package. Fill only the
`implementer` column of the ledger; a `pass` without retained evidence is
invalid, and `deferred_to_reviewer` is available **only** for a genuine
environment-only live-browser gap, with exact notes.

Five things carry the most risk in this section:

1. **`npm test` must end green** (`BLD-01`). §9's owner exception that permitted
   a red `main` ends here. Raise the byte ceiling to `30_000_000` and **verify —
   do not assume — that relighting lifts INTC and CBRS to `luminanceStdDev`
   ≥ 0.1.** Mean luminance and standard deviation move independently; raising
   the mean can flatten the deviation.
2. **The ten owner defects are criteria, not context** (`DEF-01`–`DEF-10`). For
   `DEF-04`, `DEF-05` and `DEF-06` the spec requires the **recorded root cause**,
   not just a working result, and explicitly forbids fixing the click failures
   with an invisible hit plane over empty space.
3. **`expect(source).toContain(...)` is not coverage for rendered behaviour**
   (`TST-02`). The single-source-of-truth hex guard (`FWL-05`) is the one
   declared structural exception and must identify itself as such in its test
   description.
4. **The sign→hue mapping does not move.** §10 changes lightness within the
   hue, arc length, and the geometry sign — never green-is-up / red-is-down.
   The new sampler assertions (`TST-03`) are a stronger D1 detector than §9's
   freeze was; run them over every holding in the fixture, not a subset.
5. **The banked channel stays banked.** Nothing may be re-homed onto an ambient
   scene property to replace the de-encoded axial spin.

High-risk ledger criteria that will require an independent browser or visual
check at review, so capture their evidence carefully now: `VIS-01` (live
per-world equatorial-band luminance), `VIS-04` (trail direction and magnitude in
a single still), `DEF-02` (mark chirality), `DEF-04`/`DEF-05` (belt and sun
activation from every camera state), `MOB-01` (zero canvases at 390px and
320px), `BLD-04` (route-owned long task under 50 ms), and every `PRV-*`
criterion.

D2 ("the website is still relatively confusing") **closes in §10** — the spec
records that decision and binds it to exactly three requirements (`DEF-08`,
`BHV-04`, `VIS-08`/`VIS-09`). It is not a licence for unscoped restructuring.

## Route after this handoff

- Section: `§10`
- Stage: `implement`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
