#!/usr/bin/env bash
#
# agent-relay.sh — Phase 9 §6
#
# A best-effort CONVENIENCE for alternating two locally-authenticated
# coding-agent CLIs (Claude Code and OpenAI Codex CLI) against this repo,
# NOT infrastructure. Both tools must already be installed and
# pre-configured by the OWNER in their own unattended/full-permission
# modes (this script does not set up auth, accept ToS, or grant
# permissions on your behalf) — it just runs whichever command you've
# put in TOOL_A_CMD/TOOL_B_CMD below. It passes no secrets of its own
# and makes no network calls itself; the agent CLIs it invokes are the
# ones doing that.
#
# MANUAL ALTERNATION (running one agent, watching it hit a limit,
# switching to the other yourself) REMAINS THE DOCUMENTED RELIABLE PATH.
# This script is a convenience for when you'd rather not babysit it —
# rate-limit detection here is a best-effort string/exit-code heuristic,
# not a guarantee. Read PHASE9_PROGRESS.md yourself occasionally.
#
# Usage: ./scripts/agent-relay.sh
# Stop:  Ctrl-C (logged, exits cleanly — does not kill an in-flight agent)

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# --- Owner-editable: commands and rate-limit detection -----------------
# Both flags below bypass permission prompts for unattended use — only
# meaningful (and only as safe as) whatever confinement you've already
# set up for these CLIs. Edit to match your own setup/model preference.
RESUME_PROMPT="Read AGENTS.md and the current PHASE*_PROGRESS.md; resume from the first unchecked item; stop cleanly per ground rules."

TOOL_A_NAME="claude-code"
TOOL_A_CMD=(claude -p "$RESUME_PROMPT" --dangerously-skip-permissions)

TOOL_B_NAME="codex"
TOOL_B_CMD=(codex exec "$RESUME_PROMPT" --dangerously-bypass-approvals-and-sandbox -C "$(pwd)")

# Case-insensitive substrings checked against each tool's combined
# stdout+stderr to guess "rate limited" vs. an ordinary failure. Add
# your own if a provider's wording changes.
RATE_LIMIT_PATTERNS="rate limit|rate_limit|429|usage limit|quota exceeded|try again later|overloaded"

BOTH_LIMITED_SLEEP_SECONDS=$((20 * 60))
LOG_FILE="agent-relay.log"
# -------------------------------------------------------------------

log() {
  printf '%s  %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" | tee -a "$LOG_FILE"
}

is_rate_limited() {
  echo "$1" | grep -qiE "$RATE_LIMIT_PATTERNS"
}

# Runs one tool; sets $RAN_OK (1 = exit 0, the only success gate) and
# $WAS_LIMITED (a best-effort, informational-only classification of a
# nonzero exit — never used to gate success). Returns 1 only when the
# command itself isn't installed.
run_tool() {
  local name="$1"
  shift
  if ! command -v "${1}" >/dev/null 2>&1; then
    log "$name: command not found ('$1') — skipping"
    return 1
  fi
  log "$name: starting"
  local output
  output="$("$@" 2>&1)"
  local exit_code=$?
  if [ $exit_code -eq 0 ]; then
    log "$name: finished (exit 0)"
    RAN_OK=1
    WAS_LIMITED=0
  else
    RAN_OK=0
    if is_rate_limited "$output"; then
      log "$name: rate-limited (exit $exit_code)"
      WAS_LIMITED=1
    else
      log "$name: failed, not a rate limit (exit $exit_code) — see terminal output above"
      WAS_LIMITED=0
    fi
  fi
  return 0
}

trap 'log "stopped by Ctrl-C"; exit 130' INT

log "agent-relay starting — manual alternation is the documented fallback if this misbehaves"

while true; do
  RAN_OK=0
  if run_tool "$TOOL_A_NAME" "${TOOL_A_CMD[@]}" && [ "$RAN_OK" -eq 1 ]; then
    continue
  fi

  RAN_OK=0
  if run_tool "$TOOL_B_NAME" "${TOOL_B_CMD[@]}" && [ "$RAN_OK" -eq 1 ]; then
    continue
  fi

  log "both tools rate-limited, failed, or unavailable — sleeping ${BOTH_LIMITED_SLEEP_SECONDS}s"
  sleep "$BOTH_LIMITED_SLEEP_SECONDS"
done
