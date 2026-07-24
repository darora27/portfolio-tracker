# Phase 10 §1 — Technical spike and semantic shell

Captured July 23, 2026 by `claude-code/sonnet-5` (Phase 10 Claude Builder).
Refined July 23, 2026 by `claude-code/sonnet-5` (Phase 10 Claude Refiner) to
address the five bounded Codex Critic findings in
`docs/phase10-reviews/2026-07-23-section-1-codex-critic.md`: mislabeled/
incomplete spike evidence, chapter links dropping `mode`/`no3d` query
state, a dead link to the removed R3F route, freshness-label contrast, and
the missing static concentric fallback. The "Screenshot index" and "Mobile
capture" sections below are updated in place to reflect the current,
genuine evidence; a "§1 refiner changes" section at the end of this
document summarizes what changed and why.

## Direction record (confirmed before starting)

- Structural base: **Field Journal**.
- Field Journal parts retained: editorial market-relative lead,
  observation-plate chapter stack, evidence marginalia, annotated
  divergence ribbon.
- Night Orbit parts borrowed: orbital chapter navigation, selected-body
  inspector, static concentric fallback.
- Source: `PHASE10_STATE.json` `selected_direction`, confirmed against
  `PRODUCT_DIRECTION.md` and
  `docs/phase10-design-options/field-journal/README.md` before any file
  was touched.

Pre-work checks: worktree was clean at commit `f25e271` (`phase10(§0):
baseline selected Field Journal orbital hybrid`); a Codex CLI sandbox
process scoped to this repo was found running but confirmed idle by
Devan before proceeding (no worktree changes from it during this
session); no `.env*` contents were read, printed, edited, staged, or
committed at any point.

## What §1 built

### 1. CSS 3D vs. bounded R3F technical spike

Full evidence, measurements, and the recorded decision are in
`docs/phase10-spike-section-1/DECISION.md`. Summary: **CSS 3D**, no
production Three.js/R3F dependency. `/dev/phase10-spike-css` remains in
the tree as the durable evidence artifact (owner-gated, matches the
existing `/dev/surface-scratch` precedent); `/dev/phase10-spike-r3f` and
the `three`/`@react-three/fiber` dependencies were removed after the
decision was recorded.

### 2. Production Observatory shell

- `src/lib/observatory/chapters.ts` — the five chapters (Pulse, Forces,
  Structure, Timeline, Lab), named and ordered per
  `PRODUCT_DIRECTION.md`'s information model.
- `src/components/observatory/ChapterOrbit.tsx` — the orbital chapter nav
  + selected-body inspector. One set of real `<a>`/`next/link` anchors;
  CSS transforms position them into an orbit on wide, motion-ok
  viewports and collapse them into the static concentric fallback (a
  numbered strip) otherwise. No duplicate focus stops.
- `src/components/observatory/ObservatoryShell.tsx` — the shell: one
  `h1`, a freshness slot, a public-only read-only badge, the orbit, the
  active chapter's plate (with a decorative stacked-plate depth cue), and
  a private-only owner slot.
- `src/components/observatory/ChapterFocusManager.tsx` — progressive
  enhancement only: moves focus to the active chapter's heading on
  chapter change (including browser back/forward), skipping the initial
  page-load mount.
- `src/components/observatory/observatory.module.css` — all visual/
  responsive/motion behavior, including the reduced-motion and
  static-fallback rules.
- `src/app/dev/observatory-shell/page.tsx` — owner-gated preview route
  exercising both public and private modes with clearly-labeled
  placeholder freshness/content (no portfolio data — §2/§3 wire real
  `/share` and `/` content into the shell).

The shell is **not yet mounted on `/share` or `/`** — per `PHASE10.md`,
that wiring is §2's job ("Make Pulse the default public chapter"). §1
delivers the reusable shell and proves it end-to-end via the preview
route.

## Screenshot index (updated by the §1 refiner — genuine, dimension-verified)

Every path below was verified with `sips -g pixelWidth -g pixelHeight`
against its filename before being documented; full output is in
`docs/phase10-spike-section-1/DECISION.md`. This replaces the original
builder pass's index, three of whose desktop files were not actually
1440×900 despite their labels, and which had no genuine 390×844/320px
capture (see "§1 refiner changes" below).

| State | Path | Verified size |
|---|---|---|
| Spike — CSS 3D, Pulse selected | `docs/phase10-spike-section-1/desktop/css-3d-1440x900.jpg` | 1440×900 |
| Spike — CSS 3D, forced static fallback | `docs/phase10-spike-section-1/desktop/css-3d-1440x900-no3d-fallback.jpg` | 1440×900 |
| Spike — CSS 3D, organic fallback | `docs/phase10-spike-section-1/mobile/css-3d-390x844-organic-fallback.jpg` | 390×844 |
| Spike — CSS 3D, organic fallback | `docs/phase10-spike-section-1/mobile/css-3d-320x844-organic-fallback.jpg` | 320×844 |
| Spike — R3F, rendering | `docs/phase10-spike-section-1/desktop/r3f-1440x900.jpg` | 1440×900 |
| Spike — R3F, forced WebGL failure | `docs/phase10-spike-section-1/desktop/r3f-1440x900-forced-webgl-failure.jpg` | 1440×900 |
| Spike — R3F, organic fallback | `docs/phase10-spike-section-1/mobile/r3f-390x844-organic-fallback.jpg` | 390×844 |
| Shell — public mode, Pulse | `docs/phase10-baseline/section-1/desktop/observatory-shell-public-1440x900.jpg` | 1440×900 |
| Shell — private mode, Structure, owner slot visible | `docs/phase10-baseline/section-1/desktop/observatory-shell-private-1440x900.jpg` | 1440×900 |
| Shell — forced static concentric fallback | `docs/phase10-baseline/section-1/desktop/observatory-shell-1440x900-no3d-fallback.jpg` | 1440×900 |
| Shell — public mode, Pulse | `docs/phase10-baseline/section-1/mobile/observatory-shell-390x844.jpg` | 390×844 |
| Shell — public mode, Pulse | `docs/phase10-baseline/section-1/mobile/observatory-shell-320x844.jpg` | 320×844 |
| Shell — forced static concentric fallback | `docs/phase10-baseline/section-1/mobile/observatory-shell-390x844-no3d-fallback.jpg` | 390×844 |

All screenshots were captured against a real production build
(`npm run build && npm run start`) after a computed session cookie against
a temporary, localhost-only `OWNER_PASSWORD` process override (never a
value read from `.env*`) — see
`docs/phase10-spike-section-1/DECISION.md`'s "Measurement protocol" for
the full method.

### Mobile capture — resolved by the §1 refiner

The original builder pass's interactive browser-extension automation
enforced a hard minimum window width (~614–991 CSS px) that could not be
resized down to 390 or 320 regardless of the requested target, so no
pixel-exact 390×844 or 320px screenshot existed at that time (recorded
rather than faked). The refiner pass replaced that capture method with
headless Playwright (`page.setViewportSize()`, no resize floor) — every
mobile file in the table above is a genuine capture at its labeled
dimensions:

- `document.documentElement.scrollWidth === clientWidth` (no horizontal
  overflow) was verified at 390×844 and 320×844 for both the shell and
  the CSS spike, and at 390×844 for the R3F spike.
- The forced-fallback (`?no3d=1`) shell capture at 390×844 shows the same
  static concentric map, five real links, and inspector as its 1440×900
  counterpart — the fallback layout is viewport-independent by
  construction (pure CSS), not approximated.
- The shell's own test suite
  (`src/components/observatory/observatory-fallback.test.ts`) still
  independently asserts the reduced-motion/forced-no-3D CSS rules stay
  wired to the identical set of classes, viewport-agnostic.

## Behavioral verification (live, in-browser)

- Chapter links are real anchors with stable, addressable hrefs
  (`?chapter=<id>`) — confirmed via direct navigation to
  `/dev/observatory-shell?chapter=structure` rendering the correct active
  state, and via click-driven navigation updating the URL, the active
  body, the inspector, and the plate content together.
- `next/link` is used (not a plain `<a>`) so chapter switching
  soft-navigates once hydrated — this is what lets
  `ChapterFocusManager`'s focus restoration actually engage, rather than
  every click forcing a full document reload. The link still renders as
  a real, server-rendered `<a href>`, so it remains fully functional with
  JavaScript disabled.
- Public mode (`/dev/observatory-shell`): read-only badge visible, no
  owner slot.
- Private mode (`/dev/observatory-shell?mode=private`): owner slot
  visible, no read-only badge.
- Forced fallback (`?no3d=1`): static numbered strip with all five labels
  visible, matching the mobile/reduced-motion behavior.
- Browser console: 0 errors on every captured state (one pre-existing
  `THREE.Clock` deprecation warning during the R3F spike measurement,
  from the temporary dependency itself — gone once it was removed).

## Accessibility

- Exactly one `h1` per shell instance, naming the product
  ("Portfolio Observatory") — addresses the §0 baseline finding that
  `/share`, `/`, and `/dashboard` had none. (Wiring this `h1` into those
  routes is §2/§4's job; §1 proves the shell itself carries one.)
- The orbit and its fallback are the *same* semantic `<nav>` with one
  real link per chapter — never a duplicate focus/control set between
  the "3D" and "flat" states, and never between the CSS 3D and (now
  removed) R3F spikes' semantic layers.
- `aria-current="page"` marks the active chapter on its link — state is
  conveyed by more than color.
- The active chapter's heading (`h2`, `tabIndex={-1}`) is a real focus
  target with a visible `:focus-visible` outline.
- Reduced motion and the mobile/no-3D fallback are pure CSS — verified in
  `observatory-fallback.test.ts` — so they cannot regress independently
  of each other, and neither depends on JavaScript running.
- The decorative plate-stack depth cue and the orbit's positioning
  transforms carry no essential information on their own; every chapter
  destination and its content is available identically in the flat
  fallback state.

## Tests

- `npm test`: **53 test files, 291/291 tests passed** (was 51 files / 278
  tests at the original builder commit; +2 files / +13 tests from the
  refiner pass: `page.test.ts` for the spike-css dead-link regression and
  `observatory-contrast.test.ts` for the freshness-label contrast
  regression, plus new cases added to `chapters.test.ts`,
  `ChapterOrbit.test.tsx`, and `observatory-fallback.test.ts` for query
  preservation and the concentric-map fallback).
- Coverage matches the §1 acceptance list: URL state (chapter resolution,
  href construction, active-content selection, invalid-slug fallback,
  query-param preservation across chapter navigation), keyboard controls
  (real anchors, no `tabindex` override), reduced motion / no-3D fallback
  (CSS-source invariant test, since jsdom doesn't evaluate real `@media`
  rules, including the concentric map's display toggle), public/private
  shell modes (read-only badge, owner slot presence/absence, defensive
  check that public mode never renders owner content even if passed one),
  and the freshness-label contrast ratio computed from source tokens.

## Build

- `npm run build`: Next.js 16.2.11 production build compiled
  successfully, TypeScript passed, 16 route tasks generated (was 14 at
  §0 — `/dev/observatory-shell` and `/dev/phase10-spike-css` are new;
  `/dev/phase10-spike-r3f` was added and then removed both in the
  original builder pass and again in the refiner pass, so it is not in
  the final route list).
- `three`, `@react-three/fiber`, `@types/three`, and (the refiner pass's
  temporary measurement tool) `playwright` are absent from
  `package.json`, `package-lock.json`, and `node_modules` at the final
  commit — confirmed by direct inspection and `git diff --quiet`, not
  just by the build passing.
- Source still imports Inter, JetBrains Mono, and Instrument Serif from
  `next/font/google` — unchanged from §0; the local-font migration
  remains §13 work, not silently absorbed here.

## Privacy

- `/dev/observatory-shell` and `/dev/phase10-spike-css` are owner-gated
  by default (same `OWNER_PASSWORD`/session-cookie check as every other
  new Phase 10 route) — confirmed both render the sign-in form with zero
  authentication cookie present.
- No dollar-currency pattern (`$<digits>.<digits>`) appears in either
  route's unauthenticated HTML (there is none to leak — the shell holds
  no portfolio data of its own; the preview route's placeholder content
  and freshness value are clearly-labeled non-financial strings).
- The shell's public/private mode is enforced by a plain prop condition
  (`mode === "private"`) with a passing regression test asserting the
  owner slot is never rendered in public mode even when one is supplied
  — the shell cannot cross-render owner content by construction.
- The refiner pass's added `preservedQuery` mechanism (see "§1 refiner
  changes" below) only ever echoes back query keys the caller explicitly
  names (`mode`, `no3d` on the preview route) — it cannot be used to
  smuggle arbitrary/unvetted query state into a link, and it carries no
  portfolio data of its own, same as the rest of the shell.

## §1 refiner changes (this pass)

Addressed exactly the five bounded Codex Critic findings; no other
behavior was changed, per the refiner handoff. See
`docs/phase10-reviews/2026-07-23-section-1-codex-critic.md` for the
original findings and `docs/phase10-spike-section-1/DECISION.md` for the
recreated spike measurements.

1. **Spike evidence (engineering reliability).** Recreated the R3F spike
   and its temporary dependencies, measured load time, long tasks, frame
   stability, memory, and interaction latency with headless Playwright,
   and recaptured every desktop/mobile screenshot at genuine, `sips`
   -verified 1440×900/390×844/320×844 dimensions. Along the way, found
   and fixed a real default-pointer-events-capture bug in the recreated
   R3F spike (see `DECISION.md`). R3F and Playwright were removed again
   before this commit; `git diff --quiet package.json package-lock.json`
   confirms no residual trace.
2. **Chapter-link query state (usefulness).**
   `observatoryChapterHref()` (`src/lib/observatory/chapters.ts`) now
   accepts an optional `preservedQuery` map and merges it into the built
   URL before setting `chapter`; `ChapterOrbit` and `ObservatoryShell`
   thread it through as a new optional prop. The `/dev/observatory-shell`
   preview route passes its own `mode`/`no3d` search params through as
   `preservedQuery`, so navigating chapters no longer silently drops
   `mode=private` or `no3d=1`. Existing callers that don't pass
   `preservedQuery` are unaffected (hrefs are unchanged).
3. **Dead R3F link (usefulness).** The retained
   `/dev/phase10-spike-css` page no longer links to the removed
   `/dev/phase10-spike-r3f` route; it now names the path as historical,
   non-interactive text and points to `DECISION.md` for the retained
   evidence. A source-level regression test
   (`src/app/dev/phase10-spike-css/page.test.ts`) asserts no `href` to
   the removed route exists.
4. **Freshness-label contrast (accessibility/mobile).**
   `--obs-ink-faint` in `observatory.module.css` changed from `#726d63`
   (3.82:1 against the shell background, measured by the critic) to
   `#847e73` (4.88:1, computed via the standard WCAG relative-luminance
   formula). A regression test
   (`observatory-contrast.test.ts`) computes the ratio from the source
   tokens directly so a future color edit can't silently regress below
   4.5:1 again.
5. **Static concentric fallback (product alignment).** Added a
   decorative, `aria-hidden` concentric-rings map
   (`.concentricMap`/`.concentricRing`/`.concentricCenter` in
   `observatory.module.css`, rendered by `ChapterOrbit.tsx`) that appears
   only in the fallback layout (narrow viewport, reduced motion, or
   forced no-3D) and highlights the active chapter's ring. It is
   additive only: the five real chapter links remain the only controls,
   reading order and 44px targets are unchanged, and there are no
   duplicate focus stops (verified by
   `ChapterOrbit.test.tsx`'s assertion that the map contains zero
   focusable elements).

Test count went from 278/278 (51 files) to 291/291 (53 files). Production
build remains green at 16 routes. No `.env*` access, no deploy, and the
shell remains unwired from `/share` and `/` (§2/§4 work, unchanged).
