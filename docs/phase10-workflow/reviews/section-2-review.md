# Phase 10 §2 review — `/share` Pulse vertical slice

Reviewed by: `claude-code/sonnet-5` (Claude Lead, `review` stage)

Reviewed commit: `970e01273b2979aa9764eed55840cfd98df660a3`
(`phase10(§2): build public Pulse Observatory`)

Spec: `docs/phase10-workflow/specs/section-2.md`

## Result: PASS — no findings

## Independent verification performed

- `npm test`: reran myself — 55 files, 325/325 passed (matches the
  implementation's own recorded result).
- `npm run build`: reran myself — Next.js 16.2.11 compiled, TypeScript
  passed, 16 route tasks generated (unchanged route list; no new routes).
- Read the complete diff since `prev_actor_commit` (`d086b9e`): one commit,
  `970e012`. Confirmed every file in scope matches §2's "In scope" list and
  confirmed zero diff against every file in §2's "Explicitly out of scope"
  list (`src/lib/dashboard-data.ts`, `src/app/share/full/page.tsx`,
  `SurfaceHeader.tsx`, `SurfaceActs.tsx`, `(depth-pull)/page.tsx`,
  `(depth-pull)/layout.tsx`).
- Read `src/lib/surface-copy.ts`'s `pulseLeadCopy`/`pulseDriverCopy` and
  `src/lib/surface-copy.test.ts`'s new fixtures directly; independently
  traced each hand-computed fixture against the spec's §3.2/§3.3 rules,
  including the two asymmetric edge cases (gap negative/flat with no
  material drag; gap positive with no material boost) — both fall through
  to the "No single holding drove most of the result." fallback, matching
  the spec's explicit instruction for the negative case and a reasonable,
  consistent symmetric extension for the (unspecified) positive-side
  mirror case.
- Read `PulseChapter.tsx`'s prop type directly: contains only
  `historyDays`, `portfolioTwrPct`, a narrow `benchmark` (available/twrPct/
  excessReturnPct), `chartData` (date/portfolioIndex/vooIndex), and
  `positions` (ticker/contribution) — no dollar/price-bearing field is
  reachable from its signature. No `"use client"` directive; it is a
  server component.
- Read `src/app/(depth-pull)/share/page.tsx`: `ObservatoryShell` receives
  `mode="public"`, `basePath="/share"`, `title="Portfolio Observatory"`,
  the specified `freshness` shape, and `chapterContent={{ pulse: ... }}`
  only. `data.chartData`/`data.positionRows` are mapped down to their
  non-dollar fields before reaching `PulseChapter`.
- Read `src/app/(depth-pull)/share/page.test.tsx`: covers default-Pulse
  rendering with real comparison/driver copy, the Forces placeholder
  landing, strict-currency/poison-field absence (including a
  `999999.99`-valued fixture position with every dollar field populated,
  confirming the page never reads them), and the insufficient-history
  fallback with no `NaN`.
- Verified `sips` pixel dimensions on all four committed screenshots
  (`before`/`after` × desktop 1440×900 / mobile 390×844) — all four exact.
- Visually inspected `after/desktop/share-1440x900.png` and
  `after/mobile/share-390x844.png`: the lead sentence is the dominant
  first-viewport element, no dollar value or isolated KPI leads, exactly
  one trajectory chart is visible, freshness and the read-only badge are
  visible in the same viewport as the lead sentence.
- Confirmed `.continuation:focus-visible` in the new
  `pulse-chapter.module.css` reuses the shell's existing focus pattern
  exactly (`outline: 2px solid var(--obs-accent); outline-offset: 3px`),
  matching `ChapterOrbit`'s own `.body:focus-visible` rule byte-for-byte —
  no new focus style was invented.
- Confirmed `resolveObservatoryChapter`'s no-match fallback is
  `OBSERVATORY_CHAPTERS[0]`, and `OBSERVATORY_CHAPTERS[0].id === "pulse"` —
  Pulse is genuinely the default with no `chapter` param.

### Live verification (the implementation's own handoff flagged this as unconfirmed)

The implementation handoff explicitly noted its managed browser backend
focused controls but could not dispatch simulated Enter/Space, and asked
Claude Lead to independently repeat Tab + Enter rather than inherit an
unverified keyboard PASS. I did this myself: built the app, started a real
production server on port 3100, temporarily installed Playwright
(`npm install --no-save`, matching this project's established §1
precedent), and drove a real Chromium instance against the live server.
Removed Playwright and confirmed `git diff --quiet package.json
package-lock.json` afterward (no diff).

Live results:

- 390×844: `document.documentElement.scrollWidth === document.documentElement.clientWidth`
  → `390 === 390`. No horizontal overflow.
- Exactly one `h1` in the rendered DOM.
- The "Open Forces" continuation control's live bounding box: 332×44 CSS
  pixels (≥ 44×44).
- Real keyboard traversal: `Tab` reached the "Open Forces" anchor (a real
  `<a href="/share?chapter=forces">`) after 7 tabs; `Enter` navigated the
  page to `?chapter=forces` and the shell rendered "02 — Forces" (the
  shell's own existing placeholder, expected for this section).
- The trajectory data disclosure: `Tab` reached the native `<summary>`
  after 6 tabs; `Enter` toggled `<details open>` from `false` to `true`.
- The "Open Forces" link's computed `outline-style`/`outline-width` on
  focus: `solid 2px`, confirming the focus-visible rule is live, not just
  present in source.
- Zero browser console warnings/errors during the 390×844 session.

## Acceptance criteria — checked one by one against §5 of the spec

**Behavioral**
1. PASS — default chapter is Pulse with no `chapter` param (source + live).
2. PASS — lead sentence uses real `getDashboardData()` output; no hardcoded
   numbers (source read + unit tests + rendered-output test).
3. PASS — driver sentence renders only when non-null (source + tests).
4. PASS — window and freshness both visible in the first viewport
   (screenshot + live DOM).
5. PASS — real working Forces link/control, landing on the shell's
   existing placeholder (live keyboard navigation confirmed end-to-end).
6. PASS — insufficient-history/unavailable-benchmark fallback renders
   exactly, no crash/NaN/zero-standing-in (dedicated test).
7. PASS — read-only badge visible in `mode="public"` (screenshot).

**Visual**
8. PASS — no dollar hero; the lead sentence is the dominant first-viewport
   element (screenshot).
9. PASS — exactly one trajectory visual (test asserts one `<svg>`; visual
   confirms).
10. PASS — 1440×900 before/after screenshots exist under
    `docs/phase10-baseline/section-2/`, dimensions verified with `sips`.

**Mobile**
11. PASS — 390×844 has zero horizontal page overflow, verified live (not
    assumed) — see above.
12. PASS — Forces continuation control measured live at 332×44 CSS pixels.
13. PASS — 390×844 and 1440×900 screenshots both exist and are correctly
    dimensioned.

**Accessibility**
14. PASS — exactly one `h1`, confirmed live.
15. PASS — trajectory has a working, reachable text/data alternative (a
    real `<details>`/`<summary>` disclosure containing a bounded,
    deterministic sampled table); confirmed it actually opens via keyboard
    live, not merely present in source.
16. PASS — Forces link is keyboard-reachable (Tab) and keyboard-operable
    (Enter), with a visible focus outline reusing the shell's existing
    pattern exactly; confirmed live.
17. PASS — `observatory-fallback.test.ts` is unmodified in this diff and
    still passes as part of the full 325/325 green suite.

**Tests**
18. PASS — `pulseLeadCopy` unit tests cover a clear lead, a clear trailing
    gap, a within-epsilon tie, and the insufficient-history/unavailable-
    benchmark fallback, each against a hand-computed value.
19. PASS — `pulseDriverCopy` unit tests cover single drag, multiple drags
    with an offsetting boost, single boost (leading case), below-
    materiality positions correctly unnamed, and the no-single-holding
    fallback.
20. PASS — a new privacy regression test exists for `/share`'s rendered
    output and passes.
21. PASS — full existing suite remains green; test count increased from
    310 (§1 final) to 325 (+15, matching the 15 new `it` blocks added by
    this section) with no existing test weakened, skipped, or deleted.

**Build**
22. PASS — `npm run build` passes; no new build-time network dependency
    (no new font/external script import in the diff).
23. PASS — `PulseChapter` has no `"use client"` directive; the only client
    interactivity used (the disclosure toggle) is native `<details>`/
    `<summary>`, not a new client-component boundary.

**Privacy**
24. PASS — dedicated regression test asserts zero
    `/\$\d[\d,]*\.\d{2}\b/` matches in unauthenticated `/share` HTML.
25. PASS — the same test suite asserts no `ownerSlot` rendering and no
    poisoned research/simulation/trade-reason fixture values leak; `/share`
    never passes an `ownerSlot` prop (confirmed by direct read of
    `page.tsx` — no such prop appears in the `ObservatoryShell` call).
26. PASS — `PulseChapterProps`, read directly from source, excludes every
    named dollar/price-bearing field (`value`, `gain`, `costBasis`,
    `price`, `day`, `prevClose`, `totalValue`, `totalCost`, `dailyChange`,
    `realizedGain`, `unrealizedGain`, `xirrPct`) — structurally, not just
    behaviorally, guaranteed.

## Scope discipline

Confirmed via `git diff --stat` against `prev_actor_commit` that no file
in §2's "Explicitly out of scope" list was touched, and no
Forces/Structure/Timeline/Lab content was added beyond the shell's own
pre-existing placeholder.

## Non-finding observation (not a criterion failure, recorded for §3's awareness)

On viewports ≤1023px, the new `.stage` CSS reorders the observation plate
before the chapter orbit visually (`order: -1`) without changing DOM
order, so keyboard Tab order still reaches the five chapter-orbit links
before the Pulse plate content, while sighted users see the plate first.
No acceptance criterion in this section's spec requires DOM/visual order
parity, so this is not a finding — but it's worth §3 or §13's broader
accessibility audit keeping in mind if it recurs across other chapters.

## Outcome

All 26 acceptance criteria pass under independent, live verification.
Advancing to `accept`.
