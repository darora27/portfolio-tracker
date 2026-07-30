#!/usr/bin/env bash
# phase10-unattended.sh — the one command Devan types before walking away.
set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"
MAX_TURNS=12
if [[ "${1:-}" == "--max-turns" && -n "${2:-}" ]]; then MAX_TURNS="$2"; fi
fail() { echo "PREFLIGHT FAIL: $*" >&2; exit 2; }
[[ -f STOP ]] && fail "STOP file present — remove it deliberately first."
[[ -f PHASE10_LOCK ]] && fail "PHASE10_LOCK present — a turn may be running."
[[ -z "$(git status --porcelain)" ]] || fail "working tree not clean."
node scripts/phase10-validate-state.mjs || fail "state validation failed."
if [[ -f .phase10-camera/heartbeat ]] && \
   [[ $(( $(date +%s) - $(cat .phase10-camera/heartbeat 2>/dev/null || echo 0) )) -lt 60 ]]; then
  echo "camera daemon already live."
else
  echo "starting camera daemon (log: .phase10-camera/daemon.log)…"
  nohup ./scripts/phase10-camera-daemon.sh >> /dev/null 2>&1 &
  DAEMON_PID=$!
  echo "$DAEMON_PID" > .phase10-camera/daemon.pid
  sleep 8
  [[ -f .phase10-camera/heartbeat ]] || fail "daemon produced no heartbeat — run the drill before going unattended."
  AGE=$(( $(date +%s) - $(cat .phase10-camera/heartbeat) )) 
  [[ "$AGE" -lt 60 ]] || fail "daemon heartbeat stale (${AGE}s)."
  echo "camera heartbeat confirmed."
fi
echo "launching relay: TOTAL cap $MAX_TURNS turns for this window."
echo "It stops early at owner-sitting, on any error, or on quota — every"
echo "turn ends committed, so stopping early is always safe."
echo "Leave the lid OPEN and power connected. Ctrl-C the daemon on return."
./scripts/phase10-relay.sh --max-turns "$MAX_TURNS"
STATUS=$?
echo "relay exited with status $STATUS."
echo "On return: read REVIEW_SITTING.md if present, view the screenshots"
echo "folder, give Opus your sentences, then: kill \$(cat .phase10-camera/daemon.pid)"
exit "$STATUS"
