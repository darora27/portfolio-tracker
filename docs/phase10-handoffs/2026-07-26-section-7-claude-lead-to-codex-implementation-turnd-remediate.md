# Phase 10 §7 handoff: Claude Lead (Turn D) → Codex Implementation, remediate

Prepared July 26, 2026 by `claude-code/sonnet-5`.

## Outcome

Review returned 3 bounded findings — remediate, then return for another
Turn-D-equivalent review.

## What this turn did

This was Turn D: the genuine final-acceptance review of §7 as a whole,
independently verifying all 43 acceptance criteria (§8's 34 plus §R.12's 9)
against the shipped production build. Unlike Codex's Turn C sandbox
(`listen EPERM` on `localhost`), this machine could run a real production
server, so every live/browser criterion was performed directly — including
building a second, real pre-Turn-C baseline server from a git worktree at
`prev_actor_commit` (`799a124`) for honest "added over baseline" comparisons,
and capturing the production screenshots/filmstrips Turn C's sandbox could
not produce.

40 of 43 criteria independently verified passing (full detail in the review
doc). 3 bounded findings, each reproduced live and root-caused, not merely
asserted:

1. **Finding 1 (criterion 16):** `ObservatoryEntrance`'s focus-restoration to
   the sun never actually fires on any of its three end paths (Skip-button
   click, keydown, natural timeout) — focus lands on `<body>` every time.
   Root-caused by direct event tracing: the `window`-level `pointerdown`
   listener that ends the entrance evaluates
   `overlayRef.current?.contains(document.activeElement)` *before* the
   browser applies its own focus-on-click default action, so the check is
   always false.
2. **Finding 2 (criterion 30 / §2.3.1):** the mobile-fallback load time on
   the unchanged Moto G4/CPU4x/Slow4G rig shows a reproducible **+506ms
   (+18.8%)** regression vs. a real rebuilt pre-Turn-C `/share` baseline —
   both still under the 5000ms absolute ceiling, but the table's explicit
   "no regression" clause is unmet.
3. **Finding 3 (criterion 20):** no computed contrast-ratio regression test
   covers this section's new text colors (`observatory-entrance.module.css`,
   `orrery.module.css`). I independently computed both new entrance colors
   pass 4.5:1 by a wide margin (~17.6:1, ~14.4:1) — this is a missing-test
   gap, not a numeric failure.

No implementation source was changed this turn (review-only), consistent
with every prior review-stage commit in this section. New retained
tooling/evidence only, all under `docs/phase10-spike-section-7/` and
`docs/phase10-baseline/section-7/`.

## Evidence

- Commit: (this turn's commit, following this handoff) —
  `phase10(review §7): fail with 3 bounded findings (Turn D)`
- Tests: `npm test` — 82 files, 454/454 passed (rerun independently)
- Build: `npm run build` — Next.js 16.2.11 compiled, TypeScript passed, 19
  static-page tasks generated (rerun independently)
- Screenshots: `docs/phase10-baseline/section-7/screenshots/share-turn-d/`
  (11 stills, including a genuine pre-Turn-C "before" still) and four new
  filmstrip sets under `docs/phase10-baseline/section-7/filmstrips/share-turn-d-*/`
- Raw measurement data: `docs/phase10-spike-section-7/raw/share-turn-d.json`,
  `docs/phase10-spike-section-7/raw/turn-d-functional-check.json`
- Retained tooling: `docs/phase10-spike-section-7/measure-share-turn-d.mjs`,
  `turn-d-functional-check.mjs`, `turn-d-parallax-recheck.mjs`,
  `capture-share-turn-d.mjs`
- Review doc: `docs/phase10-workflow/reviews/section-7-review-4.md`

## For the next actor

`PHASE10_STATE.json` is at `stage: remediate`, `role: codex_implementation`,
`next_actor: codex`. Fix exactly the three findings in `section.findings`
(ids 3, 4, 5 — ids 1-2 are historical, already resolved) and the same three
findings detailed in `docs/phase10-workflow/reviews/section-7-review-4.md`.
Do not re-litigate anything under that review doc's "What already passes"
section — those 40 criteria are independently confirmed and out of scope
for this remediation round.

Specifically:

1. Fix `ObservatoryEntrance.tsx`'s focus-restoration race (see Finding 1's
   full root-cause trace in the review doc) so focus reliably reaches
   `[data-portfolio-sun]` after any end trigger. Add a
   `document.activeElement` assertion to `ObservatoryEntrance.test.tsx` for
   the button-activation path.
2. Investigate the mobile-fallback load-time regression (Finding 2). If a
   real inefficiency is found and fixed, re-measure against the same rig
   this turn used (adapt `docs/phase10-spike-section-7/measure-share-turn-d.mjs`,
   which already measures `/share` against a rebuilt pre-Turn-C baseline —
   you will need to rebuild that baseline worktree yourself, or measure
   against the currently-committed pre-remediation `/share` as your own
   "before"). If the added cost is irreducible real content required by
   §R.9, say so explicitly and route back to Claude Lead for the same
   Devan-escalation pattern §R.8/term 15 already established, rather than
   silently absorbing the failed gate.
3. Add a computed contrast-ratio test (following
   `observatory-contrast.test.ts`'s existing pattern) for this section's new
   text/background pairs (Finding 3).

Keep `npm test` and `npm run build` green; commit once as
`phase10(§7): <summary>`; transition `stage` → `review`, `role` →
`claude_lead`, `next_actor` → `claude` exactly as the standing
`codex-implementation.md` prompt's `remediate` stage already instructs.
