# Phase 10 §11 handoff: Claude Lead (review turn 4) → Codex Implementation (remediation)

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

review returned 1 bounded finding (F9) — F7 and F8 from review turn 3 are
CLOSED this turn with fresh, independent evidence.

## What this turn did

- Confirmed this sandbox launches Chromium directly (`playwright.chromium.launch`
  succeeded before any other work), contradicting the Phase 10 lead standing
  prompt's Mach-port-denial claim. Followed `AGENTS.md`'s Live Verification
  section as authoritative: build+start, then `node .../scripts/<name>.mjs`.
- Requested an independent `evidence` run through the unattended camera
  daemon (`.phase10-camera/request.json` → `done-s11rvw1.json`, `ok: true`),
  producing a fresh production build/server this turn controlled, not the
  implementer's. Independently reconfirmed **F7/`TST-03`** and **F8/`VIS-04`**
  pass (all 8 holdings, ASML ΔE 0, max IBM ΔE 7.571) and **`BLD-04`** (0ms
  across 5 fresh contexts). Both findings are **CLOSED**.
- Started a second `npm run start` process against the same freshly built
  `.next` output (after the daemon's own server tore down) and wrote four
  new retained verifier scripts under
  `docs/phase10-baseline/section-11/scripts/`
  (`review-4-audit.mjs`, `review-4-owner-audit.mjs`, `review-4-ring-alpha.mjs`,
  `review-4-followup.mjs`) to independently exercise the 13 criteria the
  prior handoff named as still-unperformed.
- Independently ran `npm test` (106 files, 549 tests, zero failures).
- Opened **F9 — `BHV-20`** (medium risk): a fresh unseeded context found no
  first-visit legend content anywhere (first visit, after interaction, after
  reload, or via the Systems Manual). Source confirms this is not a timing
  gap — no component references `styles.legend`, and `SystemsManual.tsx`
  carries no legend copy. The feature does not exist in rendered output.
- Graded 9 further criteria `pass` with fresh evidence: `VIS-14`, `VIS-19`,
  `VIS-20`, `MOB-10`, `BHV-30` (re-confirmed), `BHV-32`, `BHV-33` (with a
  stated caveat), `BHV-35`, `ACC-13`.
- Left 4 criteria genuinely `not_run` rather than asserted, each with a named
  reason (not a finding — see "For the next actor" below): `VIS-16`,
  `MOB-11`, `BHV-31` (siphon sub-behavior only — pro-rata and pit-rail
  passed), `BHV-34` (Back/Forward sub-check only — URL encoding and the copy
  button passed).
- Updated the acceptance ledger's `candidate_sha` and every criterion's
  `reviewer` field touched this turn. Wrote
  `docs/phase10-workflow/reviews/section-11-review-4.md`.

No application source, public asset, package manifest, route, or renderer
changed this turn.

## Evidence

- Candidate commit: `f38b5e233114247f578256f6753fef9c22b2f900` —
  `phase10(§11): remediate trail evidence`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  reviewer column updated for `TST-03`, `VIS-04`, `BHV-20`, `VIS-14`,
  `VIS-16`, `VIS-19`, `VIS-20`, `MOB-10`, `MOB-11`, `BHV-31`, `BHV-32`,
  `BHV-33`, `BHV-34`, `BHV-35`, `ACC-13`
- Tests: `npm test` — independent review run, 106 files, 549 tests, zero
  failures
- Build: `npm run build` — independent run via this turn's own camera-daemon
  evidence request (`s11rvw1`), exit 0
- Live verifiers: `docs/phase10-baseline/section-11/raw-owner-rgb-20260729-233143.txt`,
  `raw-temporal-trail-samples.json`, `raw-review-4-audit.json`,
  `raw-review-4-owner-audit.json`, `raw-review-4-ring-alpha.json`,
  `raw-review-4-followup.json`
- Review doc: `docs/phase10-workflow/reviews/section-11-review-4.md`
- Inherited red: none

## For the next actor

This is a **remediate** turn. Fix F9 first (the required change is spelled
out in the finding and in `section-11-review-4.md`): implement the
first-visit-only legend bar per spec §5.5 rather than leaving it deleted.

While in the area, also try to close out the four `not_run` items so the
next review can grade them cleanly instead of re-deriving harnesses (none of
these four are findings — do not treat them as required fixes, just
opportunities to leave better evidence):

- `VIS-16`: a second, independently verifiable far-side ring sample. This
  turn's `review-4-ring-alpha.mjs` locates the sun by pixel-scanning for a
  warm-bright disc and computes each planet's orbit radius from its own
  on-screen position — the second sample (MSFT, a larger orbit) missed,
  most likely from compounding estimation error at larger radii. A DOM
  signal for ring/sun geometry (if one exists or can be added cheaply) would
  make this measurement exact instead of pixel-scanned.
- `MOB-11`: confirm against the spec whether the below-1024px fallback
  (`nav[aria-label="Portfolio bodies"]`, `OrreryWorld.tsx`) is expected to
  carry the full Mission Control descent noun set (`HOLDINGS`,
  `CORRELATION`, `TRADES`) or only the nouns relevant to a holdings list —
  this turn's test assumed the former and found 3 of 7 nouns missing even
  after a full scroll, which may be a scope mismatch in the test rather than
  a product gap.
- `BHV-31` siphon: `review-4-owner-audit.mjs`'s synthetic drag-into-B
  sequence never observed the `[data-counterparty="true"]` latch. A longer
  hover dwell before checking, or a closer look at whether
  `onPointerMove`/pointer capture requires the move to originate from inside
  circle A's own element, would clarify whether this is a harness gap or
  real.
- `BHV-34` Back/Forward: `page.url()` read identically before and after
  `goBack()` while rendered weights changed — likely an async timing gap
  (`page.waitForURL` or a short poll after `goBack()` should resolve it).

Run `npm test` and `npm run build` before committing per the standard
remediation gate.

## Route after this handoff

- Section: `§11`
- Stage: `remediate`
- Role: `codex_implementation`
- Next actor: `codex`
