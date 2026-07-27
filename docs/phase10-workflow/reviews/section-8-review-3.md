# Phase 10 §8 — Claude Lead review 3 (The Stock Market Universe — `/share` rebuilt)

**Result: FAIL — 3 bounded findings.**

Reviewer: claude-code/sonnet-5 (Claude Lead, `review` stage), July 27, 2026.
Reviewed commit: `333566a46c6a2c5509c27ecf136e6ede25d41624` —
`phase10(§8): remediate shared universe and native textures`.
Diff scope reviewed: `ff005e0...333566a` (one commit, the round-two E1–E5
remediation).
Spec: `docs/phase10-workflow/specs/section-8.md`.
Prior review (PASS, no findings): `docs/phase10-workflow/reviews/section-8-review-2.md`.
Round-two owner feedback this remediation addresses: `PHASE10_STATE.json`
`section.owner_feedback_round_2` (E1–E7), recorded in commit `ff005e0`.
Implementation handoff:
`docs/phase10-handoffs/2026-07-27-section-8-codex-implementation-to-claude-lead-remediate-2.md`.

The `portfolio-ux` skill was applied via the normal `Skill` tool invocation
before this review.

## Why this review required independent live-browser work

The implementation handoff recorded the same environment gap as prior
remediation rounds: Codex's sandbox could not bind `0.0.0.0:3100` (`listen
EPERM`) and the in-app browser runtime returned "No browser is available."
No live criterion was claimed as passed in the handoff. This review built the
production bundle, started a real server (`npm run build && npm run start --
-p 3100`, once with a temporary, unsaved `OWNER_PASSWORD` process override to
test authenticated behavior without ever reading `.env*`), and drove it with
a temporary, unsaved Playwright script (several iterations, all deleted after
use, never committed) to independently verify every item the handoff listed.

## What was verified and passed

### E1 — shared universe implementation

- `src/app/(depth-pull)/page.tsx` and `src/app/(depth-pull)/share/page.tsx`
  both now delegate to one `UniverseRoute({ basePath, searchParams,
  ownerGate })` — `/` passes `ownerGate: true`, `/share` passes no
  `ownerGate` (defaults to public). Live: unauthenticated `/` renders the
  sign-in form; unauthenticated `/share` renders the universe directly.
  `npm run build` confirms both remain dynamic routes (18 routes total).
- **Fixed** (gating mechanism itself; see Finding 1 for a real gap in what
  the shared implementation does once past that gate).

### E2 — native texture resolution

- `scripts/generate-planet-textures.mjs`'s `WIDTH`/`HEIGHT` constants are
  `512`/`256` (previously `112`/`56`, a 95% pixel-loss regression). All 24
  committed KTX2 files were regenerated: live `stat` confirms 24 files,
  3,424,390 bytes total, min 10,519 / max 240,295 bytes — matching the
  handoff's claimed table exactly.
- `PlanetTextures.test.ts` (new) parses every committed `.ktx2` container
  with the real KTX2 reader and asserts decoded `[pixelWidth, pixelHeight]
  === [512, 256]` per file — a genuine per-file regression test, not a
  source-substring check, so a future budget change cannot silently
  re-introduce the pixel-loss defect undetected.
- Live visual: captured the MSFT planet at APPROACH (1440×900, textures
  fully streamed). The surface shows real cloud/continent-style shading and
  gradient detail, a clear, qualitative improvement over a postage-stamp
  blur — no logo or wordmark present.
- **Fixed.**

### E3 — non-occluding labels

- `orrery.module.css`'s `.sceneLabel` lost its opaque background/border box
  (`background: transparent`, `border: 0`) while keeping `min-width:
  44px; min-height: 44px` for the hit target; the visible treatment is now
  unboxed mono text with a text-shadow for legibility.
- Live, 1440×900 OVERVIEW: ticker labels (KYMR, CBRS, MSFT, INTC, IBM, etc.)
  read cleanly with no box occluding the planet bodies beneath them.
- **Fixed.**

### E4 — return-to-OVERVIEW paths (partially — see Finding 3)

- `OrreryScene.tsx`'s canvas click handler now calls
  `callbacksRef.current.onExitOverview()` when a click hits empty space
  (`target` is falsy) and the camera isn't already at `overview`, in
  addition to the pre-existing double-click handler.
- Live-verified from APPROACH (`?planet=MSFT`) and COMMAND
  (`?focus=portfolio`): `Escape` returns to `/share` from both states;
  browser Back after a direct `?planet=MSFT` link returns to `/share`; a
  single empty-space click (away from the HUD) returns to `/share` from
  APPROACH. All four return mechanisms are present and three of the four
  work reliably.
- The fourth — the explicit "Return to overview" control — is present with
  a correct `href` but is **not reliably usable**: see Finding 3.

### E5 — simplified Mission Control

- `orrery.module.css`'s Mission Control rules lost their gradients, extra
  borders, and boxed telemetry tiles; `COMMAND` screenshots (public and
  authenticated-owner) show a clean, telegraphic layout — a large heading,
  one thin divider, a 3-column stat grid, and underlined nav — consistent
  with UNIVERSE_IDEAS.md §9's discipline and the round-two "reduce what
  surrounds the data" instruction.
- Station nav `href`s on both routes now use the route's own `basePath`
  (`/share?...` on `/share`, `/?...` on `/`) rather than a hard-coded
  `/share?...`, confirmed live on both routes.
- **Fixed** (chrome and station-link correctness; see Finding 1 for a
  content-gating gap in the same component tree).

### Re-verified standing gates

- **Criterion 43 (50ms long-task gate):** 1440×900, CPU 2× throttle
  (`Emulation.setCPUThrottlingRate`), `PerformanceObserver('longtask')`,
  5 fresh contexts against `/share`, textures allowed to fully stream
  (3s settle) before measuring. Zero long tasks over 50ms in all 5 runs;
  max observed task duration across all runs was 0ms. The gate holds after
  moving to native-resolution textures.
- **Criteria 19/20 (mobile zero-canvas, zero-overflow):** live at 390×844
  and 320×844 against `/share`: `canvas` count 0 at both widths,
  `scrollWidth − clientWidth === 0` at both widths. Visual inspection
  confirms a genuinely reflowed semantic list carrying every encoded value
  as text.
- **Reduced motion / `?no3d=1`:** both force `canvas` count to 0 at
  1440×900, consistent with `canRenderOrrery`'s existing gate.
- **Console:** zero warnings/errors across every captured context
  (OVERVIEW, APPROACH, COMMAND, both mobile widths).
- `npm test`: 87 files, 469/469 passed.
- `npm run build`: Next.js 16.2.11 (Turbopack), compiled clean, 18 routes.

## Findings

### Finding 1 (severe) — `/share` renders full owner-only content, including exact dollar amounts, when the visiting browser carries a valid owner session

**Criterion violated:** `docs/phase10-workflow/specs/section-8.md` §14 item
47 (Privacy): *"`/share` remains public and read-only with zero dollar
amounts, zero owner-only fields, in HTML/RSC payload/client bundle —
including in any encoded radius, size, direction, speed, or texture
selection. **The existing canary-value tests continue to pass.**"* Also
`PRODUCT_DIRECTION.md`'s Decision hierarchy rank 1 (security/privacy above
every other consideration) and its Non-goal *"No public exposure of total
account dollar value."*

**Evidence:** In a single browser context, authenticated at `/` with a
temporary local-only `OWNER_PASSWORD` override (never `.env*` contents),
then navigated — same context, same cookie — to `/share?focus=portfolio`.
The rendered body text included, among many others: `$24,207.47` (total
value), `$26,692.23` (invested), `$2,484.76` (gain/loss), and dozens of
per-holding cost/value figures, plus the literal string `OWNER
AUTHENTICATED`. This is not a false-positive RSC token match (verified with
a strict `\$[\d,]+(\.\d{2})?` pattern against visible `innerText`, not raw
HTML). The same `authenticated`-gated branch in `UniverseRoute.tsx` also
serves the `trades` station, which pulls raw `supabase.from("trades")` rows
including trade `reason` text — explicitly listed among this project's
never-public fields.

**Root cause:** `src/components/observatory/orrery/UniverseRoute.tsx`'s
`if (portfolioSelected && authenticated)` branch (~line 128) swaps in
`OwnerMissionControlContent` based solely on whether the *visiting browser*
carries a valid session cookie — it never checks `ownerGate` (i.e., never
checks whether the current route is `/`, the only route this section's own
`basePath: "/share"` call intentionally leaves ungated). Because `/share` is
designed to be reachable and shareable by anyone with no login, and because
the owner will realistically visit their own public link from the same
browser/device they use to manage the product, this makes the public/private
boundary contingent on incidental cookie state rather than on the route
itself.

**Why this is not settled by C2's "viewer identity" language or by
`section-8-review-2.md`'s prior pass:** `section-8-review-2.md` examined
this exact live behavior and accepted it as "correctly gated behind a valid
session" (its C2 section). Revisiting it: the owner's C2 instruction reads
*"rendered BY VIEWER IDENTITY: full content when authenticated as owner...
**Reuses the existing mode=public/private pattern. All privacy criteria
remain**."* Before this section, `/share`'s `mode` was hard-coded `"public"`
regardless of any session cookie — the pre-existing pattern C2 says to
*reuse* was route-fixed, not session-toggled, for `/share`. For `/` (which
requires the owner gate to reach at all), "viewer identity" and "route" were
already the same thing — only the owner ever reaches `/`'s Mission Control,
so serving it full content needs no additional route check. C2's own
qualifier, "all privacy criteria remain," is best read as guarding exactly
against the outcome now observed: `/share` must keep behaving as the fully
public, no-login route regardless of what the visiting browser happens to
carry. Per the Decision hierarchy, a UX/identity nuance cannot be used to
weaken the privacy criterion ranked above it, and criterion 47 itself was
never revoked by the round-two feedback — E1 says only that `/` gains the
shared implementation "while preserving its owner sign-in gate," not that
`/share`'s gate-free contract changes.

**Required change:** Scope `UniverseRoute.tsx`'s owner-content branch to
`portfolioSelected && authenticated && ownerGate` (or an equivalent
`basePath === "/"` check), so `/share` never renders
`OwnerMissionControlContent` regardless of session state, for all four
stations (dashboard/history/trades/research). Update
`src/app/(depth-pull)/share/page.test.tsx`'s "renders full owner research
only for an authenticated viewer" test to instead assert `/share` renders
only `PublicMissionControlContent` even when `isValidSession` returns
`true`; add or confirm an equivalent authenticated-content test scoped to
`/` (`src/app/(depth-pull)/page.test.tsx`) so `/`'s legitimate full-content
behavior keeps its own coverage.

### Finding 2 (moderate) — the top-level Orrery header always reads "Public universe / read-only," even on the authenticated, owner-gated `/`

**Criterion violated:** Round-two owner decision E1: *"`/` now shares the
Stock Market Universe implementation with `/share` while preserving its
owner sign-in gate and **identity-aware** private Mission Control."*

**Evidence:** Live, authenticated at `/` (session cookie present, past the
sign-in gate): the page header reads `PUBLIC UNIVERSE / READ-ONLY` — the
identical string rendered on unauthenticated `/share`. Source:
`OrreryWorld.tsx` line 245: `{referenceStudy ? "Owner-gated reference
study" : "Public universe / read-only"}` — `referenceStudy` is only ever
`true` for the unrelated `/dev/phase10-portfolio-orrery` study route;
neither `UniverseRoute.tsx` nor any other caller threads `missionMode`,
`authenticated`, or `basePath` into this text. An authenticated owner on
their own private, gated route is told they're viewing a "public"
experience.

**Required change:** Derive this header string from viewer identity/route
(e.g., from the already-available `missionMode`/`ownerGate`/`basePath`),
so an authenticated owner on `/` sees copy that accurately reflects their
private, gated context, while `/share` (and an unauthenticated `/`, which
never reaches this header at all today) keeps the existing public-safe
text.

### Finding 3 (moderate) — the Systems Manual button overlaps and steals part of the "Return to overview" control's click target in APPROACH

**Criterion violated:** `docs/phase10-workflow/specs/section-8.md` §14 item
3 (Behavioral): *"Camera state is always one gesture ... from OVERVIEW,
from both APPROACH and COMMAND."* Directly undermines round-two finding E4
("no reliable way back to the whole solar system after selecting a
stock... verify and fix Escape, an explicit control, browser Back, and
empty-space click").

**Evidence:** Live, 1440×900, `/share?planet=MSFT`. Measured bounding
boxes: "Return to overview" link `{x: 1190.6, y: 813.4, width: 119.2,
height: 44}`; "? SYSTEMS MANUAL" button `{x: 1261.5, y: 832, width: 142.5,
height: 44}` — they overlap in the region `x: 1261.5–1309.9, y: 832–857.4`.
`document.elementFromPoint()` at that overlap region returns the manual
button, not the link. Clicking there navigates to `?planet=MSFT&manual=1`
(opens the systems manual) instead of returning to OVERVIEW. A screenshot
crop confirms the word "overview" is visually cut off/illegible, rendered
behind the manual button's box. Root cause: `orrery.module.css`'s
`.manualButton` (`position: absolute; bottom: 1.5rem; right: clamp(1rem,
2.5vw, 2.5rem);`) and `.inspector` (`bottom: 1.5rem; right: clamp(1rem,
2.5vw, 2.5rem);`) anchor to the identical bottom-right position; this CSS
was not touched by this remediation round (the collision pre-dates it) but
directly undermines the explicit-control return path this round was tasked
with verifying, and is squarely covered by criterion 3.

**Required change:** Reposition `.manualButton` and/or `.inspector` (e.g.,
move the manual button to a different corner, or reserve enough clearance
so the inspector's footer links never sit under it) so the two 44×44
controls never overlap while the inspector is open at 1440×900. Add
evidence (screenshot or a bounding-box assertion) confirming the "Return to
overview" control's full click target resolves to itself, not to the
manual button.

## Screenshot evidence

`docs/phase10-baseline/section-8/claude-review-3/`:

- `overview-1440x900.png` — OVERVIEW after the first-visit orientation is
  skipped; labels legible, no occlusion, no overlap.
- `approach-msft-1440x900.png` — APPROACH state on MSFT, showing the
  native-resolution texture detail and the inspector panel.
- `BUG-manual-button-overlaps-return-link-crop.png` — cropped/zoomed proof
  of Finding 3: the "? SYSTEMS MANUAL" button's box sits directly over the
  word "overview" in the "Return to overview" link.
- `mission-control-public-1440x900.png` — public COMMAND state, `/share`.
- `mission-control-owner-1440x900.png` — authenticated-owner COMMAND state,
  `/` — full dollar figures correctly shown here, the intended surface.
- `BUG-share-leaks-owner-content-when-authenticated-1440x900.png` — proof
  of Finding 1: `/share?focus=portfolio`, same authenticated browser
  context as the `/` login, showing `OWNER AUTHENTICATED` and exact dollar
  figures on the nominally public, ungated route.
- `mobile-fallback-390x844.png` / `mobile-fallback-320x844.png` — the
  reflowed semantic list, zero canvas, zero overflow.

## Verification commands run independently by this review

- `npm test` — 87 files, 469/469 passed.
- `npm run build` — compiled clean, 18 routes.
- `npm run start -- -p 3100` against a real production build; several
  temporary, unsaved Playwright scripts (deleted after use, never
  committed) drove all live checks above, including one run with a
  temporary local-only `OWNER_PASSWORD` process override.
- `stat -f%z public/textures/planets/*.ktx2` — 24 files, 3,424,390 bytes
  total, matching the handoff's claimed table.
- Manual CDP long-task measurement (`Emulation.setCPUThrottlingRate(2)`,
  `PerformanceObserver('longtask')`, 5 fresh 1440×900 contexts against
  `/share`) — 0 long tasks over 50ms in all 5 runs.

No `.env*` contents were read, printed, edited, staged, or committed. The
temporary owner-session override used a locally chosen throwaway value,
never the real `OWNER_PASSWORD`. No `vercel --prod` was run.
