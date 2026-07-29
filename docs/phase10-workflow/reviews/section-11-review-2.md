# Phase 10 §11 review (turn 2) — FAIL with 2 bounded findings

Reviewed July 29, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: review`),
covering both roles under `single_provider_mode` (§11 applies from `applies_from`
in `PHASE10_STATE.json`).

- **Candidate SHA:** `b21339e66f1bfa173c0413bf5bda909e54c52d0c` —
  `phase10(§11): remediate bounded review findings`
- **Prior review-1 candidate:** `a690a41f2f12ef335fd9f5288f90f6a4fa154ca4` (FAIL, 4 findings)
- **Remediation commits since review-1:** `4658020`, `93994ae`, `d7589a8`, `b21339e`
- **Spec:** `docs/phase10-workflow/specs/section-11.md`
- **Ledger:** `docs/phase10-workflow/acceptance/section-11.json`
- **Implementer handoff:**
  `docs/phase10-handoffs/2026-07-29-section-11-codex-remediation-continuation-to-claude-lead.md`
- **Result:** **FAIL** — 2 new bounded findings (both currently reachable and
  evidenced). The 4 review-1 findings are resolved as owner decisions, not as
  passes, per the handoff's explicit grading instruction.

This host launches Chromium without difficulty (confirmed again this turn,
consistent with `AGENTS.md`'s Live Verification section and the
`live-browser-matrix-is-runnable` note): 10 of 11 contact-sheet shots captured
successfully, all six retained/live measurements below ran against a real
production server, and no criterion in this review was graded from source
reading alone.

## Independent gates

| Gate | Result |
|---|---|
| `npm test` | **PASS** — 106 files, 548 tests, zero failures |
| `npm run build` | **PASS** — Next.js 16.2.11, TypeScript clean, 18/18 static pages, `/share` smoke pass |
| `npm run phase10:acceptance -- check <ledger>` | **PASS** (structurally valid after this turn's reviewer-column updates) |
| `npm run phase10:capture -- --section 11` | **10/11** — `range-30d` fails; root-caused below (finding F6/VIS-11), not a harness defect |
| `measure-long-tasks.mjs` (BLD-04) | **FAIL** — 57–60ms across 5 fresh contexts against the unchanged 50ms gate |
| Live interaction check (BHV-15/F4) | **PASS** — reconfirmed live in addition to the retained test |
| `PRV-10` live/source check | **PASS** — DRAFT rig confirmed owner-gated on `/share` |

## Review-1 findings — resolved as owner decisions, not passes

Per the implementer handoff's explicit instruction, these five carried
criteria are graded `carried_by_owner` in the ledger, never `pass`:

- **`BHV-11` (F1, critical)** — owner-carried to §12a. The five-token type
  ramp shipped, but Mission Control's own reading surfaces still resolve to
  the smallest 11px role; a semantic-role remap, not another size nudge, is
  the owner-directed fix, scoped to §12a.
- **`VIS-10` (F2, high)** — owner-carried. Committed 1440×900 geometry
  measures ASML at x≈31.4%/31.3% for the 520/580px rails, both unoccluded,
  and the owner confirmed the position is correct. The original ≤380px width
  clause is not passed — the owner's newer, wider request is FB-17 in §12a.
- **`VIS-02`, `DEF-02`, `BHV-05` (F3, high)** — owner-carried. The one
  authorised SVG/texture repair attempt is complete and measured (alpha
  100%→4.88%, 98.62%→20.98%), but the owner still reports no visible mark on
  any world and retired logo work to colour+silhouette identity by his own
  fallback rule. No mark visibility or chirality pass is claimed.

`BHV-15` (F4, high) is reconfirmed **pass** this turn with fresh live
evidence in addition to the retained rendered-interaction test (below).

## New findings

### F5 — `BLD-04` (high, carried): the long-task gate is still unmet after Package C's refunds

Fresh 5-context 1440×900 CPU-2× measurement, unmodified
`measure-long-tasks.mjs`, `waitUntil: "domcontentloaded"` per the pinned
measurement contract (spec §11.1):

```
run 1: 60ms   run 2: 57ms   run 3: 58ms   run 4: 60ms   run 5: 58ms
```

against the unchanged **<50ms** absolute gate. This is the **sixth**
consecutive round this criterion has failed (65/57/58/58/57 at the §10 carry
→ 60/57/58/60/58 now) — Package C's three named refunds (radar
`IntersectionObserver` pause, below-fold lazy-mount, legacy-dashboard/Recharts
removal) did not move the number outside round-to-round noise. Not
baseline-subtracted, not redefined.

**Required change.** The §10 CDP profile attributed 34.3ms self time to
Three.js shader-program acquisition; the spec named this as the next lever if
the three refunds did not clear the gate (§4.4), and it has not yet been
attempted. Profile the candidate directly (do not assume the §10 profile still
applies unchanged) and address the actual attributed cost. Do not
baseline-subtract or redefine the 50ms boundary — that remains a
`must_wait_for_codex` action reserved for an explicit owner/cross-model
decision, not something this remediation may grant itself.

Evidence: `docs/phase10-baseline/section-11/raw-review-2-long-tasks.json`.

### F6 — `VIS-11` (high, visual): the Windows zone never shows `30D`, and no live holding's chart currently reaches it either

Spec §3.2 requires the panel's Windows line to read
`WEEK ▲ 8.1 · 30D ▲ 12.4 · SINCE BUY ▲ 41 (SIMPLE)`, each figure appearing
exactly once. The shipped `PlanetDetail.tsx` computes
`thirtyDayReturn = seriesReturn(chart, 30)` (line 46) and then **never renders
it** — the actual Windows line is only `WEEK <val>` and
`SINCE BUY <val> (SIMPLE)`. Confirmed by source read and by a live DOM capture
across all 8 production holdings on `/share`: no `30D` text node exists
anywhere in the panel for any holding.

This is also why the capture harness's `range-30d` shot fails: separately,
`ReturnInstrument`'s own 30D chart detent is gated on `points.length > 30`,
and a live sweep of all 8 holdings found none with a chart series longer than
30 points (7 show only `7D`/`SINCE BUY`; `COST` shows only `SINCE BUY`). That
narrower fact may simply reflect how little daily-snapshot history the
current database holds and could resolve itself as more snapshots accumulate
— it is noted for the implementer's context, not asserted as a second defect
requiring its own fix — but the dead `thirtyDayReturn` variable is an
unconditional code defect independent of data volume, and the shipped Windows
zone fails `VIS-11` regardless of how much history exists.

**Required change.** Render `thirtyDayReturn` in the Windows zone (guard for
`null` the same way `WEEK`/`SINCE BUY` already do). Re-run the
`phase10:capture` `range-30d` shot (or an equivalent live check) against a
holding whose series is long enough to exercise it, or record explicitly if
the current dataset cannot exercise it and name that as a data-volume note in
the handoff rather than leaving the shot silently absent.

Evidence: `docs/phase10-baseline/section-11/raw-review-2-windows-30d.json`,
`src/components/observatory/orrery/PlanetDetail.tsx:46,74-77`.

## Contact sheet

`docs/phase10-baseline/section-11/contact-sheet.md` is regenerated this turn
at **10/11** — `range-30d` still fails, root-caused above as a direct
consequence of F6 rather than a harness or environment problem. It is not
repaired by retargeting the shot at a different ticker/detent, because doing
so would misrepresent 30D as reachable when it is not; the honest fix is F6
first, then a clean recapture in the next review.

## Unperformed matrix

This fail turn stopped after recording every currently evidenced failure
still bounded to declared criteria. These remain `not_run` and are not
implicit passes — the next reviewer must run the full newly-reachable matrix
after remediation, prioritizing critical/high risk and every visual/privacy
criterion per `AGENTS.md`:

`BHV-10`, `BHV-12`, `BHV-13`, `BHV-14`, `BHV-16`, `BHV-17`, `BHV-18`,
`BHV-19`, `BHV-20`, `BHV-21`, `BHV-22`, `BHV-30`, `BHV-31`, `BHV-32`,
`BHV-33`, `BHV-34`, `BHV-35`, `VIS-12`, `VIS-13`, `VIS-14`, `VIS-15`,
`VIS-16`, `VIS-17`, `VIS-18`, `VIS-19`, `VIS-20`, `VIS-04`, `MOB-10`,
`MOB-11`, `ACC-10`, `ACC-11`, `ACC-12`, `ACC-13`, `TST-10`, `TST-11`,
`TST-12`, `TST-03`, `BLD-10`, `BLD-11`, `PRV-11`, `PRV-12`, `PRV-14`.

`TST-13`, `BLD-12`, and `PRV-13` retain their `pass` from review-1 and were
re-substantiated this turn by the fresh `npm test`/`npm run build` runs above,
which cover the same assertions.
