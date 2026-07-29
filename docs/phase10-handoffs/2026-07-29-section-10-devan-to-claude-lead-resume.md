# Phase 10 §10 handoff: Devan (owner decision) → Claude Lead

Prepared July 29, 2026 by `claude/fable-5` (Cowork, owner-directed), resolving
the block in
`docs/phase10-handoffs/2026-07-28-section-10-codex-implementation-to-devan-blocked.md`.

## Outcome

Routed to Claude Lead for `review`. Codex's round-3 remediation stands as the
candidate; the live verification it could not perform is Claude's to do.

## The decision

Codex completed all four round-3 fixes and every deterministic gate:
527/527 tests across 99 files, a green production build, a valid implementer
ledger, and clean workflow validation. It then **correctly refused to claim a
live pass**, because every Playwright verifier failed before navigation with
`Chromium MachPort permission error 1100`.

That refusal is the right behaviour and should not be treated as a failure.

## Why the environment cannot be fixed cheaply

An earlier owner change added `--no-sandbox` and `--disable-setuid-sandbox` to
all 46 browser scripts, which addressed Chromium's *internal* sandbox. The
error moved rather than disappeared: `MachPort permission error 1100` is macOS's
own sandbox denying Chromium's inter-process communication, one layer below
anything a launch flag can reach.

Clearing it would require running Codex under `danger-full-access`, which
removes essentially all sandbox protection from an agent that runs unattended
inside a relay loop. **Declined.** The cost is one review round per section; the
risk is unbounded.

**Standing division of labour, unchanged and now explicit:** Codex implements
and verifies what is deterministic — tests, build, ledger, static analysis.
Claude Lead performs all live browser verification. Neither actor accepts its
own implementation.

## For the next actor

Claude Lead, `stage: review`. The candidate is
`638812332b11b0f01d6d0e877ddcdd5660e66cd3`.

Verify the four round-3 fixes live, since none has browser evidence:

1. **F1 / TST-03** — trail sampling, core and glow geometry corrected. Re-run
   the trail sampler; six of eight holdings previously exceeded ΔE 8, and one
   loss-direction ordering violation remained.
2. **F2 / BLD-04** — shader compilation staged across frames. Re-measure the
   route-owned long task across five fresh 1440×900 CPU-2× contexts. This gate
   has been breached at 56–62 ms through three remediation attempts; §9 measured
   zero on a byte-identical script. **If it is still breached, do not
   baseline-subtract or redefine the gate** — record the measurement and route
   to Devan, as §7 did.
3. **F3 / DEF-02** — mark chirality corrected and textures regenerated. Re-run
   the chirality assertion; four of eight worlds previously failed.
4. **F4 / VIS-12** — duplicated bay questions fixed. Confirm each active
   section renders its question exactly once and that the contribution bar no
   longer covers its numeral.

Nine criteria were recorded `blocked` in the implementer ledger for lack of a
browser. Resolve each to a reviewer result rather than carrying them forward
unexamined.

## Context worth carrying

`OWNER_FEEDBACK_LEDGER.md` is required reading and is newer than any document
it contradicts.

**On F2 specifically:** §11 is already specified to *refund* the long-task
budget — it deletes the embedded legacy dashboard along with its Recharts
instances, pauses the radar off-screen, and lazy-mounts below-fold sections. If
F2 proves genuinely irreducible inside §10's scope, that is a legitimate finding
to return to Devan with the measurement, not something to force.
