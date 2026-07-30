# Phase 10 §13 handoff: Claude Lead (review round 2) → Devan, blocked

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

Blocked — see Decision needed. VIS-10 is resolved. TST-03/VIS-04 is the sole
remaining item, and it needs your call rather than a third remediation round.

## What this turn did

Graded candidate `b05c9c86e5459d739eec1b1874aa62207fda5a79` (the remediation
commit) against the full §13 acceptance ledger. Changed no application
source.

- Ran `npm test` and `npm run build` independently — both green, matching the
  remediation turn's own results exactly.
- Read the full remediation diff: a single one-line CSS selector specificity
  fix, a capture-script bug fix, and the new `f2-investigation/` evidence
  tree. Nothing else touched.
- Independently launched Chromium directly against a freshly built
  production server and wrote a fresh reviewer-owned script (not reused from
  round 1) to re-derive `VIS-10`.
- Independently read the full F2 per-ticker evidence (clearance frame log,
  three marked sampled-pixel crops) rather than trusting the handoff summary.
- Closed two owner-ledger rows on committed capture alone (`FB-22`, `FB-31`)
  — their own closes-when text has no owner-sentence requirement, matching
  the `FB-19`/`FB-20` precedent.

## Evidence

- Candidate commit: `b05c9c86e5459d739eec1b1874aa62207fda5a79` —
  `phase10(§13): remediate 2 bounded findings`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-13.json`,
  reviewer column filled, `candidate_sha` set to the candidate. 13 pass, 2
  blocked.
- Tests: `npm test` — independent review run — 112 files, 583/584 passed (1
  intentional skip), zero failures.
- Build: `npm run build` — exit 0, 18/18 routes, unchanged route list,
  `/share` smoke PASS.
- `VIS-10` evidence:
  `docs/phase10-baseline/section-13/review-scripts-2/out/verify-f1-tab-strip.png`
  and the script that produced it.
- Review doc: `docs/phase10-workflow/reviews/section-13-review-2.md`.
- Owner ledger: `OWNER_FEEDBACK_LEDGER.md` — `FB-22` and `FB-31` closed this
  turn.
- Inherited red: none. `main` was green at section start and remains green.

## The result you need

### `VIS-10` (`FB-31`) — resolved, no decision needed

The active tab now measurably differs from every inactive tab (2px cream
border-bottom vs. 1px dim). Independently re-verified with a fresh script
against a fresh production server.

### `TST-03`/`VIS-04` (`FB-26`) — genuinely re-investigated, still fails the
literal gate, needs your call

Round 1 found 5/8 tickers failing the ΔE≤8 trail-color gate and asked for a
per-ticker re-investigation of two failures (ASML, COST) that a shared
three-ticker clamp theory didn't explain. The remediation turn did that
investigation honestly rather than restating the theory:

- **ASML**: its trail sample point sits *inside its own planet disc* in
  every one of 16 sampled frames across an 11-second window — a structural
  clearance problem from ASML's tight orbit (~80px from the sun) and large
  disc (one of the biggest of the 8), not sun-glow contamination as first
  guessed.
- **COST**: its sample point lands on the trail ribbon's antialiased edge
  rather than its solid core, while IBM (almost the same daily-return
  magnitude) lands centered in the ribbon and passes cleanly.

Both are real, specific, and different from each other and from the
MSFT/INTC/CBRS clamp-collision cause (which is unchanged). Both trace to one
shared fact: the verification sampler's fixed `TRAIL_SAMPLE_FRACTION = 0.62`
doesn't guarantee a clear sample point for every holding's specific orbit
geometry.

**Why this turn didn't send it back for a third remediation round or fix it
itself:**

1. Changing the sampler's fraction/search parameters would also move the
   sample point for the 3 currently-*passing* tickers, and there's no way to
   bound-verify "no regression" for those three without re-judging the whole
   8-ticker gate — a scope expansion, not a bounded fix.
2. Widening ASML's clearance would mean touching `ORRERY_MIN_RADIUS`/
   `MAX_RADIUS` or the orbit-gap constants — which `FB-01`, in this same
   section, froze on your own instruction not to re-derive.
3. `FB-26`'s scope explicitly forbids touching the magnitude clamps or ramp/
   arc formulas, and neither mechanism implicates them anyway.

This is the same shape as `TST-03`/`BLD-04`/`DEF-02` from §10 round 5: a
real failure whose fix is a scope or tooling decision, not a remaining
implementation gap. Recorded `blocked` in the ledger (not `fail`, not
`pass`, not `carried_by_owner` — only you can authorize a carry). No gate
was weakened or redefined; the literal 5/8 failure count is reported
honestly.

## Decision needed

Pick one:

1. **Authorize a verification-methodology change** — adjust
   `TRAIL_SAMPLE_FRACTION` or the clearance-search window/step so it can find
   a clear sample point for every holding's geometry, then re-run and
   re-judge all 8 tickers (including the 3 currently passing) inside a new
   bounded remediation round.
2. **Authorize a geometry change** for ASML specifically (more orbital
   clearance near the sun), understanding this touches the same constants
   `FB-01` just froze this section on your "do NOT re-derive the ratios"
   instruction — this would need to be reconciled with that instruction, not
   silently override it.
3. **Carry `TST-03`/`VIS-04` forward** to §14 with the current measurement
   attached, matching the `BLD-04` precedent from §10/§11 — accept §13 with
   this one criterion open rather than closed.
4. Something else — this is your product/verification-methodology call to
   make, not a pre-decided menu.

## Route after this handoff

- Section: `§13`
- Stage: `review`
- Role: `claude_lead`
- Status: `blocked`
- Next actor: `devan`
