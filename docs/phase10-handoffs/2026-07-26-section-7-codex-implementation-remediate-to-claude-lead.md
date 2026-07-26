# Phase 10 §7 handoff: Codex Implementation → Claude Lead, Turn B″ review

Prepared July 26, 2026 by `codex/gpt-5`.

## Outcome

The owner-authorized second remediation is implemented and the repository is
routed to `§7` / `review` / `claude_lead` / `ready` /
`next_actor: claude`.

Both required parts were delivered on the owner-gated prototype routes only.
Production `/share` and the accepted Observatory remain unchanged. No
performance exception was assumed, CSS was not selected, and the 50 ms gate
was not changed.

## Part 1 — bundle/runtime remediation

Retained evidence:
`docs/phase10-spike-section-7/runtime-chunk-composition-turn-bdoubleprime.md`
and `raw/runtime-chunk-turn-bdoubleprime.json`.

The prior 233 KB transferred chunk contained R3F 9.6.1's entry module, whose
source imports `* as THREE` and registers the whole namespace with
`extend(THREE)`. That is why Turn B′'s scene-construction edits could not
tree-shake the chunk.

This turn replaced the reconciler path in both measured scenes with bounded
direct Three:

- named imports only; no `@react-three/fiber` or `import * as THREE`;
- shared geometry, one raycaster, one animation loop;
- callback/semantic contracts preserved;
- explicit geometry, material, renderer, listener, observer, and RAF cleanup.

Fresh green production-build composition:

| Payload | Gzip bytes | R3F present |
|---|---:|---|
| Prior heavy chunk | 232,821 | yes |
| Turn B″ shared Three renderer | 134,184 | no |
| Turn B″ Orrery scene | 3,378 | no |
| Turn B″ chapter-spike scene | 1,753 | no |

The heavy chunk is 98,637 bytes / 42.37% smaller.

## Part 2 — §R.10 visual remediation

`OrreryScene.tsx` now includes:

- a coherent in-canvas spatial star field;
- procedural per-planet shader variation;
- atmospheric rim separation;
- restrained layered additive sun glow and animated plasma;
- depth-aware camera/pointer response;
- refined real orbit paths with unchanged path/trajectory identity;
- explicit disposal to protect the memory/leak budgets.

`orrery.module.css` adds restrained command-observatory framing, a visible
background star/depth layer, telemetry-panel details, scanlines, and a
vignette while preserving mobile/reduced-motion/forced-no3d reflow.

No post-processing, imported texture/model, physics, audio, generic decorative
body, or unexplained orbit/path was added.

## Verification completed by Codex

- `npm test`: PASS — 81 files, 448/448 tests.
- `npm run build`: PASS — Next.js 16.2.11 compiled, TypeScript passed,
  19 static-page tasks generated.
- Targeted ESLint: PASS.
- `npx tsc --noEmit`: PASS.
- `node scripts/phase10-validate-state.mjs`: PASS.
- `git diff --check`: PASS.
- `package.json` / `package-lock.json`: unchanged. The already-authorized
  prototype `three@0.185.1` / types remain `--no-save`; R3F remains installed
  in `node_modules` from Turn B′ but no source imports it.
- No `.env*` contents were read, printed, copied, edited, staged, or committed.

## Required independent live review

The Codex shell attempted `next start -p 3100` with a task-only password
override and received:

`listen EPERM: operation not permitted 0.0.0.0:3100`

No live metric or screenshot is claimed. Per the standing environment-only
browser-evidence rule, Claude Lead must perform all of the following before
PASS:

1. Run the unchanged CPU-2× desktop procedure with five fresh contexts:

   `PHASE10_DESKTOP_OUTPUT=raw/desktop-scene-turn-bdoubleprime.json OWNER_PASSWORD=<task-only> node docs/phase10-spike-section-7/measure-desktop.mjs`

2. Run the unchanged mobile-fallback procedure and retain a distinctly named
   raw result.
3. Capture all eight fresh §R.11 items:

   `PHASE10_EVIDENCE_TAG=turn-bdoubleprime OWNER_PASSWORD=<task-only> node docs/phase10-spike-section-7/capture-orrery-evidence.mjs`

4. Re-run `verify-r3f-parallax.mjs`, inspect console/page errors, URL
   back/forward, focus restoration, 390×844 and 320px overflow/target sizes,
   reduced motion, forced no3d, and dollar-pattern privacy.
5. Inspect the combined visual result directly. Finding 2 is source-remediated
   but remains `remediated_pending_visual_review` until this check.

If the unchanged desktop procedure still reports a route-owned task above
50 ms, apply Devan's stop condition immediately: set `status: blocked`,
`next_actor: devan`, return the measured result, and do not select CSS, alter
the gate, or draft an exception.

## State/commit discipline

`PHASE10_STATE.json` records prior actor commit
`3afb4ea8c870fb972ff3a8fd40d90eafdf355720`. Its
`section.remediation_commits` contains the required Turn B″ placeholder; the
next actor resolves this implementation commit via `git log -1 --format=%H`.
This turn's commit hash is intentionally not written by this actor.
