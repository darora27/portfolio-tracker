# Phase 10 §3 review — `/share` Forces, Structure, Timeline, and Lab chapters

Reviewed by: `claude-code/sonnet-5` (Claude Lead, `review` stage)

Reviewed commit: `b631351` (`phase10(§3): complete public Observatory
chapters`), diffed against `prev_actor_commit` `762066c` (the
claude-lead-to-codex-implementation handoff commit).

Spec: `docs/phase10-workflow/specs/section-3.md`

## Result: FAIL — 1 bounded finding

## Independent verification performed

- `npm test`: reran myself — 59 files, 343/343 passed (matches Codex's
  recorded result).
- `npm run build`: reran myself — Next.js 16.2.11 compiled, TypeScript
  passed, 16 route tasks generated (unchanged route list).
- Read the complete diff since `762066c`: 21 files, matching §3's "In
  scope" list exactly. Confirmed zero diff against every file in §3's
  "Explicitly out of scope" list (`PulseChapter.tsx`, `ObservatoryShell.tsx`,
  `ChapterOrbit.tsx`, `ChapterFocusManager.tsx`, `chapters.ts`,
  `history-data.ts`, `dashboard-data.ts`, and every named old dashboard
  visual component).
- Confirmed no other Claude/Codex coding-agent process was active against
  this repository before starting (one stray, unrelated `next start`
  server on port 3000 was found, orphaned from an earlier session,
  `cwd` inside this repo but not a coding-agent CLI process; left
  untouched and used a separate port, 3200, for this review's own server).
- Because Codex's managed sandbox could not bind a port or reach a browser
  backend (documented in its handoff and in the evidence README), performed
  the live checks Codex could not: started a real `next start` production
  server on port 3200 and temporarily installed `playwright@1.49.1`
  (`npm install --no-save`, matching the §1 refiner's precedent for
  temporary measurement tooling), then removed it again — confirmed
  `git diff --quiet package.json package-lock.json` both before starting
  and after uninstalling.
- Live-checked all five `/share` chapters (Pulse + this section's four) at
  1440×900 and 390×844: HTTP 200, `scrollWidth === clientWidth` at 390px
  (no horizontal overflow, criterion 9), exactly one `<h1>` per load
  (criterion 12), and zero console warnings/errors across all ten
  chapter/viewport loads. `/share/full` returns 200 and renders the new
  back-link.
- Captured and committed the required 1440×900 and 390×844 "after"
  screenshots for all four new chapters under
  `docs/phase10-baseline/section-3/after/` (criteria 8, 11) and visually
  inspected them.
- Read `forces-copy.ts`, `structure-copy.ts`, and `timeline-data.ts`
  directly against §3.1–§3.3's exact algorithms: `rankContributions`
  (filter-null, sort descending), `foldContributionsForDisplay`
  (`edgeCount = maxNamed/2`, top/bottom individually kept, middle summed),
  `forcesMarginaliaCopy`'s four branches (both-cross, top-only,
  bottom-only, spread fallback) against the exact threshold comparisons
  and copy strings in the spec, `FORCES_MATERIALITY_THRESHOLD` importing
  (not redefining) `PULSE_MATERIALITY_THRESHOLD` (= `0.0015`, confirmed in
  `surface-copy.ts`), `structureConcentrationCopy` reusing `riskLine`
  unchanged, `mostCorrelatedPair`'s `i < j` uniqueness, and `flowMarkers`'
  first-snapshot-never-emits / cost-unchanged-never-emits rule.
- Read every new chapter component's (`ForcesChapter`, `StructureChapter`,
  `TimelineChapter`, `LabChapter`) prop-type signature directly: each
  contains only ticker/percentage/weight/index/correlation/date/marker/
  composition/freshness/methodology fields — no dollar, price, share,
  total, gain, cost-basis, daily-dollar, or trade-reason field is reachable
  from any signature (criterion 28). Confirmed `src/app/(depth-pull)/share/page.tsx`
  maps every field down to this narrow shape before passing it in — e.g.
  Forces receives only `.ticker`/`.contribution`, never `.weight`;
  Structure receives only `.ticker`/`.weight`, never `.contribution`;
  Timeline's `chartData` map drops `.vooIndex`.
- Read `timeline-data.ts`: the two Supabase calls select exactly
  `"date, total_cost"` and `"date, ticker, action"` (criterion 29, also
  covered by `timeline-data.test.ts`'s query-builder-argument assertion);
  `getPublicTimelineData` reads only `.compositionHistory` off
  `getHistoryData()`'s return value, never `.rows`/`.dailyReturnBars`/
  `.drawdownSeries`. `toPublicTradeMarkers`'s input type has no `reason`
  field — structurally impossible to leak (criterion 30).
- Read `StructureChapter.tsx`'s and `TimelineChapter.tsx`'s correlation and
  event tables directly: both have a real `<caption>` and
  `scope="col"`/`scope="row"` headers (criterion 13); null correlation
  cells render `"Not enough overlap"` text.
- Read every new chapter's CSS module: every continuation link and every
  `<details><summary>` has `min-height: 44px` and a `:focus-visible` rule
  (criterion 10, 15). `/share/full`'s new back-link uses Tailwind
  `min-h-11` (44px) with `focus-visible:outline-2`.
- Read `forces-copy.test.ts`, `structure-copy.test.ts`, and
  `timeline-data.test.ts` directly: each covers the exact edge cases
  criteria 17–20 require (top+bottom pair, top-only, bottom-only,
  below-threshold spread, >8-position folding; each HHI band, null-only
  matrix, genuine highest pair; increase/decrease/no-change/first-snapshot
  cases for `flowMarkers`; exact `.select()` argument assertion for
  `getPublicTimelineData`).
- Read the extended `src/app/(depth-pull)/share/page.test.tsx` and the new
  `src/app/share/full/page.test.tsx` directly: both cover criteria 21–22
  (zero strict-currency/poison-field matches across all five chapters;
  `/share/full` back-link + unchanged default-hidden dollar behavior).
  Full existing suite remains green (criterion 23).
- Confirmed no `"use client"` directive and no new client-bundle dependency
  in any new file (criteria 24–25); `npm run build` output shows no new
  route and no new build-time network fetch.
- Confirmed the `/share/full` disposition decision (§4 of the spec) is
  implemented exactly as specified: one added back-link, no other change
  to that route's rendering, `hideDollars` logic, or data fetching (diffed
  directly — only a 7-line addition to that file).

## Finding (bounded to the spec's own acceptance criteria)

### Finding 1 — Timeline's marker ribbon renders illegible, overlapping labels (criterion 14)

**Spec requirement cited:** `docs/phase10-workflow/specs/section-3.md` §3.3,
"Dominant visual" paragraph: *"Ticks must be distinguishable by shape/label
text, not color alone."* Acceptance criterion 14: *"Timeline's marker ribbon
does not rely on color alone — verify shape/text distinguishes
capital-added/withdrawn/buy/sell in the rendered markup, not only in CSS."*

**Evidence:** Live screenshot of the Timeline chapter at 1440×900 against
real current production data
(`docs/phase10-baseline/section-3/after/desktop/timeline-1440x900.png`,
and a zoomed crop taken during review) shows three trade markers within a
few days of each other rendering as three superimposed triangle glyphs with
three overlapping, illegible `markerLabel` text strings (e.g. "Bought CBRS"/
"Bought NBIS"/"Bought GOOG" collapse into unreadable overlapping text). The
same collision is visible on the mobile capture. Reading
`src/components/observatory/TimelineChapter.tsx` and
`timeline-chapter.module.css` confirms why: each `.marker` is positioned
independently by `left: <percent>%` computed from its raw date (lines
136–149 of `TimelineChapter.tsx`), and `.markerLabel` only truncates its own
text with `max-width`/`text-overflow: ellipsis` (lines 100–107 of the CSS
module) — there is no minimum-spacing, collision-avoidance, or
selective-hiding logic between adjacent markers' labels when two or more
fall within roughly the same few pixels of ribbon width.

The requirement is not satisfied by DOM structure alone (each marker's text
node is distinct in the markup) when the *rendered* result — what
criterion 14 says to verify — makes the shape/text distinction actually
unreadable in a real, non-contrived data case (clustered trades, which this
section's own real fixture data produces).

**Required change:** When two or more ribbon markers' computed `left`
positions are closer than some minimum readable spacing, either (a) hide
the overlapping labels and rely on the `title` tooltip plus the always-
uncapped `<details>` table for the covered ones (glyphs alone would then
need to remain visually distinguishable at that spacing — they already are,
by shape), or (b) stagger overlapping labels vertically/diagonally so none
overlap, or another approach that keeps every rendered label legible at
1440×900 and 390×844 with the current real marker density. This is a
display-layer fix inside `TimelineChapter.tsx`/`timeline-chapter.module.css`
only — no change to `timeline-data.ts`, the 24-marker cap, or the sampling
rule is required or in scope.

## Non-blocking observation (out of §3's bounded scope — not a finding)

Recorded in the evidence README under "Visual inspection findings": selecting
the Structure chapter shows a faint, overlapping duplicate-text artifact from
the orbit navigation's own positioning for its third of five slots
(`data-index="2"`). Confirmed via diff that `ChapterOrbit.tsx` and
`observatory.module.css` — the files that own this positioning — are
untouched by §3, and confirmed `structure-chapter.module.css` cannot be the
cause (properly scoped CSS-module classes, no global selectors). Per the
spec's explicit scope boundary ("ObservatoryShell/ChapterOrbit... all
settled in §1/§2... do not touch") and `docs/PHASE10_AGENT_WORKFLOW.md` §4's
bounded-review discipline, this is not a §3 acceptance-criterion failure and
is not included in the finding above. Devan may want a future section (or a
standalone fix) to look at it.

## Everything else: verified passing

All other acceptance criteria in `docs/phase10-workflow/specs/section-3.md`
§6 (Behavioral 1–5, Visual 6–8, Mobile 9–11, Accessibility 12–13 and 15–16,
Tests 17–23, Build 24–26, Privacy 27–31) were independently verified passing
by the checks above.
