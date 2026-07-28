# Phase 10 §8 — Claude Lead review 4 (The Stock Market Universe — `/share` rebuilt)

**Result: PASS — no findings.**

Reviewer: claude-code/sonnet-5 (Claude Lead, `review` stage), July 28, 2026.
Reviewed commit: `c2485af680b65ec6e1faa27082075e71075265fa` —
`phase10(§8): remediate privacy identity and control overlap`.
Diff scope reviewed: `15bb49d...c2485af` (one commit, remediating review 3's
three bounded findings).
Spec: `docs/phase10-workflow/specs/section-8.md`.
Prior review (FAIL, 3 findings): `docs/phase10-workflow/reviews/section-8-review-3.md`.
Implementation handoff:
`docs/phase10-handoffs/2026-07-28-section-8-codex-implementation-remediate-to-claude-lead.md`.

The `portfolio-ux` skill was applied via the normal `Skill` tool invocation
before this review.

This is a bounded re-review: only review 3's three findings are in scope,
per `docs/PHASE10_AGENT_WORKFLOW.md` §4. No new criteria were introduced.

## Why this review required independent live-browser work

The implementation handoff recorded the same environment gap as prior
remediation rounds: Codex's sandbox could not bind `0.0.0.0:3100` or
`127.0.0.1:3100` (`listen EPERM` both times). No live criterion was claimed
as passed by that turn; the handoff explicitly named the three checks Claude
Lead needed to perform independently. This review built the production
bundle, started a real server (`npm run build && npm run start -- -p 3100`,
with a temporary, unsaved `OWNER_PASSWORD` process override — never reading,
printing, editing, or committing any `.env*` file), and drove it with a
temporary, unsaved Playwright script (several iterations, all deleted after
use, never committed) to independently verify all three findings.

## What was verified and passed

### Finding 1 (severe, review 3) — `/share` leaking full owner-only Mission Control content to an authenticated browser

**Source fix confirmed:** `UniverseRoute.tsx`'s owner-content branch now reads
`if (portfolioSelected && authenticated && ownerGate)` (was: `authenticated`
alone). `ownerGate` is `true` only for `/` (`src/app/(depth-pull)/page.tsx`
passes `ownerGate: true`); `/share`'s page never passes it, so it defaults to
`false`. `missionMode` is likewise now `authenticated && ownerGate ? "private" : "public"`.

**Live evidence:** in one browser context (one cookie jar): authenticated via
`POST /api/auth/login` with a temporary, unsaved, process-only
`OWNER_PASSWORD` (confirmed a real `owner_session` cookie was set), then:

- `/` with the same cookie: `data-mode="private"` present, "Owner research
  station" present, full owner Mission Control content rendered — the
  legitimate authenticated-owner path still works.
- `/share?focus=portfolio&station=research` with the **same** cookie:
  `data-mode="public"` (not `"private"`), no "Owner research station", no
  `OWNER_RESEARCH_HEADLINE`-class owner marker, no `"owner authenticated"`
  string, **zero matches** for a strict `\$\d[\d,]*\.\d{2}\b` currency
  pattern anywhere in rendered HTML.
- Repeated for `station=trades`, `station=history`, `station=dashboard` on
  `/share` with the same authenticated cookie: every station shows
  `data-mode="private"` absent and zero currency-pattern matches.
- Plain `/share` (no query) with the same cookie: zero currency-pattern
  matches.

The privacy leak does not reproduce under any Mission Control station.
**Fixed.**

### Finding 2 (moderate, review 3) — Orrery header always read "Public universe / read-only," even on the authenticated, owner-gated `/`

**Source fix confirmed:** `OrreryWorld.tsx`'s header text now branches on
`missionMode === "private"` (in addition to the pre-existing `referenceStudy`
branch), rendering "Private universe / owner access" — not only
`referenceStudy`-gated text as before.

**Live evidence:** authenticated `/` (real session cookie, confirmed above)
renders the literal string "Private universe / owner access" and does **not**
render "Public universe / read-only" anywhere in the page. `/share`, visited
in the same authenticated context, renders "Public universe / read-only" and
never "Private universe / owner access." **Fixed.**

### Finding 3 (moderate, review 3) — Systems Manual button overlapping and stealing clicks from the inspector's "Return to overview" control

**Source fix confirmed:** `orrery.module.css`'s `.manualButton` moved from
`bottom: 1.5rem` (shared with `.inspector`'s anchor) to `top: 6.5rem`;
`.inspector` remains `bottom: 1.5rem`. The two controls now anchor to
opposite edges of the viewport and cannot share vertical space regardless of
content length.

**Live evidence, 1440×900, `/share?planet=MSFT`** (the exact case named in
review 3 and in the implementation handoff), after dismissing the
first-visit orientation overlay with `Escape`:

- "? SYSTEMS MANUAL" button bounding box: `{top: 104, bottom: 148, left:
  1261.5, right: 1404}`.
- "Return to overview" link bounding box: `{top: 813.4, bottom: 857.4, left:
  1190.6, right: 1309.9}` — vertically separated by 665px from the manual
  button; no geometric overlap.
- Sampled `document.elementFromPoint()` at all four corners plus the center
  of each control's bounding box (10 points total): every sample on the
  manual button's box resolves to the manual button or its child `<span>`;
  every sample on the "Return to overview" box resolves to the link itself.
  Full-target confirmation, not a center-point spot check.
- Screenshot evidence (`claude-review-4/approach-msft-1440x900.png`,
  `approach-asml-1440x900.png`) shows the manual button top-right, fully
  clear of the inspector panel bottom-right, "Return to overview" fully
  legible.
- Zero console warnings/errors during the flow.

**Fixed.**

## Re-verified standing gates

- `npm test`: 87 files, 470/470 passed (independently re-run).
- `npm run build`: Next.js 16.2.11 (Turbopack), compiled clean, TypeScript
  passed, 18 route-generation tasks (independently re-run).
- Source-level regression tests confirm the fix shape directly:
  `MissionControlContent.source.test.ts` now asserts the
  `authenticated && ownerGate` branch text exists; `OrreryWorld.test.tsx`
  (`/dev/phase10-portfolio-orrery`) asserts `.manualButton` contains
  `top: 6.5rem` and no `bottom:`, and `.inspector` retains `bottom: 1.5rem`;
  `page.test.tsx` (private `/`) now asserts "Private universe / owner
  access" and asserts-not "Public universe / read-only"; `share/page.test.tsx`
  flips its authenticated-viewer test to assert public-only content, no
  owner canaries, no currency pattern, and `getResearchData` not called.
- No unrelated source change: `git diff --stat 15bb49d c2485af` touches only
  `UniverseRoute.tsx`, `OrreryWorld.tsx`, `orrery.module.css`, their tests,
  and `PHASE10_STATE.json`/handoff bookkeeping — no E6 work, no scope creep.

## Screenshot evidence

`docs/phase10-baseline/section-8/claude-review-4/`:

- `approach-msft-1440x900.png` — APPROACH state on MSFT (the exact case
  named in review 3's Finding 3), confirming the manual button and inspector
  no longer overlap and "Return to overview" is fully legible.
- `approach-asml-1440x900.png` — same confirmation on a second planet
  (ASML), captured first during this review before repeating on MSFT
  specifically.

## Verification commands run independently by this review

- `npm test` — 87 files, 470/470 passed.
- `npm run build` — compiled clean, 18 routes.
- `npm run start -- -p 3100` (`PORT=3100 OWNER_PASSWORD=<temporary
  process-only value> npm run start`) against a real production build;
  several temporary, unsaved Playwright scripts (deleted after use, never
  committed) drove all live checks above.
- `document.elementFromPoint()` sampled at 10 points (4 corners + center of
  each control) across both the manual button and the "Return to overview"
  link at `/share?planet=MSFT`, 1440×900.

No `.env*` contents were read, printed, edited, staged, or committed. The
temporary owner-session override used a locally chosen throwaway value,
never the real `OWNER_PASSWORD`. No `vercel --prod` was run. The temporary
production server (port 3100) was confirmed stopped (`lsof -ti :3100`
returned empty) before this review's final commit.
