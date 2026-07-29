# Section 11 implementer evidence

Initial implementation evidence was recorded on 2026-07-28 by `codex/gpt-5`.

The command verifiers, deterministic DOM/component verifiers, unauthenticated
production-HTML privacy scan, full test suite, and production build were run
locally against the §11 working tree.

That initial turn retained non-live evidence and deferred the browser/visual
matrix. It did not claim a screenshot, pixel sample, geometry measurement,
accessibility-tree result, or performance timing.

The unchanged §10 sampler and long-task scripts are retained in `scripts/`.
They were not executed because both require a live browser context.

## §11.R remediation — 2026-07-29

Recorded by `codex/gpt-5`.

- F1 / FB-05 is root-caused, not fixed: Mission Control maps reading copy to
  the smallest legal 11px role. The bounded §12a fix is semantic role remapping,
  not a sixth token or local font nudge. See
  `raw-mission-control-type-root-cause.md`.
- F2 / VIS-10 source work targets the selected world at x approximately 30%
  from four orbit directions. The right-anchored panel now supports the
  owner-requested 460/520/580px variants and grows left. The retained capture
  harness writes live geometry when it can launch.
- F3 / FB-04 reached the owner's stop/report guard. Direct decode of all eight
  shipped base maps proves six marks exact, while IBM and NBIS use
  opaque-rectangle SVG alpha masks. No mark shape reaches those two textures,
  and normal/mirrored composites are byte-identical. No texture was regenerated
  or changed. See `raw-shipped-mark-measurement.json` and
  `captures/all-eight-texture-marks.png`.
- Cached Chromium 131 was launched through the retained Node capture script
  against the production server. The host denied its Mach rendezvous before
  page launch. No live visual pass is claimed. Exact commands and failure text
  are retained in `raw-remediation-browser-block.txt`.
