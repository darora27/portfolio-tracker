# Phase 10 §3 — `/share` Forces, Structure, Timeline, and Lab evidence

Prepared July 24, 2026 by `codex/gpt-5` (implementation); live browser
evidence added July 24, 2026 by `claude-code/sonnet-5` (Claude Lead,
`review` stage) after Codex's managed sandbox could not bind a local port
or reach a browser backend.

## Before

The §1 semantic-shell captures are the reusable before evidence specified by
the §3 contract:

- `../section-1/desktop/observatory-shell-public-1440x900.jpg` — the public
  1440×900 shell with placeholder chapter content.
- `../section-1/mobile/observatory-shell-390x844.jpg` — the public 390×844
  shell with the intentional two-dimensional fallback and placeholder content.

## After (captured live by Claude Lead during review)

Captured against a real `next start` production server (port 3200) with a
temporarily installed `playwright@1.49.1` (`npm install --no-save`,
`npx playwright install chromium` — chromium was already cached), following
the §1 refiner precedent for temporary measurement tooling. Confirmed
`git diff --quiet package.json package-lock.json` before and after; the
package was uninstalled again before this review's own commit.

- `after/desktop/forces-1440x900.png`, `structure-1440x900.png`,
  `timeline-1440x900.png`, `lab-1440x900.png` — full-page captures at a
  1440px-wide viewport (Structure's full-page height is 972px because its
  12-position weight list is slightly taller than one 900px viewport; the
  other three are exactly 900px tall, i.e. they do not scroll).
- `after/mobile/forces-390x844.png`, `structure-390x844.png`,
  `timeline-390x844.png`, `lab-390x844.png` — full-page captures at a
  390px-wide viewport, documenting the complete scrollable mobile
  composition (per §3's acceptance criterion 9, mobile is not required to
  fit one viewport, only to avoid horizontal overflow — verified below).

### Live checks (Playwright, Chromium, headless)

For all five chapters (Pulse + this section's four) at both 1440×900 and
390×844:

- HTTP status 200.
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`
  at 390px width for every chapter (no horizontal page overflow) —
  confirmed true for forces/structure/timeline/lab (and pulse, unchanged).
- Exactly one `<h1>` per page load for every chapter.
- Zero browser console warnings or errors across all ten
  chapter/viewport loads (`console` + `pageerror` listeners, empty in both
  passes).
- `/share/full` returns HTTP 200 and renders the new back-link.

### Visual inspection findings

- Forces, Structure, Timeline, and Lab each render a visually distinct
  dominant composition (signed ranked bar list; ranked weight bar list +
  correlation disclosure; single portfolio-only line chart with a running-peak
  reference and a marker ribbon; a definition list) — none is a card grid,
  and Timeline's chart is visually distinct from Pulse's dual-line chart
  (confirmed no VOO line is drawn).
- Lab's copy matches the spec's exact required strings (lead sentence,
  definition-list rows, and the `"View the complete public dataset"`
  continuation link) verbatim.
- **Finding (see review doc):** Timeline's marker ribbon renders overlapping,
  illegible marker labels wherever two or more flow/trade events fall close
  together in time against the current real production data (e.g. three
  trades within a few days produce three superimposed `Bought <ticker>`
  labels). See
  `docs/phase10-workflow/reviews/section-3-review.md` for the bounded
  finding and required change.
- **Non-blocking observation, out of §3's scope:** at 1440×900, selecting
  the Structure chapter specifically (not Forces/Timeline/Lab) shows the
  orbit navigation's `data-index="2"` node body rendering behind/overlapping
  the chapter-preview inspector card, producing a faint duplicate-text
  visual artifact. Confirmed this is unrelated to this section's work:
  `ChapterOrbit.tsx` and `observatory.module.css` (the files that own this
  positioning) are untouched by the §3 diff, `structure-chapter.module.css`
  uses only properly scoped CSS-module class names with no global leakage,
  and the DOM has exactly one `<h1>`/`<article>`/`<nav>` (no literal
  duplicate elements) — this is a pre-existing §1/§2 orbit-positioning
  behavior specific to the third of five orbit slots, not a regression
  introduced here. Recorded for awareness only; not a §3 finding per the
  spec's explicit "ObservatoryShell/ChapterOrbit... all settled in §1/§2...
  do not touch" scope boundary and the bounded-review discipline in
  `docs/PHASE10_AGENT_WORKFLOW.md` §4.

## Automated evidence

- `npm test`: PASS — 59 files, 343/343 tests (reran independently by
  Claude Lead; matches Codex's recorded result).
- `npm run build`: PASS — Next.js 16.2.11 compiled, TypeScript passed, and
  16 static-page tasks generated (reran independently by Claude Lead).
- Targeted ESLint over every changed TypeScript/TSX file: PASS (Codex).
- TypeScript (`npx tsc --noEmit`): PASS (Codex).
- Rendered `/share` privacy regression: PASS for Pulse, Forces, Structure,
  Timeline, and Lab — zero strict currency matches
  (`/\$\d[\d,]*\.\d{2}\b/`) and no poisoned research, simulation,
  trade-reason, owner-slot, or dollar-bearing fixture values.
- `/share/full` compatibility regression: PASS — the back-link points to
  `/share`, a missing `share_hide_dollars` setting still defaults all
  dollar-bearing components to hidden, and strict currency remains absent
  from the rendered test output.
- Narrow-query regression: PASS — Timeline selects exactly
  `date, total_cost` and `date, ticker, action`; its public DTO forwards
  only flow markers, trade markers, and composition history.
- Existing reduced-motion/no-3D Observatory fallback tests pass unmodified.

## Implementation and accessibility notes

- Forces, Structure, Timeline, and Lab are server components; none adds
  `"use client"` or a new client dependency.
- Their prop types accept only ticker, percentage/weight, index, correlation,
  date, public event-marker, composition, freshness, and methodology fields.
  Dollar, price, share, total, gain, cost-basis, daily-dollar, and trade-reason
  fields are structurally excluded — confirmed by direct prop-type read
  during Claude Lead review, not only by test coverage.
- Structure exposes its full correlation matrix in a native `<details>` with
  a `<caption>` and `scope="col"`/`scope="row"` headers.
- Timeline's complete uncapped event record is a captioned, scoped table;
  only the decorative ribbon is deterministically capped at 24 markers.
  Composition and correlation detail stay behind native disclosures; every
  new summary and continuation link has a CSS `min-height: 44px` and a
  visible `:focus-visible` outline reusing the shell's existing pattern.
- `/share/full` content, data fetching, and `hideDollars` logic are
  unchanged; the only route addition is the requested back-link to the
  Observatory (`min-h-11` = 44px, visible focus ring).
