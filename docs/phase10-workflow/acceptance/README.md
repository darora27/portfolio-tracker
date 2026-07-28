# Phase 10 acceptance ledgers

Starting with §10, each section specification has a machine-readable acceptance
ledger at `section-N.json`. The ledger does not replace the human-readable
specification. It makes the specification's gates enumerable, executable, and
hard to lose between implementation and review.

## Contract

- Claude Lead creates the ledger with the section specification.
- Every criterion has a stable ID, one of the seven Phase 10 dimensions, a
  risk, a concrete description, a verifier type, required artifacts, and
  separate implementer/reviewer results.
- Codex fills only `implementer` results and evidence. A `pass` without retained
  evidence is invalid.
- An environment-only live-browser gap may be
  `deferred_to_reviewer` by the implementer only, with exact notes. It is never
  a pass; Claude must perform and pass that criterion before acceptance.
- Claude records the candidate commit and fills only `reviewer` results after
  independent verification.
- A passing review requires every reviewer result to be `pass` or
  `not_applicable`; `not_applicable` requires an explanation in `notes`.
- The same candidate must remain identified by its 40-character Git SHA.

## Commands

Create the next ledger:

```bash
node scripts/phase10-acceptance.mjs new \
  --section 10 \
  --spec docs/phase10-workflow/specs/section-10.md
```

The generated example criterion is deliberately invalid until it is replaced.

Validate the contract:

```bash
node scripts/phase10-acceptance.mjs check \
  docs/phase10-workflow/acceptance/section-10.json
```

Require complete implementer or reviewer evidence:

```bash
node scripts/phase10-acceptance.mjs check \
  docs/phase10-workflow/acceptance/section-10.json \
  --require implementer

node scripts/phase10-acceptance.mjs check \
  docs/phase10-workflow/acceptance/section-10.json \
  --require reviewer
```

Print a compact status:

```bash
node scripts/phase10-acceptance.mjs status \
  docs/phase10-workflow/acceptance/section-10.json
```

`TEMPLATE.json` documents the exact shape. Do not use source-string assertions
as evidence for rendered behavior; use a browser, scene-graph, pixel, geometry,
or accessibility verifier as appropriate.
