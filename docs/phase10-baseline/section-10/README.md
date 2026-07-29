# Phase 10 §10 implementation evidence

Captured by `codex/gpt-5` on 2026-07-28.

## Result

The deterministic implementation matrix is green:

- `npm test`: 99 test files / 526 tests passed at the remediation gate.
- `npm run build`: passed, including `/share` and Mission Control route smoke.
- `npx tsc --noEmit`: passed.
- Planet textures: 23,075,805 bytes shipped at 1448×724 base / 724×362 derived, below the 30,000,000-byte ceiling.
- No production dependency changed.

## Live-browser environment gap

The prescribed in-app browser runtime was initialized, then returned `No browser is available`; its one permitted discovery call returned `[]`. No visual pass is claimed from source.

During remediation the retained Playwright verifiers were also attempted
against a ready production server at `127.0.0.1:3131`. Both installed Chromium
headless-shell revisions were blocked before navigation by the CLI sandbox:
`bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer.<pid>:
Permission denied (1100)`. Exact evidence is retained in `browser-backend.txt`.

Criteria whose truth depends on live WebGL pixels, computed geometry, pointer acquisition, mobile layout, reduced-motion rendering, or long-task entries are recorded as `deferred_to_reviewer`. Their retained verifier scripts are under `scripts/`; the corresponding raw output files record the exact environment-only gap.

## Review remediation round 3 — blocked on required live proof

The four round-3 findings were remediated in code without changing a retained
verifier, threshold, or assertion:

- `TST-03`: the published sample moves onto the stable body of the arc; the
  crossed core keeps outer-orbit coverage measurable, and the hollow additive
  glow no longer overlaps or washes the core.
- `BLD-04`: scene program families reveal over separate animation frames and
  compatible basic materials share shader parameters, directly addressing the
  reviewer’s WebGLPrograms attribution.
- `DEF-02`: supplied marks remain source-forward for DataTexture’s
  `flipY=false` path, widen to 24%, and carry stronger terrain-derived
  contrast through base, emissive, and normal maps.
- `VIS-12`: SCOPE, HAZARD, and SIGNALS now suppress their persistent question
  while active; rendered-DOM coverage exercises all five stations that can
  duplicate the active question.

The final deterministic matrix is green at 99 files / 527 tests, TypeScript,
and the production build. The regenerated payload is 22,804,307 bytes at
1448×724 base / 724×362 derived; all eight `luminanceStdDev` values remain
above 0.1.

Live proof is nevertheless blocking in this remediation round. The connected
browser reported no available session and every unchanged retained Playwright
script was rejected before navigation by the host sandbox’s Mach-port
restriction. The handoff for this round says those results may no longer be
deferred to review, so no live pass is claimed and the workflow routes to
Devan. Exact evidence is in `remediation-round-3-verification.txt`.

## Review remediation

The six bounded Claude Lead findings were addressed without changing the
accepted thresholds or expanding route scope:

- `VIS-01`: the planet shader now carries an identity-owned linear exposure.
  Applying the selected scalars to the reviewer's measured linear luminances
  targets ASML 0.214, COST 0.218, MSFT 0.214, IBM 0.203, INTC 0.197, CBRS
  0.215, and NBIS 0.219; GOOG remains unchanged at 0.342. This is a calibration
  prediction, not a claimed live pass. The accepted `[0.16, 0.55]` window,
  identity hue, texture maps, and `luminanceStdDev` floor are unchanged.
- `BHV-02` / `DEF-09`: corona hits are tagged `portfolio-glow`. Ray resolution
  skips that decorative envelope only when a more specific intersected target
  exists, so satellites inside the enlarged corona win while the solid sun
  retains priority over objects geometrically behind it.
- `TST-03`: the measurable 3px trail core is now opaque normal blending and
  therefore carries the payload-derived ramp colour; the 9px atmospheric glow
  stays additive.
- `BLD-04`: Three's raw KTX2 path parsed and zstd-decoded each map on the UI
  thread. A module worker now fetches, parses, and decompresses the same
  committed KTX2 assets after two animation frames, then transfers raw buffers
  back for `DataTexture` upload. The shader fallback remains the first frame.
- `VIS-12` and its surfaced `DEF-10` / `VIS-08` / `VIS-09` / `BHV-10`
  defects: the approach panel is viewport-bounded and scrollable, the camera
  moves farther outward and looks farther along the tangent, LOG restores
  paper-on-ink chip contrast and whole-row scrolling, each active question
  renders once, and PLOT replaces the redundant MANIFEST table with a compact
  two-word direct action.

The deterministic remediation matrix is retained in
`remediation-verification.txt`: 99 test files / 526 tests, TypeScript, and the
production build are green. Live remeasurement remains explicitly assigned to
the reviewer because of the browser environment gap above.

## Review remediation round 2

The four bounded round-2 findings were addressed without changing their gates:

- `TST-03`: the 3px model core is now a genuinely opaque Three.js pass rather
  than an opacity-1 member of the transparent render queue, and its overview
  ribbon increases centre-pixel coverage at the verifier's sample point. The
  retained live pixel result remains deferred to the reviewer; the additive
  atmospheric glow remains separate.
- `BLD-04`: the remaining task was attributed to the first decoded planet's
  base, emissive, and normal maps being bound together, making the next frame
  upload all three at the reviewer's observed ~570–590ms point. They now bind
  one per animation frame. The worker, shader-art first paint, absolute 50ms
  threshold, and no-post-processing rule are unchanged.
- `DEF-02`: the supplied-mark mask had been joined in the same Sharp pipeline
  that removed terrain alpha; Sharp emitted three channels, dropping the mask.
  The resulting rectangular patch was invariant under `.flop()`, which is why
  the manifest claimed a chirality correction while the KTX files did not
  change. Tinting and the one-channel alpha join are now separate stages. All
  24 maps changed after regeneration, and the intended pre-flop is now present
  in the shipped texture data.
- `VIS-12`: MANIFEST now follows PLOT's active-question rule, so its question
  renders once. CONTRIBUTION values occupy the half opposite their signed bar,
  keeping the coloured fill and centre detent away from every numeral.

Focused tests, TypeScript, the full 99-file / 526-test suite, and the production
build pass. The four retained browser verifiers were attempted against the
rebuilt candidate and all hit the same environment-only Chromium launch block
before navigation, so live results remain deferred rather than self-passed.

## Root-cause record

- `DEF-04` belt visibility: belt entries shared a uniformly tiny low-detail rock and only the aggregate belt control was obvious in the semantic map. Each belt holding now receives a weight-scaled icosahedral body, a direct raycast target, a ticker label, and a direct semantic link.
- `DEF-05` sun activation: the solid sun was already in `pickTargets`, but the visibly larger corona meshes had no `orreryTarget`, so much of the apparent sun was non-interactive. Both glow meshes now resolve to the portfolio target; the semantic sun link remains the keyboard source of truth.
- `DEF-06` orange shadow: the detached blob was the large second layer of the centred `.sunTelemetry` text shadow, not scene lighting. That layer was removed; the sun’s bounded geometry glow remains.
- `DEF-07` close-camera occlusion: the radial approach camera kept the enlarged sun directly behind the selected planet. The approach now moves outward and along the orbital tangent, while the wider inspector occupies the right side.
- `DEF-02` mirrored marks: round 2 fixed the dropped alpha mask, but round 3
  proved the pre-flopped silhouette itself remained mirrored for MSFT while
  several other worlds carried too little mark signal to grade. The final
  bounded remediation follows round 4's panel-free measurement: MSFT and CBRS
  alone receive a horizontal UV handedness correction, while the other six
  supplied masks remain source-forward for DataTexture’s `flipY=false` path.
  The retained sphere-strip verifier still compares normal and mirrored live
  profiles for all eight worlds and remains required before review can pass.

## Owner-authorized remediation round 4

Round 4 changes only the two approved bucket-A mechanisms:

- `TST-03`: `trailRibbonHalfWidths` now keeps an 0.85 taper floor. At the
  unchanged 0.62 sample fraction, the opaque-core half-width rises from
  0.09885 to 0.13605 world units while retaining a 15% directional taper.
  The live sampler, sample points, thresholds, ramp values, arc, and 12% head
  are unchanged.
- `DEF-02`: the texture generator applies a horizontal UV correction only to
  MSFT and CBRS, the two marks that fail decisively in the reviewer’s
  panel-free measurement. Only those six KTX2 maps and two thumbnails changed.

The regenerated payload is 22,803,051 bytes at 1448×724 base / 724×362
derived; every `luminanceStdDev` remains above 0.1 (0.106628–0.185874).
Focused scene/texture tests and TypeScript pass. Full binding gates and the
acceptance-ledger check are recorded in
`remediation-round-4-verification.txt`.

Live browser proof remains assigned to Claude Lead by the owner-approved
handoff. No live pass is claimed by Codex. `BLD-04` and the panel-occluded half
of `DEF-02` are owner-approved bucket-B carries to §11, with the round-4 review
measurements retained unchanged. — recorded by codex/gpt-5

## Texture regeneration

All eight worlds were regenerated in one pass. Each mark is edge-eroded, tinted from the underlying terrain luminance, folded into the derived normal/emissive maps, and repeated at −120°, 0°, and +120° longitude on the equator. The source proxy asserts identity ΔE ≤ 12, `luminanceStdDev ≥ 0.1`, and seam ΔE ≤ 6 for every world.

`basisu --version` was unavailable exactly as recorded in `texture-byte-count.txt`; the existing zstd KTX2 path therefore moved down the measured resolution ladder. Ladder step 4 was not reached, so no `PHASE10_PROGRESS.md` entry was required.

## Static and semantic coverage added

- Single-source five-ramp palette/firewall suite with 64 samples per ramp.
- Pure tests for sun scaling, trail sign/arc/head/flat fallback, scenery spin, moon periods, star buckets, ring alpha, aurora percent sampling/chord, weather wisps, radar colour/blip size, and Mission Control geometry.
- Rendered DOM tests for the accessible radar/manifest detail card, public-only values, parchment briefing, reduced-motion timestamp, keyboard ring entry, canvas hiding, and desktop WebGL gating.
- Local Chakra Petch 600 face plus OFL licence under `public/fonts/chakra-petch/`.

## Retained reviewer commands

Run against a production server, normally with `PHASE10_BASE_URL=http://127.0.0.1:3000/share`:

```text
node docs/phase10-baseline/section-10/scripts/capture-live-evidence.mjs
node docs/phase10-baseline/section-10/scripts/audit-live-interactions.mjs
node docs/phase10-baseline/section-10/scripts/sample-live-rgb.mjs
node docs/phase10-baseline/section-10/scripts/capture-live-sphere-strip.mjs
node docs/phase10-baseline/section-10/scripts/measure-overview-fit.mjs
node docs/phase10-baseline/section-10/scripts/measure-long-tasks.mjs
```
