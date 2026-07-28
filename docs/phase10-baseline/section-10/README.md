# Phase 10 §10 implementation evidence

Captured by `codex/gpt-5` on 2026-07-28.

## Result

The deterministic implementation matrix is green:

- `npm test`: 99 test files / 526 tests passed at the remediation gate.
- `npm run build`: passed, including `/share` and Mission Control route smoke.
- `npx tsc --noEmit`: passed.
- Planet textures: 22,570,477 bytes shipped at 1448×724 base / 724×362 derived, below the 30,000,000-byte ceiling.
- No production dependency changed.

## Live-browser environment gap

The prescribed in-app browser runtime was initialized, then returned `No browser is available`; its one permitted discovery call returned `[]`. No visual pass is claimed from source.

During remediation the retained Playwright verifiers were also attempted
against a ready production server at `127.0.0.1:3131`. Both installed Chromium
headless-shell revisions were blocked before navigation by the CLI sandbox:
`bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer.<pid>:
Permission denied (1100)`. Exact evidence is retained in `browser-backend.txt`.

Criteria whose truth depends on live WebGL pixels, computed geometry, pointer acquisition, mobile layout, reduced-motion rendering, or long-task entries are recorded as `deferred_to_reviewer`. Their retained verifier scripts are under `scripts/`; the corresponding raw output files record the exact environment-only gap.

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

## Root-cause record

- `DEF-04` belt visibility: belt entries shared a uniformly tiny low-detail rock and only the aggregate belt control was obvious in the semantic map. Each belt holding now receives a weight-scaled icosahedral body, a direct raycast target, a ticker label, and a direct semantic link.
- `DEF-05` sun activation: the solid sun was already in `pickTargets`, but the visibly larger corona meshes had no `orreryTarget`, so much of the apparent sun was non-interactive. Both glow meshes now resolve to the portfolio target; the semantic sun link remains the keyboard source of truth.
- `DEF-06` orange shadow: the detached blob was the large second layer of the centred `.sunTelemetry` text shadow, not scene lighting. That layer was removed; the sun’s bounded geometry glow remains.
- `DEF-07` close-camera occlusion: the radial approach camera kept the enlarged sun directly behind the selected planet. The approach now moves outward and along the orbital tangent, while the wider inspector occupies the right side.
- `DEF-02` mirrored marks: the compositor’s mark orientation preceded KTX2 sphere UV application in the wrong handedness. Marks are now pre-flopped before weathering and seam repair. The retained sphere-strip verifier compares normal and mirrored live profiles for all eight worlds.

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
