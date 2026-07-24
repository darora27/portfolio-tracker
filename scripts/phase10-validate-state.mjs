#!/usr/bin/env node
// Validates PHASE10_STATE.json against the Phase 10 v2 schema and its
// cross-field invariants (docs/phase10-workflow/IMPLEMENTATION_SPEC.md
// §3). No dependencies. Exit 0 = valid, exit 1 = invalid (prints every
// violation found, does not stop at the first one).
import { readFileSync } from "node:fs";

const STAGE_TO_ROLE = {
  specify: "claude_lead",
  review: "claude_lead",
  accept: "claude_lead",
  implement: "codex_implementation",
  remediate: "codex_implementation",
};
const STAGE_TO_NEXT_ACTOR = {
  specify: "claude",
  review: "claude",
  accept: "claude",
  implement: "codex",
  remediate: "codex",
};
const SHA = /^[0-9a-f]{40}$/;

const errors = [];
function require_(cond, msg) {
  if (!cond) errors.push(msg);
}

let state;
try {
  state = JSON.parse(readFileSync("PHASE10_STATE.json", "utf8"));
} catch (e) {
  console.error(`PHASE10_STATE.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

require_(state.schema_version === 2, "schema_version must be 2");
require_(state.phase === 10, "phase must be 10");
require_(/^§(1[0-3]|[2-9])$/.test(state.current_section), `current_section "${state.current_section}" is not §2-§13`);
require_(["claude_lead", "codex_implementation"].includes(state.role), `role "${state.role}" invalid`);
require_(["specify", "implement", "review", "remediate", "accept"].includes(state.stage), `stage "${state.stage}" invalid`);
require_(["ready", "blocked", "complete"].includes(state.status), `status "${state.status}" invalid`);
require_(["claude", "codex", "devan"].includes(state.next_actor), `next_actor "${state.next_actor}" invalid`);

if (state.stage in STAGE_TO_ROLE) {
  require_(state.role === STAGE_TO_ROLE[state.stage], `stage "${state.stage}" requires role "${STAGE_TO_ROLE[state.stage]}", got "${state.role}"`);
  if (state.status === "ready") {
    require_(state.next_actor === STAGE_TO_NEXT_ACTOR[state.stage], `stage "${state.stage}" with status ready requires next_actor "${STAGE_TO_NEXT_ACTOR[state.stage]}", got "${state.next_actor}"`);
  }
}
if (state.status === "blocked") {
  require_(state.next_actor === "devan", `status blocked requires next_actor "devan"`);
  require_(typeof state.stop_reason === "string" && state.stop_reason.length > 0, "status blocked requires a non-empty stop_reason");
}
if (state.status === "ready") {
  require_(state.stop_reason === null, "status ready requires stop_reason to be null");
}
if (state.status === "complete") {
  require_(state.current_section === "§13", "status complete requires current_section §13");
  require_(state.next_actor === "devan", "status complete requires next_actor devan");
}
for (const hash of [state.prev_actor_commit, state.last_green_commit]) {
  require_(hash === null || SHA.test(hash), `commit hash "${hash}" is not null or a 40-char lowercase hex sha`);
}
require_(state.legacy && typeof state.legacy === "object", "legacy key must be present as an object");
require_(Array.isArray(state.sections_history), "sections_history must be an array");
require_(state.section && typeof state.section === "object", "section must be an object");

if (errors.length) {
  console.error(`PHASE10_STATE.json failed validation (${errors.length} issue(s)):`);
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log("PHASE10_STATE.json is valid.");
process.exit(0);
