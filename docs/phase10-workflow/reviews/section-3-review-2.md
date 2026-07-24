# Phase 10 §3 re-review — Timeline marker-label remediation

Reviewed by: `claude-code/sonnet-5` (Claude Lead, `review` stage, second pass)

Reviewed commit: `a9b675e` (`phase10(§3): remediate timeline marker
labels`), diffed against `prev_actor_commit` `10f1a2f` (this section's first
`review` commit, `phase10(review §3): fail with 1 bounded finding`).

Spec: `docs/phase10-workflow/specs/section-3.md`

Prior review: `docs/phase10-workflow/reviews/section-3-review.md` (result:
FAIL — 1 bounded finding, criterion 14).

## Result: PASS — the one bounded finding is remediated; no new findings

This re-review evaluates only the bounded finding from the prior review
(criterion 14, Timeline's marker ribbon). Every other acceptance criterion
was already independently verified passing in the first review pass and is
unaffected by this remediation's diff (confirmed by scope, below).

## Scope confirmation

The remediation diff (`a9b675e` vs `10f1a2f`) touches exactly:
`src/components/observatory/TimelineChapter.tsx`, `PHASE10_STATE.json`, and
one handoff doc. `timeline-data.ts`, the 24-marker cap, the sampling rule,
every other chapter, and the shell/navigation files are all untouched —
matching the finding's own required-change scope exactly ("This is a
display-layer fix inside `TimelineChapter.tsx`/`timeline-chapter.module.css`
only — no change to `timeline-data.ts`, the 24-marker cap, or the sampling
rule is required or in scope"). No CSS module change was made or needed.

## Independent verification performed

- `npm test`: reran myself — 59 files, 343/343 passed (unchanged from the
  first review pass; no test file touched by the remediation).
- `npm run build`: reran myself — Next.js 16.2.11 compiled, TypeScript
  passed, 16 route tasks generated (unchanged route list).
- Read the diff directly: `TimelineChapter.tsx` now computes each ribbon
  marker's `left` position once, tracks `lastVisibleLabelPosition`, and sets
  `showLabel = left - lastVisibleLabelPosition >= MIN_LABEL_SPACING_PERCENT`
  (`MIN_LABEL_SPACING_PERCENT = 12`), advancing the tracked position only
  when a label is shown. Every marker still renders its glyph (`<b
  aria-hidden="true">`) and now carries both `title` and an explicit
  `aria-label` (`${formatDate} — ${text}`) regardless of `showLabel`; the
  visible `.markerLabel` span is only rendered (and is itself
  `aria-hidden="true"`, since the wrapping span's new `aria-label` is now
  the accessible name) when `showLabel` is true.
- Started a real `next start` production server (port 3200, confirmed no
  port conflict) and temporarily installed `playwright@1.49.1` (`npm
  install --no-save`), matching this section's own first-review precedent
  for live-browser verification. Confirmed `git diff --quiet package.json
  package-lock.json` before installing and after uninstalling again.
- Re-rendered `/share?chapter=timeline` against real current production
  data at both required viewports:
  - **1440×900:** 24 total markers sampled onto the ribbon, 4 visible
    labels. Computed pairwise bounding-box overlap over all 4 visible
    labels: zero overlaps. Visual inspection of the captured screenshot
    confirms each visible "Capital add…" label is cleanly separated with no
    overlapping text, and the three clustered buy markers (previously
    rendering three superimposed "Bought `<ticker>`" labels) now show
    distinguishable triangle glyphs with no label rendered for any of the
    three (all three are the same "buy" kind — criterion 14 requires
    distinguishing capital-added/withdrawn/buy/sell **kinds**, not
    individual same-kind trades from each other, so glyph-only here is not
    a regression against the criterion actually cited).
  - **390×844:** 20 markers rendered (cap logic unaffected), 0 visible
    labels — confirmed this is a pre-existing, unrelated
    `@media (max-width: 767px) { .markerLabel { display: none; } }` rule
    already present in the reviewed implementation commit (`b631351`) and
    untouched by this remediation's diff — not something the remediation
    introduced or needs to fix. Because zero labels render on mobile
    (before and after this remediation), there is trivially zero label
    overlap on mobile. `scrollWidth === clientWidth` confirmed true (no
    horizontal overflow, unchanged).
  - Zero console warnings/errors at either viewport.
- Updated and re-committed the "after" evidence screenshots for Timeline at
  both viewports (`docs/phase10-baseline/section-3/after/desktop/timeline-1440x900.png`,
  `after/mobile/timeline-390x844.png`) — the previously committed pair
  predated the remediation and showed the overlapping-label defect;
  re-verified new dimensions with `sips` (1440×900 desktop; 390×1321 full-page
  mobile, consistent with this section's other full-page mobile captures).
  Updated `docs/phase10-baseline/section-3/README.md`'s "Visual inspection
  findings" and added a "Remediation re-verification" section recording this
  pass's independent checks.

## Everything else

No other acceptance criterion was re-examined in this pass, per the bounded
review discipline in `docs/PHASE10_AGENT_WORKFLOW.md` §4 — the first
review's independent verification of criteria 1–13, 15–31 stands unchanged,
since the remediation diff does not touch any file those checks depended on.

## Conclusion

Finding 1 (criterion 14) is resolved. §3 has zero outstanding findings and
is ready for `accept`.
