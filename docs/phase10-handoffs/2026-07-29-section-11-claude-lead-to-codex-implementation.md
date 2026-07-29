# Phase 10 §11 handoff: Claude Lead (specify) → Codex Implementation

Prepared July 29, 2026 by `claude-code/opus-5`.

## Outcome

Spec ready for implementation. §11 "Universe legibility and the draft rig" has
a design proof, an implementation-ready specification, and a 54-criterion
acceptance ledger. **No application source changed this turn.**

## What this turn did

- Invoked the project `portfolio-ux` skill before writing any user-facing
  specification, as the standing prompt requires. §11 is entirely user-facing.
- Satisfied `DESIGN_GATE.md` by the **existing owner-approved package** route,
  mapping every one of the eight required proof items explicitly rather than
  assuming the files prove them:
  `docs/phase10-workflow/design-proofs/section-11.md`.
- Wrote `docs/phase10-workflow/specs/section-11.md` — risk-first, sequenced
  A→G, with the boundary where work must stop stated up front rather than
  discovered mid-implementation.
- Created `docs/phase10-workflow/acceptance/section-11.json` with
  `phase10:acceptance -- new`, replaced the example, and validated it.
- Verified mechanically that every criterion ID referenced in the spec and the
  design proof exists in the ledger, and that no ledger criterion is
  unreferenced. Both directions are clean.

## Evidence

- Spec: `docs/phase10-workflow/specs/section-11.md`
- Design proof: `docs/phase10-workflow/design-proofs/section-11.md`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  **54 criteria**, all `not_run` in both actor columns;
  `phase10:acceptance -- check` **valid**
- Dimension coverage: behavioral 20, visual 14, privacy 5, tests 5, build 4,
  accessibility 4, mobile 2 — all seven Phase 10 dimensions present
- Carried from §10: `TST-03`, `VIS-04`, `DEF-02`, `VIS-02`, `BHV-05`,
  `BLD-04` — each retains its **original §10 ID** and carries its
  `measurement_at_carry`, `owner_observation`, `resolved_in_11_by`, and
  `evidence_at_carry` in a `carried_from_section_10` block
- `prev_actor_commit`: `3a8853b3c7a31ae135a9eb145da957fd360c984c`
- Validator: `npm run phase10:validate` — green at turn start
- Tests / build: **not run this turn.** This is a documentation-only specify
  turn that changed no application source. `main` is green at section start —
  527/527 across 99 files, `npm run build` exit 0, re-run by the accept turn.
- Inherited red: **none.** §9's exception is discharged; no exception is
  inherited into §11.

## For the next actor

Codex Implementation, `stage: implement` on §11. Read the spec's §1 (sequence),
§8 (where the work stops), and §9 (the carried criteria) before touching code.

**Implement in the spec's A→G order.** It is deliberately risk-first: **all six
carried §10 criteria are closed by packages B, C and D — package F, the DRAFT
rig, closes none of them.** If this section runs long, the debt is discharged
before the new feature starts.

Highest-risk criteria, each requiring independent live browser verification:

| Criterion | Why it is the risk |
|---|---|
| `BHV-13`, `VIS-13` | The planet-visibility invariant is what makes `DEF-02`, `VIS-02` and `BHV-05` measurable at all. At §10's accept the panel covered **96.8–100%** of the sampled band. |
| `BLD-04` | 65/57/58/58/57 ms against an unchanged 50 ms ceiling, unmoved across five rounds. The three refunds in spec §4.4 are the plan; `measure-long-tasks.mjs` runs **unmodified**. |
| `TST-03`, `VIS-04` | The sampler must be **re-derived**, not the ΔE gate loosened. §10 proved width was never the cause: the taper fix took IBM to ΔE 0.396 while NBIS moved only 33.8→30.5. |
| `BHV-30`, `TST-11` | The rig's ledger invariant and the 1e-9 identity test against `simulateRebalanced` — financial honesty, and the reason the rig is trustworthy. |
| `PRV-10`, `PRV-13`, `PRV-14` | The privacy boundary. See below. |

**Do not regenerate planet textures** against the no-visible-logo theory before
it is measurable. Four rounds already did, and each moved the score by less than
the measurement noise. The panel rebuild is the first chance to find out whether
the marks were correct all along.

### §11 runs under `single_provider_mode`

Its compensating controls are **mandatory**, not advisory: executable verifiers
with retained raw output, **no criterion graded from source reading alone**, and
owner visual review before acceptance. `sections_history` will record
`single_provider_mode: true`.

Live browser verification **is runnable in this environment** — the repo's own
`node_modules/playwright` with cached Chromium, driven against a real production
server, as §10's review rounds did. An in-app browser tool reporting "no
backend" is not evidence that live verification is unavailable. Reuse §10's
retained verifier scripts, copying them into
`docs/phase10-baseline/section-11/scripts/` and recording any modification.

Per the mode's operating note, a Claude process may cover this Codex turn. It
must open by recording that it acts under single-provider mode and which role it
performs. **Do not edit the state machine's role values** — the record should
show Claude covered a Codex turn, not that the workflow was rewritten around an
outage. `role` and `next_actor` are therefore left at
`codex_implementation` / `codex`.

### Where the work stops — `must_wait_for_codex`

Spec §8 is the full table. In short:

- **Privacy boundary.** Renaming, relayout and the descent are fine — they
  change presentation, not the partition. **Frozen:** which fields are public,
  the gating mechanism, and every canary test. The DRAFT rig ships
  **owner-gated** (spec §7.9) rather than opened to `/share`. If any package
  requires moving a field across the public/owner line, stop and hand off.
- **Financial math core.** §11 changes none of it. The rig **adds** a pure
  mix-held function tested against the existing `simulateRebalanced` oracle —
  additive, not a change. The XIRR work changes only its presentation under 90
  days, never its computation.
- **Gate weakening.** Not available this section. `BLD-04`'s 50 ms is not
  baseline-subtracted. `TST-03`'s ΔE ≤ 8 is not loosened. Anything else →
  blocked handoff to Devan.

## Two items for Devan — neither blocks implementation

Both are recorded in the design proof under "Owner decision" and resolved under
a named rule so work can proceed now. Either can be corrected in one gate.

1. **Is the DRAFT rig public on `/share`?** `UNIVERSE_IDEAS_4.md` §8 offers it
   as *"a recommendation the owner can veto"*, so it is **not decided**.
   Resolved under `G-PUBLIC`'s owner-gated default: §11 ships it owner-gated
   (`PRV-10`). Opening it is also a privacy-boundary change, which
   `single_provider_mode` sends to cross-model review anyway. **If you want
   friends to be able to fiddle with it on the share link, say so and it opens
   in one gate.**
2. **How short is "shorter"?** You rejected round 3's 36–64° trail arcs and
   asked for *"somewhere between the two"* (round 2 was 18–30°), judged by eye.
   Set as a token pair at **26–46°**, measured by the reviewer and **confirmed
   by your visual review before acceptance**. `VIS-04`'s arc band is the only
   clause that changes — its ΔE gate, ramp-lightness clause and 12% white-hot
   calibration head are untouched. This is an owner-directed design-target
   change, **not a gate weakening**, and it is flagged here so you can correct
   the band if 26–46° is still not what your eye wants.

### Scope recommendation — advisory, not a blocker

§11 covers roughly twice §10's surface, and §10 took one implementation round,
five reviews, four remediations, and still carried six criteria. Under
`single_provider_mode` the reviewer is the same model that implemented, which
the mode itself records as a genuine reduction in review quality.

**Recommendation: consider splitting §11 at the A–E / F seam** — legibility and
the carried debt in one section, the DRAFT rig in the next. The seam is clean:
no package A–E depends on F, and F closes no carried criterion.

That is a roadmap decision and therefore yours, so this spec covers **all** of
§11 and implementation proceeds now. Because the sequence is risk-first,
nothing is lost by answering late — the work done first survives either choice.

## Small workflow gap, still not repaired

`docs/phase10-workflow/acceptance/README.md` still says a passing review
requires every reviewer result to be `pass` or `not_applicable`. `dbdeb39`
added `carried_by_owner` to the validator and the manifest but not to that
sentence. The validator is authoritative and passes; the README is one sentence
stale. Carried forward from the §10 accept handoff and left for the owner
rather than repaired inside a product turn.

## Route after this handoff

- Section: `§11`
- Stage: `implement`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
