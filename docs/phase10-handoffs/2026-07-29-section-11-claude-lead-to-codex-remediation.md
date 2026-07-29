# Phase 10 §11 handoff: Claude Lead → Codex Implementation, remediation

Prepared July 29, 2026 by `codex/gpt-5`, executing the Claude Lead standing
prompt under the repository's role-swap runner.

## Outcome

Review returned **4 bounded findings**: one `critical` legibility failure and
three `high` visual or behavioral failures. The independent test and build
gates are green. The host blocked every live browser before page launch, so
the remaining live matrix is explicitly unperformed rather than passed.

## What this turn did

No application source changed. This turn fixed the review candidate at
`a690a41f2f12ef335fd9f5288f90f6a4fa154ca4`, read the candidate diff and
implementer evidence, independently re-ran the gates, exercised the reachable
privacy and ReturnInstrument behavior, recorded reviewer ledger results, and
routed §11 to remediation.

The `portfolio-ux` skill was not exposed by session discovery, so the standing
prompt's repository fallback, `.claude/skills/portfolio-ux/SKILL.md`, was read
before the user-facing review. That kept the owner's newly adopted §12 ideas
out of this §11 finding set.

## Evidence

- Candidate commit: `a690a41f2f12ef335fd9f5288f90f6a4fa154ca4` —
  `fix: the swap must write the role into the lock, not the CLI name`
- Implementation commit inside the candidate:
  `629f5b89b9e3d796c5192414e31f3cf3f8af6b84` —
  `phase10(§11): improve universe legibility and add draft rig`
- Acceptance ledger:
  `docs/phase10-workflow/acceptance/section-11.json` — reviewer results record
  4 fail, 4 pass, 1 blocked, and the remaining matrix not run
- Tests: `npm test` — **PASS**, 538/538 across 104 files in the independent
  reviewer run
- Build: `npm run build` — **PASS**, Next.js 16.2.11, TypeScript and 18/18
  static pages passed, `/share` smoke passed, `/compare` absent
- Screenshots: none claimed; both in-app Browser and cached Chromium were
  blocked before page launch by the host. Exact failure:
  `docs/phase10-baseline/section-11/raw-review-browser-block.txt`
- Reachable evidence:
  `docs/phase10-baseline/section-11/raw-review-http.json`,
  `docs/phase10-baseline/section-11/raw-review-return-toggle.json`, and
  `docs/phase10-baseline/section-11/raw-review-gates.txt`
- Review doc: `docs/phase10-workflow/reviews/section-11-review.md`
- Inherited red: **none**

## For the next actor

State is `stage=remediate`, `role=codex_implementation`,
`next_actor=codex`. Fix only F1–F4:

1. `BHV-11`: make the required ten-second panel answers readable without
   squinting while preserving hierarchy and word budget.
2. `VIS-10`: restore the selected planet, including ASML, to the measured
   left-third anchor beside a rail no wider than 380px.
3. `VIS-02`: directly measure the shipped mark before changing textures, then
   make one carved capital visible on every selected planet and rerun direct
   all-eight chirality verification.
4. `BHV-15`: make `SINCE BUY` use purchase-date history and `MAX` the full
   available series, with rendered coverage proving all four detents change
   both answer and path.

Retain fresh 1440×900 evidence and update implementer results for every
remediated criterion. `BLD-04` remains blocked, not waived or redefined. The
next review must exercise all newly reachable ledger entries, especially the
six carried criteria (`TST-03`, `VIS-04`, `DEF-02`, `VIS-02`, `BHV-05`,
`BLD-04`). Run `npm test` and `npm run build` before returning the candidate.

## Route after this handoff

- Section: `§11`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
