#!/usr/bin/env bash
# One command for the whole owner evidence run.
#
# Written July 29, 2026 after the third consecutive capture round trip. Agent
# sandboxes on this Mac are denied Chromium at the Mach-port boundary, so the
# owner is the camera — but he should not have to juggle two terminals and five
# commands to be it. This builds, serves, measures, captures, and stops the
# server again.
#
#   ./scripts/phase10-evidence.sh 11
#
# Exits non-zero if the long-task gate is missed or any shot fails, so a
# partial run cannot be mistaken for a clean one.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

SECTION="${1:-11}"
PORT="${PORT:-3000}"
BASE="http://127.0.0.1:${PORT}"
OUT="docs/phase10-baseline/section-${SECTION}"
STAMP="$(date +%Y%m%d-%H%M%S)"
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo ""
    echo "→ stopping the production server (pid $SERVER_PID)"
    kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
  fi
}
trap cleanup EXIT INT TERM

echo "=== 1/4  production build ==========================================="
npm run build || { echo "BUILD FAILED — nothing measured."; exit 1; }

echo ""
echo "=== 2/4  starting the server ========================================"
npm run start >"/tmp/phase10-server-${STAMP}.log" 2>&1 &
SERVER_PID=$!

for i in $(seq 1 45); do
  if curl -fsS -o /dev/null "$BASE" 2>/dev/null; then
    echo "→ up at $BASE after ${i}s"
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "SERVER DIED. Log:"; tail -20 "/tmp/phase10-server-${STAMP}.log"; exit 1
  fi
  sleep 1
  [ "$i" = 45 ] && { echo "SERVER NEVER ANSWERED after 45s. Log:"; tail -20 "/tmp/phase10-server-${STAMP}.log"; exit 1; }
done

echo ""
echo "=== 3/4  long-task measurement (the 50ms gate) ======================"
PHASE10_BASE_URL="${BASE}/share" \
  node "${OUT}/scripts/profile-long-task.mjs" \
  | tee "${OUT}/raw-owner-profile-${STAMP}.json" >/dev/null
echo "→ profile   ${OUT}/raw-owner-profile-${STAMP}.json"

PHASE10_BASE_URL="${BASE}/share" \
  node "${OUT}/scripts/measure-long-tasks.mjs" \
  | tee "${OUT}/raw-owner-long-tasks-${STAMP}.txt"
TIMING_LINE="$(grep -o 'machine-readable: .*' "${OUT}/raw-owner-long-tasks-${STAMP}.txt" | tail -1)"

echo ""
echo "=== 3b/4  trail-colour sampler (TST-03) ============================="
SAMPLER="${OUT}/scripts/sample-live-rgb.mjs"
SAMPLER_LINE=""
if [ -f "$SAMPLER" ]; then
  PHASE10_BASE_URL="${BASE}/share" node "$SAMPLER" \
    | tee "${OUT}/raw-owner-rgb-${STAMP}.txt"
  SAMPLER_LINE="$(grep -o 'machine-readable: .*' "${OUT}/raw-owner-rgb-${STAMP}.txt" | tail -1)"
else
  echo "→ no sampler at $SAMPLER, skipping"
fi

echo ""
echo "=== 4/4  captures ==================================================="
npm run phase10:capture -- --section "$SECTION" --base "$BASE"
CAPTURE_STATUS=$?

echo ""
echo "====================================================================="
GATE_PASS=0
if printf '%s' "$TIMING_LINE" | grep -q '"pass":true'; then
  echo "  50ms GATE:  PASS"
  GATE_PASS=1
else
  MAXMS="$(printf '%s' "$TIMING_LINE" | sed -n 's/.*"maximumMs":\([0-9]*\).*/\1/p' | head -1)"
  echo "  50ms GATE:  FAIL${MAXMS:+  (worst context ${MAXMS}ms)}"
fi
[ "$CAPTURE_STATUS" -eq 0 ] && echo "  CAPTURES:   all shots landed" \
                            || echo "  CAPTURES:   at least one shot failed — see the sheet"
if [ -n "$SAMPLER_LINE" ]; then
  if printf '%s' "$SAMPLER_LINE" | grep -q '"pass":true'; then
    echo "  TRAIL HUE:  PASS"
  else
    SERR="$(printf '%s' "$SAMPLER_LINE" | sed -n 's/.*"error":"\([^"]*\)".*/\1/p' | head -1)"
    echo "  TRAIL HUE:  FAIL${SERR:+  ($SERR)}"
  fi
fi
echo ""
echo "  sheet   ${OUT}/contact-sheet.md"
echo "====================================================================="
echo ""
echo "Paste the two lines above to Opus. Nothing here needs your judgement —"
echo "this run is pure measurement."

[ "$GATE_PASS" -eq 1 ] && [ "$CAPTURE_STATUS" -eq 0 ] && exit 0
exit 1
