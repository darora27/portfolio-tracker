# Phase 10 §11 handoff: Codex Implementation → Devan, blocked

Prepared July 29, 2026 by `codex/gpt-5`.

## Outcome

F7 / `TST-03` and dependent F8 / `VIS-04` cannot be remediated as routed
without contradicting the accepted owner direction or changing the verifier.
The finding assumes the current trail band is 26–46°. The candidate actually
ships 18–30°, and FB-03 is closed on Devan's sentence *"trails look fine."*

At that shorter band, the graded frame contains no visible ASML ribbon pixel.
A sampler coordinate cannot truthfully point to a pixel that the planet and
sun occlude. No production source was changed, and no threshold, fixture,
trail length, renderer order, or verifier was altered.

State remains at §11 remediation, is `blocked`, and routes to Devan for one
precise decision.

## What this turn established

- Confirmed the live-state/spec mismatch: F7/F8 and `VIS-04` say 26–46°, while
  `scene-model.ts` and the newer authoritative owner ledger say 18–30°.
  — done by `codex/gpt-5`
- Reconstructed review turn 3's ASML sample from the real 1440×900 camera and
  eight-holding payload. The model reproduces the committed coordinate within
  0.226px. — done by `codex/gpt-5`
- Tested the furthest safe in-ribbon coordinate without changing the trail:
  96% of the 30° arc still projects 7.104px inside ASML's disc. The whole
  current ribbon is occluded in that frame. — done by `codex/gpt-5`
- Searched the committed pixels. The ASML region contains zero pixels within
  RGB distance 12 of expected `#b3241d`; the only exact saturated loss-red
  pixels in the frame belong to INTC and CBRS. Reusing those coordinates for
  ASML would be false evidence. — done by `codex/gpt-5`
- Attempted the unchanged retained verifier against a rebuilt production
  server. The managed sandbox denied Chromium before navigation at
  `MachPortRendezvous`; no new pixel result is claimed. — done by
  `codex/gpt-5`
- Re-ran the unchanged candidate's full deterministic gates: 106 test files /
  549 tests pass, and the Next.js 16.2.11 production build passes with 18/18
  static pages and `/share` smoke green. — done by `codex/gpt-5`

## Evidence

- Incoming review commit:
  `f271fc77e73d425f8f6d6baa507b021aac257a0c`.
- Root-cause measurement:
  `docs/phase10-baseline/section-11/raw-remediation-f7-geometry.json`.
- Prior live pixels:
  `docs/phase10-baseline/section-11/raw-rgb-pixel-output-diagnostic.json` and
  `docs/phase10-baseline/section-11/pixel-samples/overview-trail-samples.png`.
- Derivation:
  `docs/phase10-baseline/section-11/raw-trail-sampler-derivation.md`.
- Sandbox launch record:
  `docs/phase10-baseline/section-11/raw-remediation-f7-browser-gap.txt`.
- Full tests:
  `docs/phase10-baseline/section-11/raw-remediation-f7-npm-test.txt`.
- Production build:
  `docs/phase10-baseline/section-11/raw-remediation-f7-npm-build.txt`.
- Acceptance check:
  `docs/phase10-baseline/section-11/raw-remediation-f7-acceptance-check.txt`.
  It passes structurally. `VIS-04` and `TST-03` use the schema's explicit
  non-pass `deferred_to_reviewer` value while state routes to Devan; neither is
  claimed pass, and the notes say a reviewer cannot resolve the owner decision.
- Inherited red: none.

## Why the routed change is impossible as written

The unchanged verifier must sample every holding from one 1440×900 still. In
that still, ASML's 18–30° ribbon is fully behind its own disc/sun. The bounded
instructions also prohibit all ways to make a sample exist:

1. Re-lengthening the arc is explicitly forbidden and would reopen confirmed
   FB-03.
2. Drawing the ribbon over the planet changes owner-confirmed pixels and the
   physical behind-the-body trail rule.
3. Pointing ASML at INTC or CBRS pixels would falsify per-holding evidence.
4. Capturing each holding at a naturally visible phase changes the mandated
   unmodified verifier and its single-still method.

## Decision needed

Recommended: authorize option A.

- **A — temporal verifier:** keep the owner-confirmed 18–30° trails and every
  existing ΔE/hue/ordering threshold, but allow `sample-live-rgb.mjs` to wait
  for and capture each holding only when that holding's own ribbon is visibly
  clear. `VIS-04` receives a captioned multi-frame pixel plate rather than one
  impossible all-holdings still.
- **B — visual geometry change:** adopt a new minimum-visible-tail rule that
  makes every trail emerge from occlusion in one still. This reopens FB-03 and
  needs a fresh owner visual verdict.
- **C — owner carry/retirement:** explicitly carry or retire TST-03/VIS-04.
  This is not available to the implementation actor and would be an owner gate
  decision.

No recommendation is made to re-widen the trails or weaken ΔE.

## Exact normal-Terminal reproduction

Terminal 1:

```bash
cd /Users/devanarora/Desktop/portfolio-tracker
npm run build
npm run start
```

Terminal 2:

```bash
cd /Users/devanarora/Desktop/portfolio-tracker
PHASE10_BASE_URL=http://127.0.0.1:3000/share \
  node docs/phase10-baseline/section-11/scripts/sample-live-rgb.mjs \
  | tee docs/phase10-baseline/section-11/raw-remediation-f7-owner-rgb.txt
PHASE10_BASE_URL=http://127.0.0.1:3000/share \
  node docs/phase10-baseline/section-11/scripts/sample-live-rgb-diagnostic.mjs \
  | tee docs/phase10-baseline/section-11/raw-remediation-f7-owner-diagnostic.json
```

These commands reproduce the current failure; they do not resolve the
accepted-direction conflict above. Read the final machine-readable lines
literally and do not treat launch success as a criterion pass.

## Route after this handoff

- Section: `§11`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `blocked`
- Next actor: `devan`
