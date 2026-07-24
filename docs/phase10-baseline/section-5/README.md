# Phase 10 §5 — metric explainability evidence

Prepared July 24, 2026 by `codex/gpt-5` (implementation).

## Outcome

The Observatory now has one reusable inline metric-explanation disclosure.
Lab uses it for TWR and XIRR; Structure uses it for HHI. Complete, deterministic
content builders also cover Beta, Sharpe, Sortino, volatility, and max drawdown
for §6 to mount without redefining their math or language.

## Before

The retained §3 public chapter captures document the immediately preceding
static Lab method ledger and Structure concentration plate. Copies were cropped
from the top-left to the exact required viewport dimensions and visually
inspected:

- `before/desktop/lab-1440x900.png` — 1440×900.
- `before/desktop/structure-1440x900.png` — 1440×900.
- `before/mobile/lab-390x844.png` — 390×844.
- `before/mobile/structure-390x844.png` — 390×844.

## Implemented evidence

- The compact row leads with the metric value and a visible 44px-minimum
  `Explain <label>` button.
- Expanded content follows the required guided order: definition, current
  value/window, interpretation, relevance, limitations, optional calculation,
  freshness, permalink, and Close.
- Limited and unavailable states use literal visible prefixes. No status relies
  on color alone.
- Opening focuses the explanation heading. Escape and the visible Close button
  both collapse the panel and return focus to the trigger.
- Valid `?explain=twr|xirr|hhi` links pre-open only in the metric's home
  chapter. Invalid and cross-chapter values open nothing.
- Reduced motion removes the 150ms height/opacity entrance animation.
- No explanation builder accepts a dollar amount or imports a currency
  formatter. The public route receives only percentages, weights, dates, and
  existing public-safe values.

## Design decision

The primitive is one inline disclosure in normal document flow at every
viewport. It is neither an anchored popover nor a mobile bottom sheet.
`docs/PHASE10_UX_ARCHITECTURE.md` explicitly identifies inline disclosure as
the safer choice for long content; the repository has no existing
focus-non-trapping popover or sheet utility, and a single mechanism keeps
reading order and focus behavior identical across breakpoints.

## Automated verification

- `npm test`: PASS — 65 test files, 379/379 tests — done by `codex/gpt-5`.
- `npm run build`: PASS — Next.js 16.2.11 compiled, TypeScript passed, and 16
  static-page tasks generated — done by `codex/gpt-5`.
- `npx tsc --noEmit`: PASS — done by `codex/gpt-5`.
- Targeted ESLint over every changed TypeScript/TSX file: PASS — done by
  `codex/gpt-5`.
- Focused metric-model/component/chapter/route suite: PASS — 6 files, 36/36
  tests — done by `codex/gpt-5`.
- `git diff --check`: PASS — done by `codex/gpt-5`.
- Direct currency-content check (`formatCurrency`,
  `formatSignedCurrency`, and literal dollar-number patterns): zero matches in
  `metric-explanations.ts` — done by `codex/gpt-5`.
- No package manifest or dependency changed — done by `codex/gpt-5`.

## Browser evidence limitation for review

The required live after screenshots and browser-only measurements could not be
captured in this managed Codex turn. The in-app browser runtime reported no
available backend. A repository-local Chrome executable was present, but its
headless process was terminated by the managed environment before producing a
frame. Codex did not claim unperformed visual, console, overflow, focus, target,
or performance measurements.

Claude Lead should capture and commit:

- `after/desktop/lab-compact-1440x900.png`
- `after/desktop/lab-twr-expanded-1440x900.png`
- `after/desktop/structure-hhi-expanded-1440x900.png`
- `after/mobile/lab-compact-390x844.png`
- `after/mobile/lab-twr-expanded-390x844.png`
- `after/mobile/structure-hhi-expanded-390x844.png`

The review pass should also record console warning/error counts, verify
`scrollWidth === clientWidth` at 390px, measure trigger/summary/permalink/Close
targets at 44×44 CSS pixels or larger, verify no clipped formula or Close
control, confirm the direct XIRR link opens expanded and focused, and compare
the route-owned client cost against §1's accepted method.

## Conscious bounded deferral

Beta, Sharpe, Sortino, volatility, and max drawdown have complete, tested
`MetricExplanation` builders in this section but no live `MetricExplain` mount
point. `PHASE10.md` §6 explicitly assigns “Add explainability from §5” to the
dashboard rebuild; mounting those five metrics before their Observatory
dashboard home exists would create throwaway UI.
