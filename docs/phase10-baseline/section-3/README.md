# Phase 10 §3 — `/share` Forces, Structure, Timeline, and Lab evidence

Prepared July 24, 2026 by `codex/gpt-5`.

## Before

The §1 semantic-shell captures are the reusable before evidence specified by
the §3 contract:

- `../section-1/desktop/observatory-shell-public-1440x900.jpg` — the public
  1440×900 shell with placeholder chapter content.
- `../section-1/mobile/observatory-shell-390x844.jpg` — the public 390×844
  shell with the intentional two-dimensional fallback and placeholder content.

The placeholder body is supplied by `ObservatoryShell` for every chapter whose
`chapterContent` entry is absent, so these captures document the identical
pre-§3 state Forces, Structure, Timeline, and Lab used.

## After

The required live 1440×900 and 390×844 captures could not be produced in this
Codex turn. The managed execution sandbox denied both production-server bind
attempts (`0.0.0.0:3100` and `127.0.0.1:3100`) with `EPERM`, and the required
in-app browser runtime reported no available browser backend. Browser runtime
troubleshooting confirmed an empty browser list. The browser-control skill
forbids substituting a separate browser automation stack, so no screenshot,
console count, pixel dimension, live overflow equality, or live target-size
claim is made here.

Expected after paths remain intentionally absent rather than being filled with
synthetic or mislabeled evidence:

- `after/desktop/forces-1440x900.png`
- `after/desktop/structure-1440x900.png`
- `after/desktop/timeline-1440x900.png`
- `after/desktop/lab-1440x900.png`
- `after/mobile/forces-390x844.png`
- `after/mobile/structure-390x844.png`
- `after/mobile/timeline-390x844.png`
- `after/mobile/lab-390x844.png`

Claude Lead must perform the exact live screenshot, console, overflow, focus,
keyboard activation, and 44×44 target checks during review. This is an evidence
limitation, not a claimed visual pass.

## Automated evidence

- `npm test`: PASS — 59 files, 343/343 tests.
- `npm run build`: PASS — Next.js 16.2.11 compiled, TypeScript passed, and 16
  static-page tasks generated.
- Targeted ESLint over every changed TypeScript/TSX file: PASS.
- TypeScript (`npx tsc --noEmit`): PASS.
- Focused §3, `/share`, `/share/full`, and Observatory fallback set: PASS —
  33/33 tests.
- Rendered `/share` privacy regression: PASS for Pulse, Forces, Structure,
  Timeline, and Lab — zero strict currency matches
  (`/\$\d[\d,]*\.\d{2}\b/`) and no poisoned research, simulation,
  trade-reason, owner-slot, or dollar-bearing fixture values.
- `/share/full` compatibility regression: PASS — the back-link points to
  `/share`, a missing `share_hide_dollars` setting still defaults all
  dollar-bearing components to hidden, and strict currency remains absent from
  the rendered test output.
- Narrow-query regression: PASS — Timeline selects exactly
  `date, total_cost` and `date, ticker, action`; its public DTO forwards only
  flow markers, trade markers, and composition history.
- Existing reduced-motion/no-3D Observatory fallback tests pass unmodified.

## Implementation and accessibility notes

- Forces, Structure, Timeline, and Lab are server components; none adds
  `"use client"` or a new client dependency.
- Their prop types accept only ticker, percentage/weight, index, correlation,
  date, public event-marker, composition, freshness, and methodology fields.
  Dollar, price, share, total, gain, cost-basis, daily-dollar, and trade-reason
  fields are structurally excluded.
- Forces renders signed contribution text alongside directional bars.
- Structure exposes its full correlation matrix in a native `<details>` with a
  caption and scoped table headers.
- Timeline renders portfolio-only growth against a running-peak reference and
  uses distinct `+`, `−`, `▲`, and `▼` marker glyphs plus event text. Its
  complete uncapped event record is a captioned table; only the decorative
  ribbon is deterministically capped at 24 markers.
- Timeline composition and correlation detail stay behind native disclosures;
  all new summaries and continuation links have CSS minimum heights of 44px
  and visible `:focus-visible` outlines.
- Lab uses a definition list for TWR, same-period VOO methodology, the fixed
  under-14-day limitation, source freshness, and the complete-public-dataset
  continuation.
- `/share/full` content, data fetching, and `hideDollars` logic are unchanged;
  the only route addition is the requested back-link to the Observatory.
