#!/usr/bin/env node
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import {
  resolve,
} from "node:path";
import {
  execFileSync,
} from "node:child_process";
import {
  DEFAULT_ROOT,
  WORKFLOW_PATH,
  parseSectionNumber,
  readJson,
  validateWorkflowRepository,
} from "./phase10-workflow-lib.mjs";

const root = DEFAULT_ROOT;
const asJson = process.argv.slice(2).includes("--json");
const workflow = readJson(root, WORKFLOW_PATH);
const state = readJson(root, workflow.files.state);

function listFiles(relativeDirectory, predicate = () => true) {
  const absoluteDirectory = resolve(root, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return [];
  return readdirSync(absoluteDirectory)
    .filter((name) => predicate(name))
    .sort();
}

function sumFileStats(paths) {
  return [...new Set(paths)].reduce(
    (total, path) => {
      const absolute = resolve(root, path);
      if (!existsSync(absolute) || !statSync(absolute).isFile()) return total;
      const contents = readFileSync(absolute, "utf8");
      return {
        files: total.files + 1,
        bytes: total.bytes + Buffer.byteLength(contents),
        lines: total.lines + contents.split(/\r?\n/).length,
      };
    },
    { files: 0, bytes: 0, lines: 0 },
  );
}

const gitSubjects = execFileSync("git", ["log", "--format=%s"], {
  cwd: root,
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

const reviewRounds = {};
for (const subject of gitSubjects) {
  const match = /^phase10\(review §(\d+)\):\s+(fail|pass|blocked)/i.exec(subject);
  if (!match) continue;
  const section = Number(match[1]);
  reviewRounds[section] ??= { pass: 0, fail: 0, blocked: 0, total: 0 };
  const outcome = match[2].toLowerCase();
  reviewRounds[section][outcome] += 1;
  reviewRounds[section].total += 1;
}

const recurringPacket = sumFileStats([
  ...workflow.context.always_read,
  WORKFLOW_PATH,
]);
const workflowErrors = validateWorkflowRepository(root);
const acceptanceFiles = listFiles(
  workflow.files.acceptance_directory,
  (name) => /^section-\d+\.json$/.test(name),
);
const completedEligibleSections = (
  Array.isArray(state.sections_history) ? state.sections_history : []
).filter(
  (section) =>
    parseSectionNumber(section?.id) >=
    workflow.acceptance_ledger.required_from_section,
).length;
const highReviewSections = Object.entries(reviewRounds)
  .filter(([, counts]) => counts.total >= 3)
  .sort(([left], [right]) => Number(left) - Number(right))
  .map(([section, counts]) => ({ section: `§${section}`, ...counts }));

const report = {
  generated_at: new Date().toISOString(),
  workflow_valid: workflowErrors.length === 0,
  workflow_errors: workflowErrors,
  route: {
    section: state.current_section,
    stage: state.stage,
    role: state.role,
    status: state.status,
    next_actor: state.next_actor,
    terminal: `§${workflow.managed_sections.terminal}`,
  },
  recurring_packet: recurringPacket,
  artifacts: {
    specs: listFiles("docs/phase10-workflow/specs", (name) =>
      /^section-\d+\.md$/.test(name),
    ).length,
    handoffs: listFiles("docs/phase10-handoffs", (name) => name !== "TEMPLATE.md")
      .length,
    acceptance_ledgers: acceptanceFiles.length,
    completed_sections_requiring_ledgers: completedEligibleSections,
  },
  review_rounds: {
    by_section: reviewRounds,
    sections_with_three_or_more: highReviewSections,
  },
  verification: {
    policy: workflow.verification.policy,
    inherited_condition: state.section?.note ?? null,
    last_green_commit: state.last_green_commit ?? null,
  },
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(workflowErrors.length === 0 ? 0 : 1);
}

console.log("Phase 10 workflow report");
console.log(`  Valid: ${report.workflow_valid ? "yes" : "no"}`);
console.log(
  `  Route: ${state.current_section} ${state.stage} → ${state.next_actor} (${state.status})`,
);
console.log(`  Terminal: §${workflow.managed_sections.terminal}`);
console.log(
  `  Always-read packet: ${recurringPacket.files} files, ${recurringPacket.lines} lines, ${recurringPacket.bytes} bytes`,
);
console.log(
  `  Artifacts: ${report.artifacts.specs} specs, ${report.artifacts.handoffs} handoffs, ${report.artifacts.acceptance_ledgers} acceptance ledgers`,
);
if (highReviewSections.length) {
  console.log("  Review hotspots (3+ recorded review outcomes):");
  for (const counts of highReviewSections) {
    console.log(
      `    ${counts.section}: ${counts.total} total (${counts.pass} pass, ${counts.fail} fail, ${counts.blocked} blocked)`,
    );
  }
} else {
  console.log("  Review hotspots: none");
}
if (workflowErrors.length) {
  console.log("  Validation errors:");
  for (const error of workflowErrors) console.log(`    - ${error}`);
}

process.exit(workflowErrors.length === 0 ? 0 : 1);
