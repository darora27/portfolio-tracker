#!/usr/bin/env bash
# Bounded Phase 10 state relay.
#
# This supervisor reads only durable repository state. It never parses agent
# prose, edits files, commits, retries, sleeps, or runs agents concurrently.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

MAX_TURNS=6
CHECK_ONLY=0

usage() {
  echo "Usage: ./scripts/phase10-relay.sh [--max-turns N] [--check]"
  echo ""
  echo "  --max-turns N  Run at most N serial agent turns (1-20; default 6)."
  echo "  --check        Validate state and print the next actor without running it."
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --max-turns)
      if [ "$#" -lt 2 ]; then
        echo "BLOCKED: --max-turns requires an integer from 1 to 20."
        exit 2
      fi
      MAX_TURNS="$2"
      shift 2
      ;;
    --check)
      CHECK_ONLY=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "BLOCKED: unknown argument: $1"
      usage
      exit 2
      ;;
  esac
done

case "$MAX_TURNS" in
  ''|*[!0-9]*)
    echo "BLOCKED: --max-turns must be an integer from 1 to 20."
    exit 2
    ;;
esac

if [ "$MAX_TURNS" -lt 1 ] || [ "$MAX_TURNS" -gt 20 ]; then
  echo "BLOCKED: --max-turns must be between 1 and 20."
  exit 2
fi

read_state() {
  node -e '
    const fs = require("fs");
    const state = JSON.parse(fs.readFileSync("PHASE10_STATE.json", "utf8"));
    const fields = [
      state.status ?? "",
      state.next_actor ?? "",
      state.stage ?? "",
      state.current_section ?? "",
    ];
    process.stdout.write(fields.join("\t"));
  '
}

require_clean_tree() {
  local dirty
  dirty="$(git status --porcelain)"
  if [ -n "$dirty" ]; then
    echo "BLOCKED: repository is not clean:"
    echo "$dirty"
    return 1
  fi
}

preflight() {
  if [ -e STOP ]; then
    echo "STOP is present. Relay will not start another turn."
    return 3
  fi

  if [ -e PHASE10_LOCK ]; then
    echo "BLOCKED: PHASE10_LOCK already exists:"
    sed -n '1,20p' PHASE10_LOCK
    return 2
  fi

  require_clean_tree || return 2

  if ! node scripts/phase10-validate-state.mjs; then
    echo "BLOCKED: PHASE10_STATE.json validation failed."
    return 2
  fi
}

preflight
PREFLIGHT_STATUS=$?
if [ "$PREFLIGHT_STATUS" -ne 0 ]; then
  exit "$PREFLIGHT_STATUS"
fi

IFS=$'\t' read -r STATUS NEXT_ACTOR STAGE CURRENT_SECTION <<< "$(read_state)"

if [ "$CHECK_ONLY" -eq 1 ]; then
  echo "Relay check passed."
  echo "section=$CURRENT_SECTION stage=$STAGE status=$STATUS next_actor=$NEXT_ACTOR"
  exit 0
fi

TURN=1
while [ "$TURN" -le "$MAX_TURNS" ]; do
  if [ -e STOP ]; then
    echo "STOP is present. Relay stopped before turn $TURN."
    exit 0
  fi

  if [ -e PHASE10_LOCK ]; then
    echo "BLOCKED: PHASE10_LOCK exists before turn $TURN."
    sed -n '1,20p' PHASE10_LOCK
    exit 2
  fi

  require_clean_tree || exit 2
  node scripts/phase10-validate-state.mjs || exit 2
  IFS=$'\t' read -r STATUS NEXT_ACTOR STAGE CURRENT_SECTION <<< "$(read_state)"

  case "$STATUS" in
    complete)
      echo "Phase 10 is complete. Relay stopped."
      exit 0
      ;;
    blocked)
      echo "Phase 10 state is blocked. Read stop_reason and the latest handoff."
      exit 2
      ;;
    ready)
      ;;
    *)
      echo "BLOCKED: unsupported state status '$STATUS'."
      exit 2
      ;;
  esac

  case "$NEXT_ACTOR" in
    claude)
      RUNNER="./scripts/phase10-claude-lead.sh"
      ;;
    codex)
      RUNNER="./scripts/phase10-codex-implementation.sh"
      ;;
    devan)
      echo "State requires Devan. Relay stopped."
      exit 0
      ;;
    *)
      echo "BLOCKED: unsupported next_actor '$NEXT_ACTOR'."
      exit 2
      ;;
  esac

  BEFORE_COMMIT="$(git rev-parse HEAD)"
  BEFORE_STATE="$(shasum -a 256 PHASE10_STATE.json | awk '{print $1}')"

  echo ""
  echo "Relay turn $TURN/$MAX_TURNS:"
  echo "section=$CURRENT_SECTION stage=$STAGE actor=$NEXT_ACTOR"

  if "$RUNNER"; then
    RUNNER_STATUS=0
  else
    RUNNER_STATUS=$?
  fi

  if [ -e PHASE10_LOCK ]; then
    echo "BLOCKED: runner exited but PHASE10_LOCK remains."
    sed -n '1,20p' PHASE10_LOCK
    exit 2
  fi

  require_clean_tree || exit 2
  node scripts/phase10-validate-state.mjs || exit 2

  AFTER_COMMIT="$(git rev-parse HEAD)"
  AFTER_STATE="$(shasum -a 256 PHASE10_STATE.json | awk '{print $1}')"
  IFS=$'\t' read -r STATUS NEXT_ACTOR STAGE CURRENT_SECTION <<< "$(read_state)"

  if [ "$RUNNER_STATUS" -ne 0 ]; then
    echo "BLOCKED: agent runner exited with status $RUNNER_STATUS."
    echo "section=$CURRENT_SECTION stage=$STAGE status=$STATUS next_actor=$NEXT_ACTOR"
    exit "$RUNNER_STATUS"
  fi

  if [ "$BEFORE_COMMIT" = "$AFTER_COMMIT" ] || [ "$BEFORE_STATE" = "$AFTER_STATE" ]; then
    echo "BLOCKED: the agent exited successfully but durable state did not advance."
    exit 2
  fi

  if [ "$STATUS" = "blocked" ]; then
    echo "Agent recorded a blocked state. Read stop_reason and the latest handoff."
    exit 2
  fi

  if [ "$STATUS" = "complete" ]; then
    echo "Phase 10 is complete. Relay stopped."
    exit 0
  fi

  TURN=$((TURN + 1))
done

echo ""
echo "Relay reached its $MAX_TURNS-turn safety limit."
echo "The repository is clean and the next actor is recorded in PHASE10_STATE.json."
