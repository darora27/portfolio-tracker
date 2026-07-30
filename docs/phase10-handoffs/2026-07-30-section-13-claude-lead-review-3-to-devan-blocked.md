# Phase 10 §13 handoff: claude_lead review round 3 → devan, blocked

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

Blocked — see Decision needed. Your sample-point-search ruling
(`ee7f12b`, "sampler searches for a valid point; no threshold moves") is
implemented correctly and independently re-verified. One residual, genuine,
structural failure (ASML) remains, and I'm bringing it back to you rather
than deciding myself, for the reasons below.

## What this turn did

- Independently re-ran `npm test` (112 files, 583/584 passed, 1 intentional
  skip, zero failures) and `npm run build` (exit 0, 18/18 routes, `/share`
  smoke PASS) against candidate `33789ee` — both match the implementer's own
  run exactly.
- Read the full diff since the last review (`git diff b05c9c8 33789ee`) line
  by line: it is scoped exactly to your ruling — `TRAIL_SAMPLE_FRACTION`
  (0.62) retained as the search base, an ordered ±0.08-step walk clamped to
  `[0.2, 0.92]`, every existing gate (ΔE≤8, hue distance ≤10°, chroma >0.3,
  clearance ≥1px) byte-for-byte unchanged, no geometry constant touched.
- Independently launched Chromium against a freshly built production server
  (not reusing the implementer's server or evidence) and wrote a fresh,
  independently re-derived verification script (not copied from the
  implementer's), then ran it **twice** to check reproducibility.

## What I found

**Your ruling was implemented exactly as specified.** GOOG, IBM, and CRM —
the three tickers that were already passing — still pass, satisfying your
explicit non-regression requirement.

**ASML's failure is real, structural, and reproducible.** Three independent
runs — the implementer's own, and my two — all found the identical
best-achievable ΔE of **9.436**, against your unweakened ≤8 gate. That exact
number recurring three times, from runs sampling different real-time frames,
is strong evidence this is a stable geometry ceiling (ASML's tight
orbit / large disc leaving no clean sample point anywhere along its trail),
not sampling luck. This is the same structural cause round 2's investigation
already found; the search you authorized correctly could not resolve it,
exactly as your ruling anticipated ("if none exists for a ticker, that is a
reportable failure, not a silent skip").

**A nuance my single reviewer run surfaced that the implementer's one run
didn't show:** INTC is a marginal case. It passed easily in the
implementer's run (ΔE 1.398) and in my second run (ΔE 3.492), but missed
narrowly in my first run (ΔE 8.81, over the gate, after the full 150-second
search). That's a real, timing-dependent effect of which live orbital frame
the search happens to land on — not a bug in either script (I re-derived
the math independently and hand-checked it). Practically: **7/8 passes under
normal operation; an unlucky run can land at 6/8**, and ASML is the one
ticker that never passes.

## Why I'm bringing this back to you rather than deciding it

Your ruling settled the *method* question decisively, and it's now correctly
implemented. What's left is a narrower question your ruling's text doesn't
answer: **does a confirmed, reproducible, fully-explained single-ticker
residual failure — after a correctly-implemented, exhaustive search — count
as closing this row, or does it need an explicit exception from you before
`TST-03`/`VIS-04` can show anything but failing?**

Two things stop me from picking an answer myself. First, `TST-03` is
critical risk and both criteria gate financial/visual encoding correctness
— this workflow's own rule puts correctness ahead of convenience, and me
inventing a "pass" for a criterion whose literal text ("for every holding")
the evidence doesn't meet would be exactly the kind of call this project
reserves for you. Second, you explicitly refused the one mechanism
(`carried_by_owner`) this project has used every other time a section needed
to be accepted with a residual failing critical criterion (§10's six carried
rows, §11's BLD-04). Given you closed that door on purpose ("That would
defer the same broken sampler a third time"), I don't think it's mine to
reopen quietly by calling this something else.

## Your options, as I see them

1. **Accept with a documented, non-generalizing owner exception** — similar
   in shape to the §1 CSS-3D long-task exception, not to the "carry"
   pattern you refused: you'd be saying ASML's specific, understood,
   structural limitation is an acceptable known gap, recorded honestly, and
   §13 can close around it.
2. **Authorize a geometry change for ASML specifically** — reopening the
   orbit/disc-size freeze you set via FB-01 this same section, scoped to
   ASML only.
3. **Something else you specify.**

I have no view I'm pushing here beyond what's in the evidence — this is
squarely a call about what you consider "close enough" on a criterion you've
been personally involved in three times now (FB-26, F2, this ruling).

## Evidence

- Candidate commit: `33789eebeb170c1c60a833b5d963bbadbb64f2f7` — "phase10(§13): sampler walks the trail for a valid sample point"
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-13.json` — `candidate_sha` filled, TST-03/VIS-04 reviewer entries updated
- Tests: `npm test` — 112 files, 583/584 passed, 1 intentional skip, zero failures (this turn's independent run)
- Build: `npm run build` — exit 0, 18/18 routes, `/share` smoke PASS (this turn's independent run)
- Review doc: `docs/phase10-workflow/reviews/section-13-review-3.md` (full reasoning and reproducibility table)
- Reviewer script + evidence: `docs/phase10-baseline/section-13/review-scripts-3/verify-tst03-vis04.mjs`, `docs/phase10-baseline/section-13/review-scripts-3/out/review3-tst03-vis04.json`
- Inherited red: none. `npm test`/`npm run build` are fully green.

## Route after this handoff

- Section: `§13`
- Stage: `review`
- Role: `claude_lead`
- Status: `blocked`
- Next actor: `devan`

## Decision needed

Whether ASML's confirmed, reproducible, structurally-explained residual
`TST-03`/`VIS-04` failure can be accepted as a documented owner exception
(option 1 above), whether you want its orbit geometry reconsidered
specifically (option 2), or something else. Once you decide, the next
Claude Lead turn implements your decision directly (no further remediation
round is needed — there's nothing left to fix in code; this is purely a
scope/acceptance call).
