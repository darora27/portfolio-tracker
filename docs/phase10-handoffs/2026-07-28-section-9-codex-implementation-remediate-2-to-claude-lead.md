# Phase 10 §9 handoff: Codex Implementation remediation 2 → Claude Lead review

Prepared July 28, 2026 by `codex/gpt-5`.

## Outcome

F7's bounded implementation and test changes are complete. The pure scene
model now fits the real perspective projection rather than echoing a flat 88%
constant, and it proves all eight planets and resting tags remain inside a
1440×900 frame across a degree-by-degree full orbital phase sweep. Tests,
TypeScript, lint, the production build, route smoke, and the state validator
are green.

The environment-only browser exception applies. No browser backend was
available and the retained Chromium binary was denied before page creation, so
the post-F7 live geometry check and screenshot recapture remain for Claude
Lead to perform independently before PASS.

## Bounded F7 changes

- Added a serializable OVERVIEW camera descriptor to
  `buildOverviewSceneModel`. Its distance is solved from the
  perspective-projected belt extent; its vertical target is solved from the
  projected outer orbit, maximum planet radius, and resting-label extent —
  done by codex/gpt-5.
- Added projected screen centres and conservative bounding boxes for every
  planet, resting-label bounding boxes, and the belt's real projected bounding
  box. `belt.viewportSpanPct` is now calculated from that projection rather
  than copied from `OVERVIEW_BELT_SPAN_PCT` — done by codex/gpt-5.
- Added shared post-collision viewport clamping for scene labels. The live
  renderer and pure model consume the same label-layout function — done by
  codex/gpt-5.
- Updated `OrreryScene` to consume the scene model's camera position, target,
  near/far planes, and label layout. Pointer parallax remains relative to the
  fitted target — done by codex/gpt-5.
- Added a 360-step orbital phase test for all eight planets and tags at
  1440×900, including the 85–92% belt-span gate, plus a parity test against
  the actual three.js `PerspectiveCamera` projection — done by codex/gpt-5.
- Recorded criteria 1 and 17's automated result and the exact live-evidence
  gap in `docs/phase10-baseline/section-9/README.md` — done by codex/gpt-5.
- Trail/orbit sign→colour and sign→direction mapping are byte-unchanged —
  verified by codex/gpt-5.

## Verification

- `npx vitest run src/lib/observatory/scene-model.test.ts`: PASS, 13/13 —
  done by codex/gpt-5.
- `npm test`: PASS, 94 files / 499 tests — done by codex/gpt-5.
- `npx tsc --noEmit`: PASS — done by codex/gpt-5.
- Focused ESLint on the three changed implementation/test files: PASS with
  zero warnings and zero errors — done by codex/gpt-5.
- `npm run build`: PASS, Next.js 16.2.11, TypeScript clean, 18
  static-generation tasks, then `Share route smoke: PASS (/share 200; Mission
  Control manifest 200)` — done by codex/gpt-5.
- `node scripts/phase10-validate-state.mjs`: PASS — done by codex/gpt-5.
- No dependency manifest changed; no `.env*` content was read, printed,
  edited, staged, or committed; no `vercel --prod` or deployment command was
  run — done by codex/gpt-5.

## Browser evidence limitation

The in-app browser runtime initialized, but browser discovery returned:

```text
No browser is available
[]
```

The repository's retained Playwright 1.49.1 Chromium was then attempted
against `http://127.0.0.1:3119/share`. Chromium exited before page creation:

```text
FATAL:mach_port_rendezvous.cc(399)] Check failed: kr == KERN_SUCCESS.
bootstrap_check_in ... Permission denied (1100)
```

No screenshot was fabricated or relabelled. Consequently,
`docs/phase10-baseline/section-9/after/overview-1440x900.png` remains the
pre-F7 image from review 2 and is explicitly identified that way in the
evidence README.

## Required independent review

Claude Lead must:

1. Start the committed production build and load `/share` at exactly 1440×900.
2. Sample all eight scene-label rectangles and planet projected bounds over
   motion, confirming every edge remains within the viewport.
3. Confirm the actual belt ring spans 85–92% of viewport width.
4. Recapture and overwrite
   `docs/phase10-baseline/section-9/after/overview-1440x900.png`.
5. Visually confirm all eight resting tags are simultaneously legible and no
   planet is clipped.

Review only F7. F1–F6 remain settled, and the §15 build-smoke note remains
outside §9.
