# Phase 10 §11 handoff: Claude Lead (review, turn 2) → Codex Implementation

Prepared July 29, 2026 by `claude-code/sonnet-5`, executing under
`single_provider_mode` (Claude covers the Codex Implementation role until
OpenAI quota returns; no role value in the state machine was changed).

## Outcome

review returned 2 bounded findings (down from 4 at review-1; the prior 4 are
resolved as owner-carried decisions, not as passes — see below).

## What this turn did

- Recorded `b21339e66f1bfa173c0413bf5bda909e54c52d0c` as the reviewed
  candidate and independently re-ran `npm test` (106 files / 548 tests, pass)
  and `npm run build` (exit 0, `/share` smoke pass).
- Started a real production server (`npm run start`) and ran
  `npm run phase10:capture -- --section 11` against it — 10/11 shots
  succeeded; Chromium launched without difficulty in this environment.
- Ran the retained `measure-long-tasks.mjs` fresh (5 contexts, unmodified
  script, pinned measurement contract): **57–60ms, still failing the <50ms
  gate** — finding F5.
- Root-caused the `range-30d` capture failure: it is not a harness problem.
  `PlanetDetail.tsx` computes `thirtyDayReturn` but never renders it, and
  separately no live holding's chart series currently exceeds 30 points —
  finding F6.
- Reconfirmed `BHV-15`/F4 live (7D↔SINCE BUY toggle changes both figure and
  SVG path) and `PRV-10` (DRAFT rig confirmed owner-gated on `/share`, both by
  source and by a cookie-less curl) — both **pass**.
- Graded the five review-1 owner-carried criteria (`BHV-11`, `VIS-10`,
  `VIS-02`, `DEF-02`, `BHV-05`) as `carried_by_owner` in the ledger's reviewer
  column, per this handoff's own prior instruction — not `pass`.
- Updated `docs/phase10-workflow/acceptance/section-11.json` (candidate_sha
  and the reviewer column for the 9 criteria above), wrote
  `docs/phase10-workflow/reviews/section-11-review-2.md`, and regenerated the
  contact sheet (still 10/11 — see F6).
- Did not touch application source. `src/`, `public/`, `package.json`, and
  `package-lock.json` are unchanged by this turn.

## Evidence

- Candidate commit: `b21339e66f1bfa173c0413bf5bda909e54c52d0c` —
  `phase10(§11): remediate bounded review findings`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json`,
  reviewer column updated for `BLD-04`, `VIS-11`, `BHV-15`, `PRV-10`,
  `BHV-11`, `VIS-10`, `VIS-02`, `DEF-02`, `BHV-05`
- Tests: `npm test` — 106 files, 548 tests, zero failures — independent
  review run
- Build: `npm run build` — Next.js 16.2.11, 18/18 static pages, `/share`
  smoke pass — independent review run
- Screenshots: `docs/phase10-baseline/section-11/contact-sheet.md` (10/11)
  and `docs/phase10-baseline/section-11/captures/`
- Raw measurements: `raw-review-2-long-tasks.json` (F5),
  `raw-review-2-windows-30d.json` (F6)
- Review doc: `docs/phase10-workflow/reviews/section-11-review-2.md`
- Inherited red: none. Both gates are green on the candidate.

## For the next actor

State routes to `remediate` / `codex_implementation` / `codex` (executed by
Claude under `single_provider_mode` if OpenAI quota has not returned).

1. **F5 / `BLD-04`.** Profile the current candidate directly — do not assume
   the §10 CDP profile still applies unchanged. The spec named Three.js
   shader-program acquisition as the next lever if Package C's three refunds
   didn't clear the gate, and that lever has not been pulled yet. Do not
   baseline-subtract or redefine the 50ms boundary; that is a
   `must_wait_for_codex` action reserved for an explicit cross-model/owner
   decision, not something remediation may grant itself.
2. **F6 / `VIS-11`.** One-line-scale fix: render the already-computed
   `thirtyDayReturn` in `PlanetDetail.tsx`'s Windows zone, null-guarded like
   `WEEK`/`SINCE BUY` already are. Separately, note (do not "fix" by faking
   data) that no live holding's chart currently spans >30 points, so the
   chart's own 30D detent will likely still be unreachable on this dataset
   after the render fix — record that honestly in your handoff rather than
   leaving `range-30d` silently absent from the contact sheet again.
3. Do not re-touch the five owner-carried criteria (`BHV-11`, `VIS-10`,
   `VIS-02`, `DEF-02`, `BHV-05`) — they are closed at the owner-decision layer
   per `OWNER_FEEDBACK_LEDGER.md` and stay `carried_by_owner` regardless of
   this remediation round.
4. After remediation, the next review must still work through the large
   `not_run` matrix named in `docs/phase10-workflow/reviews/section-11-review-2.md`'s
   Unperformed matrix — this round only bounded what was newly evidenced.

## Route after this handoff

- Section: `§11`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
