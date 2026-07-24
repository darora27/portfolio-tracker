#!/usr/bin/env bash
# Deterministic, network-free tests for the bounded relay and runner exit codes.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

TEST_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/phase10-relay-selftest.XXXXXX")"
trap 'rm -rf "$TEST_ROOT"' EXIT INT TERM

RELAY_REPO="$TEST_ROOT/relay-repo"
mkdir -p "$RELAY_REPO/scripts"
cp scripts/phase10-relay.sh "$RELAY_REPO/scripts/phase10-relay.sh"

cat > "$RELAY_REPO/.gitignore" <<'EOF'
/STOP
/PHASE10_LOCK
EOF

cat > "$RELAY_REPO/PHASE10_STATE.json" <<'EOF'
{
  "status": "ready",
  "next_actor": "claude",
  "stage": "review",
  "current_section": "§test"
}
EOF

cat > "$RELAY_REPO/scripts/phase10-validate-state.mjs" <<'EOF'
import fs from "node:fs";
const state = JSON.parse(fs.readFileSync("PHASE10_STATE.json", "utf8"));
if (!["ready", "blocked", "complete"].includes(state.status)) process.exit(1);
if (!["claude", "codex", "devan"].includes(state.next_actor)) process.exit(1);
console.log("fixture state valid");
EOF

cat > "$RELAY_REPO/scripts/phase10-claude-lead.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
node -e '
  const fs = require("fs");
  const state = JSON.parse(fs.readFileSync("PHASE10_STATE.json", "utf8"));
  state.stage = "remediate";
  state.next_actor = "codex";
  fs.writeFileSync("PHASE10_STATE.json", JSON.stringify(state, null, 2) + "\n");
'
git add PHASE10_STATE.json
git commit -q -m "fixture: claude advances state"
EOF

cat > "$RELAY_REPO/scripts/phase10-codex-implementation.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
node -e '
  const fs = require("fs");
  const state = JSON.parse(fs.readFileSync("PHASE10_STATE.json", "utf8"));
  state.status = "complete";
  state.stage = "accept";
  state.next_actor = "devan";
  fs.writeFileSync("PHASE10_STATE.json", JSON.stringify(state, null, 2) + "\n");
'
git add PHASE10_STATE.json
git commit -q -m "fixture: codex completes state"
EOF

chmod +x \
  "$RELAY_REPO/scripts/phase10-relay.sh" \
  "$RELAY_REPO/scripts/phase10-claude-lead.sh" \
  "$RELAY_REPO/scripts/phase10-codex-implementation.sh"

git -C "$RELAY_REPO" init -q
git -C "$RELAY_REPO" config user.name "Phase 10 Relay Self-Test"
git -C "$RELAY_REPO" config user.email "relay-selftest@example.invalid"
git -C "$RELAY_REPO" add .
git -C "$RELAY_REPO" commit -q -m "fixture: initialize"

(
  cd "$RELAY_REPO"
  ./scripts/phase10-relay.sh --check | grep -q \
    "section=§test stage=review status=ready next_actor=claude"

  touch STOP
  set +e
  ./scripts/phase10-relay.sh --max-turns 1 >/dev/null 2>&1
  STOP_STATUS=$?
  set -e
  rm STOP
  if [ "$STOP_STATUS" -ne 3 ]; then
    echo "FAIL: STOP should exit 3; got $STOP_STATUS."
    exit 1
  fi

  ./scripts/phase10-relay.sh --max-turns 2 >/dev/null
  node -e '
    const state = require("./PHASE10_STATE.json");
    if (state.status !== "complete" || state.next_actor !== "devan") process.exit(1);
  '
  if [ "$(git rev-list --count HEAD)" -ne 3 ]; then
    echo "FAIL: expected initial + two serial agent commits."
    exit 1
  fi
)

RUNNER_REPO="$TEST_ROOT/runner-repo"
mkdir -p \
  "$RUNNER_REPO/scripts" \
  "$RUNNER_REPO/docs/phase10-workflow/prompts" \
  "$RUNNER_REPO/fake-bin" \
  "$RUNNER_REPO/fake-home"
cp scripts/phase10-claude-lead.sh "$RUNNER_REPO/scripts/"
cp scripts/phase10-codex-implementation.sh "$RUNNER_REPO/scripts/"
printf 'fixture\n' > "$RUNNER_REPO/docs/phase10-workflow/prompts/claude-lead.md"
printf 'fixture\n' > "$RUNNER_REPO/docs/phase10-workflow/prompts/codex-implementation.md"
git -C "$RUNNER_REPO" init -q

cat > "$RUNNER_REPO/fake-bin/claude" <<'EOF'
#!/usr/bin/env bash
exit 17
EOF

cat > "$RUNNER_REPO/fake-bin/codex" <<'EOF'
#!/usr/bin/env bash
exit 19
EOF

chmod +x "$RUNNER_REPO/fake-bin/claude" "$RUNNER_REPO/fake-bin/codex"

set +e
(
  cd "$RUNNER_REPO"
  PATH="$RUNNER_REPO/fake-bin:$PATH" HOME="$RUNNER_REPO/fake-home" \
    ./scripts/phase10-claude-lead.sh >/dev/null 2>&1
)
CLAUDE_STATUS=$?
(
  cd "$RUNNER_REPO"
  PATH="$RUNNER_REPO/fake-bin:$PATH" HOME="$RUNNER_REPO/fake-home" \
    ./scripts/phase10-codex-implementation.sh >/dev/null 2>&1
)
CODEX_STATUS=$?
set -e

if [ "$CLAUDE_STATUS" -ne 17 ]; then
  echo "FAIL: Claude runner should preserve exit 17; got $CLAUDE_STATUS."
  exit 1
fi
if [ "$CODEX_STATUS" -ne 19 ]; then
  echo "FAIL: Codex runner should preserve exit 19; got $CODEX_STATUS."
  exit 1
fi
if [ -e "$RUNNER_REPO/PHASE10_LOCK" ]; then
  echo "FAIL: runner lock was not released."
  exit 1
fi

echo "Phase 10 relay self-test passed."
