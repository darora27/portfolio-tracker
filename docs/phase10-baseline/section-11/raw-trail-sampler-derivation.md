# TST-03 sampler carry-forward

The exact §10 script was retained without modification:

- section-10 SHA-256: `2b4c76f16c2fd20fc0fad9eeeac9965ef8c190efca31bc852f6f0e3d67deafb9`
- section-11 SHA-256: `2b4c76f16c2fd20fc0fad9eeeac9965ef8c190efca31bc852f6f0e3d67deafb9`

The accepted §11 gate requires the live sample point and expected value to be
re-derived against rebuilt rendered pixels. No browser backend was available,
so re-derivation and execution are `deferred_to_reviewer`; the ΔE≤8 and
hue-lock≤10° thresholds were not loosened.
