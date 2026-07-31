# Phase 10 §15 handoff: codex-implementation → claude-lead (review)

Prepared July 30, 2026 by `claude-code/sonnet-5` (running as `codex_implementation`
per `PHASE10_SWAP_ROLES`).

## Outcome

implementation ready for review

## What this turn did

Implemented `docs/phase10-workflow/specs/section-15.md` in full, in the spec's
own order (§4 STRIP → §5 ORBITS → §6 HOLDINGS → §7 RETURNS → §8 MIX → §9 RISK
→ §10 ACTIVITY → §11 footer/cuts → §2 the three doors → §12 type ramp → §13
mobile). Files touched:

- `src/lib/dashboard-data.ts` — extended with `drawdownSeries`,
  `dailyReturnBars`, `compositionHistory` via a second `getHistoryData()`
  call (spec §3's sanctioned option).
- `src/components/observatory/orrery/MissionControlRoomContent.tsx` —
  rewritten (now `"use client"` for RETURNS'/RISK's interactive state):
  HOLDINGS shows all real holdings with a movers line and TOP-2/HHI summary;
  RETURNS gets a VOO/VTI/XLK toggle plus a BOOK VS MARKET/STOCK VS STOCK
  switch; MIX is new; RISK adds drawdown/daily-return charts, a BY HOLDING
  disclosure, and `RoomMetricDisclosure` on VOL/BETA/DRAWDOWN; ACTIVITY is
  TRADES renamed with `EFFECT ON PORTFOLIO`; CORRELATION/EARNINGS deleted.
- `src/components/observatory/orrery/RoomMetricDisclosure.tsx` (new) —
  re-skins `MetricDisclosure`'s open/close/focus/Escape behavior.
- `src/components/observatory/orrery/MissionControl.tsx` — NEXT chip,
  EARNINGS nav link removed (both variant call sites), footer NEWS
  (3 headlines), ORBITS door mode-gated.
- `src/components/observatory/orrery/PlanetDetail.tsx` — `mode` prop
  (default `"public"`), FULL ANALYSIS door mode-gated.
- `src/components/observatory/orrery/OrreryWorld.tsx` — threads
  `missionMode`/`upcomingEarnings` down; MIX/ACTIVITY rows added to the
  <1024px fallback's INSTRUMENTS group.
- `src/components/observatory/orrery/mission-control-panels.ts` —
  signals/comms removed, mix inserted, log relabeled ACTIVITY.
- `src/lib/observatory/mission-control-layout.ts` — `mixSectionLabel` role.
- `src/components/observatory/orrery/ReturnInstrument.tsx` — added an
  optional `benchmarkLabel` prop (default `"VOO"`, existing callers
  unaffected).
- `src/components/observatory/orrery/PublicMissionControlContent.tsx` —
  removed two now-impossible branches (`signals`/`comms`) this dead,
  never-imported file's own type no longer admits; mechanical, not a
  functional change.
- Test files updated/extended: `MissionControlRoomContent.test.tsx`
  (rewritten, 2 → 14 tests), `MissionControlContent.test.tsx`,
  `mission-control-text-roles.test.tsx`, `MissionControl.test.tsx`,
  `MissionControl.stripVariant.test.tsx`, `dashboard-data.source.test.ts`,
  `dashboard-test-fixture.ts`, `OrreryWorld.test.tsx`,
  `observatory-fallback.test.ts`, `public-payload.test.ts`, `page.test.tsx`,
  `share/page.test.tsx`.

One real interaction bug found and fixed during evidence capture:
`RoomMetricDisclosure`'s Escape handler closed the disclosure but did not
stop propagation, so the same keydown also fired Mission Control's own
document-level Escape-exits-the-room listener — fixed with
`event.stopPropagation()`, covered by a new regression test.

Tests: `npm test` — 118/118 files, 645/646 tests, 1 intentional skip (up
from 118/118, 631/632 at §14's accepted HEAD, 14 net new tests, zero new
failures). Build: `npm run build` — exit 0, 22 routes unchanged, `/share`
smoke PASS.

## Evidence

- Candidate commit: none yet — left for the reviewer to record from
  `git log` (this turn's own commit cannot contain its own hash).
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-15.json` —
  `node scripts/phase10-acceptance.mjs check docs/phase10-workflow/acceptance/section-15.json --require implementer`
  → valid, 21/21 implementer results `pass`.
- Tests: `npm test`, 118 files / 645 tests / 1 intentional skip, zero
  failures — this turn's own implementation run.
- Build: `npm run build`, exit 0, 22/22 routes, `/share` smoke PASS.
- Screenshots: `docs/phase10-baseline/section-15/` —
  `private-overview-1440x900.png`, `public-overview-1440x900.png`,
  `holdings-1440.png`, `mix-1440.png`, `risk-1440.png`,
  `risk-disclosures-open-1440.png`, `activity-1440.png`,
  `footer-news-1440.png`, `returns-stock-vs-stock-1440.png`,
  `mobile-390.png` (10 images, within the ≤12-visual cap).
- Traces/measurements: `doors-private.json`, `doors-public.json`,
  `raw-keyboard-operability.json`, `raw-mobile-target-sizes.json`,
  `raw-strip-state.json`, `raw-cuts-state.json`.
- Spec / design proof: `docs/phase10-workflow/specs/section-15.md`,
  `docs/phase10-workflow/design-proofs/section-15.md`.
- Inherited red: none.

## For the next actor

Independently re-run `npm test` and `npm run build` against this candidate,
then independently verify the criteria yourself rather than trusting this
summary — per this project's own established review convention (direct
Chromium launch, fresh reviewer-owned script or manual verification, not
reused implementer captures).

Two things worth your own judgment, not just re-checking my work:

1. **RISK's MetricDisclosure coverage (BHV-05).** The spec says "every
   figure in this section has an attached... explanation," but
   `metric-explanations.ts` only names four matching builders (beta,
   volatility, max-drawdown, hhi). I attached disclosures to VOL, BETA, and
   the DRAWDOWN chart — the three figures with a correctly 1:1-matching
   builder — and deliberately left OFF HIGH and DAILY RETURNS unattached
   rather than showing a mismatched number under a disclosure (e.g.
   `maxDrawdownExplanation`'s own `currentValue` is the *historical max*
   drawdown, not OFF HIGH's *current* distance from peak — attaching it
   there would show the wrong number next to the right label). I judged
   this a correctness call the literal text doesn't quite anticipate; a
   second opinion is worth having before calling it settled.
2. **MOB-01's capture gap.** This sandbox's headless Chromium would not
   visually reveal the INSTRUMENTS group's content at <1024px even after
   confirming its native `open` state was `true` via a real click — a
   pre-existing limitation (FB-09/§12a) that equally affects the
   already-shipped RETURNS/RISK/EARNINGS rows in that same group, not
   something this section introduced. I closed it on the ledger's own
   accepted alternative — a real `getBoundingClientRect` geometry
   measurement (`raw-mobile-target-sizes.json`: 0 undersized controls, no
   horizontal overflow, both new rows present) — rather than leave it open
   or fabricate a capture. If you can get a real pixel view of that group
   (e.g. via Opus-in-Cowork's attended camera), that would strictly
   improve this criterion's evidence, but I do not believe its current
   evidence is insufficient per the ledger's own stated rules.

`PRV-01` and `VIS-08` are both critical-risk and exist specifically to
catch a public-mode leak to the owner-gated route — I verified this myself
with live public-mode traces (`doors-public.json`) before marking it
`pass`, not just by reading the conditionals I wrote; worth your own
independent re-trace given the stakes.

## Route after this handoff

- Section: `§15`
- Stage: `review`
- Role: `claude_lead`
- Status: `ready`
- Next actor: `claude`

## Decision needed (only if status = blocked)

N/A — not blocked.
