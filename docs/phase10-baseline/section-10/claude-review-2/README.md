# Phase 10 §10 — Claude Lead review round 2 evidence

Captured by `claude-code/opus-5` on 2026-07-28 against candidate
`3d1882a116ef116f21a529eaa050f17f88875def`.

Method: `next start` production build at `http://127.0.0.1:3131/share`,
headless Chromium from the repository's own `node_modules` (`playwright`),
1440×900 unless stated. Real GPU (`ANGLE (Apple, Apple M2, OpenGL 4.1)`).
The implementer's environment could not launch Chromium; this environment can,
so every criterion the implementer left `deferred_to_reviewer` was reachable.

## Section verifiers, run unmodified

| verifier | criterion | result |
|---|---|---|
| `capture-live-sphere-strip.mjs` | `VIS-01`, `DEF-02`, `TST-04` | luminance loop passes for all 8; **aborts** on chirality at COST |
| `audit-live-interactions.mjs` | `BHV-02` (keyboard), `ACC-03`, `ACC-05`, `BHV-03`, `BHV-08` | passes |
| `sample-live-rgb.mjs` | `TST-03` | **aborts** — `GOOG deltaE 13.022 > 8` |
| `measure-long-tasks.mjs` | `BLD-04` | **fails the ceiling** — 62/56/56/56/57 ms |
| `capture-live-evidence.mjs` | `VIS-12`, `MOB-01` | runs end-to-end; `after/` and `mobile/` populated |

`capture-live-evidence.mjs` completing is the direct proof that F2's satellite
blocker is gone: it previously aborted at `Could not acquire the HAZARD
satellite` before its first screenshot.

## Files

- `raw-strip-chirality.txt` — non-throwing full table for both assertions
  inside `capture-live-sphere-strip.mjs`: per-world equatorial luminance
  (`VIS-01`) and mark chirality (`DEF-02`).
- `raw-sphere-strip-abort-DEF-02.txt` — the section verifier's own abort.
- `raw-trail-sampler-TST-03.txt` — the section verifier's abort plus the full
  eight-holding table.
- `raw-long-tasks-BLD-04.txt` — five fresh 1440×900 CPU-2× contexts, unmodified
  script, not baseline-subtracted.
- `raw-satellites-BHV-02.txt` — pointer sweep of the projected satellite orbit
  in four camera states.
- `raw-satellite-clicks-DEF-09.txt` — all three satellites acquired by pointer.
- `raw-satellite-station-DEF-09.txt` — nine stable-hover click samples.
- `raw-hazard-station-DEF-09.txt` — five independent direct-aim sessions,
  5/5 acquired, 5/5 routed to `station=hazard`.
- `raw-surfaces.txt` — live DOM measurements for `DEF-10`, `VIS-08`, `VIS-09`,
  `BHV-01`, `BHV-04`, `BHV-10`, `ACC-07`, `MOB-03`.
- `raw-starfield-VIS-06.txt` — connected-component analysis of the overview
  capture. Inconclusive; see below.
- `crop-manifest-contribution.png` — 3× crop of the MANIFEST bay's CONTRIBUTION
  column.
- `crop-overview-starfield.png` — 2× crop of the overview starfield.

## Note on `VIS-06`

The previous review recorded an observation that the overview "reads as an even
dot lattice". On closer inspection the regular lattice in
`crop-overview-starfield.png` is a reticle/graph-paper overlay, not the
starfield, and the component analysis in `raw-starfield-VIS-06.txt` is
contaminated by UI glyphs (its brightest component is the caption bar at
763,860). No claim is made in either direction; `VIS-06` is recorded as
unperformed, not as a finding.
