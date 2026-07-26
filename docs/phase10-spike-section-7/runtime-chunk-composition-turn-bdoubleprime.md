# Phase 10 §7 Turn B″ runtime-chunk composition

Recorded July 26, 2026 by `codex/gpt-5`.

## Question

Why did Turn B′ leave the desktop route-owned task unchanged at 59–60 ms, and
what changed in the owner-authorized chunk-level optimization round?

## Retained before evidence

- Turn B′ production chunk: `0_z2rgj02ay80.js`.
- On-disk minified bytes: 881,917.
- Locally recomputed gzip bytes: 232,821.
- Live transferred bytes recorded in
  `raw/desktop-scene-turn-bprime.json`: 233,398.
- The chunk contained the `@react-three/fiber` entry module.
- The installed R3F 9.6.1 entry at
  `node_modules/@react-three/fiber/dist/react-three-fiber.esm.js` imports
  `* as THREE from "three"` and calls `extend(THREE)`. R3F's own source
  comment says this registers the entire Three namespace by default.
  Therefore scene-level import cleanup could not tree-shake unused Three
  modules from this chunk.

## Turn B″ implementation

- Removed `@react-three/fiber` from both measured scene source paths.
- Kept the same owner-gated routes, lazy client gate, semantic controls,
  fallback behavior, selection callbacks, camera travel, and pointer
  interaction contracts.
- Replaced the reconciler with a bounded direct-Three renderer using named
  imports, shared geometries, one render loop, one raycaster, and explicit
  disposal of every geometry, material, and renderer.
- The Portfolio Orrery scene now adds its required visual system without
  post-processing, imported textures, models, or physics: an in-canvas
  spatial star field, procedural shader variation per planet, atmospheric
  rim lighting, layered additive sun glow, depth-aware parallax, refined
  orbit paths, and CRT/HUD framing.

## Fresh production-build composition

Source: clean successful `npm run build` on July 26, followed by a deterministic
scan of `.next/static/chunks/*.js`. Raw retained values:
`raw/runtime-chunk-turn-bdoubleprime.json`.

| Runtime payload | Minified bytes | Gzip bytes | Contains R3F |
|---|---:|---:|---|
| Shared Three renderer chunk `3c2h0fp_tgndt.js` | 540,142 | 134,184 | no |
| Orrery scene chunk `3vuva1ht_a0y8.js` | 8,391 | 3,378 | no |
| Chapter-spike scene chunk `2j3rjldu01k2r.js` | 3,521 | 1,753 | no |

The shared heavy chunk fell from 232,821 gzip bytes to 134,184 gzip bytes:
98,637 bytes, or 42.37%, smaller. It contains `WebGLRenderer` but neither
`@react-three/fiber` nor the old `extend(THREE)` namespace-registration path.

## Live-measurement status

The unchanged §2.3.2 script was prepared for a fresh run, but this Codex
environment denied `next start -p 3100` with
`listen EPERM: operation not permitted 0.0.0.0:3100`. No live long-task,
memory, frame-stability, leak-check, screenshot, or motion number is claimed
from this environment. Per the standing environment-only browser-evidence
rule, Claude Lead must run the unchanged live procedure and capture all eight
fresh §R.11 evidence items before PASS.
