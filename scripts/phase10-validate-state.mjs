#!/usr/bin/env node
// Validates live Phase 10 state, cross-file workflow invariants, generated
// context freshness, roadmap bounds, and the current acceptance ledger.
// No dependencies. Exit 0 = valid; exit 1 prints every violation.
import {
  DEFAULT_ROOT,
  readJson,
  validateWorkflowRepository,
  WORKFLOW_PATH,
} from "./phase10-workflow-lib.mjs";

let workflow;
try {
  workflow = readJson(DEFAULT_ROOT, WORKFLOW_PATH);
} catch (error) {
  console.error(`${WORKFLOW_PATH} is not valid JSON: ${error.message}`);
  process.exit(1);
}

let state;
try {
  state = readJson(DEFAULT_ROOT, workflow.files.state);
} catch (error) {
  console.error(`${workflow.files.state} is not valid JSON: ${error.message}`);
  process.exit(1);
}

const errors = validateWorkflowRepository(DEFAULT_ROOT);
const require_ = (condition, message) => {
  if (!condition) errors.push(message);
};
const sha = /^[0-9a-f]{40}$/;

require_(state.schema_version === 2, "state schema_version must be 2");
require_(state.phase === workflow.phase, `state phase must be ${workflow.phase}`);
require_(
  ["ready", "blocked", "complete"].includes(state.status),
  `status "${state.status}" invalid`,
);
require_(
  ["claude", "codex", "devan"].includes(state.next_actor),
  `next_actor "${state.next_actor}" invalid`,
);
require_(
  state.legacy && typeof state.legacy === "object",
  "legacy key must be present as an object",
);
require_(
  Array.isArray(state.sections_history),
  "sections_history must be an array",
);
require_(
  state.section && typeof state.section === "object",
  "section must be an object",
);
for (const hash of [state.prev_actor_commit, state.last_green_commit]) {
  require_(
    hash === null || sha.test(hash),
    `commit hash "${hash}" is not null or a 40-character lowercase SHA`,
  );
}

if (errors.length) {
  console.error(
    `Phase 10 workflow validation failed (${errors.length} issue(s)):`,
  );
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(
  `Phase 10 workflow is valid: ${state.current_section} ${state.stage} ` +
    `status=${state.status} next_actor=${state.next_actor}; terminal=` +
    `§${workflow.managed_sections.terminal}.`,
);
