/**
 * Phase 10 §7 Turn D measurement tool.
 *
 * Measures the SHIPPED production /share route (Portfolio Orrery entry) on
 * both required §2.3 profiles, against a real pre-§7 /share baseline server
 * (checked out at prev_actor_commit 799a124, before Turn C's wiring) running
 * on a separate port — not the isolated dev reference route.
 *
 *   PHASE10_BASE_URL=http://localhost:3100 \
 *   PHASE10_BASELINE_URL=http://localhost:3101 \
 *   node docs/phase10-spike-section-7/measure-share-turn-d.mjs
 *
 * /share is public; no owner session/cookie is used or required.
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROD_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";
const BASELINE_URL = process.env.PHASE10_BASELINE_URL ?? "http://localhost:3101";
const REPETITIONS = 5;
const FRAME_SAMPLES = 60;

const DESKTOP_PROFILE = { viewport: { width: 1440, height: 900 }, cpuThrottleRate: 2 };
const MOBILE_PROFILE = {
  ...devices["Moto G4"],
  cpuThrottleRate: 4,
  network: {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  },
};

async function sampleFrames(page, count = FRAME_SAMPLES) {
  return page.evaluate(
    (n) =>
      new Promise((resolveFrames) => {
        const values = [];
        let previous = performance.now();
        const tick = (now) => {
          values.push(now - previous);
          previous = now;
          if (values.length < n + 1) requestAnimationFrame(tick);
          else resolveFrames(values.slice(1));
        };
        requestAnimationFrame(tick);
      }),
    count,
  );
}

function heapFrom(metrics) {
  return metrics.metrics.find((m) => m.name === "JSHeapUsedSize")?.value ?? null;
}

async function clickFirstHoldingAndSettle(page) {
  const started = performance.now();
  const firstHolding = page.locator("[data-holding]").first();
  const ticker = await firstHolding.getAttribute("data-holding");
  await firstHolding.click();
  await page.waitForFunction(
    () => document.activeElement?.id === "orrery-inspector-heading",
    { timeout: 5000 },
  );
  await page.waitForTimeout(900);
  return { ms: performance.now() - started, ticker };
}

async function measureDesktopRun(browser, baseUrl, run) {
  const context = await browser.newContext({ viewport: DESKTOP_PROFILE.viewport });
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
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: DESKTOP_PROFILE.cpuThrottleRate });
  await page.addInitScript(() => {
    window.__phase10LongTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__phase10LongTasks.push({ startTime: entry.startTime, duration: entry.duration });
      }
    }).observe({ entryTypes: ["longtask"] });
  });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  const started = performance.now();
  await page.goto(`${baseUrl}/share`, { waitUntil: "networkidle" });
  const wallLoadMs = performance.now() - started;
  await page.waitForTimeout(2500); // clear entrance overlay window
  const settledHeap = heapFrom(await cdp.send("Performance.getMetrics"));
  const idleFrameDeltas = await sampleFrames(page);

  const hasHoldingLinks = (await page.locator("[data-holding]").count()) > 0;
  let interaction = { ms: null, ticker: null };
  let transitionFrameDeltas = [];
  if (hasHoldingLinks) {
    const transitionFramesPromise = page.evaluate(() => {
      const frames = [];
      return new Promise((resolveFrames) => {
        const startTime = performance.now();
        const tick = (now) => {
          frames.push(now);
          if (now - startTime < 900) requestAnimationFrame(tick);
          else resolveFrames(frames.slice(1).map((f, i) => f - frames[i]));
        };
        requestAnimationFrame(tick);
      });
    });
    interaction = await clickFirstHoldingAndSettle(page);
    transitionFrameDeltas = await transitionFramesPromise;
  }

  const longTasks = await page.evaluate(() => window.__phase10LongTasks ?? []);
  const scripts = [...network.values()]
    .filter((r) => r.type === "Script")
    .map((r) => ({
      url: r.url,
      encodedDataLength: r.encodedDataLength,
      phase: domContentTimestamp !== null && r.timestamp > domContentTimestamp ? "post-dom-content" : "initial",
    }));

  await context.close();
  return {
    run,
    wallLoadMs,
    settledHeap,
    longTasks,
    longTaskOver50Count: longTasks.filter((t) => t.duration > 50).length,
    idleFrameDeltas,
    idleDroppedFrames: idleFrameDeltas.filter((d) => d > 33.4).length,
    transitionFrameDeltas,
    transitionFramesWithin33_4Ms:
      transitionFrameDeltas.length > 0
        ? transitionFrameDeltas.filter((d) => d <= 33.4).length / transitionFrameDeltas.length
        : null,
    interactionLatencyMs: interaction.ms,
    interactionTicker: interaction.ticker,
    scripts,
    consoleErrors,
  };
}

async function measureMobileRun(browser, baseUrl, run) {
  const context = await browser.newContext(MOBILE_PROFILE);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const requests = [];
  cdp.on("Network.requestWillBeSent", (event) => {
    requests.push({ url: event.request.url, type: event.type, timestamp: event.timestamp });
  });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", MOBILE_PROFILE.network);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: MOBILE_PROFILE.cpuThrottleRate });
  await cdp.send("Performance.enable");
  await page.addInitScript(() => {
    window.__phase10LongTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__phase10LongTasks.push({ startTime: entry.startTime, duration: entry.duration });
      }
    }).observe({ entryTypes: ["longtask"] });
  });

  const started = Date.now();
  await page.goto(`${baseUrl}/share`, { waitUntil: "networkidle" });
  const wallLoadMs = Date.now() - started;
  await page.waitForTimeout(500);
  const frameDeltas = await sampleFrames(page);
  const longTasks = await page.evaluate(() => window.__phase10LongTasks ?? []);
  const metrics = await cdp.send("Performance.getMetrics");
  const scripts = [...new Set(requests.filter((r) => r.type === "Script").map((r) => r.url))];
  const canvasCount = await page.locator("canvas").count();

  await context.close();
  return {
    run,
    wallLoadMs,
    longTasks,
    longTaskOver50Count: longTasks.filter((t) => t.duration > 50).length,
    frameDeltas,
    droppedFrames: frameDeltas.filter((d) => d > 33.4).length,
    scriptRequests: scripts,
    jsHeapUsedSize: heapFrom(metrics),
    canvasCount,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const output = { measuredAt: new Date().toISOString(), prodUrl: PROD_URL, baselineUrl: BASELINE_URL };
  try {
    output.desktop = { prod: [], baseline: [] };
    for (let run = 1; run <= REPETITIONS; run += 1) {
      output.desktop.prod.push(await measureDesktopRun(browser, PROD_URL, run));
    }
    for (let run = 1; run <= REPETITIONS; run += 1) {
      output.desktop.baseline.push(await measureDesktopRun(browser, BASELINE_URL, run));
    }
    output.mobile = { prod: [], baseline: [] };
    for (let run = 1; run <= REPETITIONS; run += 1) {
      output.mobile.prod.push(await measureMobileRun(browser, PROD_URL, run));
    }
    for (let run = 1; run <= REPETITIONS; run += 1) {
      output.mobile.baseline.push(await measureMobileRun(browser, BASELINE_URL, run));
    }

    // Repeated-selection leak check (production only; baseline has no holdings to select)
    const context = await browser.newContext({ viewport: DESKTOP_PROFILE.viewport });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Performance.enable");
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: DESKTOP_PROFILE.cpuThrottleRate });
    await page.goto(`${PROD_URL}/share`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    const tickers = await page.locator("[data-holding]").evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-holding")),
    );
    const leakCycles = [];
    for (let cycle = 1; cycle <= 4; cycle += 1) {
      for (const ticker of tickers) {
        await page.locator(`[data-holding="${ticker}"]`).click();
        await page.waitForFunction(
          () => document.activeElement?.id === "orrery-inspector-heading",
        );
      }
      await page.locator('[data-portfolio-sun]').click();
      await page.waitForTimeout(300);
      leakCycles.push({ cycle, jsHeapUsedSize: heapFrom(await cdp.send("Performance.getMetrics")) });
    }
    output.leakCycles = leakCycles;
    await context.close();
  } finally {
    await browser.close();
  }
  const outPath = resolve(HERE, "raw/share-turn-d.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
