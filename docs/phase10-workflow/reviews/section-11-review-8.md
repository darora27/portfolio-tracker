# Phase 10 §11 review (turn 8) — MOB-11 CLOSED, ledger hygiene reconciled, BLD-04 re-opened FAIL

Reviewed July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: review`),
covering both roles under `single_provider_mode` (`PHASE10_STATE.json`
`applies_from: "§11"`).

- **Candidate SHA:** `0c3a812f5d755bf3f981741ecff6a9f5f2b2f20c` —
  `phase10(§11): remediate MOB-11-1 — add HOLDINGS label to fallback holdings list`
- **Prior review-7 candidate:** `e8faf0d3ae6ce7f14f9a9f0b44205f51f0b4ae77` (FAIL, MOB-11-1)
- **Remediation commit since review-7:** `0c3a812` — one line of application
  source (`OrreryWorld.tsx:379`), plus evidence/ledger/handoff bookkeeping.
- **Spec:** `docs/phase10-workflow/specs/section-11.md`
- **Ledger:** `docs/phase10-workflow/acceptance/section-11.json`
- **Result:** **FAIL, not pass.** `MOB-11-1` is **CLOSED**. The ledger's
  `--require reviewer` check — flagged as never run to a clean pass by review
  turns 6 and 7 — was run this turn and is now clean except for one criterion.
  A fresh, independent re-measurement of the carried, high-risk `BLD-04`
  long-task gate found it marginal/flaky on this review environment (2 of 3
  independent batches breach the 50ms boundary). The section cannot accept
  this turn.

## Independent gates

| Gate | Result |
|---|---|
| `npm test` | **PASS** — 107 files, 553 tests, zero failures (independent run, this turn; raw output at `raw-npm-test.txt`) |
| `npm run build` | **PASS** — Next.js 16.2.11 production build, exit 0, 18/18 static pages, `/share` smoke pass (independent run, this turn; raw output at `raw-npm-build.txt`) |
| Chromium launch, this sandbox | Confirmed directly again, three separate fresh production server processes this turn (ports 3500, 3600, 3700) |

## `MOB-11-1` — CLOSED, pass

Independently rebuilt and started a fresh production server (port 3500, not
the implementer's process) and re-ran the naming sweep against candidate
`0c3a812` using this turn's own copy of the verifier script
(`scripts/review-8-mob11-verify.mjs`, distinct output paths from the
implementer's evidence). At both 390×844 and 320×844: `HOLDINGS` now present
in `document.body.innerText` alongside `RETURNS`/`RISK`/`NEWS`/`EARNINGS`;
`CORRELATION`/`TRADES` correctly still absent per the owner's 2026-07-30
ruling; zero banned nouns; zero horizontal overflow. Directly inspected
`raw-review-8-fallback-390.png`: every holding item now reads `HOLDINGS /
<TICKER> · <Company>`, matching the `NEWS / ...`, `BELT BODY / ...`, `RETURNS
/ ...`, `RISK / ...`, `EARNINGS / ...` convention of its siblings. Server
torn down after capture (confirmed via `lsof`). `MOB-11-1` CLOSED, moved to
`closed_findings_history`.

With `BHV-31` already closed (review turn 7) and `MOB-11` closing here, §11
has **zero remaining bounded findings from prior review turns.**

## Ledger-hygiene reconciliation — the gap review turns 6 and 7 both flagged

Review turn 7 explicitly recorded that `npm run phase10:acceptance -- check
<ledger> --require reviewer` had never been run to a clean pass, and warned
that the visual-truth rule (`verifier.kind: "browser"` requires pixel
evidence, not just `dimension: "visual"`) applies to nearly the whole matrix.
Running it fresh this turn confirmed that: **93 issues across 44 of 54
criteria** — overwhelmingly predating this remediation and unrelated to
`MOB-11`.

Investigation (not assertion) established the substance behind every one of
these 93 issues before touching anything:

- Read the actual verifier scripts (`review-3-audit.mjs`,
  `review-3-audit-2.mjs`, `review-3-owner-audit.mjs`,
  `review-4-owner-audit.mjs`, etc.) that produced the criteria currently
  marked `pass`. Every one performs real, live, gesture-driven or DOM-level
  verification — the substance was never in question.
- Confirmed that most of these scripts **also captured a screenshot** in the
  same browser session as their measurement (e.g.
  `raw-review-3-overview-postzoom.png`, `raw-review-3-room-scrolled.png`,
  `raw-review-3-draft-rig.png`, `captures/asml-panel-type.png`,
  `captures/asml-selected.png`) — real pixel evidence that already existed on
  disk but was never cited in the criterion's `reviewer.evidence` array, and
  never matched the `required_artifacts` filenames guessed at spec time
  (`after/mission-control-1440x900.png` and similar were never produced by
  any tooling — `phase10-capture.mjs` writes to `captures/`, and the
  review-turn scripts write to `raw-review-N-*`).
- **Directly viewed** (not merely referenced) the highest-value candidate
  screenshots before citing them — `raw-review-3-room-scrolled.png` (confirms
  the descent order, sticky strip content, and the exact plain-language
  correlation copy required by `BHV-18`), `raw-review-3-overview-postzoom.png`
  (confirms naming, no error furniture, sun dominance, label spacing),
  `captures/asml-panel-type.png` (confirms the full five-zone panel stack,
  window attachment, and figure formatting), `captures/asml-selected.png`
  (confirms the planet unoccluded beside the panel), `raw-review-3-draft-rig.png`
  (confirms the DRAFT rig chassis, ghost rings, tank rack, banner, and VALUE
  column), `raw-review-4-room.png` (confirms the RETURNS chart at room scale),
  `raw-review-4-reduced-motion-mc.png` and `raw-review-6-overview-ring-check.png`.

For every criterion where this established that real, already-retained pixel
evidence existed but was uncited, or that `required_artifacts` named a file no
tooling had ever produced while a substantively equivalent real artifact
existed: `required_artifacts` was corrected to the real, existing, retained
filename, and that filename was added to `reviewer.evidence`. **No new
verification was invented and no threshold, gate, or measurement method was
touched** — this is citation and bookkeeping correction only, reconciling the
ledger's declared evidence names to what was actually produced and already
independently judged sufficient by the review turns that ran it (per
`docs/phase10-workflow/reviews/section-11-review-3.md` through `-7.md`).

Two genuinely missing pieces of evidence were produced fresh this turn rather
than reconciled from history, because no companion screenshot existed in
their original sessions:

- **`BHV-20`** (first-visit legend): `raw-review-8-legend-first-visit.png`,
  captured this turn — shows the legend bar (`SUN = WHOLE PORTFOLIO · PLANET
  = ONE HOLDING · CLICK EITHER TO OPEN`) present during the first-visit
  orientation, matching the JSON check's `legendPresentFirstVisit: true` /
  `legendPresentAfterInteraction: false`.
- **`BLD-04`**: see below — this one did not reconcile cleanly.

The full reconciliation script is retained at
`docs/phase10-baseline/section-11/scripts/reconcile-review-8-ledger.mjs` for
audit — every file path it cites was existence-checked before being written
into the ledger (the script throws rather than citing a nonexistent path).

After reconciliation, `npm run phase10:acceptance -- check <ledger> --require
reviewer` dropped from 93 issues across 44 criteria to **zero issues outside
`BLD-04`** — confirmed by re-running the check to a clean result on every
other criterion.

## New finding: `BLD-04` (carried, high risk) — re-opened FAIL, marginal/flaky on this environment

`BLD-04` has been recorded `pass` since review turn 3, most recently
re-confirmed by review turns 3-7 and by the owner's own capture run
(2026-07-29, 5 fresh contexts, 0ms every context). Re-verifying it
independently this turn — required practice for any carried criterion, and
exactly what closed it originally — found it is **not** a confident,
reproducible pass in this environment.

Three independent invocations of the unmodified `measure-long-tasks.mjs`
(unchanged `<50ms` gate, five fresh 1440×900 CPU-2× contexts each, not
baseline-subtracted):

| Run | Server | Result | Per-context (ms) |
|---|---|---|---|
| A | fresh process, port 3600 | **FAIL** | 0, 52, 0, 0, 0 |
| B | same process as A, second invocation | **FAIL** | 0, 0, 0, 50, 0 |
| C | a second, completely separate fresh process, port 3700 | **PASS** | 0, 0, 0, 0, 0 |

`ps aux` at measurement time showed no other node/npm/next process
contending for CPU against this repository (only unrelated low-CPU
background apps) — the marginal breaches are not attributable to contention
from a competing process this turn started.

**This is graded FAIL, not pass**, per the carried-criteria rule that none
may be closed by assertion — the one clean run (C) cannot be cherry-picked
over the two runs that breached the boundary. This is **not** asserted as a
regression from the owner's own clean capture on his machine, which remains
valid evidence of a passing state there. It is a genuine, reproduced finding
that the gate is marginal on this review environment: 2 of 3 independent
batches (15 total fresh browser contexts) breach a boundary the fix was
believed to have cleared with room to spare. The ledger's own recorded
`bld_04_caveat` anticipated exactly this shape of problem: *"The metric is
now binary rather than continuous: it distinguishes over-50 from under-50 but
not 49 from 5... a companion total-blocking-time figure would give headroom
visibility."* Converting one clearly-over-50ms task into several sub-threshold
chunks does not by itself establish margin against ordinary scheduling
jitter when some of those chunks land close to the boundary.

**Finding BLD-04-1 (bounded).**
- **Criterion:** `BLD-04`
- **Evidence:** `docs/phase10-baseline/section-11/raw-review-8-bld04-longtasks.json`
  (full per-run breakdown, all three invocations),
  `docs/phase10-baseline/section-11/raw-review-3-overview-postzoom.png`
  (confirms the scene renders correctly, not a broken/blank probe)
- **Required change:** either establish genuine headroom below 50ms (profile
  which specific chunk(s) land close to the boundary and reduce them
  further), or investigate and name the specific cause of this environment's
  marginal breaches if it differs from the owner's clean-running machine. **Do
  NOT baseline-subtract or redefine the gate** — this is an explicit
  `must_wait_for_codex` item under `single_provider_mode`, and the spec
  (§4.4, §9) has already refused that path five times over.

## Unchanged: five owner-carried criteria not reopened

`BHV-11`, `VIS-10`, `VIS-02`, `DEF-02`, `BHV-05` remain `carried_by_owner` —
this turn changed no logo mark, panel width, or Mission Control typography.
Their `required_artifacts` were reconciled to the real evidence already on
file (see above) but their status and substance are unchanged.

## Contact sheet

Not regenerated this turn — no new visual criterion was opened that a
12-frame contact sheet would newly evidence, and the existing
`docs/phase10-baseline/section-11/contact-sheet.md` remains the section's
sheet. `BLD-04` is a timing gate, not a visual criterion in the contact-sheet
sense.

## For the next turn (codex_implementation, remediate)

Fix `BLD-04-1` only: establish real headroom on the route-owned long task, or
name the precise cause of the marginal breaches reproduced this turn. Re-run
`measure-long-tasks.mjs` unmodified, at least twice on independently fresh
server processes (matching this turn's method), and record all runs — not
just the passing one. Re-run `npm test` and `npm run build` before
committing. Do not touch anything else in scope; the ledger-hygiene
reconciliation from this turn should not be re-litigated, and every other
criterion is clean.
