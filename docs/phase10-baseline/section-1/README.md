# Phase 10 §1 — Technical spike and semantic shell

Captured July 23, 2026 by `claude-code/sonnet-5` (Phase 10 Claude Builder).

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

## Screenshot index

| State | Path |
|---|---|
| Spike — CSS 3D, Pulse selected (1440×900) | `docs/phase10-spike-section-1/desktop/css-3d-1440x900.jpg` |
| Spike — CSS 3D, forced static fallback (1440×900) | `docs/phase10-spike-section-1/desktop/css-3d-1440x900-no3d-fallback.jpg` |
| Spike — CSS 3D, organic fallback at 614×667 | `docs/phase10-spike-section-1/mobile/css-3d-614x667-organic-fallback.jpg` |
| Spike — R3F, rendering (1440×900) | `docs/phase10-spike-section-1/desktop/r3f-1440x900.jpg` |
| Spike — R3F, forced WebGL failure (1440×900) | `docs/phase10-spike-section-1/desktop/r3f-1440x900-forced-webgl-failure.jpg` |
| Shell — public mode, Pulse (1440×900) | `docs/phase10-baseline/section-1/desktop/observatory-shell-public-1440x900.jpg` |
| Shell — private mode, Structure, owner slot visible (1440×900) | `docs/phase10-baseline/section-1/desktop/observatory-shell-private-1440x900.jpg` |
| Shell — forced static fallback (1440×900) | `docs/phase10-baseline/section-1/desktop/observatory-shell-1440x900-no3d-fallback.jpg` |
| Shell — organic fallback at 614×667 | `docs/phase10-baseline/section-1/mobile/observatory-shell-614x667-organic-fallback.jpg` |

All screenshots were captured after a real sign-in against a temporary,
localhost-only `OWNER_PASSWORD` process override (never a value read from
`.env*`), matching the §0 precedent.

### Mobile capture limitation (390×844 / 320px)

This session's browser automation environment enforces a hard minimum
window width (~614–991 CSS px depending on tab) that could not be resized
down to 390 or 320 regardless of the requested target. In its place:

- The 614×667 capture exercises the exact same `max-width: 767px` CSS
  rule a 390px or 320px viewport would hit — there is no separate
  breakpoint between 320 and 767, so this is the real code path, not an
  approximation of a different one.
- The forced-fallback (`?no3d=1`) screenshots show the identical fallback
  markup independent of viewport width.
- `document.documentElement.scrollWidth` was verified equal to
  `clientWidth` (no horizontal overflow) at the narrow width that was
  reachable.
- The shell's own test suite
  (`src/components/observatory/observatory-fallback.test.ts`) asserts the
  reduced-motion and forced-no-3D CSS rules stay wired to the identical
  set of classes, independent of any live viewport.

No claim is made of a live 390px or 320px screenshot; this limitation is
recorded rather than worked around with a fabricated capture.

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

- `npm test`: **51 test files, 278/278 tests passed** (was 46 files /
  239 tests at the §0 baseline; +5 files / +39 tests for this section:
  `chapters.test.ts`, `ChapterOrbit.test.tsx`, `ObservatoryShell.test.tsx`,
  `ChapterFocusManager.test.tsx`, `observatory-fallback.test.ts`).
- Coverage matches the §1 acceptance list: URL state (chapter resolution,
  href construction, active-content selection, invalid-slug fallback),
  keyboard controls (real anchors, no `tabindex` override), reduced
  motion / no-3D fallback (CSS-source invariant test, since jsdom doesn't
  evaluate real `@media` rules), and public/private shell modes
  (read-only badge, owner slot presence/absence, defensive check that
  public mode never renders owner content even if passed one).

## Build

- `npm run build`: Next.js 16.2.11 production build compiled
  successfully, TypeScript passed, 16 route tasks generated (was 14 at
  §0 — `/dev/observatory-shell` and `/dev/phase10-spike-css` are new;
  `/dev/phase10-spike-r3f` was added and then removed within this
  section, so it is not in the final route list).
- `three`, `@react-three/fiber`, and `@types/three` are absent from
  `package.json`, `package-lock.json`, and `node_modules` at the final
  commit — confirmed by direct inspection, not just by the build passing.
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
