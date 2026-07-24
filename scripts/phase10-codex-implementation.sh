#!/usr/bin/env bash
# Phase 10 fixed-agent one-command runner — Codex Implementation.
#
# Same discipline as scripts/phase10-claude-lead.sh: lock, invoke,
# unlock. No parsing, no retries, no commits from this script.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

LOCK_FILE="PHASE10_LOCK"
PROMPT_FILE="docs/phase10-workflow/prompts/codex-implementation.md"
CODEX_MODEL="${PHASE10_CODEX_MODEL:-}"
LOG_DIR="$HOME/.phase10-workflow-logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date -u +%Y%m%dT%H%M%SZ)-codex-implementation.log"

if [ -e "$LOCK_FILE" ]; then
  echo "PHASE10_LOCK already exists. Another turn may be in progress, or a"
  echo "previous run did not clean up. Contents:"
  cat "$LOCK_FILE"
  echo "If you are certain no agent is running, remove PHASE10_LOCK by hand"
  echo "and re-run this script."
  exit 1
fi

cat > "$LOCK_FILE" <<LOCKEOF
owner=codex
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
task=phase10-codex-implementation-turn
LOCKEOF

release_lock() {
  rm -f "$LOCK_FILE"
}
trap release_lock EXIT INT TERM

echo "Starting Codex Implementation turn. Log: $LOG_FILE"
if [ -n "$CODEX_MODEL" ]; then
  codex -a never exec -C "$(pwd)" -s workspace-write -m "$CODEX_MODEL" - \
    < "$PROMPT_FILE" 2>&1 | tee "$LOG_FILE"
else
  codex -a never exec -C "$(pwd)" -s workspace-write - \
    < "$PROMPT_FILE" 2>&1 | tee "$LOG_FILE"
fi

echo ""
echo "Codex Implementation turn finished. Run 'git log -1' and check"
echo "PHASE10_STATE.json's status/stage/next_actor to see what happened."
echo "If status is 'blocked', read stop_reason and the newest file in"
echo "docs/phase10-handoffs/ before doing anything else."
