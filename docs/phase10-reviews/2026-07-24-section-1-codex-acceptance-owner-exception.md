# Phase 10 §1 Codex Acceptance — owner-approved long-task exception

Reviewed July 24, 2026 by `codex/gpt-5`.

Reviewed commit: `f8001ada9187faff7838c1b45fc52409c06eea0c`

Result: **ACCEPT**

## Exception

Devan approved a §1-only exception to the absolute “zero tasks over 50 ms”
whole-page budget. The 50 ms long-task classification boundary remains
unchanged, and all absolute tasks remain recorded as observed. The replacement
acceptance gate for §1 is:

> CSS 3D must introduce no attributable route-owned long task and no
> route-owned client hydration.

This exception is not precedent for future production performance audits.

## Verification

- The retained raw evidence reports FAIL honestly in all five runs. Absolute
  tasks are 57/72 ms, 68 ms, 71 ms, 67 ms, and 66 ms.
- The repeated 66–72 ms task begins as the shared 71,312-byte React DOM chunk
  completes. The built route manifest classifies that chunk as a
  `rootMainFile`; route-bundle diagnostics include it for every built App
  Router route, including `/_not-found`. The chunk contains
  `hydrateRoot`/`createRoot`. This supports shared-bootstrap attribution; the
  Long Tasks API itself exposes only `window`/`self`, not a call stack.
- `src/app/layout.tsx` contains no `DepthPullProvider`.
  `src/app/(depth-pull)/layout.tsx` scopes it to `/`, `/share`, and
  `/dev/surface-scratch`, matching the only production/dev consumers.
- The authenticated `/dev/phase10-spike-css` branch renders no client
  component. Its route-owned spatial implementation is semantic DOM plus CSS;
  `LoginForm` renders only on the unmeasured unauthenticated branch. No
  route-owned client hydration or route-owned attributable long task is
  present.
- R3F/Three.js production source and direct dependencies are absent.
- `/` and `/share` page blobs are byte-identical to the pre-remediation
  versions and still do not import the Observatory shell. §2 is not started.
- Full tests and production build pass at acceptance.

## Scorecard

| Category | Result |
|---|---|
| Product alignment | PASS |
| Hierarchy | PASS |
| Usefulness | PASS |
| Originality | PASS |
| Accessibility/mobile | PASS |
| Engineering reliability | PASS with the owner-approved §1 exception above |

§1 is complete. Do not begin §2 without Devan’s explicit instruction.
