# Phase 10 §10 review — FAIL with 6 bounded findings

Reviewed by `claude-code/opus-5` (Claude Lead, `review` stage), July 28, 2026.

- **Candidate SHA:** `457f90f6dff6c4e64bde22cee0c9725b32ce0c36`
- **Spec:** `docs/phase10-workflow/specs/section-10.md`
- **Ledger:** `docs/phase10-workflow/acceptance/section-10.json`
- **Implementer handoff:**
  `docs/phase10-handoffs/2026-07-28-section-10-codex-implementation-to-claude-lead.md`
- **Result:** **FAIL** — 6 bounded findings, 2 of them on `critical` criteria.

The `portfolio-ux` project skill was invoked for this turn via the `Skill` tool
(not the fallback path).

---

## 1. What the implementer deferred, and what changed at review

Codex recorded 37 `pass` and 40 `deferred_to_reviewer` because its in-app
browser runtime reported `No browser is available` (discovery `[]`,
`docs/phase10-baseline/section-10/browser-backend.txt`). That deferral was
honest: nothing live was claimed without its artifact, and every verifier script
was retained.

**A browser was available to this review.** `playwright` and cached Chromium are
present in the repository's own `node_modules`, and the scene renders on a real
GPU headlessly:

```
renderer: ANGLE (Apple, Apple M2, OpenGL 4.1)
canvasCount: 1, sceneLabelCount: 8, console errors: 0
all 24 planet .ktx2 maps: HTTP 200
```

So the full deferred matrix was reachable. The retained scripts were run against
a `next start` production build at `http://127.0.0.1:3131/share`, 1440×900.

**Three of the six retained verifiers abort on their own assertions.** They are
correctly written; the candidate does not satisfy them.

---

## 2. Independent gates

| Gate | Result |
|---|---|
| `npm test` | **PASS** — 99 files, 525/525 |
| `npm run build` | **PASS** — Next.js 16.2.11, 18 static page tasks, route list unchanged, `/share` 200 + Mission Control manifest smoke |
| `phase10:acceptance -- check … --require implementer` | **PASS** |

`BLD-01` is genuinely closed: §9's inherited red is gone, `planet-textures.test.ts`
reads `30_000_000`, and INTC/CBRS clear the `luminanceStdDev ≥ 0.1` floor. The
§9 owner red exception ends here as the spec required.

---

## 3. Findings

### F1 — `VIS-01` (critical, visual): seven of eight worlds are outside the required luminance window

The section's own retained verifier aborts:

```
Error: ASML live equatorial luminance 0.0754 outside [0.16, 0.55]
  at capture-live-sphere-strip.mjs:104
```

Measured with the identical formula, non-throwing, all eight:

| world | equatorial mean | in `[0.16, 0.55]` |
|---|---|---|
| ASML | 0.0765 | no |
| GOOG | 0.3423 | **yes** |
| COST | 0.0779 | no |
| MSFT | 0.0763 | no |
| IBM | 0.0169 | no |
| INTC | 0.0164 | no |
| CBRS | 0.0631 | no |
| NBIS | 0.0497 | no |

Stable across a 20-second window (rotation moves ASML only 0.076 → 0.138), on a
real GPU, with every texture loaded and zero console errors. Not a load failure
and not a settling artifact.

**Calibration, because this is a critical criterion.** §9's committed
`live-sphere-strip-32.png` measured with the same formula gives ASML 0.105,
GOOG 0.384, MSFT 0.0386. So the method is consistent between the two sections,
and the relight did move four of the five dark worlds in the intended direction
(IBM ×6.5, COST ×6.0, NBIS ×5.0, CBRS ×2.9) — but INTC went *backwards*
(0.0428 → 0.0164), and no world except GOOG reaches the floor.

Note for whoever fixes this: those §9 strip numbers also do **not** reproduce the
`MSFT 0.157 / ASML 0.207 / GOOG 0.551` figures the spec quotes in §8.1 as the
window's empirical basis — they land roughly 1.4–2× lower. The window may itself
be mis-calibrated against the live-strip method.

**Required change.** Bring all eight worlds inside `[0.16, 0.55]` as measured by
`capture-live-sphere-strip.mjs`, and fix INTC's regression specifically. If the
window's provenance turns out to be the blocker, **route the calibration to
Devan as a spec-level decision — do not move the floor unilaterally.**

Evidence: `docs/phase10-baseline/section-10/claude-review/raw-luminance-VIS-01.txt`.

---

### F2 — `BHV-02` (critical, behavioral): satellites are not activatable by pointer

`capture-live-evidence.mjs` aborts at
`Error: Could not acquire the HAZARD satellite.`

Direct probe — aim at the satellite's own reported screen position, 60 attempts,
recording what is actually hit:

```
satellite pointer acquired: false
targets hit while aiming at satellite: {"portfolio": 60}
moon pointer acquired: true  {"moon:ASML": 1}
```

A 2,500-point full-viewport scan at 22px never acquires any `satellite:*` target:

```
distinct targets: ["ASML","CBRS","COST","GOOG","IBM","INTC","MSFT","NBIS",
                   "belt:CRM","belt:KYMR","belt:MEI","belt:ORCL","belt:SPCX","portfolio"]
```

**Root cause is in the candidate's own README.** The `DEF-05` fix records: *"the
visibly larger corona meshes had no `orreryTarget` … Both glow meshes now resolve
to the portfolio target."* Combined with §5.1's sun rescale (1.28 → ~2.44), the
satellites orbit inside the corona's screen footprint — the HAZARD satellite sits
at (667, 294) with the sun centred at (720, 294), ~53px away, inside the sun disc
itself. The `DEF-05` fix consumed the satellites' pointer surface.

The keyboard path is unaffected and works (§4).

**Required change.** Restore pointer activation for all three satellites from
every camera state without reverting `DEF-05` — e.g. give the corona pick meshes
lower precedence than nearer small bodies, rather than adding an invisible hit
plane.

Evidence: `docs/phase10-baseline/section-10/claude-review/raw-pointer-targets-BHV-02.txt`.

---

### F3 — `DEF-09` (high, behavioral): satellite destinations are not reachable by pointer

Same root cause and same evidence as F2. `DEF-09` requires every moon **and
satellite** to have a working destination reachable by pointer **and** keyboard.
Moons pass on both paths; satellites pass on keyboard only
(`Enter` → `?focus=portfolio&camera=command&station=hazard`, confirmed).

**Required change.** Closed by F2's fix; re-verify with
`capture-live-evidence.mjs` running to completion.

---

### F4 — `TST-03` (high, tests): the trail sampler fails all three of its assertions

`sample-live-rgb.mjs` aborts at `ASML deltaE 31.617 > 8`. Full non-throwing table:

| ticker | weekly | expected | sampled | ΔE | hue | Δhue | chroma |
|---|---|---|---|---|---|---|---|
| ASML | −4.82% | `#ff716b` | `#ffa6b0` | **31.62** | 353.3 | 9.74 | 0.349 |
| GOOG | −7.06% | `#f25a53` | `#d6635c` | **16.51** | 3.4 | 0.44 | 0.478 |
| COST | null | `#e3b65c` | `#d6ca66` | **15.55** | 53.6 | — | 0.439 |
| MSFT | −3.28% | `#ff817b` | `#da948b` | **24.22** | 6.8 | 3.83 | 0.310 |
| IBM | +1.54% | `#2e9458` | `#445551` | **47.04** | 165.9 | **22.88** | **0.067** |
| INTC | −5.55% | `#ff6a63` | `#da7870` | **22.45** | 4.5 | 1.53 | 0.416 |
| CBRS | +6.63% | `#69f09c` | `#63b08a` | **34.76** | 150.4 | 7.39 | 0.302 |
| NBIS | +2.88% | `#3dae6a` | `#43c076` | 7.27 | 144.5 | 1.48 | 0.490 |

1. **ΔE ≤ 8** — fails on 7 of 8.
2. **Hue lock ±10° at chroma > 0.30** — IBM fails at 22.88° off the 143° anchor
   with chroma 0.067, i.e. its trail samples as near-grey.
3. **Ordering** — 2 violations:
   - gain: CBRS (|6.63%|) samples **darker** than NBIS (|2.88%|) — 0.355 vs 0.402;
   - loss: ASML (|4.82%|) samples **lighter** than MSFT (|3.28%|) — 0.517 vs 0.379.

The sign→hue mapping itself holds (gains land near 143–150°, losses near 3–7°),
so this is **not** a D1 recurrence — no contradicting ticker is named, and colour
logic should not be re-opened on D1 grounds.

**Required change.** Make the rendered trail pixels match `rampForWeekly()`
within ΔE 8 and restore monotonic lightness ordering. The uniform
darker-and-desaturated bias across every holding points at a render-stage
transform between the ramp value and the pixel, not at the ramp LUT (which its
unit tests pass).

Evidence: `docs/phase10-baseline/section-10/claude-review/raw-trail-sampler-TST-03.txt`.

---

### F5 — `BLD-04` (high, build): the route-owned long task regressed from 0 ms to 61 ms

Five fresh contexts, 1440×900, CPU 2×, unmodified 50 ms ceiling, not
baseline-subtracted:

| run | max long task |
|---|---|
| 1 | **61 ms** |
| 2 | 57 ms |
| 3 | 58 ms |
| 4 | 58 ms |
| 5 | 58 ms |

Every run breaches the gate; two long tasks appear per run (~57–61 ms and
~51–52 ms).

§9 measured `maximumMs: 0` on all five runs with a **byte-identical** script
(`diff` between the §9 and §10 copies reports no difference), so this is a
regression introduced by this candidate, not an inherited or rig condition.
§1's long-task exception was explicitly non-precedential and does not apply.

**Required change.** Bring the route-owned long task back under 50 ms across
five fresh contexts. Do not baseline-subtract or redefine the gate.

Evidence: `docs/phase10-baseline/section-10/claude-review/raw-long-tasks-BLD-04.txt`.

---

### F6 — `VIS-12` (high, visual): the required 1440×900 evidence did not exist

`docs/phase10-baseline/section-10/after/` and `.../mobile/` were both **empty**
in the candidate, so no surface named by `VIS-12` had evidence, and
`capture-live-evidence.mjs` cannot produce any because it aborts on F2 before
its first screenshot.

This review captured the set by patching only the satellite block (retained as
`claude-review/scripts/capture-surfaces-past-satellite-block.mjs`), which
surfaced further defects the implementer should see while remediating —
recorded here as evidence for F1–F5, **not** as new criteria:

- **Planet detail** (`claude-review/surfaces/planet-detail-1440x900.png`) — the
  panel's ID-plate header is clipped off the top of the viewport, content is cut
  at the bottom edge, and the planet neither shrinks nor moves left; the
  rescaled sun sits directly behind ASML at close camera.
- **LOG bay** (`…/mission-control-log-1440x900.png`) — parchment renders
  correctly, but the `LOG` chip is dark-brown on dark-brown, and the third trade
  row is clipped mid-glyph at the panel edge.
- **Mission Control** — each bay's question line renders **twice** (as the panel
  header and again inside the body), and the MANIFEST block under the PLOT rail
  renders its `BODY / DAY / FUEL / CONTRIBUTION` headers with no rows.

**Required change.** Land F1–F5, then run `capture-live-evidence.mjs`
end-to-end so `VIS-12`'s artifacts are produced by the section's own verifier,
and address the clipping/duplication above under their own criteria
(`DEF-10`, `VIS-08`, `VIS-09`, `BHV-10`).

---

## 4. Criteria that passed independent verification

Confirmed live this turn, with retained evidence:

- **`MOB-01`** (critical) — 390×844 and 320×844: `canvas` count **0**,
  `scrollWidth === clientWidth`, 27 targets, **minimum target 44px**, zero
  undersized. (`raw-mobile-MOB-01.txt`)
- **`ACC-03`** — 28 scene controls in a deterministic tab order (sun → 8 planets
  → 8 moons → 5 belt bodies → 3 satellites → sector → belt → manual), every one
  `focusVisible: true` with a `2px solid` outline and ≥44px target.
- **`ACC-05`** — under `prefers-reduced-motion`: `canvasCount: 0`,
  `runningAnimations: []`, and moon/satellite/nebula/comet encodings all
  preserved.
- **`ACC-06`** — radar canvas stays `aria-hidden`; the detail card expands from
  the MANIFEST rows by keyboard (`manifestExpandedByKeyboard: true`).
- **`BHV-03`** — radar ring expands in place by keyboard and `Enter` opens
  `?holding=ASML&camera=approach`.
- **`BHV-08`** — Escape returns to `/share` from both the belt and Mission
  Control, with `focusReturnedToSun: true`.
- **`DEF-08`** — the sector map states what it is in-scene without a click
  (`SECTOR CHART / LOCAL SECTOR` plus the solid-core/hollow-core legend).

(All from `raw-interaction-audit-PASS.txt`, `raw-mobile-MOB-01.txt`, and
`claude-review/surfaces/sector-map-1440x900.png`.)

Belt bodies are also confirmed pointer-activatable — the viewport scan acquires
`belt:CRM`, `belt:KYMR`, `belt:MEI`, `belt:ORCL`, `belt:SPCX` — and keyboard-
activatable. `DEF-04`'s *visible body* half is recorded as **unperformed**: two
pixel probes disagreed because the body-to-label offset is unknown, and this
review will not assert a defect it cannot substantiate.

---

## 5. Criteria left unperformed

F2 aborted the capture matrix before most visual surfaces were reachable by the
section's own verifier, so the following remain `not_run` and must be exercised
by Codex once F1–F5 make them reachable — they are **not** implicit passes and
**not** new findings:

`DEF-01` `DEF-02` `DEF-03` `DEF-04` `DEF-05` `DEF-06` `DEF-07` `DEF-10`
`BHV-01` `BHV-04` `BHV-05` `BHV-09` `BHV-10` `VIS-02` `VIS-03` `VIS-04`
`VIS-06` `VIS-07` `VIS-08` `VIS-09` `VIS-10` `VIS-13` `VIS-14` `MOB-03`
`ACC-07` `TST-04` `BLD-05`

One observation for `VIS-06` specifically, since it is cheap to check first: the
overview still reads as an even dot lattice rather than a clustered population
with diffraction spikes (`claude-review/surfaces/overview-1440x900.png`).

---

## 6. Route

- Section `§10`, stage → `remediate`, role → `codex_implementation`,
  next actor → `codex`, `review_result = fail`, status `ready`.
- Findings F1–F6 are the entire authorized remediation scope. No advisory
  findings were introduced.
