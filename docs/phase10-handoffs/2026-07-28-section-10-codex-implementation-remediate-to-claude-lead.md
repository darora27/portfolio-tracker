# Phase 10 §10 handoff: Codex Implementation → Claude Lead, remediation

Prepared July 28, 2026 by `codex/gpt-5`.

## Outcome

The bounded F1–F6 implementation changes are complete and §10 is ready for
independent Claude Lead review. The acceptance ledger, TypeScript, all 526
tests, and the production build are green. Live WebGL remeasurement remains an
explicit environment-only evidence gap: this CLI could start the production
server, but neither available browser path could launch Chromium.

## Bounded changes

- F1 / `VIS-01`: added identity-owned linear render exposure, calibrated from
  the reviewer's full live table to target approximately 0.20–0.22 for the
  seven dark worlds; GOOG remains unchanged. The `[0.16, 0.55]` window,
  identity hues, KTX2 assets, and source `luminanceStdDev` floor are unchanged
  — done by codex/gpt-5.
- F2–F3 / `BHV-02`, `DEF-09`: corona meshes now identify as
  `portfolio-glow`. Ray resolution skips that decorative envelope only when a
  more specific intersected target exists. Unit coverage proves a satellite
  inside the corona wins, a corona-only hit still activates the sun, and a
  solid-sun hit keeps priority over geometry behind it — done by
  codex/gpt-5.
- F4 / `TST-03`: the measurable 3px trail core is opaque normal blending, so
  it carries `rampForWeekly()` directly; the atmospheric 9px glow remains
  additive — done by codex/gpt-5.
- F5 / `BLD-04`: raw KTX2 fetch, parse, and zstd decode moved from Three's
  UI-thread raw-texture path to a bundled module worker. Work still begins
  after two animation frames, decoded buffers transfer back without copying on
  the UI thread, and deterministic shader art remains bound for first paint
  and failures — done by codex/gpt-5.
- F6 / `VIS-12` with `DEF-10`, `VIS-08`, `VIS-09`, `BHV-10`: the approach
  inspector is viewport-bounded and scrollable; the close camera is farther
  out and looks farther along the orbital tangent; LOG restores paper-on-ink
  chip contrast and whole-row scrolling; each active bay question renders
  once; and PLOT replaces the redundant MANIFEST table with a compact
  two-word direct holding action — done by codex/gpt-5.

## Verification

- `npm run phase10:acceptance -- check
  docs/phase10-workflow/acceptance/section-10.json --require implementer`:
  PASS — done by codex/gpt-5.
- `npx tsc --noEmit`: PASS — done by codex/gpt-5.
- Focused scene-model and Mission Control matrix: 31/31 PASS — done by
  codex/gpt-5.
- `npm test`: PASS — 99 files, 526/526 tests — done by codex/gpt-5.
- `npm run build`: PASS — Next.js 16.2.11, TypeScript clean, unchanged route
  list, `/share` 200, Mission Control manifest 200 — done by codex/gpt-5.
- No package manifest changed, no dependency was added, and no new route was
  created — done by codex/gpt-5.
- No `.env*` content was read, printed, edited, staged, or committed; no
  `vercel --prod` or deployment command was run — done by codex/gpt-5.

## Live evidence gap

The in-app browser returned:

```text
selection: No browser is available
discovery: []
```

The retained Playwright probes were then attempted against a ready production
server at `http://127.0.0.1:3131/share`. Chromium revisions 1148 and 1234 both
failed before navigation:

```text
bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer.<pid>:
Permission denied (1100)
```

Accordingly, every affected live criterion remains
`deferred_to_reviewer`; no pixel, pointer, geometry, screenshot, mobile,
accessibility, fallback, or long-task pass is claimed. Exact evidence is in:

- `docs/phase10-baseline/section-10/browser-backend.txt`
- `docs/phase10-baseline/section-10/remediation-verification.txt`
- `docs/phase10-baseline/section-10/raw-*.txt`

## Required independent review

1. Replace the placeholder in `section.remediation_commits` with this
   remediation commit's SHA from `git log -1` — assigned to Claude Lead.
2. Run `capture-live-sphere-strip.mjs` to completion and verify every world in
   `[0.16, 0.55]`, including INTC, plus all chirality checks — assigned to
   Claude Lead.
3. Run `probe-satellite-acquisition.mjs`,
   `audit-live-interactions.mjs`, and then `capture-live-evidence.mjs` to
   completion. Inspect every camera state and populate the required `after/`
   and `mobile/` artifacts — assigned to Claude Lead.
4. Run `sample-live-rgb.mjs`; confirm deltaE ≤ 8, hue lock, and same-direction
   magnitude ordering for all eight fixtures — assigned to Claude Lead.
5. Run `measure-long-tasks.mjs` unchanged across five fresh 1440×900 CPU-2×
   contexts and require every maximum below 50ms — assigned to Claude Lead.
6. Exercise the 27 criteria listed in
   `section.unperformed_criteria_note`, including the surfaced planet-detail,
   Mission Control, mobile, accessibility, fallback, and first-paint checks —
   assigned to Claude Lead.
7. Independently rerun `npm test` and `npm run build` before PASS — assigned
   to Claude Lead.

The remediation commit subject is:

`phase10(§10): remediate live verification failures`

Per the non-self-reference rule, Codex does not write that commit's own hash
into state.
