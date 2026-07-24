# Phase 10 §5 review — metric explainability primitive and core metrics

Reviewed by: `claude-code/sonnet-5` (Claude Lead, `review` stage)

Reviewed commit: `25a8fbfd8a68ca26cbf13057edc1ff8659e3eeb0`
(`phase10(§5): add metric explainability primitive`), diffed against
`prev_actor_commit` `3bf23e94ff4a03cf2eac5464756298384a75dbf9`.

Spec: `docs/phase10-workflow/specs/section-5.md`

## Result: FAIL — 1 bounded finding

## Independent verification performed

- `npm test`: reran myself — 65 files, 379/379 passed (matches Codex's
  reported count exactly).
- `npm run build`: reran myself — Next.js 16.2.11 compiled, TypeScript
  passed, 16 route tasks generated (unchanged route list).
- Read `metric-explanations.ts` in full against every builder function's
  exact spec in §3 (field-by-field: `id`, `name`, `shortLabel`, `category`,
  `definition`, `currentValue`, `interpretation`, `whyItMattersHere`,
  `limitations`, `calculation`, `sourceFreshness`) for all eight metrics —
  matches verbatim, including the shared `freshnessLine` helper and the
  reused `METRIC_SHORT_HISTORY_DAYS = 90` / 14-day TWR threshold.
- Read `metric-explanations.test.ts`: confirmed two fixtures per metric (16
  total), a shared `assertComplete` schema-completeness helper, hand-computed
  literal-value assertions (not just "is defined") for every metric's normal
  and edge case, and a banned-advisory-language regex test across every
  fixture — criteria 18–20.
- Read `MetricExplain.tsx`/`metric-explain.module.css` against §4's full
  behavior list: real `<button>` trigger with visible `Explain <label>` text
  (never icon-only), `aria-expanded`/`aria-controls`, focus-on-open via ref
  + `useEffect`, Escape/Close-button close with focus return to the trigger,
  guided content order (definition → value → interpretation → why-it-matters
  → limitations → calculation `<details>` → freshness → permalink → Close),
  `usePrefersReducedMotion` gating the 150ms open animation, and
  `initiallyOpen` seeding only the initial render (no re-sync `useEffect`) —
  matches, with one exception (see Finding 1 below).
- Read `LabChapter.tsx` and `StructureChapter.tsx`: confirmed exact prop
  additions (`basePath`, `preservedQuery`, `explainOpenId`), correct
  placement (TWR then XIRR replacing the old `<dl>` in Lab; HHI directly
  after the concentration lead and before the weights `<figure>` in
  Structure), and permalinks built via `observatoryChapterHref` with the
  documented `explain` key — criteria 5, 8.
- Read `LabChapter.test.tsx`/`StructureChapter.test.tsx` (both new): confirm
  correct-props rendering, `explainOpenId` opening only the matching
  instance, and an absent/mismatched id leaving both collapsed — criterion
  22.
- Diffed `src/app/(depth-pull)/share/page.tsx` and
  `src/app/(depth-pull)/page.tsx` against `3bf23e9`: confirmed
  `resolveExplainParam(params.explain)` follows the same destructure
  pattern as `chapter`, `explainOpenId` is passed to `LabChapter`/
  `StructureChapter` only when `active.id` matches that metric's home
  chapter, `data.xirrPct` reaches `LabChapter`, and no other chapter
  component or `ObservatoryShell`/`chapters.ts` file changed — criteria 5,
  6.
- Read the extended `page.test.tsx` files for both routes: confirm coverage
  of a valid same-chapter `explain` value, a cross-chapter value opening
  nothing, and an invalid value opening nothing, on both `/share` and `/` —
  criterion 23.
- Grepped `metric-explanations.ts` and `MetricExplain.tsx` for `$`,
  `formatCurrency`, `formatSignedCurrency`: the only `$` matches are
  template-literal interpolation syntax (`${...}`), not currency signs —
  zero dollar-bearing content — criterion 28. `/share`'s existing
  zero-dollar-leak tests remain in the unchanged 379/379 count — criterion
  29. `src/app/(depth-pull)/page.tsx`'s `isValidSession` gate is untouched
  by the diff — criterion 30.
- Started a real `next start` production server (port 3111) with a
  temporary process-only `OWNER_PASSWORD` override, and temporarily
  installed `playwright@1.49.1` (`npm install --no-save`), matching
  precedent from §1 and §4's review. Confirmed `git diff --quiet
  package.json package-lock.json` before installing and after uninstalling
  again; confirmed `playwright` absent from `node_modules` afterward.
- Captured the six required `after/` screenshots Codex's runner could not
  produce (browser backend unavailable in that turn): `desktop/
  lab-compact-1440x900.png`, `desktop/lab-twr-expanded-1440x900.png`,
  `desktop/structure-hhi-expanded-1440x900.png`, `mobile/
  lab-compact-390x844.png`, `mobile/lab-twr-expanded-390x844.png`, `mobile/
  structure-hhi-expanded-390x844.png` — all now committed under
  `docs/phase10-baseline/section-5/after/` — criteria 9, 12.
- Live-verified, against the running server:
  - Zero console warnings/errors on `/share?chapter=lab` at both viewports.
  - `/share?chapter=lab&explain=twr` and `?chapter=structure&explain=hhi`
    render the matching panel already expanded with the panel's `<h3>`
    heading holding `document.activeElement` on load — criterion 5.
  - `?chapter=structure&explain=twr` (cross-chapter) and
    `?chapter=lab&explain=bogus` (invalid) both open zero panels — criteria
    5, 6.
  - At 390×844, `document.documentElement.scrollWidth === clientWidth`
    (390 === 390) on both the compact and TWR-expanded states, with no
    clipped text visible in the captured screenshots — criterion 10.
  - Measured on-screen boxes at 390px: trigger 117×44, calculation
    `<summary>` 332×44, Close button 60×44, permalink 135×44 — all at or
    above 44×44 — criterion 11.
  - A `PerformanceObserver` longtask listener recorded zero long tasks while
    opening and closing both Lab panels in sequence; the addition is one
    small client component with no new dependency, consistent with §1's
    accepted low-risk profile — criterion 27 (lighter-weight than §1's full
    five-run Moto G4 protocol, but a real, live measurement, not a
    from-scratch methodology change).
  - `observatory-fallback.test.ts` (unmodified) remains in the green
    379/379 count — criterion 17.

## Finding 1 (Visual — acceptance criterion 7, and §4's status-line
requirement)

**Criterion cited:** Acceptance criterion 7 ("... expanded state reads as a
guided layer ... — not a flat list of labeled fields resembling a tooltip"),
and this section's spec §4 requirement 4, which requires "a visible text
status line" using the literal `"Limited: "`/`"Unavailable: "` prefix,
"matching the shell's existing `"Critical: "`/`"Notice: "` text-label
convention from §4" — a convention (`BriefingChapter.tsx:52`,
`{item.severity === "critical" ? "Critical: " : "Notice: "}{item.text}`)
that always prefixes real content; the prefix never stands alone.

**Evidence:** `MetricExplain.tsx:84-92` renders:

```tsx
{explanation.interpretation.status !== "contextual" ? (
  <p className={styles.status}>
    <strong>
      {explanation.interpretation.status === "limited"
        ? "Limited: "
        : "Unavailable: "}
    </strong>
  </p>
) : null}
```

This paragraph contains only the prefix and nothing else — no status
content follows it inside the same line/sentence, unlike every other
prefix-convention usage in the codebase. Live-captured on
`/share?chapter=lab&explain=xirr` (30 days of history, under the 90-day
`METRIC_SHORT_HISTORY_DAYS` threshold): the panel renders a bolded
`"Limited:"` as its own isolated line, followed by a blank gap, followed by
the unrelated interpretation summary sentence on the next line
(`docs/phase10-baseline/section-5/after/desktop/lab-twr-expanded-1440x900.png`
does not show this state since TWR is not short-history in this fixture;
reproduced and visually confirmed in a temporary XIRR capture during this
review — same component, same code path). `MetricExplain.test.tsx:53`
(`expect(screen.getByText("Limited:")).not.toBeNull();`) only asserts the
bare fragment exists, which is why this shipped green.

**Required change:** The status line must read as one complete sentence
naming what is limited or unavailable — e.g. prefixing the existing
`interpretation.summary` paragraph itself (mirroring
`BriefingChapter`'s `{prefix}{item.text}` pattern exactly), or another
single-sentence formulation that keeps the prefix attached to real content.
Update `MetricExplain.test.tsx` accordingly so it asserts complete rendered
text, not just the bare prefix.

## Scope confirmation

The reviewed diff (`25a8fbf` vs `3bf23e9`) touches exactly the files
authorized by the spec's §5 "Required work — file-level guidance":
`metric-explanations.ts`/`.test.ts` (new), `MetricExplain.tsx`/
`metric-explain.module.css`/`.test.tsx` (new), `LabChapter.tsx` +
`lab-chapter.module.css` + new `LabChapter.test.tsx`, `StructureChapter.tsx`
+ new `StructureChapter.test.tsx`, both `(depth-pull)` page files and their
tests, plus before-screenshots and the evidence doc/handoff. No file from
§5's own out-of-scope list (`RiskPanel.tsx`, `ConcentrationMeter.tsx`,
`/dashboard`, `/share/full`, `ObservatoryShell.tsx`, `ChapterOrbit.tsx`,
`ChapterFocusManager.tsx`, `chapters.ts`, `PulseChapter.tsx`,
`ForcesChapter.tsx`, `TimelineChapter.tsx`, `BriefingChapter.tsx`,
`OwnerUtilityStrip.tsx`, `src/lib/dashboard-data.ts`, `src/lib/math/*`) was
touched.

## Conclusion (initial pass)

29 of 30 acceptance criteria pass on independent re-verification. One
bounded finding (criterion 7 / §4's status-line requirement) remains.
Routed to Codex Implementation for `remediate`.

## Remediation re-review

Reviewed by: `claude-code/sonnet-5` (Claude Lead, `review` stage, remediation
round)

Reviewed commit: `aa35daa440de31fe1132767b254ef2f7efc4f772`
(`phase10(§5): remediate metric status sentence`), diffed against
`prev_actor_commit` `60a6208e41b17a48e77a1f738ecc35726329b5f5`.

### Result: PASS — Finding 1 resolved, no new findings

### Independent verification performed

- `npm test`: reran myself — 65 files, 379/379 passed (matches Codex's
  reported count).
- `npm run build`: reran myself — Next.js 16.2.11 compiled, TypeScript
  passed, 16 route tasks generated (unchanged route list).
- Read `MetricExplain.tsx:84-95`: the `"Limited: "`/`"Unavailable: "`
  `<strong>` prefix now sits directly inside the same `<p>` as
  `{explanation.interpretation.summary}`, immediately followed by it — one
  complete sentence, matching `BriefingChapter`'s `{prefix}{item.text}`
  convention exactly. The `"contextual"` branch is unchanged
  (`<p>{explanation.interpretation.summary}</p>` alone, no prefix).
- Read `MetricExplain.test.tsx:50-61`: now asserts the complete rendered
  sentence text (`"Limited: Unlike TWR, XIRR is sensitive to when money was
  added or withdrawn — a large recent deposit can swing it sharply even if
  the underlying investments haven't moved much."`) rather than the bare
  `"Limited:"` fragment.
- Live re-render: started a production server (`npm run build` +
  `npm run start -- -p 3100`) and fetched
  `/share?chapter=lab&explain=xirr` (30 days of history, under the 90-day
  `METRIC_SHORT_HISTORY_DAYS` threshold). The server-rendered HTML contains
  exactly one `<p class="...status">` element:
  `<strong>Limited: </strong>Unlike TWR, XIRR is sensitive to when money was
  added or withdrawn — a large recent deposit can swing it sharply even if
  the underlying investments haven't moved much.` — one complete sentence,
  no isolated fragment, no blank-line gap. Confirmed no `$<digits>` dollar
  pattern anywhere in the fetched HTML (the only `$`-prefixed tokens present
  are React Server Components serialization markers such as `$undefined`
  and `$1`, unrelated to currency). Stopped the temporary server afterward
  (confirmed port 3100 clear via `lsof`).
- Confirmed the diff since `prev_actor_commit` touches only
  `PHASE10_STATE.json`, the remediation handoff doc,
  `MetricExplain.tsx`, and `MetricExplain.test.tsx` — no file outside this
  one finding's scope.

### Scope confirmation

Bounded to Finding 1 only, as required — no new criteria introduced, no
other file touched.

### Conclusion

All 30 acceptance criteria now pass. `section.review_result` → `"pass"`.
Routing to `accept` stage (this Claude Lead turn stops here per protocol;
acceptance is a separate, later turn).
