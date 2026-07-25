/**
 * Phase 10 §7 Turn B measurement tool — intentionally not run by Codex Turn A.
 *
 * Measures the actual 1440×900 CSS and R3F scenes with CPU 2× throttling,
 * five fresh contexts, raw long tasks/frame deltas/network bytes, focus-to-
 * settle interaction latency, CDP heap, and the R3F 20-transition leak check.
 *
 *   OWNER_PASSWORD=<temporary-local-value> node docs/phase10-spike-section-7/measure-desktop.mjs
 *
 * Requires a production server and a temporary, unsaved Playwright install.
 */
import { chromium } from "playwright";
import crypto from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(HERE, "raw/desktop-scene.json");
const BASE_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
if (!OWNER_PASSWORD) throw new Error("OWNER_PASSWORD must be provided without reading .env*");

const REPETITIONS = 5;
const FRAME_SAMPLES = 60;
const SESSION_COOKIE_NAME = "owner_session";
const PROFILE = {
  viewport: { width: 1440, height: 900 },
  cpuThrottleRate: 2,
};
const ROUTES = {
  baseline: "/dev/observatory-shell?mode=public",
  css: "/dev/phase10-spike-css-world",
  r3f: "/dev/phase10-spike-r3f-world",
};

function sessionToken(password) {
  return crypto
    .createHmac("sha256", password)
    .update("portfolio-tracker-owner-session")
    .digest("hex");
}

async function sampleFrames(page) {
  return page.evaluate(
    (count) =>
      new Promise((resolveFrames) => {
        const values = [];
        let previous = performance.now();
        const tick = (now) => {
          values.push(now - previous);
          previous = now;
          if (values.length < count + 1) requestAnimationFrame(tick);
          else resolveFrames(values.slice(1));
        };
        requestAnimationFrame(tick);
      }),
    FRAME_SAMPLES,
  );
}

function heapFrom(metrics) {
  return metrics.metrics.find((metric) => metric.name === "JSHeapUsedSize")?.value ?? null;
}

async function clickChapterAndSettle(page, label) {
  const started = performance.now();
  await page.getByRole("link", { name: new RegExp(label, "i") }).click();
  await page.waitForFunction(
    (expected) =>
      document.activeElement?.tagName === "H2" &&
      document.activeElement.textContent?.trim() === expected,
    label,
  );
  await page.waitForTimeout(900);
  return performance.now() - started;
}

async function measureRun(browser, path, name) {
  const context = await browser.newContext({ viewport: PROFILE.viewport });
  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: sessionToken(OWNER_PASSWORD),
      domain: new URL(BASE_URL).hostname,
      path: "/",
    },
  ]);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const network = new Map();
  let domContentTimestamp = null;
  cdp.on("Network.requestWillBeSent", (event) => {
    network.set(event.requestId, {
      url: event.request.url,
      type: event.type,
      timestamp: event.timestamp,
      encodedDataLength: 0,
    });
  });
  cdp.on("Network.loadingFinished", (event) => {
    const request = network.get(event.requestId);
    if (request) request.encodedDataLength = event.encodedDataLength;
  });
  cdp.on("Page.domContentEventFired", (event) => {
    domContentTimestamp = event.timestamp;
  });
  await cdp.send("Network.enable");
  await cdp.send("Page.enable");
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: PROFILE.cpuThrottleRate });
  await page.addInitScript(() => {
    window.__phase10LongTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__phase10LongTasks.push({
          startTime: entry.startTime,
          duration: entry.duration,
        });
      }
    }).observe({ entryTypes: ["longtask"] });
  });

  const started = performance.now();
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
  const wallLoadMs = performance.now() - started;
  await page.waitForTimeout(2500);
  const settledHeap = heapFrom(await cdp.send("Performance.getMetrics"));
  const idleFrameDeltas = await sampleFrames(page);
  const transitionStart = await page.evaluate(() => performance.now());
  const interactionLatencyMs = await clickChapterAndSettle(page, "Forces");
  const transitionFrameDeltas = await page.evaluate(
    async (startTime) => {
      const frames = [];
      await new Promise((resolveFrames) => {
        const tick = (now) => {
          if (now >= startTime) frames.push(now);
          if (now - startTime < 900) requestAnimationFrame(tick);
          else resolveFrames();
        };
        requestAnimationFrame(tick);
      });
      return frames.slice(1).map((frame, index) => frame - frames[index]);
    },
    transitionStart,
  );
  const longTasks = await page.evaluate(() => window.__phase10LongTasks ?? []);

  const scripts = [...network.values()]
    .filter((request) => request.type === "Script")
    .map((request) => ({
      url: request.url,
      encodedDataLength: request.encodedDataLength,
      phase:
        domContentTimestamp !== null && request.timestamp > domContentTimestamp
          ? "post-dom-content"
          : "initial",
    }));

  const leakCycles = [];
  if (name === "r3f") {
    const sequence = ["Forces", "Structure", "Timeline", "Lab", "Pulse"];
    for (let cycle = 1; cycle <= 4; cycle += 1) {
      for (const label of sequence) await clickChapterAndSettle(page, label);
      leakCycles.push({
        cycle,
        jsHeapUsedSize: heapFrom(await cdp.send("Performance.getMetrics")),
      });
    }
  }

  const result = {
    wallLoadMs,
    settledHeap,
    longTasks,
    longTaskOver50Count: longTasks.filter((task) => task.duration > 50).length,
    idleFrameDeltas,
    idleDroppedFrames: idleFrameDeltas.filter((delta) => delta > 33.4).length,
    transitionFrameDeltas,
    transitionFramesWithin33_4Ms:
      transitionFrameDeltas.filter((delta) => delta <= 33.4).length /
      Math.max(1, transitionFrameDeltas.length),
    interactionLatencyMs,
    scripts,
    leakCycles,
  };
  await context.close();
  return result;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const output = {
    measuredAt: new Date().toISOString(),
    purpose: "desktop CSS/R3F scene comparison",
    baseUrl: BASE_URL,
    profile: {
      viewport: PROFILE.viewport,
      cpuThrottleRate: PROFILE.cpuThrottleRate,
      networkThrottling: "none",
    },
    repetitions: REPETITIONS,
    thresholds: {
      addedInitialGzipJsBytes: 50 * 1024,
      r3fLazyGzipJsBytes: 260 * 1024,
      wallLoadMs: 3000,
      addedLongTasksOver50Ms: 0,
      idleDroppedFramesOver33_4Ms: 0,
      transitionFramesWithin33_4MsRatio: 0.9,
      addedJsHeapBytes: 40 * 1024 * 1024,
      leakGrowthCycle1To4Bytes: 10 * 1024 * 1024,
      interactionLatencyMs: 900,
    },
    routes: {},
    r3fLazyChunkUrls: [],
  };
  try {
    for (const [name, path] of Object.entries(ROUTES)) {
      output.routes[name] = [];
      for (let run = 1; run <= REPETITIONS; run += 1) {
        output.routes[name].push({ run, ...(await measureRun(browser, path, name)) });
      }
    }
    const baselineScripts = new Set(
      output.routes.baseline.flatMap((run) => run.scripts.map((script) => script.url)),
    );
    const cssScripts = new Set(
      output.routes.css.flatMap((run) => run.scripts.map((script) => script.url)),
    );
    output.r3fLazyChunkUrls = [
      ...new Set(
        output.routes.r3f
          .flatMap((run) => run.scripts)
          .filter(
            (script) =>
              script.phase === "post-dom-content" &&
              !baselineScripts.has(script.url) &&
              !cssScripts.has(script.url),
          )
          .map((script) => script.url),
      ),
    ];
  } finally {
    await browser.close();
  }
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`Wrote ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
