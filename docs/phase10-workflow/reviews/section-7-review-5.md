# Phase 10 §7 Turn D review (round 2) — bounded remediation of the 3 findings from review-4

Reviewed by: `claude-code/sonnet-5` (Claude Lead, `review` stage, Turn D per
`docs/phase10-workflow/specs/section-7.md` §0, second pass in this
remediate/review loop).

Reviewed commit: `48c8a2e` (`phase10(§7): remediate focus, mobile load, and
contrast`), diffed against `prev_actor_commit`
`ab7c7b1faa7e09af3aea58f9015130610c139e5e` (`phase10(review §7): fail with 3
bounded findings (Turn D)`).

Scope: this is a bounded remediation review. Per
`docs/PHASE10_AGENT_WORKFLOW.md` §4, it evaluates only the three findings
`section-7-review-4.md` raised (Finding 1 / criterion 16, Finding 2 /
criterion 30, Finding 3 / criterion 20) — everything else in §8's 34 and
§R.12's 9 criteria was already independently verified passing in review-4
and is not re-litigated here. Codex's handoff stated plainly that its
sandbox could not bind `localhost`, so none of the three fixes were live- or
timing-verified by Codex itself; all live verification below is this turn's
own, independent work.

## Result: PASS — all three findings independently confirmed resolved

## Independent verification performed

- `npm test`: reran myself — 82 files, 457/457 passed.
- `npm run build`: reran myself — Next.js 16.2.11 compiled, TypeScript
  passed, 19 route tasks generated.
- Started the real shipped production server (`next start -p 3100`). `/share`
  is public; no owner session or password override was needed for any check
  in this turn.
- Rebuilt a second, real pre-Turn-C baseline server on port 3101 from a git
  worktree checked out at `prev_actor_commit` `799a124` (the same baseline
  commit review-4 used), including the same temporary `npm install --no-save
  three@0.185.1 @react-three/fiber@^9 @types/three@0.185.1` precedent so the
  baseline's own R3F spike route still compiles; confirmed
  `git diff --quiet package.json package-lock.json` afterward. Both servers
  stopped and the worktree removed at the end of this review.

## Finding 1 (criterion 16, focus restoration) — RESOLVED

Read `ObservatoryEntrance.tsx`'s diff directly: `endEntrance()` is now
guarded by an `endingRef` so the pointerdown/click double-fire this finding
root-caused can no longer race, and focus is scheduled to
`[data-portfolio-sun]` via `requestAnimationFrame` unconditionally on every
end path, rather than being gated on a stale `overlayRef.current?.contains(...)`
check. Confirmed `[data-portfolio-sun]` is a real, focusable `<Link>` in
`OrreryWorld.tsx` (`src/components/observatory/orrery/OrreryWorld.tsx:176-187`).

Wrote and ran an independent script
(`docs/phase10-spike-section-7/turn-d-claude-focus-verify.mjs`) against the
live shipped `/share`, covering all three end paths in fresh browser
contexts:

| End path | `document.activeElement` | Has `data-portfolio-sun` | Overlay still mounted |
|---|---|---|---|
| Skip-button click | `<a>` | true | 0 |
| `keydown` (Escape) | `<a>` | true | 0 |
| Natural 1800ms timeout | `<a>` | true | 0 |

Focus lands on the real sun link in every case, never `<body>`, and the
overlay is fully unmounted (not merely hidden) afterward. `criterion 16` is
satisfied.

## Finding 2 (criterion 30 / §2.3.1, mobile load regression) — RESOLVED

Read the diff: every `<Link>` in `OrreryWorld.tsx` now sets `prefetch={false}`
(sun, each holding, the deep-stock link, the Pulse/Forces link, and the
close-inspector link), and a new source-contract test
(`OrreryWorld.test.tsx`, "disables speculative prefetch on every Orrery
link for the mobile fallback") regex-matches every `<Link` tag in the real
production file and asserts each one contains `prefetch={false}` — this
guards against a future added link silently reintroducing the cost, not
just the links present today.

Re-ran the unchanged §2.3.1 rig myself, twice, against the same two real
servers review-4 used:

1. Straight order (5 prod runs, then 5 baseline runs — the same order
   review-4's script uses): prod median **2375 ms**, baseline median
   **2845 ms** — prod **470 ms faster**, the opposite direction from
   review-4's pre-remediation finding (`+506 ms` regression).
2. Because a same-direction-both-ways flip is worth a harder look, I wrote a
   second, order-controlled script
   (`docs/phase10-spike-section-7/turn-d-claude-interleaved-mobile.mjs`,
   10 repetitions, alternating which server is measured first each round to
   cancel out warm-up/thermal drift): prod median **2343 ms**, baseline
   median **2709 ms** — prod **366 ms faster**, confirming the first run's
   direction was not an order artifact.

Both methodologies agree: the shipped build no longer regresses against the
pre-§7 baseline on this rig — it now loads faster, consistent with removing
speculative RSC prefetch work from the mobile fallback path. The
pre-existing, already-accepted ~66-69 ms long task remains present at the
same magnitude on both builds (1/5 runs each in the straight-order pass);
the R3F chunk remains absent from every mobile-viewport script request on
both builds (confirmed live via network log, consistent with review-4's
already-passing criterion 29). Raw data:
`docs/phase10-spike-section-7/raw/share-turn-d.json` (straight order,
superseding the pre-remediation numbers review-4 recorded — the prior
numbers remain readable in git history at `ab7c7b1`) and
`docs/phase10-spike-section-7/raw/turn-d-claude-interleaved-mobile.json`
(interleaved). `criterion 30` is satisfied.

## Finding 3 (criterion 20, contrast) — RESOLVED

Read the diff: `observatory-contrast.test.ts` now reads
`observatory-entrance.module.css` directly and adds two computed-ratio
assertions — `.signal`'s `#ffd68c` against `.arrival`'s real background
(`#010504`, the base layer of its multi-stop `background` declaration), and
`.skip`'s `#fff0cf` against its own `rgba(2, 12, 9, 0.92)` background
alpha-composited over that same arrival surface (a new `compositeOver` +
`contrastRatioRgb` helper pair, not eyeballed).

Independently recomputed both ratios by hand from the WCAG relative-luminance
formula, using the exact hex/rgba values in
`observatory-entrance.module.css`: `.signal` on `.arrival` ≈ **14.9:1**;
`.skip`'s composited surface (`rgb(2,11,9)` after alpha-compositing) against
`#fff0cf` ≈ **17.65:1** — both consistent with the review-4 finding's own
manual estimate (≈14.4:1 / ≈17.6:1) and both far above the 4.5:1 floor. The
tests pass as part of this turn's full `npm test` run. `criterion 20` is
satisfied.

## Nothing else regressed

- Full diff since `ab7c7b1` touches exactly the three files each finding
  named (`ObservatoryEntrance.tsx`, `OrreryWorld.tsx`,
  `observatory-contrast.test.ts`) plus their tests and the state/handoff
  bookkeeping — no other production file changed.
- `457/457` tests pass (was `454/454` at review-4's reviewed commit; +3 new
  assertions, 0 removed or weakened).
- Build is green; route list unchanged.
- No new `<Link>` lost its `prefetch={false}`; no new dollar pattern, no new
  owner-only import — the diff is non-visual/behavioral in a way that could
  not plausibly reopen any of review-4's already-passing 40 criteria, and
  direct inspection confirms none did.

## Carried-forward evidence gap (unchanged from review-4, not a new finding)

Storytelling rubric rows 1, 7, 10, and 11 (criterion 9) still require
verbatim reactions from unprimed human viewers who have not seen the pre-§7
shell. Consistent with Turn B, Turn B″, and review-4's own handling of this
same requirement, no such reaction is fabricated here. This is a disclosed,
persistent evidence gap outside what Codex (or this review) can resolve
through code, not a bounded finding — it does not block this remediation
round's PASS.

## What this means for `PHASE10_STATE.json`

Zero findings this round. `stage` → `accept`, `role` stays `claude_lead`,
`next_actor` → `claude`, `section.review_result` → `"pass"`. §7 is eligible
for the standard `accept`-stage turn that follows, which rolls the section
machine forward to §8.
