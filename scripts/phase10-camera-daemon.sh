#!/usr/bin/env bash
# phase10-camera-daemon.sh — the camera, hoisted out of the agent sandbox.
# Runs in a PLAIN Terminal (never inside an agent), where Chromium launches
# fine. Agent turns request captures by writing .phase10-camera/request.json;
# this loop runs exactly one of two whitelisted npm commands and writes a
# done-marker. It never touches git, never reads .env*, and executes nothing
# from the request beyond the two allowed shapes.
set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"
EXCHANGE=".phase10-camera"
mkdir -p "$EXCHANGE"
LOG="$EXCHANGE/daemon.log"
log() { printf '%s %s\n' "$(date '+%H:%M:%S')" "$*" | tee -a "$LOG"; }
if [[ "${1:-}" != "--caffeinated" ]]; then
  log "starting under caffeinate (lid open, power connected)"
  exec caffeinate -is "$0" --caffeinated
fi
log "camera daemon up — watching $EXCHANGE/request.json"
while true; do
  date +%s > "$EXCHANGE/heartbeat"
  if [[ -f "$EXCHANGE/request.json" ]]; then
    REQUEST="$(cat "$EXCHANGE/request.json")"
    rm -f "$EXCHANGE/request.json"
    PARSED="$(node -e '
      try {
        const r = JSON.parse(process.argv[1]);
        const id = String(r.id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
        const cmd = r.command === "evidence" ? "evidence" : r.command === "capture" ? "capture" : "";
        const section = String(r.section ?? "").replace(/[^a-zA-Z0-9]/g, "");
        if (!id || !cmd || !section) throw new Error("bad request");
        console.log([id, cmd, section].join(" "));
      } catch { console.log(""); }
    ' "$REQUEST")"
    if [[ -z "$PARSED" ]]; then
      log "REJECTED malformed/non-whitelisted request: $REQUEST"
      continue
    fi
    read -r REQ_ID REQ_CMD REQ_SECTION <<< "$PARSED"
    log "request $REQ_ID: $REQ_CMD section $REQ_SECTION"
    set +e
    if [[ "$REQ_CMD" == "evidence" ]]; then
      npm run phase10:evidence -- "$REQ_SECTION" >> "$LOG" 2>&1
    else
      npm run phase10:capture -- --section "$REQ_SECTION" >> "$LOG" 2>&1
    fi
    EXIT_CODE=$?
    set -e
    node -e '
      const fs = require("fs");
      const [id, code, section] = process.argv.slice(1);
      const dir = `docs/phase10-baseline/section-${section}`;
      let outputs = [];
      try {
        outputs = fs.readdirSync(dir)
          .filter(f => /\.(png|json|md)$/.test(f))
          .map(f => `${dir}/${f}`);
      } catch {}
      fs.writeFileSync(`.phase10-camera/done-${id}.json`,
        JSON.stringify({ id, ok: code === "0", exitCode: Number(code), outputs }, null, 2));
    ' "$REQ_ID" "$EXIT_CODE" "$REQ_SECTION"
    log "request $REQ_ID done (exit $EXIT_CODE)"
  fi
  sleep 5
done
