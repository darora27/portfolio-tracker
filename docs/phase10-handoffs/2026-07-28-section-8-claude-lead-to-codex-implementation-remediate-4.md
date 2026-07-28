# Phase 10 §8 handoff: Claude Lead review 5 → Codex Implementation (remediate, round 4)

Prepared July 28, 2026 by `claude-code/sonnet-5`.

## Outcome

Review returned 1 bounded finding. Five of the six owner round-three defects
(F2–F6) are confirmed fixed with live evidence. F1 is not.

## What this turn did

Independently built and ran a real production server (`npm run build && npm
run start -- -p 3100`, temporary process-only `OWNER_PASSWORD`, never
touching `.env*`) — this sandbox allowed the bind that Codex's sandbox
denied twice. Drove it with several temporary, unsaved Playwright scripts to
verify all six owner round-three defects (F1–F6) live at 1440×900, plus
390×844/320×844 mobile fallback and `?no3d=1`. Used direct RGB pixel
sampling (Python/Pillow, not committed) on captured screenshots to check
Finding 1's color claims precisely rather than by eye alone. No
implementation source was changed this turn.

## Evidence

- Commit (no source change, review-only): to be created by this turn's
  bookkeeping commit, `phase10(review §8): fail with 1 bounded finding`.
- Reviewed commit: `bdf524c389b08c8b69eb6b9be46285595bbf14a2`.
- Tests: 87 files, 474/474 passed (re-run independently).
- Build: Next.js 16.2.11, compiled clean, 18 routes (re-run independently).
- Screenshots: `docs/phase10-baseline/section-8/claude-review-5/`.
- Review doc: `docs/phase10-workflow/reviews/section-8-review-5.md`.

## For the next actor

Codex Implementation, `stage: remediate`. Read
`docs/phase10-workflow/reviews/section-8-review-5.md`'s "Finding 1" section
in full — it has the exact pixel evidence, root-cause analysis, and control
comparison (OVERVIEW vs. APPROACH camera distance).

**The one finding to fix:**

F1 (orbit-ring and comet-trail legibility at OVERVIEW) is not resolved by
the last remediation. The opacity increase (`0.2`→`0.34` ring, `0.72`→`0.96`
trail) is real at the material level but `scene.fog = new Fog("#020706", 15,
34)` (`OrreryScene.tsx:328`, predates this section and is untouched) darkens
both `MeshBasicMaterial` instances toward near-black at OVERVIEW's camera
distance, while the planet body's custom `ShaderMaterial` has no fog term at
all and stays fully lit. Live pixel sampling confirms trail pixels at
OVERVIEW are not reliably brighter than the plain starfield background and
carry no discernible hue; the identical trail geometry/material renders
correctly (vivid red/green) when viewed from APPROACH's much closer camera
distance — that comparison is the control that isolates fog as the cause.

**Required fix:** make the orbit-ring and trail materials immune to (or
correctly tuned against) `scene.fog` at OVERVIEW distance. The simplest
correct fix is `fog: false` on both materials' constructor options,
consistent with the planet body already being fog-exempt — but verify
live in a still OVERVIEW frame that this (or an equivalent fix) actually
produces a legible, correctly-hued trail before claiming it fixed; do not
rely on the opacity constants alone again.

**Also required:** replace or supplement the source-substring regression
test added last round (`OrreryScene.source.test.ts`'s new "keeps overview
rings and trails legible" test only greps for `"opacity: 0.34"` /
`"opacity: 0.96"` in source text — it passed while the live render was still
broken). Add coverage that can actually catch this class of bug: a rendered
pixel/screenshot-based check if the test setup supports one, or at minimum
an explicit `fog: false` source assertion on both materials so a future
regression can't silently reintroduce fog on these two materials without a
test noticing.

**Do not touch:** F2–F6's fixes (all confirmed live and correct — do not
"improve" or refactor them while you're in this file). Do not begin any
round-two creative scope (`UNIVERSE_IDEAS_2.md`) — this remains a bounded
defect-only remediation.

Keep `npm test` and `npm run build` green, commit once as
`phase10(§8): <summary>`, and transition `stage` → `review`, `role` →
`claude_lead`, `next_actor` → `claude`. If the environment blocks live
verification again, preserve green work, document the gap plainly (as the
last two rounds did), and route to Claude review rather than guessing at a
pass.

## Decision needed

None — this is a normal bounded remediation, not a blocked state.
