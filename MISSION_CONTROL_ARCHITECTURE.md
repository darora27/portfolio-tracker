# Mission Control content architecture — FB-34, adopted

**Owner-requested Fable consult, delivered and adopted July 30, 2026.**
This document is the authority for the Mission Control content rework. A
section spec is assembled *from* it; nothing here is re-derived.

Devan's request, in his words:

> *"The design of the universe itself is coming together. But now the content
> is the issue. A lot of information is missing and a lot of the information
> that is there is not necessary. Now I am not smart enough to figure what is
> missing and what is unnecessary on my own but I want fable to compare this
> website to what already exists for portfolio managers and stock screeners."*

---

## 1. Why this is a re-wiring job, not a rebuild

**Nothing was deleted.** Mission Control was built *beside* a working dashboard
and never inherited its organs. 26 components in `src/components/dashboard/`
and 3 in `src/components/history/` are present, routed and tested; Mission
Control imports exactly one *type* (`ChartPoint`) and no content component.

**Hard rule for the implementing section: no new parts.** Every item below
names an existing component. The single exception is the Chart Room, which is
stage two and has its own adopted design (`UNIVERSE_IDEAS_6.md` §1 plus the
owner-reviewed mock).

## 2. The benchmark

Serious portfolio tools — brokerage pages, Morningstar's portfolio view,
Empower — converge on one skeleton: a glance row; a performance-vs-benchmark
chart with period toggles; the positions table as the centrepiece; an
allocation view; then activity and history. **Risk stats live one layer down.
Correlation matrices appear only in institutional risk tools. Earnings and news
live on calendar and research surfaces, never as main furniture. Per-stock
depth is a different page** — which is exactly what the Chart Room is.

Devan's instincts already match the industry. The job is to let the room agree
with him.

## 3. The organizing principle

Mission Control answers five questions in order, one section each:

**how am I doing → where is everything → what do I own → am I beating the
market → what am I made of → how bad can it get → what did I do.**

Everything else is one click deeper. Same descent logic as round 5, with the
dashboard's organs installed in the right rooms.

## 4. The architecture

| Order | Section | Content (all from the live inventory) | Windows |
|---|---|---|---|
| pinned | **THE STRIP** | TODAY hero · WEEK / SINCE START TWR / VS VOO / OFF HIGH chips · `NEXT: MSFT T−2D` earnings chip · section links (variant B, settled). **Replaces the top-right block entirely.** | TODAY / WEEK / SINCE START |
| 1 | **ORBITS** | the radar, unchanged — every ring/blip click opens the **Chart Room** (FB-13 door #2) | — |
| 2 | **HOLDINGS** | `PositionsTable` content, **all holdings, not eight**: WEIGHT · TODAY · WEEK · SINCE BUY · sparkline · T−nD earnings chip · VALUE (owner only). One movers line on top (`BEST TODAY ▲ … · WORST ▼ …` from `WinnersLosers`). One summary line beneath: `TOP-2 54% · MODERATE` (`ConcentrationMeter`) + realized/unrealized (owner). **Row click → Chart Room** (door #1). | column headers |
| 3 | **RETURNS** | `ValueChart` vs VOO / VTI / XLK with **per-benchmark toggles** + `ExcessReturns` as the conclusion line — and a second mode switch, **BOOK VS MARKET / STOCK VS STOCK**, which is `HoldingsPerformanceChart` with its **per-stock toggles**. The two charts he explicitly missed, one section. | 7D / 30D / SINCE START |
| 4 | **MIX** *(new plain name, same naming rule)* | `CompositionDonut` (holdings by %) · `ClassificationBarList` (sector/AI) · `CompositionOverTimeChart` (History item #1) | SINCE START |
| 5 | **RISK** | three gauges (vol · beta · off-high) + `DrawdownChart` (History #2) + `DailyReturnsChart` (History #3) + `BY HOLDING ▸` disclosure (`HoldingRiskTable`), with `MetricDisclosure` attached to **every** figure | SINCE START, labeled |
| 6 | **ACTIVITY** *(TRADES renamed)* | the paper log, column renamed **EFFECT ON PORTFOLIO** — kill the word BOOK, he told us it meant nothing to him · `OPEN TRADE DESK ▸` (owner) | dates |
| footer | — | NEWS demoted to a three-headline line (links stay) · BRIEFING · DRAFT latch | — |

## 5. Cuts, each with the question it orphans

**CORRELATION section — gone from the room.** The question *"do my stocks move
as one bet?"* survives in two better homes: the TOP-2 concentration line, and
the Chart Room's per-stock `MOVES WITH` bars — the only form he ever found
readable. The full matrix retires until he asks for it by name.

**The four framing modes — do NOT import.** `WhyMode`, `AttentionMode`,
`HowAmIDoingMode`, `AllAnalyticsView` were Phase 9's answer to "what am I here
for". Mission Control's descent *is* that answer now; installing both is the
two-design-systems disease he already diagnosed once. He praised charts and
toggles, never modes. **They stay untouched on `/dashboard`.** The one organ
worth harvesting is `MetricDisclosure` — plain-language-on-demand serves *"I'm
not smart enough to figure out what's missing"* better than any mode.

## 6. EARNINGS ruling — demote and relocate, never delete

The original requirement was **the information** — *"upcoming earnings dates,
impossible in Sheets"* — not a wall section. Industry treats earnings as chips
and calendars, not furniture.

It becomes: one `NEXT: <ticker> T−nD` chip in the strip, a T−nD chip on every
HOLDINGS row, and the full picture per-stock in the Chart Room strip. He loses
nothing except a section he called unnecessary, and the original requirement is
better honoured.

**He can veto this with one sentence.**

## 7. The Chart Room is the other half, not an appendix

Mission Control is the **portfolio-manager page**; the Chart Room is the
**stock page**. Rows, rings and `FULL ANALYSIS ▸` are the doors between them.

Third report means **it ships in the same section as this rewiring, as stage
two** — so it cannot slip again behind "content" work.

## 8. FB-26 compatibility

No conflict. This architecture already leads with TODAY everywhere; a
daily-return universe and a TODAY-first room agree.

## 9. Owner sentences still outstanding

1. **"Earnings as chips instead of a section: yes"** — or no, which reverses
   §6 with no argument.
2. **After seeing the renamed ACTIVITY section once: "keep it" or "cut it to
   the `/trades` page."** Plain rename first, verdict on sight.

## 10. Acceptance test for the spec written from this

**The parts list must contain only component names from the inventory**, plus
Chart Room stage two. If a spec invents a new component, it goes back with
*"no new parts."*
