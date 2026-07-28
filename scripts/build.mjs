import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

async function run(command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  const [code, signal] = await new Promise((resolve) => {
    child.once("exit", (exitCode, exitSignal) =>
      resolve([exitCode, exitSignal]),
    );
  });
  if (signal) {
    throw new Error(`${path.basename(command)} exited on ${signal}.`);
  }
  if (code !== 0) {
    process.exitCode = code ?? 1;
    return false;
  }
  return true;
}

const nextBin = path.resolve("node_modules/next/dist/bin/next");
if (!(await run(process.execPath, [nextBin, "build"]))) {
  process.exit();
}

const smokeArgs = [path.resolve("scripts/verify-share-route.mjs")];
if (
  process.argv.includes("--keep-server") ||
  existsSync("/private/tmp/portfolio-tracker-phase10-keep-server")
) {
  smokeArgs.push("--keep-server");
}
if (
  process.argv.includes("--run-section9-evidence") ||
  existsSync("/private/tmp/portfolio-tracker-phase10-run-evidence")
) {
  smokeArgs.push("--run-section9-evidence");
}
await run(process.execPath, smokeArgs);
