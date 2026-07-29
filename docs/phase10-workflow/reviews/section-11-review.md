# Phase 10 §11 review — FAIL with 4 bounded findings

Reviewed July 29, 2026 by `codex/gpt-5`, executing the Claude Lead standing
prompt under the repository's role-swap runner.

- **Candidate SHA:** `a690a41f2f12ef335fd9f5288f90f6a4fa154ca4`
- **Implementation commit inside the candidate:** `629f5b89b9e3d796c5192414e31f3cf3f8af6b84`
- **Spec:** `docs/phase10-workflow/specs/section-11.md`
- **Ledger:** `docs/phase10-workflow/acceptance/section-11.json`
- **Implementer handoff:**
  `docs/phase10-handoffs/2026-07-29-section-11-codex-implementation-to-claude-lead-review.md`
- **Result:** **FAIL** — four bounded findings; two are on `critical`
  criteria.

The requested `portfolio-ux` skill was not exposed by session discovery, so
the standing prompt's fallback was used:
`.claude/skills/portfolio-ux/SKILL.md`. It constrained this review to the
declared §11 criteria and prevented the owner's newly adopted §12 Chart Room,
sky, cursor-flight, type-ramp, exit-receipt, and tab-strip ideas from becoming
advisory §11 findings.

## Independent gates and reachable evidence

| Gate | Result |
|---|---|
| `npm run phase10:acceptance -- check … --require implementer` | **PASS** |
| `npm test` | **PASS** — 104 files, 538 tests after adding the retained review observation |
| `npm run build` | **PASS** — Next.js 16.2.11, 18/18 static pages, `/share` smoke passed, `/compare` absent |
| Public production HTTP/privacy scan | **PASS** — `/share` 200; no visible currency, DRAFT, VALUE, or raw owner-field keys |
| Owner visual review | **FAIL evidence retained** in `OWNER_FEEDBACK_LEDGER.md` §3.0, committed after the implementation |
| Live Browser / cached Playwright | **BLOCKED before page launch** — in-app backends `[]`; cached Chromium rejected by the host's Mach rendezvous permission boundary |

The independent gate and HTTP outputs are retained in
`docs/phase10-baseline/section-11/raw-review-gates.txt` and
`raw-review-http.json`. The exact browser failure is retained in
`raw-review-browser-block.txt`. No screenshot, pixel, geometry,
accessibility-tree, interaction, or timing result is claimed.

## Findings

### F1 — `BHV-11` (critical, behavioral): the ten-second read still requires squinting

The owner's visual review of this candidate says:

> "the small fonts need to be a good bit larger so that you can even see what
> they have to say at all."

That is a direct failure of `BHV-11`, which requires every answer to be
findable without scrolling, squinting, or translating. It also records the
same small-type complaint as §10 as unresolved after the §11 rebuild.

**Required change.** Raise the planet-panel small-text roles that carry the
five required answers—window words, detents, chart labels, stats labels,
earnings, news metadata, and footer copy—until the owner can read the
ten-second stack without squinting. Keep the information hierarchy and word
budget; do not add prose. Retain a fresh 1440×900 panel capture and the literal
five-question ten-second result.

Evidence: `OWNER_FEEDBACK_LEDGER.md` §3.0.

### F2 — `VIS-10` (high, visual): selected planets miss the left-third anchor

The owner names ASML and reports that the selected planet renders in the
middle to middle-right with large unused space on the left. `VIS-10` requires
the selected planet at screen x approximately 30%, beside a rail no wider than
380px.

**Required change.** Correct the approach-camera framing so every selected
planet, including ASML, lands at the left-third anchor rather than centre or
right. Measure the live disc centre and panel width in pixels at 1440×900 and
retain the result; do not fake orbital positions.

Evidence: `OWNER_FEEDBACK_LEDGER.md` §3.0.

### F3 — `VIS-02` (high, carried visual): carved marks remain invisible

After the §11 panel rebuild was meant to make the sphere measurable, the owner
reports for the fourth time that no company logo is visible on any planet.
`VIS-02` requires the carved marks to read as part of the terrain with one
capital facing the camera at all times. The owner observation establishes the
visibility failure; `DEF-02` chirality remains unperformed rather than passed.

**Required change.** First establish a direct shipped-view measurement of the
mark itself for all eight worlds. Then correct the camera/material/mark
visibility so at least one carved capital reads on every selected planet while
retaining terrain lighting, grain, normal-map embossing, erosion, and
brand-first phase. Do **not** regenerate textures before the direct mark
measurement; four prior regenerations moved less than measurement noise. Once
visible, run the direct all-eight chirality verifier.

Evidence: `OWNER_FEEDBACK_LEDGER.md` §3.0 and
`docs/phase10-baseline/section-11/raw-review-browser-block.txt`.

### F4 — `BHV-15` (high, behavioral): `SINCE BUY` and `MAX` are the same control

The executable rendered-DOM observation activates all four detents and records
their title answers and SVG path signatures. `SINCE BUY` and `MAX` both render
`▲ 23.7%` and the exact same path. Only the title word changes. `BHV-15`
requires every range toggle to visibly change both the figure and plotted
shape.

**Required change.** Give `SINCE BUY` its purchase-date window and `MAX` the
full available series so they produce distinct figures and paths whenever
pre-purchase history exists. Add rendered interaction coverage that asserts
all four detents change both answer and shape on a fixture with distinct
windows.

Evidence:
`docs/phase10-baseline/section-11/raw-review-return-toggle.json` and
`docs/phase10-baseline/section-11/scripts/review-return-toggle.test.tsx`.

## Unperformed matrix

The following ledger entries remain `not_run` because the browser could not
launch, or because this fail turn stopped after recording every currently
evidenced failure. They are not implicit passes:

`BHV-10`, `BHV-12`, `BHV-13`, `BHV-14`, `BHV-16`, `BHV-17`, `BHV-18`,
`BHV-19`, `BHV-20`, `BHV-21`, `BHV-22`, `BHV-30`, `BHV-31`, `BHV-32`,
`BHV-33`, `BHV-34`, `BHV-35`, `BHV-05`, `VIS-11`, `VIS-12`, `VIS-13`,
`VIS-14`, `VIS-15`, `VIS-16`, `VIS-17`, `VIS-18`, `VIS-19`, `VIS-20`,
`VIS-04`, `DEF-02`, `MOB-10`, `MOB-11`, `ACC-10`, `ACC-11`, `ACC-12`,
`ACC-13`, `TST-10`, `TST-11`, `TST-12`, `TST-03`, `BLD-10`, `BLD-11`,
`PRV-11`, `PRV-12`, and `PRV-14`.

`BLD-04` is explicitly `blocked` in the ledger with the launch failure
attached. The unchanged absolute `<50ms` gate remains in force. After
remediation, the next reviewer must run all newly reachable entries, including
the six carried criteria, before any acceptance.
