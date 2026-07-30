# TST-03 sampler derivation and blocked root cause

The exact §10 script was retained without modification:

- section-10 SHA-256: `2b4c76f16c2fd20fc0fad9eeeac9965ef8c190efca31bc852f6f0e3d67deafb9`
- section-11 SHA-256: `2b4c76f16c2fd20fc0fad9eeeac9965ef8c190efca31bc852f6f0e3d67deafb9`

The accepted §11 gate requires the live sample point and expected value to be
re-derived against rebuilt rendered pixels. Review turn 3 supplied that live
run and exposed ASML at ΔE 81.622: its published point samples the blue-violet
planet, not a red ribbon.

Remediation root-caused why a sampler-only change cannot resolve that result
on the current candidate:

- The routed finding and `VIS-04` ledger still describe a 26–46° arc.
- The shipped candidate is 18–30°, recorded in `scene-model.ts` and closed on
  the owner's FB-03 sentence: *"trails look fine."*
- Reconstructing the renderer camera reproduces the old ASML coordinate within
  0.226px. Even a point at 96% of the current 30° ribbon remains 7.104px
  inside the planet's projected disc.
- The committed screenshot contains zero pixels near ASML within RGB distance
  12 of expected `#b3241d`. The only exact expected pixels belong to INTC and
  CBRS. Publishing either coordinate as ASML would be false evidence.

Full machine-readable diagnosis:
`docs/phase10-baseline/section-11/raw-remediation-f7-geometry.json`.

The unchanged script was attempted again against a rebuilt production server,
but this managed sandbox denied Chromium at macOS `MachPortRendezvous` before
navigation. That launch output is retained separately and is not treated as a
pixel result.

No ΔE, hue-lock, ordering, arc, fixture, or visual gate changed. Devan must
choose whether to authorize a temporal per-holding verifier (same thresholds,
sampled only when that holding's own ribbon is visible) or a new visual
geometry target. The current instructions prohibit both choices.
