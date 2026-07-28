#!/usr/bin/env node
import {
  readFileSync,
  writeFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";
import {
  DEFAULT_ROOT,
  readJson,
  renderActiveContext,
  WORKFLOW_PATH,
} from "./phase10-workflow-lib.mjs";

const args = new Set(process.argv.slice(2));
const workflow = readJson(DEFAULT_ROOT, WORKFLOW_PATH);
const outputPath = resolve(DEFAULT_ROOT, workflow.files.active_context);
const rendered = renderActiveContext(DEFAULT_ROOT);

if (args.has("--print")) {
  process.stdout.write(rendered);
  process.exit(0);
}

if (args.has("--check")) {
  let existing = "";
  try {
    existing = readFileSync(outputPath, "utf8");
  } catch {
    console.error(`${workflow.files.active_context} does not exist.`);
    process.exit(1);
  }
  if (existing !== rendered) {
    console.error(
      `${workflow.files.active_context} is stale. Run npm run phase10:context.`,
    );
    process.exit(1);
  }
  console.log(`${workflow.files.active_context} is current.`);
  process.exit(0);
}

writeFileSync(outputPath, rendered);
console.log(`Generated ${workflow.files.active_context}.`);
