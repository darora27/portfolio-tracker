# Phase 10 §7 handoff: Claude Lead → Codex Implementation, Turn C

Prepared July 26, 2026 by `claude-code/sonnet-5`.

## Outcome

Review passed, no findings. Both blocking/bounded findings from
`section-7-review-2.md` are independently confirmed resolved in
`docs/phase10-workflow/reviews/section-7-review-3.md`. Per §0's Turn B′
subsection, this does **not** transition to `accept` (no production
Observatory file has been touched yet) — it routes to **Turn C: Codex
production implementation**, wiring the now-passing
`/dev/phase10-portfolio-orrery` build into production `/share`.

## What this turn did

Independently re-ran every live check the Turn B″ handoff could not perform
(its sandbox denied `next start` localhost binding):

- Started a real production server locally with a task-only `OWNER_PASSWORD`
  override; stopped it cleanly at the end.
- Reran the unchanged §2.3.2 desktop procedure (1440×900, CPU 2×, 5 fresh
  contexts): the R3F route-owned long task is **0/5 runs over 50 ms** —
  identical to baseline and CSS. Finding 1 is resolved; the owner's stop
  condition never triggered, so no exception/threshold change/Devan
  escalation is needed.
- Reran the unchanged §2.3.1 mobile-fallback procedure: zero added long
  tasks, zero R3F chunk requests below 1024px, zero dropped frames.
- Captured all eight fresh §R.11 evidence items and inspected them directly:
  a real in-canvas star field, Fresnel rim lighting on planets and the sun,
  layered additive sun glow, and seeded per-planet procedural variation are
  all genuinely present. Finding 2 is resolved.
- Independently reconfirmed criteria 35–40, 42, 43, the §R.9 fallbacks
  (canvas absent under `?no3d=1`/reduced-motion, present normally; zero
  mobile overflow/canvas/sub-44px targets at 390px and 320px), §R.10a (no
  name-collision touch), zero console/page errors across five
  route/viewport/mode combinations, and zero dollar-pattern leaks on both
  the sun-selected and holding-selected views.
- Independently inspected `.next/static/chunks/*.js` after my own
  `npm run build`: no chunk contains an `@react-three/fiber`/`extend(THREE)`
  signature; the shared heavy chunk gzips to 133,633 bytes, matching the
  claimed 134,184-byte reduction.
- `npm test`: 81 files, 448/448 passed (identical count to Codex's report).
- Wrote `docs/phase10-workflow/reviews/section-7-review-3.md` with full
  evidence and reasoning.
- Updated `PHASE10_STATE.json`: both findings marked `resolved`,
  `review_result` → `pass`, `remediation_commits` placeholder resolved to
  `5f89a9bbdb7e7fbded6432af9c0adac136c8bda4`, `stage` → `implement`, `role`
  → `codex_implementation`, `next_actor` → `codex`.

No `src/` file was touched this turn — only `docs/` evidence/tooling and
this state file, matching every prior review-only commit in this section.

## Evidence

- Reviewed commit: `5f89a9bbdb7e7fbded6432af9c0adac136c8bda4` — `phase10(§7): remediate runtime chunk and Orrery visual system`
- Tests: 81 files, 448/448 passed
- Build: Next.js 16.2.11 compiled, TypeScript passed, 19 static-page tasks generated
- Fresh desktop long-task raw: `docs/phase10-spike-section-7/raw/desktop-scene-turn-bdoubleprime.json`
- Fresh mobile-fallback raw: `docs/phase10-spike-section-7/raw/mobile-fallback-turn-bdoubleprime.json`
- Fresh §R.11 screenshots/filmstrips: `docs/phase10-baseline/section-7/{screenshots,filmstrips}/*-turn-bdoubleprime*`
- Review doc: `docs/phase10-workflow/reviews/section-7-review-3.md`

## For the next actor (Turn C — Codex, `stage: implement`)

Per `docs/phase10-workflow/specs/section-7.md` §0's Turn C subsection, adapted
to §R's Portfolio Orrery target (§R supersedes §5's original five-chapter
`SpatialScene` plan wherever they conflict):

1. **Do not rebuild or re-decide anything.** The selected/authorized runtime
   is **direct Three (bounded, no reconciler)** — not `@react-three/fiber`.
   This is a deviation from §9's original file plan (written before Turn
   B″'s owner-authorized pivot away from the R3F reconciler), and it is the
   correct one: `grep -rln "@react-three/fiber" src/` returns nothing —
   zero production source imports it anymore. **Only `three` (and
   `@types/three` for TypeScript) need to become real `package.json`
   dependencies; do not add `@react-three/fiber`.** It may remain absent
   from `package.json` entirely — it is currently only a leftover
   `--no-save` `node_modules` install with no source importer, and adding
   it back to the manifest would reintroduce exactly the chunk weight Turn
   B″ removed for no functional benefit.
2. Run `npm install three@0.185.1 @types/three@0.185.1` for real (drop
   `--no-save`) and confirm `git diff package.json package-lock.json` shows
   the expected addition, per §2.5/§R.9's "if R3F was selected, Turn C
   keeps it installed for Phase B" instruction — applied here to the actual
   dependency that ships (`three`), not to `@react-three/fiber`, which was
   never selected as the shipping mechanism after Turn B″'s pivot.
3. Wire the now-passing `/dev/phase10-portfolio-orrery` implementation into
   production `/share`, replacing `/share`'s current entry with the
   full-viewport Orrery per §R.1–§R.9 and `PRODUCT_DIRECTION.md`'s "The
   Portfolio Orrery" section: the sun opens the portfolio-level summary
   (reusing the accepted Pulse/Forces/Structure chapter content, not
   rebuilding it — §R.2), planets are the same `publicOrreryHoldings`
   projection already proven at the dev route, the same encodings/legend/
   inspector/fallbacks/privacy boundaries carry over unchanged. The base
   document's §5.4 `ObservatoryShell.tsx` mounting instructions describe
   the general mounting pattern (entrance sequence, camera/parallax layer,
   scene layer inside `.stage`) — adapt them to mount the Orrery instead of
   the original chapter-body `SpatialScene`, preserving `ObservatoryShell`'s
   existing `chapterContent`, `ownerSlot`, `freshness`, and URL/focus
   contracts exactly as §3.1 requires.
4. Preserve every fallback and privacy contract already proven at
   `/dev/phase10-portfolio-orrery` (mobile static/list, reduced-motion
   freeze, no-WebGL CSS fallback, keyboard/screen-reader synchronized
   holding list and inspector, no owner-only data reaching `/share`).
5. Run `npm test` and `npm run build`; both green before committing. Attempt
   every live browser check yourself first; if this environment again denies
   `next start` localhost binding, document the exact gap plainly (per the
   standing environment-only evidence rule) rather than claiming an
   unperformed check, commit, and transition normally to Claude `review`
   — Claude Lead will perform the missing live checks before PASS, exactly
   as this turn and the two before it did.
6. This is a genuine Turn D-bound review once you commit: the next Claude
   review must independently verify **all thirty-four base criteria plus
   §R's criteria 35–43** (49 total), not only the §R subset Turn B/B′/B″
   reviews checked — because this is the first commit touching a production
   Observatory file (`/share`, `ObservatoryShell.tsx`, or equivalent) in this
   section. Transition state exactly as the standing
   `codex-implementation.md` prompt's `implement` stage instructs (`stage`
   → `review`, `role` → `claude_lead`, `next_actor` → `claude`).
7. Commit as `phase10(§7): wire Portfolio Orrery into production /share
   (Turn C)`.
