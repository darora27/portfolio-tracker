#!/usr/bin/env bash
# Phase 10 fixed-agent one-command runner — Codex Implementation.
#
# Same discipline as scripts/phase10-claude-lead.sh: lock, invoke,
# unlock. No parsing, no retries, no commits from this script.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ -e STOP ]; then
  echo "STOP is present. Codex will not start."
  exit 3
fi

LOCK_FILE="PHASE10_LOCK"
PROMPT_FILE="${PHASE10_PROMPT_OVERRIDE:-docs/phase10-workflow/prompts/codex-implementation.md}"
CODEX_MODEL="${PHASE10_CODEX_MODEL:-}"
CODEX_RESUME_SESSION="${PHASE10_CODEX_RESUME_SESSION:-}"
GIT_DIR="$(pwd)/.git"
LOG_DIR="$HOME/.phase10-workflow-logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date -u +%Y%m%dT%H%M%SZ)-codex-implementation.log"

if ! node scripts/phase10-validate-state.mjs; then
  echo "Phase 10 workflow validation failed. Refusing to start Codex."
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
owner=codex
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
task=phase10-codex-implementation-turn
LOCKEOF

echo "Starting Codex Implementation turn. Log: $LOG_FILE"
if [ -n "$CODEX_RESUME_SESSION" ] && [ -n "$CODEX_MODEL" ]; then
  codex -a never exec resume -m "$CODEX_MODEL" "$CODEX_RESUME_SESSION" - \
    < "$PROMPT_FILE" 2>&1 | tee "$LOG_FILE"
  CLI_STATUS=$?
elif [ -n "$CODEX_RESUME_SESSION" ]; then
  codex -a never exec resume "$CODEX_RESUME_SESSION" - \
    < "$PROMPT_FILE" 2>&1 | tee "$LOG_FILE"
  CLI_STATUS=$?
elif [ -n "$CODEX_MODEL" ]; then
  codex -a never exec -C "$(pwd)" --add-dir "$GIT_DIR" \
    -m "$CODEX_MODEL" - \
    < "$PROMPT_FILE" 2>&1 | tee "$LOG_FILE"
  CLI_STATUS=$?
else
  codex -a never exec -C "$(pwd)" --add-dir "$GIT_DIR" - \
    < "$PROMPT_FILE" 2>&1 | tee "$LOG_FILE"
  CLI_STATUS=$?
fi

echo ""
echo "Codex Implementation turn finished. Run 'git log -1' and check"
echo "PHASE10_STATE.json's status/stage/next_actor to see what happened."
echo "If status is 'blocked', read stop_reason and the newest file in"
echo "docs/phase10-handoffs/ before doing anything else."
exit "$CLI_STATUS"
