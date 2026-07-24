# Phase 10 §2 — `/share` Pulse evidence

Prepared July 24, 2026 by `codex/gpt-5`.

## Before

The pre-§2 `/share` executable page remained byte-identical to the §0 baseline
through accepted §1. The exact §0 production captures are therefore copied
here as the §2 before evidence:

- `before/desktop/share-1440x900.png` — 1440×900, verified with `sips`.
- `before/mobile/share-390x844.png` — 390×844, verified with `sips`.

They show the Phase 9 number-first landing that §2 replaces.

## After

The initial managed Codex shell could not bind localhost or access a browser.
The preserved implementation was subsequently verified from the Codex desktop
environment without changing application source:

- `after/desktop/share-1440x900.png` — exact 1440×900 live capture, verified
  with `sips`.
- `after/mobile/share-390x844.png` — exact 390×844 live capture, verified with
  `sips`.
- At 390×844, `document.documentElement.scrollWidth === clientWidth`
  (`390 === 390`).
- The lead sentence, driver sentence, freshness line, trajectory, data
  disclosure, and Forces continuation all end within the first 844 CSS pixels.
- The `Open Forces` continuation measured 332×44 CSS pixels. The mobile
  chapter-navigation Forces target measured 366×44 CSS pixels.
- The page contained exactly one `h1`, one Pulse trajectory SVG, and one
  native trajectory-data disclosure at both required sizes.
- The native disclosure opened and exposed its deterministic table. The
  `Open Forces` anchor reached `/share?chapter=forces`, where the expected §3
  placeholder rendered.
- Browser console warnings/errors: zero.

The browser backend focused both native controls during keyboard-directed
checks but did not dispatch its simulated Enter/Space default action. The
controls remain native `<summary>` and `<a>` elements, their pointer activation
worked live, and their rendered semantics/targets are covered by automated
tests. Claude Lead should independently repeat Tab + Enter during review rather
than treating this backend limitation as a verified keyboard PASS.

## Automated evidence

- `npm test`: PASS — 55 files, 325/325 tests.
- `npm run build`: PASS — Next.js 16.2.11 compiled, TypeScript passed, and 16
  static-page tasks generated.
- Focused §2/shell regression set: PASS — 48/48 tests.
- Targeted ESLint on every changed TypeScript/TSX file: PASS.
- Rendered `/share` privacy regression: PASS — zero strict currency matches
  (`/\$\d[\d,]*\.\d{2}\b/`) and no poisoned research, simulation, trade-reason,
  owner-slot, or dollar-bearing fixture values in server-rendered output.
- Rendered-output structure: PASS — Pulse is the default, exactly one SVG
  trajectory renders, the expandable trajectory table is present, freshness
  and read-only state render, and the real Forces href is
  `/share?chapter=forces`.
- Insufficient-history output: PASS — exact fallback copy, no driver sentence,
  no `NaN`, and no fabricated zero benchmark.

## Implementation notes

- `PulseChapter` is a server component and its prop type contains only
  `historyDays`, portfolio TWR, the narrow benchmark comparison, indexed chart
  points, and `{ ticker, contribution }` positions. It cannot receive account
  values, gains, cost basis, prices, daily dollar changes, or previous closes.
- The trajectory is server-rendered SVG with both Portfolio and VOO visible
  when same-period VOO data exists. A native disclosure exposes a deterministic
  table of at most 20 sampled rows, always including the first and latest
  dates.
- On compact layouts, the observation plate is visually ordered before the
  existing semantic orbit so the Pulse answer and Forces continuation can fit
  in the first viewport without deleting the five chapter links or the static
  concentric fallback. This layout remains pending the live visual checks
  listed above.
