# Phase 10 §10 handoff: Devan (triage approved) → Codex Implementation

Prepared July 29, 2026 by `claude/fable-5` (Cowork, owner-directed), resolving
`docs/phase10-handoffs/2026-07-29-section-10-claude-lead-to-devan-blocked.md`.

## Outcome

**Triage classification approved as submitted.** One bucket-A remediation is
authorised. Bucket B is carried to §11 with measurements attached. Bucket C is
empty.

## What round 4 established

The live matrix ran in full for the first time — 71 pass, 3 fail, 3 blocked, 0
not_run, including all fifteen criteria never performed in any prior round.
Chromium launched from the repo's own Playwright against a real GPU; the
`MachPort 1100` block is specific to the Codex sandbox and does not apply to the
review host.

**F4 / VIS-12 is closed.** All seven bays render their question once; zero-pixel
numeral/bar overlap across thirteen rows.

**F1 / TST-03 went from 7 of 8 failing to 1 of 8.** Five holdings now sample at
ΔE exactly 0, ordering is monotonic, and ASML's misplaced sample point is fixed.

## A prior owner-side nomination was wrong, and is withdrawn

`SECTION_10_TRIAGE.md` nominated F1 as a bucket-C candidate, arguing the trail
core was sub-pixel at the OVERVIEW camera and that CBRS — rendering as roughly a
one-pixel line blending with the void — could not satisfy a ΔE ≤ 8 match on
physical grounds.

**CBRS now passes at ΔE 2.10.** The criterion was satisfiable; the
implementation had not reached it. The nomination was made from a screenshot-
level reading of round 3's evidence rather than from measurement, and
measurement overturned it.

Recorded because the triage rule exists to prevent grinding against impossible
gates — and it must not become a way to retire hard ones. **Bucket C requires
evidence a criterion is unsatisfiable, not an argument that it looks unlikely.**

## The three-round misdiagnosis, and why it matters

`DEF-02`'s chirality failure was attributed to texture generation for three
consecutive rounds. Codex regenerated all 24 texture maps twice against that
theory, moving the measured scores by less than 0.02.

It was never a texture defect. **The verifier crops at the planet's published
centre, and at the approach camera the opaque holding inspector covers
96.8–100% of the band it samples** for the six failing worlds. MSFT's crop
contained the SCOPE chart and a telemetry row — no planet pixel at all.

The published geometry was correct throughout: with overlays hidden, MSFT
renders as a full disc exactly where the scene reports it. Recomputed
panel-free, two of six failures reverse to pass.

This is the same problem the owner reported from the other side — *"the planet
panel is slightly too big"* — and it is a standing lesson worth carrying: **a
verifier that samples screen space must account for what else occupies that
screen space.** A measurement can fail for reasons that have nothing to do with
the thing being measured.

## Bucket A — authorised, one remediation

1. **F1 / TST-03 — NBIS trail width floor.** The last remaining ΔE failure. The
   review notes the fix already exists in `trailRibbonHalfWidths`.
2. **F3b / DEF-02 — MSFT and CBRS mark chirality.** Recomputed panel-free, these
   two still fail decisively, so a genuinely mirrored mark exists underneath the
   panel. This is the real texture defect, now separated from the measurement
   artefact that masked it.

Do not weaken either verifier. Do not change sample points or thresholds.

## Bucket B — carried to §11, not closed

Both must be recorded with their measurements attached, and **added to §11's
acceptance criteria** so they cannot be lost:

1. **F2 / BLD-04** — route-owned long task at 55–61 ms across four attempts
   against a 50 ms ceiling. Round 3's CPU profile attributes it to Three.js
   shader-program acquisition (34.3 ms self time in `getParameters` /
   `getProgramCacheKey`) and explicitly clears texture upload. §11 deletes the
   embedded legacy dashboard with its Recharts instances, pauses the radar
   off-screen, and lazy-mounts below-fold sections — all of which reduce the
   material and program permutations the profile names.
2. **F3a — the panel-occluded measurement.** The chirality verifier cannot see
   the planet at the approach camera while the current panel geometry stands.
   §11's planet-panel rebuild — which shrinks the panel and keeps the planet
   visible — resolves it. §11 must re-run the chirality verifier after the
   rebuild and record the panel-free result.

## Bucket C — empty

No criterion in §10 has been shown unsatisfiable. No exception is recorded, and
none was self-authorised.

## For the next actor

Codex Implementation, `stage: remediate`. Fix the two bucket-A items, keep
`npm test` and `npm run build` green, commit once as `phase10(§10): <summary>`,
and route to Claude Lead review.

Live verification remains Claude's — Chromium does not launch under the Codex
sandbox on this machine (`MachPort permission error 1100`), and running Codex
under `danger-full-access` was declined. Do not claim a live pass; state the gap
plainly as you have been doing.

`OWNER_FEEDBACK_LEDGER.md` is required reading and is newer than any document it
contradicts.
