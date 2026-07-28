#!/usr/bin/env node
import {
  existsSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";
import {
  DEFAULT_ROOT,
  parseSectionNumber,
  readJson,
  validateAcceptanceLedger,
  WORKFLOW_PATH,
} from "./phase10-workflow-lib.mjs";

function usage() {
  console.log(`Usage:
  node scripts/phase10-acceptance.mjs new --section N --spec PATH
  node scripts/phase10-acceptance.mjs check PATH [--require implementer|reviewer]
  node scripts/phase10-acceptance.mjs status PATH

The "new" command creates a deliberately incomplete ledger. The lead must
replace the example criterion with every concrete criterion from the section
spec before the state may leave "specify".`);
}

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function readLedger(path) {
  return JSON.parse(readFileSync(resolve(DEFAULT_ROOT, path), "utf8"));
}

const workflow = readJson(DEFAULT_ROOT, WORKFLOW_PATH);
const command = process.argv[2];

if (!command || ["-h", "--help"].includes(command)) {
  usage();
  process.exit(command ? 0 : 2);
}

if (command === "new") {
  const rawSection = option("--section");
  const sectionNumber = Number(rawSection?.replace(/^§/, ""));
  const specDoc = option("--spec");
  if (
    !Number.isInteger(sectionNumber) ||
    sectionNumber < workflow.managed_sections.first ||
    sectionNumber > workflow.managed_sections.terminal ||
    !specDoc
  ) {
    console.error(
      `--section must be within §${workflow.managed_sections.first}–§${workflow.managed_sections.terminal}, and --spec is required.`,
    );
    usage();
    process.exit(2);
  }
  const expectedSpecDoc =
    workflow.acceptance_ledger.spec_path_pattern.replace(
      "{N}",
      String(sectionNumber),
    );
  if (specDoc !== expectedSpecDoc) {
    console.error(`--spec must be the canonical path ${expectedSpecDoc}.`);
    process.exit(2);
  }
  const absoluteSpecDoc = resolve(DEFAULT_ROOT, specDoc);
  if (!existsSync(absoluteSpecDoc) || !statSync(absoluteSpecDoc).isFile()) {
    console.error(`Specification ${specDoc} does not exist as a file.`);
    process.exit(1);
  }
  if (process.argv.includes("--output")) {
    console.error(
      "--output is not supported; ledgers use the canonical manifest path.",
    );
    process.exit(2);
  }
  const section = `§${sectionNumber}`;
  const pattern = workflow.acceptance_ledger.path_pattern;
  const output = pattern.replace("{N}", String(sectionNumber));
  const outputPath = resolve(DEFAULT_ROOT, output);
  if (existsSync(outputPath)) {
    console.error(`${output} already exists; refusing to overwrite it.`);
    process.exit(1);
  }
  const ledger = {
    schema_version: workflow.acceptance_ledger.schema_version,
    phase: workflow.phase,
    section,
    spec_doc: specDoc,
    candidate_sha: null,
    criteria: [
      {
        id: "REPLACE-001",
        dimension: "behavioral",
        risk: "high",
        description:
          "Replace this example with one entry for every concrete acceptance criterion.",
        verifier: {
          kind: "manual",
          command: null,
        },
        required_artifacts: [],
        implementer: {
          status: "not_run",
          evidence: [],
          notes: null,
        },
        reviewer: {
          status: "not_run",
          evidence: [],
          notes: null,
        },
      },
    ],
  };
  writeFileSync(outputPath, `${JSON.stringify(ledger, null, 2)}\n`);
  console.log(`Created ${output}. Replace the example criterion before validation.`);
  process.exit(0);
}

const ledgerPath = process.argv[3];
if (!ledgerPath) {
  usage();
  process.exit(2);
}
const ledger = readLedger(ledgerPath);

if (command === "check") {
  const requireActor = option("--require");
  if (
    requireActor !== null &&
    !["implementer", "reviewer"].includes(requireActor)
  ) {
    console.error("--require must be implementer or reviewer.");
    process.exit(2);
  }
  const errors = validateAcceptanceLedger(workflow, ledger, {
    requireActor: requireActor ?? undefined,
  });
  if (
    Array.isArray(ledger.criteria) &&
    ledger.criteria.some((criterion) => criterion?.id === "REPLACE-001")
  ) {
    errors.push("replace the template criterion REPLACE-001");
  }
  if (errors.length) {
    console.error(`${ledgerPath} failed validation (${errors.length} issue(s)):`);
    for (const error of errors) console.error(` - ${error}`);
    process.exit(1);
  }
  console.log(`${ledgerPath} is valid${requireActor ? ` for ${requireActor}` : ""}.`);
  process.exit(0);
}

if (command === "status") {
  const counts = {};
  const criteria = Array.isArray(ledger.criteria) ? ledger.criteria : [];
  for (const actor of ["implementer", "reviewer"]) {
    counts[actor] = {};
    for (const criterion of criteria) {
      const status = criterion?.[actor]?.status ?? "missing";
      counts[actor][status] = (counts[actor][status] ?? 0) + 1;
    }
  }
  console.log(
    `${ledger.section} acceptance ledger (${criteria.length} criteria)`,
  );
  console.log(`candidate_sha=${ledger.candidate_sha ?? "not recorded"}`);
  for (const actor of ["implementer", "reviewer"]) {
    const summary = Object.entries(counts[actor])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([status, count]) => `${status}=${count}`)
      .join(" ");
    console.log(`${actor}: ${summary || "no criteria"}`);
  }
  process.exit(parseSectionNumber(ledger.section) === null ? 1 : 0);
}

usage();
process.exit(2);
