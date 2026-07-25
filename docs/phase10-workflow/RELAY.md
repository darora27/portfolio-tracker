# Phase 10 bounded state relay

Status: owner-approved from §3 remediation review onward.

## Purpose

`scripts/phase10-relay.sh` removes Devan from ordinary successful
Claude-to-Codex handoffs while preserving the existing fixed roles, standing
prompts, state validator, locks, commits, and bounded-review discipline.

It is intentionally not a general autonomous orchestrator. It reads only
durable machine state and Git state. It never interprets conversational output.

## Run

From the repository root:

```bash
./scripts/phase10-relay.sh --max-turns 6
```

`6` is the default and is enough for a typical specify → implement → review →
accept sequence with room for one remediation handoff. Valid limits are 1–20.

Read-only preflight:

```bash
./scripts/phase10-relay.sh --check
```

Network-free workflow self-test:

```bash
./scripts/phase10-relay-selftest.sh
```

The self-test uses temporary fake repositories and fake Claude/Codex
executables. It verifies serial state transitions, STOP behavior, runner exit
code propagation, and lock release without consuming model tokens.

## What one relay iteration does

1. Refuses to continue if `STOP` or `PHASE10_LOCK` exists.
2. Requires `git status --porcelain` to be empty.
3. Runs `node scripts/phase10-validate-state.mjs`.
4. Reads `status`, `next_actor`, `stage`, and `current_section` from
   `PHASE10_STATE.json`.
5. Invokes exactly one fixed runner:
   - `next_actor: claude` → `scripts/phase10-claude-lead.sh`
   - `next_actor: codex` → `scripts/phase10-codex-implementation.sh`
6. Waits for that process to exit.
7. Requires the lock to be released, the tree to be clean, state to validate,
   the Git commit to change, and the state-file hash to change.
8. Stops or begins the next bounded iteration based only on the newly validated
   machine state.

## Stop behavior

To prevent the next handoff:

```bash
touch /Users/devanarora/Desktop/portfolio-tracker/STOP
```

`STOP` does not kill an agent already working; it prevents another turn from
starting. To interrupt the currently running process, press Control-C in the
relay Terminal. The active fixed runner's trap releases `PHASE10_LOCK`.

After inspecting state, remove the stop file manually before resuming:

```bash
rm /Users/devanarora/Desktop/portfolio-tracker/STOP
```

## Safety boundaries

The relay:

- runs one agent at a time;
- never parses stdout/stderr to decide control flow;
- never edits files or runs `git commit`;
- never swaps Claude and Codex roles;
- never retries a failed or ambiguous turn;
- never sleeps or guesses a usage-reset time;
- never bypasses either runner's sandbox or permission mode;
- stops on non-zero CLI exit, dirty tree, invalid state, stale lock, no
  commit/state progress, `blocked`, `complete`, `next_actor: devan`, or the
  configured turn limit.

Because provider quota resets are not exposed here as dependable
machine-readable state, the relay does not wait and retry after a rate limit.
That remains a safe manual resume after checking the recorded outcome.

For an owner-directed recovery where a specific Codex session already contains
valuable implementation context, the fixed Codex runner supports a one-time
session override:

```bash
PHASE10_CODEX_RESUME_SESSION=<session-id> \
  ./scripts/phase10-codex-implementation.sh
```

This is never selected automatically by the relay. The state must first be
deliberately restored to a valid `ready` Codex turn, and the exact prior
session ID must come from that turn's local log. When supplied to the relay
rather than the fixed runner directly, the relay clears the override after the
first Codex turn so later Codex stages or sections do not inherit stale session
context.

## Exit meaning

- Exit `0`: clean safety-limit stop, explicit `STOP`, `complete`, or
  `next_actor: devan`.
- Exit `2`: repository/state/progress block requiring inspection.
- Any other non-zero value: propagated fixed-runner/CLI failure.

The relay never makes a failed turn look successful: both fixed runners now
preserve their underlying CLI pipeline exit status.
