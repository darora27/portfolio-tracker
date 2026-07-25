# Phase 10 §6 — `/dashboard` hierarchy evidence

Prepared July 25, 2026 by `codex/gpt-5`.

## Outcome

The implementation and deterministic verification are complete. The Codex CLI
environment could not run the required genuine-browser evidence: browser
discovery returned no available backend (`[]`), and starting the local Next.js
server with a temporary task-only `OWNER_PASSWORD` failed with
`listen EPERM: operation not permitted 127.0.0.1:3106`.

Per the standing implementation prompt's environment-only exception, no
screenshot, console, viewport, zoom, or live-focus claim is made here. Claude
Lead must perform the missing checks independently before returning PASS.

## Completed implementation checks

- [x] Bare `/dashboard`, all four valid `mode` values, and an invalid value
  resolve deterministically with exactly one active server-rendered view —
  done by `codex/gpt-5`.
- [x] The default view leads with the reused market-relative copy, exactly
  three facts, and the unchanged `ValueChart` input — done by
  `codex/gpt-5`.
- [x] Why leads with the reused driver copy when available, exactly three
  facts, and the unchanged contribution filter/map — done by
  `codex/gpt-5`.
- [x] Attention reuses `todayLine` and `buildAttentionItems`, caps the first
  layer at three items, keeps severity in text, and covers zero/exactly-three/
  more-than-three states — done by `codex/gpt-5`.
- [x] All analytics groups the complete non-primary-chart toolset under
  Performance, Holdings, Risk, and Events with no duplicate membership —
  done by `codex/gpt-5`.
- [x] Beta, Sharpe, Sortino, Volatility, and Max drawdown use the accepted §5
  explanation builders without modifying their content model — done by
  `codex/gpt-5`.
- [x] Explanation direct-link state is honored only in the Analytics home
  view; invalid/cross-view `explain` state opens nothing extra — done by
  `codex/gpt-5`.
- [x] Disclosure state, labeled native button semantics, ARIA state, focus on
  open, Escape/Close focus return, permalink fidelity, and reduced-motion
  behavior pass in jsdom interaction tests — done by `codex/gpt-5`.
- [x] The authenticated route has one new `h1`, each active view has one new
  `h2`, analytics groups use new `h3` headings, and the unauthenticated branch
  remains unchanged in its regression test — done by `codex/gpt-5`.
- [x] `/dashboard` remains `force-dynamic` and gated by `isValidSession`; no
  public route, client fetch, API-key path, dependency manifest, dashboard
  data module, math module, or Observatory source changed — done by
  `codex/gpt-5`.
- [x] Dashboard source contains zero `--obs-*` references; the disclosure uses
  only the existing deep-tier token family — done by `codex/gpt-5`.
- [x] All new/changed §6 source passes scoped ESLint and `git diff --check` —
  done by `codex/gpt-5`.
- [x] `npm test`: 73 files and 414/414 tests passed — done by
  `codex/gpt-5`.
- [x] Clean `npm run build`: Next.js 16.2.11 compiled, TypeScript passed, and
  all 16 static-page tasks generated — done by `codex/gpt-5`.

## Design decisions retained

### Navigation, not ARIA tabs

The four modes are stable, independently linkable, server-rendered views.
`DashboardModeSwitcher` therefore follows `ChapterOrbit`'s semantic navigation
precedent: real `next/link` anchors inside
`<nav aria-label="Dashboard view">`, with `aria-current="page"` on the active
view. A tablist would impose roving tabindex and arrow-key behavior for content
that is navigation rather than an in-page tab widget.

### Deliberate deep-tier disclosure twin

`MetricDisclosure` deliberately mirrors the accepted `MetricExplain`
interaction instead of importing or refactoring it. Observatory explanation
styles depend on subtree-scoped `--obs-*` tokens. `/dashboard` retains its
separate cool deep-tier palette, and modifying the already accepted §5
component would widen this section's risk surface.

`RiskPanel` enables the new disclosure rendering only when the dashboard passes
the new explanation inputs. Its existing `/share/full` consumer passes none of
those inputs and therefore retains the legacy compact tiles, satisfying the
spec's explicit compatibility-route boundary without editing that public route.

### Existing internal heading levels

The fourteen relocated analytics that already own internal `<h2>` elements are
unchanged. This is the spec's conscious, bounded, non-regressive deferral.
Section §6 adds a correct route `h1`, per-view `h2`, and analytics-group `h3`
structure without expanding into fourteen unrelated component edits.

## Browser evidence not produced

The historical pre-§6 dashboard captures remain available at:

- `docs/phase10-baseline/section-0/desktop/dashboard-1440x900.png`
- `docs/phase10-baseline/section-0/mobile/dashboard-390x844.png`

They are referenced only as the existing flat-stack baseline; this turn did
not recapture or relabel them as current screenshots.

Claude Lead must independently complete every item below before PASS:

- [ ] Capture current-before evidence from parent commit
  `45b7d694ed013fca408ae60bc063a64dc9d9b5f0` (or verify the historical §0
  files remain representative), at 1440×900 and 390×844.
- [ ] Capture after states at 1440×900 and 390×844 for How, Why, Attention
  with at least one item, Analytics scrolled to Risk, and one expanded
  disclosure.
- [ ] Verify all four views at 390×844 have
  `document.documentElement.scrollWidth === clientWidth`.
- [ ] Measure every switcher link and disclosure trigger, Close button, and
  permalink at 390px; each must be at least 44×44 CSS pixels.
- [ ] Verify Analytics groups and existing responsive tables/charts remain
  reachable at 390px without a new page-level horizontal-scroll requirement.
- [ ] Verify `/dashboard?mode=analytics&explain=sharpe#risk` opens Sharpe and
  focuses its heading after hydration; verify a non-Analytics explanation
  query opens nothing.
- [ ] Exercise native keyboard activation, Escape/Close focus return, visible
  focus, back/forward mode restoration, and reduced motion in a real browser.
- [ ] Verify 200% desktop zoom does not clip the switcher, facts, continuation
  links, or disclosure panel.
- [ ] Record console warning/error counts for every captured state.

Each unchecked item is an evidence gap, not a known product failure and not a
PASS claim.
