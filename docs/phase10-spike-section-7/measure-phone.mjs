/**
 * Phase 10 §7 Turn B measurement tool — intentionally not run by Codex Turn A.
 *
 * Confirms the mobile fallback only. It does not score the desktop WebGL
 * scene. Run against a production server:
 *
 *   OWNER_PASSWORD=<temporary-local-value> node docs/phase10-spike-section-7/measure-phone.mjs
 *
 * Requires a temporary, unsaved Playwright install. It never reads .env files.
 */
import { chromium, devices } from "playwright";
import crypto from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(HERE, "raw/mobile-fallback.json");
const DESKTOP_OUTPUT = resolve(HERE, "raw/desktop-scene.json");
const BASE_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
if (!OWNER_PASSWORD) throw new Error("OWNER_PASSWORD must be provided without reading .env*");

const REPETITIONS = 5;
const FRAME_SAMPLES = 60;
const SESSION_COOKIE_NAME = "owner_session";
const PROFILE = {
  ...devices["Moto G4"],
  cpuThrottleRate: 4,
  network: {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  },
};
const ROUTES = {
  baseline: "/dev/observatory-shell?mode=public&no3d=1",
  css: "/dev/phase10-spike-css-world?no3d=1",
  r3f: "/dev/phase10-spike-r3f-world?forceFail=1",
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

async function measureRun(browser, path, knownLazyChunkUrls) {
  const context = await browser.newContext(PROFILE);
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
  const requests = [];
  cdp.on("Network.requestWillBeSent", (event) => {
    requests.push({ url: event.request.url, type: event.type, timestamp: event.timestamp });
  });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", PROFILE.network);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: PROFILE.cpuThrottleRate });
  await cdp.send("Performance.enable");
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

  const started = Date.now();
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
  const wallLoadMs = Date.now() - started;
  await page.waitForTimeout(500);
  const frameDeltas = await sampleFrames(page);
  const longTasks = await page.evaluate(() => window.__phase10LongTasks ?? []);
  const metrics = await cdp.send("Performance.getMetrics");
  const scripts = requests.filter((request) => request.type === "Script").map((request) => request.url);
  const result = {
    wallLoadMs,
    longTasks,
    longTaskOver50Count: longTasks.filter((task) => task.duration > 50).length,
    frameDeltas,
    droppedFrames: frameDeltas.filter((delta) => delta > 33.4).length,
    scriptRequests: [...new Set(scripts)],
    knownR3fLazyChunkRequests: [...new Set(scripts)].filter((url) =>
      knownLazyChunkUrls.includes(url),
    ),
    jsHeapUsedSize:
      metrics.metrics.find((metric) => metric.name === "JSHeapUsedSize")?.value ?? null,
  };
  await context.close();
  return result;
}

async function main() {
  const knownLazyChunkUrls = existsSync(DESKTOP_OUTPUT)
    ? JSON.parse(readFileSync(DESKTOP_OUTPUT, "utf8")).r3fLazyChunkUrls ?? []
    : [];
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const output = {
    measuredAt: new Date().toISOString(),
    purpose: "mobile fallback confirmation only; never used to score the desktop scene",
    baseUrl: BASE_URL,
    profile: {
      device: "Moto G4 (Playwright descriptor)",
      viewport: PROFILE.viewport,
      deviceScaleFactor: PROFILE.deviceScaleFactor,
      isMobile: PROFILE.isMobile,
      hasTouch: PROFILE.hasTouch,
      cpuThrottleRate: PROFILE.cpuThrottleRate,
      network: PROFILE.network,
    },
    repetitions: REPETITIONS,
    thresholds: {
      lazyR3fChunkRequests: 0,
      wallLoadMs: 5000,
      addedLongTasksOver50Ms: 0,
      droppedFramesOver33_4Ms: 0,
    },
    knownLazyChunkUrls,
    routes: {},
  };
  try {
    for (const [name, path] of Object.entries(ROUTES)) {
      output.routes[name] = [];
      for (let run = 1; run <= REPETITIONS; run += 1) {
        output.routes[name].push({
          run,
          ...(await measureRun(browser, path, knownLazyChunkUrls)),
        });
      }
    }
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
