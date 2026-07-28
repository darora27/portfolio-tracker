# Phase 10 §10 review, round 2 — FAIL with 4 bounded findings

Reviewed by `claude-code/opus-5` (Claude Lead, `review` stage), July 28, 2026.

- **Candidate SHA:** `3d1882a116ef116f21a529eaa050f17f88875def`
- **Prior review:** `docs/phase10-workflow/reviews/section-10-review.md`
  (FAIL, 6 findings, at `457f90f`)
- **Spec:** `docs/phase10-workflow/specs/section-10.md`
- **Ledger:** `docs/phase10-workflow/acceptance/section-10.json`
- **Implementer handoff:**
  `docs/phase10-handoffs/2026-07-28-section-10-codex-implementation-remediate-to-claude-lead.md`
- **Evidence:** `docs/phase10-baseline/section-10/claude-review-2/`
- **Result:** **FAIL** — 4 bounded findings, none critical.

The `portfolio-ux` project skill was invoked for this turn via the `Skill` tool
(not the fallback path).

---

## 1. Round 1's findings

Three of the six are closed, one is closed on its evidence half only, and two
remain open on the same criteria.

| round-1 finding | criterion | round-2 result |
|---|---|---|
| F1 world luminance | `VIS-01` (critical) | **closed** |
| F2 satellite pointer | `BHV-02` (critical) | **closed** |
| F3 satellite destinations | `DEF-09` | **closed** |
| F4 trail sampler | `TST-03` | **still fails** |
| F5 route-owned long task | `BLD-04` | **still fails** |
| F6 `VIS-12` evidence + surfaced defects | `VIS-12` | **evidence closed, 2 defects remain** |

Both critical findings are closed. `capture-live-evidence.mjs` completing
end-to-end is the direct proof of that: it previously aborted at
`Could not acquire the HAZARD satellite` before its first screenshot, and it now
produces all sixteen `after/` surfaces and both `mobile/` captures.

The implementer's `deferred_to_reviewer` entries were honest again — Chromium
was genuinely unavailable in that environment. It was available here, from the
repository's own `node_modules`, against a `next start` production build at
`http://127.0.0.1:3131/share` on a real GPU
(`ANGLE (Apple, Apple M2, OpenGL 4.1)`).

---

## 2. Independent gates

| Gate | Result |
|---|---|
| `npm test` | **PASS** — 99 files, 526/526 |
| `npm run build` | **PASS** — Next.js 16.2.11, compiled, route list unchanged, `/share` 200 + Mission Control manifest smoke |
| `phase10:acceptance -- check … --require implementer` | **PASS** |

---

## 3. Findings

### F1 — `TST-03` (high, tests): the trail sampler still fails

`sample-live-rgb.mjs` aborts at `GOOG deltaE 13.022 > 8`. Full non-throwing
table, all eight fixtures:

| ticker | weekly | expected | sampled | ΔE | Δhue | chroma | L |
|---|---|---|---|---|---|---|---|
| ASML | −4.82% | `#ff716b` | `#ff716b` | **0.00** | 0.57 | 0.580 | 0.341 |
| GOOG | −7.06% | `#f25a53` | `#cc4e48` | **13.02** | 0.27 | 0.518 | 0.188 |
| COST | null | `#e3b65c` | `#d6cf69` | **18.12** | — | 0.427 | 0.599 |
| MSFT | −3.28% | `#ff817b` | `#da716b` | **11.56** | 0.24 | 0.435 | 0.278 |
| IBM | +1.54% | `#2e9458` | `#445551` | **47.04** | **22.88** | **0.067** | 0.083 |
| INTC | −5.55% | `#ff6a63` | `#da7b73` | **23.86** | 1.66 | 0.404 | 0.303 |
| CBRS | +6.63% | `#69f09c` | `#4da96f` | **28.54** | 0.83 | 0.361 | 0.311 |
| NBIS | +2.88% | `#3dae6a` | `#379e61` | 6.92 | 1.47 | 0.404 | 0.261 |

1. **ΔE ≤ 8** — fails on 6 of 8 (was 7 of 8).
2. **Hue lock ±10° at chroma > 0.30** — IBM still 22.88° off the 143° anchor at
   chroma 0.067; its trail still samples as near-grey.
3. **Ordering** — one violation remains, in the loss direction: MSFT (|3.28%|)
   samples **darker** (L 0.278) than ASML (|4.82%|, L 0.341).

Making the 3px core opaque fixed ASML exactly (ΔE 0) and removed one of the two
ordering violations, so the diagnosis was right and incomplete: the remaining
seven still carry a darker, less saturated bias, and IBM — the one holding whose
expected colour is a mid-green — is the worst at ΔE 47.

**Required change.** Make the rendered trail pixels match `rampForWeekly()`
within ΔE 8 for every fixture and restore monotonic lightness ordering within
each direction. IBM's near-grey sample (chroma 0.067 against an expected 143°
green) is the sharpest single lead.

Evidence:
`docs/phase10-baseline/section-10/claude-review-2/raw-trail-sampler-TST-03.txt`.

---

### F2 — `BLD-04` (high, build): the route-owned long task still breaches 50 ms

`measure-long-tasks.mjs`, unmodified, five fresh 1440×900 CPU-2× contexts, not
baseline-subtracted. Run twice this session:

| run | first pass | second pass |
|---|---|---|
| 1 | 69 ms | **62 ms** |
| 2 | 59 ms | 56 ms |
| 3 | 55 ms | 56 ms |
| 4 | 55 ms | 56 ms |
| 5 | 56 ms | 57 ms |

Ten of ten contexts breach the ceiling. Moving the KTX2 fetch/parse/zstd decode
into a module worker did not clear it — the measured maximum is unchanged within
noise from round 1's 57–61 ms. §9 measured `maximumMs: 0` on all five runs with
a byte-identical script, so this remains a §10 regression, and §1's exception
was explicitly non-precedential.

**Required change.** Bring the route-owned long task under 50 ms across five
fresh contexts. The worker moved the decode but something on the route still
occupies the main thread for ~56 ms at ~570–590 ms after navigation; attribute
that task before changing anything else. Do not baseline-subtract, redefine the
gate, or add a post-processing pass.

Evidence:
`docs/phase10-baseline/section-10/claude-review-2/raw-long-tasks-BLD-04.txt`.

---

### F3 — `DEF-02` (high, visual): four of eight marks render mirrored

This assertion had never run. Round 1's F1 aborted
`capture-live-sphere-strip.mjs` inside the luminance loop; with `VIS-01` closed,
the verifier now reaches its chirality block and aborts there:

```
Error: COST chirality failed: normal=-0.4514 mirrored=-0.4041
  at capture-live-sphere-strip.mjs:198
```

Non-throwing full table (`pass` requires `normalScore > mirroredScore`):

| world | normal | mirrored | pass |
|---|---|---|---|
| ASML | +0.1703 | −0.1821 | **yes** |
| GOOG | +0.0886 | −0.2374 | **yes** |
| COST | −0.4515 | −0.4044 | no |
| MSFT | −0.4784 | **+0.2493** | no |
| IBM | +0.0248 | +0.0492 | no |
| INTC | −0.2784 | **+0.2111** | no |
| CBRS | +0.0512 | −0.0769 | **yes** |
| NBIS | −0.1262 | −0.1271 | **yes** |

MSFT and INTC are decisive: the live profile anti-correlates with the mark and
correlates with its mirror. COST and IBM sit close to noise on both scores and
fail only on sign. The candidate's README records the intended fix ("marks are
now pre-flopped before weathering and seam repair"); it is correct for four
worlds and wrong for four.

**Required change.** Make `normalScore > mirroredScore` hold for all eight
worlds as measured by the section's own verifier, starting from MSFT and INTC
where the mirror signal is unambiguous. `TST-04` passes — the guard exists and
fires — so this is a texture-generation defect, not a missing assertion.

Evidence:
`docs/phase10-baseline/section-10/claude-review-2/raw-strip-chirality.txt`,
`…/raw-sphere-strip-abort-DEF-02.txt`.

---

### F4 — `VIS-12` (high, visual): two of round 1's surfaced defects remain

The evidence half is closed. `capture-live-evidence.mjs` runs end-to-end and
every surface `VIS-12` names now has a 1440×900 artifact produced by the
section's own verifier, plus both mobile captures. Of the four defects round 1
required to be addressed alongside it, two are fixed and two are not.

Fixed and re-verified: the planet-detail ID plate is inside the viewport with
the panel scrollable (`DEF-10`), and the LOG chip is ink-on-paper at 13.02:1
with the trade rows in a scroll region (`VIS-09`).

Still present:

1. **The MANIFEST bay renders its question twice.** Live DOM count at
   `station=manifest` is 2 for "what do i own, at what weight"; all six other
   bays render their question once. `MissionControl.tsx:155` renders it
   unconditionally in the rail header while `ManifestBay.tsx:21` renders it
   again in the bay. The equivalent PLOT duplicate was fixed with an
   `activePanel === "plot"` guard and `.activeBayQuestion` was deleted; the
   MANIFEST instance was missed.
2. **The MANIFEST bay obscures a financial value.** The CONTRIBUTION cell draws
   its coloured bar on top of the numeral, hiding one character of every row:
   `-3▮1%`, `-0▮5%`, `+0▮5%`. A public readout of contribution to return is
   ambiguous as rendered — this outranks the layout question it sits inside.

**Required change.** Render each active bay's question exactly once, and stop
the CONTRIBUTION bar from overlapping its value. Then re-run
`capture-live-evidence.mjs` so the MANIFEST surface's artifact shows the fix.

Evidence: `docs/phase10-baseline/section-10/after/`,
`…/claude-review-2/raw-surfaces.txt`,
`…/claude-review-2/crop-manifest-contribution.png`.

---

## 4. Criteria that passed independent verification this turn

With retained evidence, newly confirmed at this candidate:

- **`VIS-01`** (critical) — all eight worlds inside `[0.16, 0.55]`: ASML 0.4368,
  GOOG 0.3399, COST 0.3463, MSFT 0.4617, IBM 0.2951, INTC 0.2432, CBRS 0.2951,
  NBIS 0.2734. INTC's regression is reversed (0.0164 → 0.2432) and the accepted
  window was not moved.
- **`BHV-02`** (critical) — all three satellites acquire by pointer; HAZARD
  acquires 5/5 by direct aim where it was 0/60 before. Sun, planets, moons and
  belt bodies all still acquire; the 27-control keyboard order is unchanged.
- **`DEF-09`** — pointer destinations are per-satellite correct: HAZARD 5/5 →
  `station=hazard`, DRIFT → `station=scope`, SUPPLY 7/9 → `station=comms`. The
  two SUPPLY misses are a boundary race against a body moving ~11 px/s, not a
  routing defect.
- **`DEF-05`** — the sun acquires on 477 of 480 swept corona points and is the
  first control in the tab order. The corona-yield change restored satellites
  without costing the sun its pointer surface.
- **`TST-04`** — the sphere-strip capture asserts both luminance and chirality,
  and the chirality assertion demonstrably fires.
- **`DEF-10`** — panel 576px = 40.0% of viewport, above the 560px floor, top and
  bottom inside the viewport, `overflow-y: auto` with scrollHeight 976 >
  clientHeight 770, ID-plate number 64px.
- **`VIS-09`** — paper `#f0e2c4` / ink `#2b1a10`, LOG chip 13.02:1, rows
  scrollable.
- **`BHV-01`** — eight labels at 12px, all inside the viewport, zero overlaps.
- **`VIS-03`** — the sun is the largest body at OVERVIEW against a measured
  largest planet radius of 32.4px.
- **`BHV-04`** — all seven bays render their question and carry destinations.
- **`MOB-03`** — 390×844: canvas 0, no horizontal overflow, 28 controls, reading
  order sun → planets → moons → belt → satellites.
- **`ACC-07`** — under reduced motion the sweep is replaced by
  `SWEEP HELD · 60S REFRESH` with zero running animations. Recorded precisely:
  that stamp is an interval, not a clock time.

`VIS-04` (critical) is recorded **blocked**, not passed: its "ramp lightness for
magnitude" half is exactly what `TST-03` measures, and that fails.

---

## 5. Criteria left unperformed

Not exercised this turn, recorded as explicit work rather than implicit passes:

`DEF-01` `DEF-03` `DEF-04` `DEF-06` `DEF-07` `BHV-05` `BHV-09` `BHV-10`
`VIS-02` `VIS-06` `VIS-07` `VIS-08` `VIS-10` `VIS-13` `VIS-14` `BLD-05`

`DEF-04`'s pointer and keyboard halves are confirmed (belt bodies acquire in the
full-viewport scan and hold their place in the tab order); only its
*visible body* half remains unperformed.

On `VIS-06` specifically: the previous review's observation that the overview
"reads as an even dot lattice" is **withdrawn as unsubstantiated**. The regular
lattice visible in `claude-review-2/crop-overview-starfield.png` is a reticle
overlay rather than the starfield, and the component analysis in
`claude-review-2/raw-starfield-VIS-06.txt` is contaminated by UI glyphs. No
claim is made in either direction.

---

## 6. Route

- Section `§10`, stage → `remediate`, role → `codex_implementation`,
  next actor → `codex`, `section.review_result = fail`, status `ready`.
- Findings F1–F4 above are the entire authorized remediation scope. No advisory
  findings were introduced and no new criteria were created — `DEF-02` and
  `VIS-12` were both already declared, and `DEF-02` was on round 1's explicit
  unperformed list.
