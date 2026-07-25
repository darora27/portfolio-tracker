# Phase 10 §6 recovery: Devan → Codex Implementation

Prepared July 24, 2026 after the environment-only blocked turn.

## Owner resolution

The §6 candidate passed 409/409 tests and the production build before it was
reverted solely because the Codex CLI could not bind localhost or access a
browser backend.

The owner approves the durable workflow rule now recorded in
`docs/phase10-workflow/prompts/codex-implementation.md`:

- Codex must attempt required browser checks.
- If the CLI environment alone prevents those checks, Codex preserves and
  commits otherwise complete green work, documents the exact evidence gap, and
  routes to Claude review.
- Claude Lead performs every missing live check before PASS.
- This exception does not excuse a known browser failure.

The unrelated local Next.js development server that stalled the post-revert
build was stopped. The current base independently passes 379/379 tests and a
production build.

## Recovery instruction

Resume Codex session `019f9657-8f33-7373-9499-ad5a0db98381` so it can reuse its
existing §6 implementation context. Reapply the reverted candidate, rerun tests
and build, preserve it if green, commit, and transition normally to Claude
review. Do not block or revert solely for unavailable Codex-side browser
evidence.
