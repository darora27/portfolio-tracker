# Phase 10 §4 — private `/` owner briefing evidence

Prepared July 24, 2026 by `codex/gpt-5` (implementation).

## Outcome

The authenticated `/` route now renders the private Observatory. Its default
plate answers what changed, why, and what deserves attention before the
existing shell renders the subordinate owner-utility slot with dollars and
private actions.

## Before

The retained §0 authenticated `/` captures document the Phase 9
`SurfaceHeader` / `SurfaceActs` number-first experience that §4 replaces. They
were copied into this section's evidence directory and their dimensions were
re-verified:

- `before/desktop/home-1440x900.png` — 1440×900 — inspected by
  `codex/gpt-5`.
- `before/mobile/home-390x844.png` — 390×844 — inspected by
  `codex/gpt-5`.

Both show total account value as the dominant first fact, followed by the
weekly sentence. They are historical baseline images rather than a
same-turn recapture; the live pre-change recapture could not be made for the
runner limitation below.

## After screenshot and live-browser limitation

The managed Codex runner could not capture the required after screenshots:

- `npm run dev -- --port 3104` failed to bind `0.0.0.0:3104` with `EPERM`.
- Retrying with `--hostname 127.0.0.1` failed to bind
  `127.0.0.1:3104` with `EPERM`.
- The required in-app browser runtime reported no available browser backend
  after its documented availability check.

Per the browser-control contract, Codex did not substitute standalone
Playwright or claim unperformed viewport, console, keyboard, or visual checks.
These exact files remain for Claude Lead to capture during bounded review:

- `after/desktop/home-1440x900.png`
- `after/mobile/home-390x844.png`

The following live-only checks also remain for review: 390px
`scrollWidth === clientWidth`, console warning/error count, visual
subordination of the utility strip, focus visibility and Tab/Enter operation,
and measured 44×44 CSS-pixel targets.

## Implemented evidence

- The default briefing renders `todayLine(...)`, the existing first mover's
  deterministic driver sentence when available, fixed-priority attention
  marginalia, the explicit clear-state fallback, and a real Forces link —
  done by `codex/gpt-5`.
- Attention priority is stale prices, critical concentration, notable mover,
  then up to three date-sorted near-term earnings events. Critical/notice
  meaning is included in visible link text — done by `codex/gpt-5`.
- The utility strip labels total value, total cost, and simple return, then
  links to Dashboard, Trades, Research, and History. It adds no card,
  animation, client directive, or dependency — done by `codex/gpt-5`.
- Forces, Structure, Timeline, and Lab reuse the same component calls and
  narrow prop slices already shipped on `/share` — done by `codex/gpt-5`.
- The unauthenticated source branch is unchanged. Its rendered regression
  shows the existing sign-in form and confirms neither dashboard nor timeline
  data is fetched while logged out — done by `codex/gpt-5`.
- `/share/page.tsx` and all components it imports remain untouched; its
  existing rendered dollar-leak suite passes unchanged — done by
  `codex/gpt-5`.

## Automated verification

- `npm test`: PASS — 61 test files, 357/357 tests — done by
  `codex/gpt-5`.
- `npm run build`: PASS — Next.js 16.2.11 compiled, TypeScript passed, and
  16 static-page tasks generated — done by `codex/gpt-5`.
- `npx tsc --noEmit`: PASS — done by `codex/gpt-5`.
- Targeted ESLint over every changed TypeScript/TSX file: PASS — done by
  `codex/gpt-5`.
- Focused briefing, private route, public route, and Observatory fallback
  suite: PASS — 4 files, 35/35 tests — done by `codex/gpt-5`.
- `git diff --check`: PASS — done by `codex/gpt-5`.
- No package manifest or dependency changed; the new briefing and utility
  components remain server components — done by `codex/gpt-5`.

## Conscious bounded deferral

Forces, Structure, Timeline, and Lab are reused at `/` without new
private-only dollar content in §4. Owner dollars belong only to the utility
slot in this slice. This follows the section spec's explicit scope boundary
and is recorded for Phase 10's final deferred-item report.
