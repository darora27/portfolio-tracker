import { spawn } from "node:child_process";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Could not allocate a localhost port for the route smoke test.");
  }
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  return address.port;
}

async function stopServer(server) {
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    once(server, "exit"),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (server.exitCode === null) {
    server.kill("SIGKILL");
    await once(server, "exit");
  }
}

async function runEvidenceScript(origin, script, output) {
  const child = spawn(process.execPath, [path.resolve(script)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PHASE10_BASE_URL: `${origin}/share`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let raw = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      raw += chunk;
    });
  }
  const [code, signal] = await once(child, "exit");
  await writeFile(path.resolve(output), raw || "(no output)\n", "utf8");
  if (signal || code !== 0) {
    throw new Error(
      `${path.basename(script)} failed${signal ? ` on ${signal}` : ` with exit ${code}`}.`,
    );
  }
}

const port = await availablePort();
const nextBin = path.resolve("node_modules/next/dist/bin/next");
const server = spawn(
  process.execPath,
  [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let serverOutput = "";
for (const stream of [server.stdout, server.stderr]) {
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    serverOutput = `${serverOutput}${chunk}`.slice(-8_000);
  });
}

try {
  const origin = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 45_000;
  let ready = false;
  while (!ready && Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(
        `Production server exited before the route smoke test.\n${serverOutput}`,
      );
    }
    try {
      const response = await fetch(`${origin}/share`);
      await response.arrayBuffer();
      if (response.status !== 200) {
        throw new Error(`/share returned HTTP ${response.status}.`);
      }
      ready = true;
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.includes("fetch failed")
      ) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (!ready) {
    throw new Error(
      `Production server did not accept requests before the smoke-test timeout.\n${serverOutput}`,
    );
  }

  const stationResponse = await fetch(
    `${origin}/share?focus=portfolio&camera=command&station=manifest`,
  );
  await stationResponse.arrayBuffer();
  if (stationResponse.status !== 200) {
    throw new Error(
      `/share Mission Control manifest returned HTTP ${stationResponse.status}.`,
    );
  }

  console.log(
    "Share route smoke: PASS (/share 200; Mission Control manifest 200)",
  );
  if (process.argv.includes("--run-section9-evidence")) {
    await runEvidenceScript(
      origin,
      "docs/phase10-baseline/section-9/scripts/audit-live-interactions.mjs",
      "docs/phase10-baseline/section-9/raw-interaction-audit.txt",
    );
    await runEvidenceScript(
      origin,
      "docs/phase10-baseline/section-9/scripts/diagnose-live-scene.mjs",
      "docs/phase10-baseline/section-9/raw-live-scene-diagnostic.txt",
    );
    await runEvidenceScript(
      origin,
      "docs/phase10-baseline/section-9/scripts/measure-long-tasks.mjs",
      "docs/phase10-baseline/section-9/raw-long-task-output.txt",
    );
    await runEvidenceScript(
      origin,
      "docs/phase10-baseline/section-9/scripts/sample-live-rgb.mjs",
      "docs/phase10-baseline/section-9/raw-rgb-pixel-output.txt",
    );
    await runEvidenceScript(
      origin,
      "docs/phase10-baseline/section-9/scripts/capture-live-evidence.mjs",
      "docs/phase10-baseline/section-9/raw-capture-output.txt",
    );
    await runEvidenceScript(
      origin,
      "docs/phase10-baseline/section-9/scripts/capture-live-sphere-strip.mjs",
      "docs/phase10-baseline/section-9/raw-sphere-strip-output.txt",
    );
  }
  if (process.argv.includes("--keep-server")) {
    console.log(`PHASE10_BASE_URL=${origin}/share`);
    await new Promise((resolve) => {
      process.once("SIGINT", resolve);
      process.once("SIGTERM", resolve);
    });
  }
} finally {
  await stopServer(server);
}
