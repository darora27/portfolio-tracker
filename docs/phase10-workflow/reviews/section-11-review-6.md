# Phase 10 §11 review (turn 6) — F10 CLOSED, zero new bounded findings, BLOCKED on two owner decisions

Reviewed July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: review`),
covering both roles under `single_provider_mode` (`PHASE10_STATE.json`
`applies_from: "§11"`).

- **Candidate SHA:** `e8faf0d3ae6ce7f14f9a9f0b44205f51f0b4ae77` —
  `phase10(§11): remediate F10 — ring far-side geometry, alpha, and width`
- **Prior review-5 candidate:** `0fae59d288b144f88e7ce832bc9807a9b5704449` (FAIL, F10 opened)
- **Remediation commit since review-5:** `e8faf0d` only. `git diff --stat
  3e9656c e8faf0d` touches `OrreryScene.tsx`, `scene-model.ts`,
  `scene-model.test.ts` in application source, plus evidence/handoff/state
  bookkeeping. No other application source changed — matches the
  implementer's own scope claim exactly, no drift.
- **Spec:** `docs/phase10-workflow/specs/section-11.md`
- **Ledger:** `docs/phase10-workflow/acceptance/section-11.json`
- **Result:** **BLOCKED, not pass.** F10 (`VIS-16`) is **CLOSED** this turn
  with fresh, independent evidence and zero new bounded findings against
  application code. The section still cannot accept: two pre-existing
  criteria (`BHV-31` pro-rata tolerance, `MOB-11` mobile-fallback scope)
  remain `not_run` for reasons review turn 5 already established are owner
  decisions, not code defects — routed to Devan this turn per his explicit
  instruction in the state file (`unperformed_criteria_note`) to decide
  "whether to route BHV-31 pro-rata / MOB-11 as new findings or spec
  questions." Both are spec questions, not findings.

## Independent gates

| Gate | Result |
|---|---|
| `npm test` | **PASS** — 107 files, 553 tests, zero failures (independent run, this turn) |
| `npm run build` | **PASS** — Next.js 16.2.11 production build, exit 0, 18/18 static pages, `/share` smoke pass (independent run, this turn) |
| `npm run phase10:acceptance -- check <ledger> --require implementer` | **PASS** — valid |
| Chromium launch, this sandbox | Confirmed directly, again, this turn — own `npm run build && npm run start -- -p 3200` (a fresh port, independent of the implementer's already-stopped process), then `node docs/phase10-baseline/section-11/scripts/*.mjs`. No in-app browser tool used. |

## F10 — `VIS-16` — CLOSED, pass

Ran the implementer's own `remediation-f10-ring-farside.mjs` script fresh —
not a re-read of the committed `raw-remediation-f10-ring-farside.json` —
against this turn's own independently built/started server (port 3200), 5
times for stability, same protocol prior remediation/review turns used:

| Run | ASML delta | CBRS delta | allSampledRingsVisibleAboveBackground |
|---|---|---|---|
| 1 | 17.00 | 18.15 | true |
| 2 | 17.00 | 18.22 | true |
| 3 | 17.00 | 18.22 | true |
| 4 | 20.86 | 13.79 | true |
| 5 | 17.00 | 13.22 | true |

All 5 runs clear the unweakened `>6` luminance-delta threshold on both
sampled rings (smallest on-canvas orbit ASML, largest on-canvas orbit CBRS)
with comfortable, repeatable margin — no run anywhere near the boundary.

A fresh full-overview 1440×900 capture from this turn's own server
(`raw-review-6-overview-ring-check.png`) corroborates visually: every one of
the eight orbital rings reads as a complete, faint, continuous circle around
the sun — not an arc confined to the near-planet zone — and the frame does
not read as uniform graph paper. Still subtle/atmospheric, consistent with
the implementer's own characterisation, not a visual regression.

**Flagging forward, unresolved but non-blocking:** the fix changed the
specific token values `VIS-16`'s own description cites (0.22 floor / 0.55
peak → 0.7/0.85, ring `widthPx` 1.5 → 4). The criterion's literal language
("at least 0.22", "token pair rather than a single constant") is satisfied
by construction — these are minimums, and this turn's own visual check does
not read as a product regression — but the exact numbers differ from what
was previously shipped and reviewed. Not treated as blocking since no
criterion requires Devan's sign-off on this specific token pair, but offered
for his visual confirmation if he wants to weigh in.

Evidence: `docs/phase10-baseline/section-11/raw-review-6-ring-farside.json`
(all 5 runs), `docs/phase10-baseline/section-11/raw-review-6-overview-ring-check.png`,
`docs/phase10-baseline/section-11/scripts/review-6-overview-shot.mjs`.

## Routed to Devan this turn: `BHV-31` and `MOB-11`

Review-5 left both `not_run` for reasons that are, on inspection, genuine
product/policy decisions rather than measurable defects — re-confirmed this
turn, not reopened as new investigation:

### `BHV-31` — pro-rata breathing tolerance undefined

The siphon-latch and pit-rail components of `BHV-31` already pass (keyboard
path, review-4/5). The remaining piece — "pro-rata breathing preserves the
relative mix of the seven untouched holdings" — has a real, measured number
under a genuine keyboard-driven edit (`maxRatioDrift: 0.0184`, up to ~1.8
percentage points of ratio movement among untouched holdings), plausibly
explained by the half-unit largest-remainder rounding the spec itself
mandates (§7.3). But the spec defines no tolerance for the word "preserves."
Grading this pass or fail requires inventing a threshold with no textual
authority — exactly what G-SCOPE and this project's whole ledger discipline
exist to prevent. This is a number only Devan can set.

**Question for Devan:** what maximum ratio drift among untouched holdings
counts as "preserves the relative mix" for BHV-31? A concrete number (e.g.
"≤2 percentage points") would let the next review turn grade this
conclusively against the already-measured 0.0184.

### `MOB-11` — mobile-fallback scope ambiguity

`BHV-10` names "the fallback" as one of five places every renamed section
noun must appear. `MOB-10` describes the same fallback as "the existing
tested 2D fallback... a genuinely reflowed semantic list" — i.e. a holdings
list, not a re-implementation of Mission Control's seven-section descent
room. Nothing in the spec explicitly requires the fallback to grow
`CORRELATION`/`TRADES`/`ORBITS` sections it has no mobile content for. Both
readings are defensible from the same spec text; more browser measurement
cannot resolve which one is intended.

**Question for Devan:** should the below-1024px fallback grow new sections
for `CORRELATION`/`TRADES`/`ORBITS` (making `BHV-10`'s "the fallback" clause
literal), or does `BHV-10` only bind the nouns the fallback already shows?

## Not attempted this turn: full `--require reviewer` ledger check

`npm run phase10:acceptance -- check <ledger> --require reviewer` was not
run to a clean pass this turn. A first pass shows ~99 issues, almost all
"required artifact not retained in evidence" — a structural mismatch between
`after/*.png` filenames declared in the ledger's `required_artifacts` at
specify time and the actual evidence-collection convention this section has
used ever since (`raw-review-N-*.json/png`, the `captures/` shot-list
harness, `contact-sheet.md`). The `after/` directory itself is empty; it was
never populated under this convention. This predates this turn and every
prior §11 review turn — none of turns 2 through 5 ran `--require reviewer`
either, since all found real bounded findings and routed to remediate before
reaching the accept step where that check is specified. Since this section
cannot accept this turn regardless (two owner decisions outstanding), closing
that ledger-hygiene gap is deferred to whichever turn actually attempts
accept, rather than done speculatively now.

## Unchanged: five owner-carried criteria not reopened

`BHV-11`, `VIS-10`, `VIS-02`, `DEF-02`, `BHV-05` remain `carried_by_owner` —
this turn changed no logo mark, panel width, or Mission Control typography.

## For the next turn

This is a **blocked** turn, routed to Devan. Once he answers both questions
above:

- If he sets a `BHV-31` tolerance: grade the already-measured 0.0184 drift
  against it (no new measurement needed unless he wants a fresh run).
- If he resolves `MOB-11`'s scope: either close it as-is (fallback nouns
  only) or route new fallback-section work to a `specify`/`remediate` turn.
- Then attempt the full `--require reviewer` ledger check and close the
  evidence/artifact-naming gap described above before the next accept
  attempt.
