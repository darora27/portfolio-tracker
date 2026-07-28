#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {
  tmpdir,
} from "node:os";
import {
  join,
} from "node:path";
import {
  renderActiveContext,
  validateAcceptanceLedger,
  validateWorkflowRepository,
} from "./phase10-workflow-lib.mjs";

const root = mkdtempSync(join(tmpdir(), "phase10-workflow-selftest-"));

function write(path, contents) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, contents);
}

const workflow = {
  schema_version: 1,
  phase: 10,
  managed_sections: { first: 2, terminal: 16 },
  files: {
    state: "PHASE10_STATE.json",
    roadmap: "PHASE10.md",
    active_context: "docs/phase10-workflow/ACTIVE_CONTEXT.md",
  },
  stages: {
    specify: { role: "claude_lead", next_actor: "claude" },
    implement: { role: "codex_implementation", next_actor: "codex" },
    review: { role: "claude_lead", next_actor: "claude" },
    remediate: { role: "codex_implementation", next_actor: "codex" },
    accept: { role: "claude_lead", next_actor: "claude" },
  },
  transitions: {
    specify_pass: "implement",
    implement_pass: "review",
    review_fail: "remediate",
    remediate_pass: "review",
    review_pass: "accept_and_advance",
    accept: "accept_and_advance",
  },
  verification: {
    implementation_candidate: ["npm test", "npm run build"],
    independent_final_review: ["npm test", "npm run build"],
    policy: "two independent gates",
  },
  acceptance_ledger: {
    schema_version: 1,
    required_from_section: 10,
    path_pattern: "docs/phase10-workflow/acceptance/section-{N}.json",
    spec_path_pattern: "docs/phase10-workflow/specs/section-{N}.md",
    dimensions: [
      "behavioral",
      "visual",
      "mobile",
      "accessibility",
      "tests",
      "build",
      "privacy",
    ],
    risks: ["critical", "high", "medium", "low"],
    statuses: [
      "not_run",
      "pass",
      "fail",
      "blocked",
      "deferred_to_reviewer",
      "not_applicable",
    ],
  },
  global_gates: [{ id: "G-TEST", rule: "fixture gate" }],
  context: {
    always_read: ["AGENTS.md", "PHASE10_STATE.json"],
    active_context_hash_sources: [
      "docs/PHASE10_AGENT_WORKFLOW.md",
      "docs/phase10-workflow/DESIGN_GATE.md",
    ],
    history_on_demand: ["PHASE10_PROGRESS.md"],
  },
  drift_checks: {
    roadmap_terminal_phrase: "After §{terminal} acceptance, report:",
    prompt_terminal_token: "workflow.managed_sections.terminal",
    operational_prompts: [
      "docs/phase10-workflow/prompts/claude-lead.md",
      "docs/phase10-workflow/prompts/codex-implementation.md",
    ],
  },
};

const state = {
  schema_version: 2,
  phase: 10,
  current_section: "§10",
  role: "claude_lead",
  stage: "specify",
  status: "ready",
  next_actor: "claude",
  section: {
    id: "§10",
    title: "Fixture",
    spec_doc: null,
    findings: [],
    direction_docs: ["DIRECTION.md"],
    handoff: "HANDOFF.md",
    note: "Known fixture condition.",
  },
  sections_history: [],
  prev_actor_commit: null,
  last_green_commit: null,
  stop_reason: null,
  legacy: {},
};

try {
  write(
    "docs/phase10-workflow/workflow.json",
    `${JSON.stringify(workflow, null, 2)}\n`,
  );
  write("PHASE10_STATE.json", `${JSON.stringify(state, null, 2)}\n`);
  write(
    "PHASE10.md",
    "# Fixture\n\n## §10. Fixture\n\n## §11. Next\n\n## §16. Final\n\nAfter §16 acceptance, report:\n",
  );
  write("AGENTS.md", "fixture\n");
  write("PHASE10_PROGRESS.md", "fixture\n");
  write("docs/PHASE10_AGENT_WORKFLOW.md", "fixture workflow\n");
  write("docs/phase10-workflow/DESIGN_GATE.md", "fixture design gate\n");
  write(
    "docs/phase10-workflow/prompts/claude-lead.md",
    "workflow.managed_sections.terminal\n",
  );
  write(
    "docs/phase10-workflow/prompts/codex-implementation.md",
    "workflow.managed_sections.terminal\n",
  );
  const active = renderActiveContext(root);
  write("docs/phase10-workflow/ACTIVE_CONTEXT.md", active);

  assert.match(active, /Current section: \*\*§10/);
  assert.match(active, /Managed range: §2–§16/);
  assert.match(active, /Known fixture condition/);
  assert.deepEqual(validateWorkflowRepository(root), []);

  write("docs/PHASE10_AGENT_WORKFLOW.md", "changed workflow\n");
  assert(
    validateWorkflowRepository(root).some((error) => error.includes("is stale")),
  );
  write("docs/PHASE10_AGENT_WORKFLOW.md", "fixture workflow\n");

  write(
    "PHASE10.md",
    "# Fixture\n\n## §10. Fixture\n\n## §15. Final\n\nAfter §15 acceptance, report:\n",
  );
  const driftErrors = validateWorkflowRepository(root);
  assert(driftErrors.some((error) => error.includes("terminal section")));
  assert(driftErrors.some((error) => error.includes("final-report marker")));
  assert(driftErrors.some((error) => error.includes("is stale")));
  write(
    "PHASE10.md",
    "# Fixture\n\n## §10. Fixture\n\n## §11. Next\n\n## §16. Final\n\nAfter §16 acceptance, report:\n",
  );
  write(
    "docs/phase10-workflow/ACTIVE_CONTEXT.md",
    renderActiveContext(root),
  );

  const ledger = {
    schema_version: 1,
    phase: 10,
    section: "§10",
    spec_doc: "docs/phase10-workflow/specs/section-10.md",
    candidate_sha: "a".repeat(40),
    criteria: [
      {
        id: "PRV-01",
        dimension: "privacy",
        risk: "critical",
        description: "Public payload contains no owner values.",
        verifier: { kind: "command", command: "npm test" },
        required_artifacts: ["privacy.json"],
        implementer: {
          status: "pass",
          evidence: ["privacy.json"],
          notes: null,
        },
        reviewer: {
          status: "pass",
          evidence: ["review-privacy.json"],
          notes: null,
        },
      },
    ],
  };
  assert.deepEqual(
    validateAcceptanceLedger(workflow, ledger, { requireActor: "reviewer" }),
    [],
  );

  const acceptedState = structuredClone(state);
  acceptedState.current_section = "§11";
  acceptedState.section = {
    id: "§11",
    title: "Next",
    spec_doc: null,
    findings: [],
    direction_docs: [],
    handoff: "HANDOFF-11.md",
    note: "Accepted-ledger fixture.",
  };
  acceptedState.sections_history = [
    {
      id: "§10",
      status: "complete",
      accepted_commit: "a".repeat(40),
      acceptance_ledger:
        "docs/phase10-workflow/acceptance/section-10.json",
    },
  ];
  write("docs/phase10-workflow/specs/section-10.md", "# Fixture spec\n");
  write(
    "docs/phase10-workflow/acceptance/section-10.json",
    `${JSON.stringify(ledger, null, 2)}\n`,
  );
  write("PHASE10_STATE.json", `${JSON.stringify(acceptedState, null, 2)}\n`);
  write(
    "docs/phase10-workflow/ACTIVE_CONTEXT.md",
    renderActiveContext(root),
  );
  assert.deepEqual(validateWorkflowRepository(root), []);

  const missingAcceptedLedgerState = structuredClone(acceptedState);
  delete missingAcceptedLedgerState.sections_history[0].acceptance_ledger;
  write(
    "PHASE10_STATE.json",
    `${JSON.stringify(missingAcceptedLedgerState, null, 2)}\n`,
  );
  write(
    "docs/phase10-workflow/ACTIVE_CONTEXT.md",
    renderActiveContext(root),
  );
  const missingAcceptedLedgerErrors = validateWorkflowRepository(root);
  assert(
    missingAcceptedLedgerErrors.some((error) =>
      error.includes("must retain acceptance_ledger"),
    ),
  );
  assert(
    missingAcceptedLedgerErrors.some((error) =>
      error.includes("accepted ledger (missing) does not exist"),
    ),
  );
  write("PHASE10_STATE.json", `${JSON.stringify(acceptedState, null, 2)}\n`);
  write(
    "docs/phase10-workflow/ACTIVE_CONTEXT.md",
    renderActiveContext(root),
  );

  const invalidAcceptedLedger = structuredClone(ledger);
  invalidAcceptedLedger.criteria[0].reviewer = {
    status: "not_run",
    evidence: [],
    notes: null,
  };
  write(
    "docs/phase10-workflow/acceptance/section-10.json",
    `${JSON.stringify(invalidAcceptedLedger, null, 2)}\n`,
  );
  assert(
    validateWorkflowRepository(root).some((error) =>
      error.includes("§10 accepted ledger"),
    ),
  );
  write(
    "docs/phase10-workflow/acceptance/section-10.json",
    `${JSON.stringify(ledger, null, 2)}\n`,
  );

  const deferredLedger = structuredClone(ledger);
  deferredLedger.criteria[0].implementer = {
    status: "deferred_to_reviewer",
    evidence: [],
    notes: "Requires the review actor's authenticated browser session.",
  };
  assert.deepEqual(
    validateAcceptanceLedger(workflow, deferredLedger, {
      requireActor: "implementer",
    }),
    [],
  );
  deferredLedger.criteria[0].reviewer = {
    status: "deferred_to_reviewer",
    evidence: [],
    notes: "A final reviewer cannot defer final acceptance.",
  };
  assert(
    validateAcceptanceLedger(workflow, deferredLedger, {
      requireActor: "reviewer",
    }).some((error) => error.includes("reviewer.status must be")),
  );

  ledger.criteria.push(structuredClone(ledger.criteria[0]));
  assert(
    validateAcceptanceLedger(workflow, ledger).some((error) =>
      error.includes("duplicated"),
    ),
  );

  const malformedLedger = structuredClone(ledger);
  malformedLedger.criteria = [null, { required_artifacts: "not-an-array" }];
  assert(
    validateAcceptanceLedger(workflow, malformedLedger).some((error) =>
      error.includes("must be an object"),
    ),
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("Phase 10 workflow self-test passed.");
