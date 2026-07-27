# Phase 10 §8 handoff: claude_lead (review) → codex_implementation (remediate)

Prepared July 27, 2026 by `claude-code/sonnet-5`.

## Outcome

Review returned 3 bounded findings.

## What this turn did

Independently reviewed Codex Implementation's §8 round-two remediation
(commit `333566a46c6a2c5509c27ecf136e6ede25d41624`, addressing owner
feedback items E1–E5) against `docs/phase10-workflow/specs/section-8.md`'s
acceptance criteria and the round-two owner-feedback text in
`PHASE10_STATE.json`. Since that turn's sandbox could not bind a local
server, this review built a real production server (`npm run build && npm
run start -- -p 3100`, once with a temporary local-only `OWNER_PASSWORD`
process override, never reading `.env*`) and independently drove it with
several temporary, unsaved Playwright scripts (deleted after use) covering
every item the handoff listed as unverified: arrival surfaces at 1440×900
(public `/share` and authenticated `/`), texture perceptual detail, label
occlusion, all four OVERVIEW return paths from both APPROACH and COMMAND,
Mission Control on both routes including station links and the
public/owner identity split, 390/320px mobile fallback, reduced motion and
`?no3d=1`, console output, and the 50ms long-task gate (5 fresh 1440×900
CPU-2× contexts).

E1 (shared route), E2 (native textures), E3 (non-occluding labels), and E5
(simplified Mission Control) verified cleanly. E4 (return paths) verified
for three of its four required mechanisms; the fourth (the explicit
control) has a real defect — see Finding 3. Independent verification also
surfaced two findings not itemized in E1–E5 but grounded directly in
`section-8.md`'s own still-binding criteria (47 and 3) and
`PRODUCT_DIRECTION.md`'s privacy-first Decision hierarchy — see the review
doc for why these are in scope despite the narrower E1–E5 item list.

1. **Severe.** `/share` renders full owner-only Mission Control content —
   exact dollar amounts, trade reasons — whenever the visiting browser
   carries a valid owner session cookie, because
   `UniverseRoute.tsx`'s owner-content branch checks only `authenticated`,
   never `ownerGate`. Live-reproduced: authenticate at `/`, then in the
   same browser context visit `/share?focus=portfolio` — the response
   includes `OWNER AUTHENTICATED` and dozens of exact dollar figures. This
   is the same live behavior `section-8-review-2.md` examined and accepted
   under a reading of C2 the review doc explains is better read as scoped
   to `/`, not `/share`; see the review doc's full reasoning before
   re-litigating this in remediation.
2. **Moderate.** `OrreryWorld.tsx`'s top header is hardcoded to "Public
   universe / read-only" regardless of viewer identity — an authenticated
   owner on the gated `/` sees the same text as an anonymous `/share`
   visitor, contradicting round-two decision E1's "identity-aware" Mission
   Control requirement.
3. **Moderate.** The "? SYSTEMS MANUAL" button and the holding inspector's
   "Return to overview" link share one CSS bottom-right anchor
   (`orrery.module.css`'s `.manualButton`/`.inspector`) and visually/
   functionally overlap in APPROACH at 1440×900 — `elementFromPoint` at
   the overlap resolves to the manual button, and clicking there opens the
   manual instead of returning to OVERVIEW, undermining E4's explicit-
   control fix.

No other criteria failed. Tests (469/469), build, the native-texture
regression test, the 50ms long-task gate (0 over-budget tasks across 5
fresh contexts), mobile fallback (zero canvas/overflow at 390/320px),
reduced motion, `?no3d=1`, and console output all passed independent live
verification.

## Evidence

- Review commit: this turn's own commit; hash intentionally left for the
  next actor to record under the non-self-referential workflow.
- Review doc: `docs/phase10-workflow/reviews/section-8-review-3.md` (full
  findings, required changes, root-cause file/line citations, and
  everything independently verified as passing).
- Screenshots: `docs/phase10-baseline/section-8/claude-review-3/`
  (including the two `BUG-*` files proving findings 1 and 3 live).
- Tests: `npm test` — PASS, 87 files, 469/469.
- Build: `npm run build` — PASS, Turbopack, 18 routes.
- Long-task gate: 0 tasks over 50ms across 5 fresh 1440×900 CPU-2×
  contexts against `/share`.

## For the next actor

`PHASE10_STATE.json` is `current_section: "§8"`, `stage: "remediate"`,
`role: "codex_implementation"`, `status: "ready"`, `next_actor: "codex"`.
Fix only the 3 bounded findings in `section.findings` /
`docs/phase10-workflow/reviews/section-8-review-3.md` — no other scope
expansion, and do not start E6 (still explicitly lower-priority and
unauthorized for a new public data surface).

For finding 1, verify the fix live in the same authenticated-then-visit-
/share sequence this review used — that is exactly the scenario the
existing unit test suite missed (it tests each route's authenticated state
in isolation, not a session carried across routes). Update
`src/app/(depth-pull)/share/page.test.tsx`'s "renders full owner research
only for an authenticated viewer" test to assert the opposite (public-only
content on `/share` regardless of session), and confirm
`src/app/(depth-pull)/page.test.tsx` still separately covers full content
on authenticated `/`.

For finding 3, verify the "Return to overview" control's full bounding box
resolves to itself (not the manual button) at 1440×900 after the fix — a
bounding-box/`elementFromPoint` check, not only a visual screenshot, since
that is what caught the click-hijacking half of this bug.

Run `npm test` and `npm run build` green before committing, then hand back
to Claude Lead for re-review.
