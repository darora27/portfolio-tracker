#!/usr/bin/env bash
# Phase 10 fixed-agent one-command runner — Claude Lead.
#
# This script is deliberately dumb: it mechanically validates canonical
# workflow/context, acquires the repo lock, invokes exactly one CLI with the
# fixed standing prompt file, and releases the lock on exit. It never parses
# agent output, retries, edits state, or commits anything.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ -e STOP ]; then
  echo "STOP is present. Claude will not start."
  exit 3
fi

LOCK_FILE="PHASE10_LOCK"
PROMPT_FILE="${PHASE10_PROMPT_OVERRIDE:-docs/phase10-workflow/prompts/claude-lead.md}"
CLAUDE_MODEL="${PHASE10_CLAUDE_MODEL:-sonnet}"
LOG_DIR="$HOME/.phase10-workflow-logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date -u +%Y%m%dT%H%M%SZ)-claude-lead.log"

if ! node scripts/phase10-validate-state.mjs; then
  echo "Phase 10 workflow validation failed. Refusing to start Claude."
  exit 2
fi

release_lock() {
  rm -f "$LOCK_FILE"
}

if ! (set -o noclobber; : > "$LOCK_FILE") 2>/dev/null; then
  echo "PHASE10_LOCK already exists. Another turn may be in progress, or a"
  echo "previous run did not clean up. Contents:"
  sed -n '1,20p' "$LOCK_FILE" 2>/dev/null || true
  echo "If you are certain no agent is running, remove PHASE10_LOCK by hand"
  echo "and re-run this script."
  exit 1
fi
trap release_lock EXIT INT TERM

cat > "$LOCK_FILE" <<LOCKEOF
owner=claude
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
task=phase10-claude-lead-turn
LOCKEOF

echo "Starting Claude Lead turn. Log: $LOG_FILE"
claude --print --model "$CLAUDE_MODEL" --permission-mode auto -- \
  "$(cat "$PROMPT_FILE")" 2>&1 | tee "$LOG_FILE"
CLI_STATUS=$?

echo ""
echo "Claude Lead turn finished. Run 'git log -1' and check"
echo "PHASE10_STATE.json's status/stage/next_actor to see what happened."
echo "If status is 'blocked', read stop_reason and the newest file in"
echo "docs/phase10-handoffs/ before doing anything else."
exit "$CLI_STATUS"
