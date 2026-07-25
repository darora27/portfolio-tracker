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

## Browser evidence — completed by Claude Lead

The historical pre-§6 dashboard captures are the retained "before" baseline
(single flat stack, no modes yet), per this doc's own "one 1440×900 and one
390×844 capture is sufficient for 'before'" note:

- `docs/phase10-baseline/section-0/desktop/dashboard-1440x900.png`
- `docs/phase10-baseline/section-0/mobile/dashboard-390x844.png`

All items below were completed live, by `claude-code/sonnet-5`, against a
real production server (`npx next start`) with a temporary localhost-only
`OWNER_PASSWORD` process override (never read from `.env*`), driven by
Playwright (`playwright@1.62.0`, installed with `npm install --no-save` and
removed again afterward — confirmed via `git diff --quiet package.json
package-lock.json`, matching the §1 refiner's established temporary-tooling
pattern). Raw structured results are retained at
`claude-lead-live-check-results.json` (checked for secrets before commit —
none present; it contains only DOM measurements and console arrays).

- [x] Captured after states at 1440×900 and 390×844 for How (default),
  Why, Attention (three real items visible), Analytics scrolled to Risk,
  and Analytics with the Sharpe disclosure expanded — see `desktop/` and
  `mobile/` in this directory — done by claude-code/sonnet-5.
- [x] Verified all four views at 390×844 have
  `document.documentElement.scrollWidth === clientWidth` (390 === 390 in
  every case, including the expanded-disclosure state) —
  `claude-lead-live-check-results.json` (`mobile-*-overflow` keys) — done by
  claude-code/sonnet-5.
- [x] Measured every switcher link (44px height, all four) and every visible
  disclosure trigger/Close button/permalink at 390px (44px height in every
  case) — `claude-lead-live-check-results.json` (`mobile-switcher-link-sizes`,
  `mobile-metric-buttons-sizes`, `mobile-permalink-sizes`) — done by
  claude-code/sonnet-5.
- [x] Verified Analytics groups (Performance/Holdings/Risk/Events) and their
  existing components (correlation heatmap, tables) remain reachable at
  390px by scrolling, with no new page-level horizontal-scroll requirement
  (confirmed by the same scrollWidth/clientWidth equality) — done by
  claude-code/sonnet-5.
- [x] Verified `/dashboard?mode=analytics&explain=sharpe#risk` opens Sharpe
  pre-expanded with its `<h3>` heading ("Sharpe ratio") focused after load
  (`explain-sharpe-focus` in the results JSON); verified
  `/dashboard?mode=how&explain=beta` opens zero disclosure panels
  (`cross-view-explain-how-panel-count: 0`) — done by claude-code/sonnet-5.
- [x] Exercised native keyboard activation (focus trigger, `Enter` →
  `aria-expanded="true"`, focus moves to the panel `<h3>`), `Escape` →
  `aria-expanded="false"` with focus returned to the trigger button, and
  browser back/forward mode restoration (`Why?` → `What deserves
  attention?` → back restores `Why?`'s `<h2>`, forward restores
  `Attention`'s) — `keyboard-*` and `*-nav-h2` keys in the results JSON —
  done by claude-code/sonnet-5.
- [x] Verified reduced motion: with `prefers-reduced-motion: reduce`
  emulated, the expanded panel's computed `animation-name` is `none`
  (`reduced-motion-animation-name`) — done by claude-code/sonnet-5.
- [x] Verified 200% desktop zoom (emulated per this project's established
  narrow-viewport-capture methodology, halving the CSS viewport to
  720×450 while keeping the same DPR) does not clip or overflow the
  switcher, facts, continuation links, or the expanded disclosure panel
  scrolled to Risk (`zoom200-overflow`: 720 === 720; see
  `desktop/zoom200-analytics-risk.png`) — done by claude-code/sonnet-5.
- [x] Recorded console warning/error counts for all four desktop states:
  zero warnings and zero errors in every case
  (`desktop-*-console` keys) — done by claude-code/sonnet-5.
- [x] Re-ran `npm test` (73 files, 414/414 passed) and a clean `npm run
  build` (Next.js 16.2.11 compiled, TypeScript passed, 16 static-page
  tasks generated, `/dashboard` remained dynamic) independently, on this
  turn's own clean starting HEAD — done by claude-code/sonnet-5.
- [x] Confirmed zero `--obs-*` token references anywhere under
  `src/components/dashboard/` by direct grep (criterion 14) — done by
  claude-code/sonnet-5.
- [x] Confirmed `RiskPanel`'s new explanation props are optional and
  `/share/full`'s existing call site (unedited, no new props) still renders
  its legacy compact tiles — satisfies the spec's explicit "do not touch
  `/share/full`" boundary while still wiring `MetricDisclosure` into
  `/dashboard` — done by claude-code/sonnet-5.

No item in this section remains an evidence gap; every check above is a real
result from a real browser, not a claim.
