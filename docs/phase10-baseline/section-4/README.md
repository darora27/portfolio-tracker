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

## After screenshots

The managed Codex runner could not capture the required after screenshots
(`npm run dev -- --port 3104` and a `127.0.0.1:3104` retry both failed to bind
with `EPERM`; the in-app browser runtime reported no available backend). Per
the browser-control contract, Codex did not substitute standalone Playwright
or claim unperformed checks, and handed the remaining live evidence to Claude
Lead's `review` stage.

Claude Lead captured the required pair during review, July 24, 2026, against a
real `next start` production server (temporary `playwright@1.61.1` installed
via `npm install --no-save`, confirmed absent from `package.json`/
`package-lock.json` before and after, and uninstalled again before this
commit):

- `after/desktop/home-1440x900.png` — 1440×900, authenticated, chapter
  `pulse` (default) — `BriefingChapter` leads with "Down 2.1% today.", the
  driver sentence, four "Notice:" attention items, and the Forces
  continuation; `OwnerUtilityStrip` renders below in small muted type with no
  card/border box.
- `after/mobile/home-390x844.png` — 390×844, same authenticated view;
  `document.documentElement.scrollWidth === clientWidth` (390 === 390, no
  horizontal overflow).

### Live checks performed during review

- **Logged-out `/`:** HTTP 200, password field present, zero occurrences of
  `Portfolio Observatory` or a `$<digits>.<digits>` pattern in the rendered
  HTML — confirms owner gating and zero dollar leakage on the unauthenticated
  branch.
- **Authenticated `/`:** exactly one `<h1>`; `"Owner briefing"` appears before
  `"Total value"` in document order.
- **Target sizes:** every `OwnerUtilityStrip` action link and every
  attention-item link measured exactly 44px tall (245–579px wide on desktop,
  324–332px wide on mobile) at both viewports — all meet the 44×44 CSS-pixel
  minimum.
- **Visual subordination:** computed font size of the chapter lead is 36px
  versus 12.16px for an `OwnerUtilityStrip` stat value — confirms the utility
  strip is subordinate by type scale, not merely DOM order.
- **Keyboard/focus:** Tab reaches an anchor first; tabbing to an attention-item
  link shows a visible `outline: solid 2px` (the shell's existing
  focus-visible pattern, unmodified by this section).
- **Console:** zero warning/error/pageerror messages captured across the
  logged-out load and the authenticated desktop/mobile renders.
- **Mobile layout order (full-page capture, not committed):** briefing plate,
  concentric orbit fallback, five-chapter nav list, then `OwnerUtilityStrip`
  at the bottom — confirms the utility strip does not crowd chapter
  navigation on narrow viewports.

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
