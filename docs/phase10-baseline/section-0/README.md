# Phase 10 §0 Baseline

Captured July 23, 2026 by `codex/gpt-5`.

This is the pre-Phase 10 production baseline. No production route, component,
financial logic, dependency, or visual token changed during §0. The images
below are viewport captures, not full-page composites.

## Direction record

- Structural base: **Field Journal**
- Field Journal parts retained: editorial market-relative lead,
  observation-plate chapter stack, evidence marginalia, annotated divergence
  ribbon
- Night Orbit parts borrowed: orbital chapter navigation, selected-body
  inspector, static concentric fallback
- Signal Constellation parts borrowed: none

The orbit is the index for the editorial plates. It does not become a second
content model.

## Screenshot index

| Route | 1440×900 | 390×844 | 390px page overflow |
|---|---|---|---|
| `/share` | [desktop](./desktop/share-1440x900.png) | [mobile](./mobile/share-390x844.png) | No |
| `/` | [desktop](./desktop/home-1440x900.png) | [mobile](./mobile/home-390x844.png) | No |
| `/dashboard` | [desktop](./desktop/dashboard-1440x900.png) | [mobile](./mobile/dashboard-390x844.png) | No |
| `/compare` | [desktop](./desktop/compare-1440x900.png) | [mobile](./mobile/compare-390x844.png) | No |
| `/research` | [desktop](./desktop/research-1440x900.png) | [mobile](./mobile/research-390x844.png) | No |
| `/history` | [desktop](./desktop/history-1440x900.png) | [mobile](./mobile/history-390x844.png) | No |
| `/trades` | [desktop](./desktop/trades-1440x900.png) | [mobile](./mobile/trades-390x844.png) | No |

Every mobile measurement returned `documentElement.clientWidth = 390` and
`documentElement.scrollWidth = 390`.

## Visual findings

- `/share` is dominated by the isolated portfolio return and large empty
  paper field. It has no Phase 10 chapter navigation or useful first-viewport
  driver.
- `/` repeats that composition with private total value as the dominant
  object.
- `/dashboard` leads with seven equally weighted metric cards followed by a
  large chart; the hierarchy reads as an analytics wall.
- `/compare` contains compelling data but reveals all four paths, statistics,
  and logs immediately.
- `/research` leads with source status and the complete cross-source table,
  rather than a bounded priority story.
- `/history` leads with three chart blocks without an event narrative.
- `/trades` leads with settings and data entry before decision review.
- The 390px views avoid page-level overflow. Dense research/history/trade
  content is still compressed or internally contained rather than
  reorganized into an intentional mobile story.

## Accessibility baseline

- There is no five-chapter semantic/spatial navigation yet. That is the §1
  starting gap, not a §0 regression.
- `/share`, `/`, and `/dashboard` expose no `h1`.
- `/compare`, `/research`, `/history`, and `/trades` expose a route `h1`.
- Existing deep navigation uses normal links and buttons.
- A public FlipCard received a visible `2px solid` violet focus outline with a
  `2px` offset. Its state is represented by `aria-pressed`.
- The live browser reported `prefers-reduced-motion: no-preference`. Existing
  Phase 9 component tests cover reduced-motion branches; §0 did not emulate a
  reduced-motion browser and makes no live-emulation claim.
- The current browser automation did not reliably synthesize Enter/Space
  activation in this pass. Native button semantics, `aria-pressed`, click
  operation, the passing component suite, and the prior Phase 9 live keyboard
  audit remain the evidence. §1 must perform a fresh keyboard chapter-nav pass.

## Browser and privacy baseline

- Browser console: 0 warnings, 0 errors during the route capture session.
- `/share`: 0 visible dollar patterns.
- Raw `/share` HTML/RSC: 0 strict currency values and 0 comma-formatted
  currency values.
- Raw HTML does contain `$`-prefixed React Server Component reference tokens;
  those are not displayed currency. The strict check prevents that known
  false positive.
- No raw public markers for total value, invested amount, trade reason,
  simulations, or sign-out controls.
- Logged out, `/`, `/dashboard`, `/compare`, `/research`, `/history`, and
  `/trades` all rendered password fields.
- Logged out, `/share` remained public and showed the read-only label.
- Logged out, history and trade CSV exports each returned HTTP 401.

The owner screenshots were captured with a temporary, localhost-only
`OWNER_PASSWORD` process override. The browser signed out before the local
server stopped. No `.env*` contents were read, printed, edited, staged, or
committed.

## Tests, build, bundle, and fonts

- `npm test`: 46 files, 239/239 tests passed.
- `npm run build`: Next.js 16.2.11 compiled successfully, TypeScript passed,
  and all 14 static-page tasks completed.
- The build report lists the application routes as dynamic server-rendered
  routes except the not-found page.
- §0 added no dependency and changed no executable source, so there is no
  bundle delta.
- Current source imports Inter, JetBrains Mono, and Instrument Serif from
  `next/font/google`. The normal build passed, but the source remains
  build-time network-dependent. No offline-build claim is made; the planned
  local-font migration remains §13 work.

## Process baseline

The process audit found no active Claude Code or Codex CLI execution against
the repository. The Claude and Codex desktop applications and idle
browser-control helpers were open, but no competing coding-agent process
changed the worktree.
