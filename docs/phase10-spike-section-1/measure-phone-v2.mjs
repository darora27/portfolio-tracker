// TEMPORARY. Phase 10 §1 refiner remediation (round 2) for the Codex
// Acceptance engineering-reliability finding: the CSS 3D route failed its
// declared 0-long-task budget in every run, and the frame-stability script
// measured a different predicate than the one declared in the threshold
// table. Not part of the app, not referenced by package.json scripts, not
// run by npm test/build. Deleted after this pass; a copy is retained (not
// executed) at docs/phase10-spike-section-1/measure-phone-v2.mjs for
// independent review.
//
// Two corrections over the prior measure-phone.mjs:
//
// 1. Frame stability: collects exactly 60 requestAnimationFrame deltas
//    (not a variable 60-61 from a fixed 1000ms window) and retains every
//    raw delta in the output, so the declared predicate ("at least 55 of
//    60 samples at or below 16.7ms") can be recomputed exactly from the
//    retained data, instead of only retaining a differently-defined
//    "droppedFrames > 33.4ms" summary.
//
// 2. Long tasks: in addition to the whole-page long-task measurement (as
//    before), each route is also measured with NO auth cookie, which
//    renders only the pre-existing LoginForm fallback (near-zero
//    route-specific markup) through the exact same root layout / fonts /
//    DepthPullProvider / Next.js-React client runtime. This isolates how
//    much of the observed long-task time is caused by the compared 3D
//    implementation itself versus the shared app shell those routes
//    inherit regardless of content. See DECISION.md "Long-task root cause
//    and threshold correction" for why this matters and how it's read.
//
// Usage: OWNER_PASSWORD=<temp-local-only-value> node scripts/tmp-phase10-measure-phone-v2.mjs
// Requires a production server already running at http://localhost:3100
// and playwright installed as a temporary, unsaved dev dependency.

import { chromium, devices } from "playwright";
import crypto from "node:crypto";
import { writeFileSync } from "node:fs";

const BASE_URL = "http://localhost:3100";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
if (!OWNER_PASSWORD) {
  throw new Error("OWNER_PASSWORD must be set (temporary local-only value, not read from .env*)");
}
const SESSION_COOKIE_NAME = "owner_session";
const REPETITIONS = 5;
const FRAME_SAMPLE_COUNT = 60;
const FRAME_BUDGET_MS = 16.7;

function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}

const PHONE_PROFILE = {
  ...devices["Moto G4"],
  cpuThrottleRate: 4,
  network: {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
    uploadThroughput: (750 * 1024) / 8, // 750 Kbps
    latency: 150, // ms RTT
  },
};

async function withThrottledPage(context, fn) {
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", PHONE_PROFILE.network);
  await client.send("Emulation.setCPUThrottlingRate", { rate: PHONE_PROFILE.cpuThrottleRate });
  await client.send("Performance.enable");
  try {
    return await fn(page, client);
  } finally {
    await page.close();
  }
}

async function measureLoad(page, client, url, { expectCanvas = false } = {}) {
  await page.addInitScript(() => {
    window.__longTasks = [];
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__longTasks.push({ duration: entry.duration, startTime: entry.startTime });
        }
      });
      po.observe({ entryTypes: ["longtask"] });
    } catch {
      // longtask not supported; leave __longTasks empty
    }
  });

  const wallStart = Date.now();
  await page.goto(url, { waitUntil: "networkidle" });
  const wallLoadMs = Date.now() - wallStart;

  const nav = await page.evaluate(() => {
    const [entry] = performance.getEntriesByType("navigation");
    return entry
      ? {
          domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
          loadEventEnd: entry.loadEventEnd,
          duration: entry.duration,
        }
      : null;
  });

  const longTasks = await page.evaluate(() => window.__longTasks ?? []);

  await page.waitForTimeout(600);
  if (expectCanvas) {
    await page.waitForSelector("canvas", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(300);
  }

  // Collect exactly FRAME_SAMPLE_COUNT deltas (not a variable count from a
  // fixed wall-clock window), and return every raw delta so the declared
  // "at least 55 of 60 samples <= 16.7ms" predicate can be recomputed
  // exactly from retained data.
  const frameDeltas = await page.evaluate(
    (n) =>
      new Promise((resolve) => {
        const deltas = [];
        let last = performance.now();
        function tick(t) {
          deltas.push(t - last);
          last = t;
          if (deltas.length < n + 1) requestAnimationFrame(tick);
          else resolve(deltas.slice(1)); // drop the first delta (settle point, not a real frame gap)
        }
        requestAnimationFrame(tick);
      }),
    FRAME_SAMPLE_COUNT,
  );
  const avgFrameMs = frameDeltas.reduce((a, b) => a + b, 0) / (frameDeltas.length || 1);
  const maxFrameMs = frameDeltas.reduce((a, b) => Math.max(a, b), 0);
  const framesAtOrBelowBudget = frameDeltas.filter((d) => d <= FRAME_BUDGET_MS).length;
  const droppedFrames = frameDeltas.filter((d) => d > 33.4).length;

  const domMemory = await page.evaluate(() => {
    const m = performance.memory;
    return m ? { usedJSHeapSize: m.usedJSHeapSize, totalJSHeapSize: m.totalJSHeapSize } : null;
  });
  const { metrics: cdpMetrics } = await client.send("Performance.getMetrics");
  const cdpMemory = {
    JSHeapUsedSize: cdpMetrics.find((m) => m.name === "JSHeapUsedSize")?.value ?? null,
    JSHeapTotalSize: cdpMetrics.find((m) => m.name === "JSHeapTotalSize")?.value ?? null,
  };

  return {
    wallLoadMs,
    nav,
    longTaskCount: longTasks.length,
    longTaskTotalMs: longTasks.reduce((a, t) => a + t.duration, 0),
    frameSampleCount: frameDeltas.length,
    frameDeltas,
    avgFrameMs,
    maxFrameMs,
    framesAtOrBelowBudget,
    droppedFrames,
    domMemory,
    cdpMemory,
  };
}

async function measureInteraction(page) {
  const start = Date.now();
  await page.getByRole("link", { name: /Forces/ }).click();
  await page.waitForSelector('[aria-current="page"]');
  await page.waitForFunction(() => {
    const el = document.querySelector('[aria-current="page"]');
    return el && el.textContent && /02/.test(el.textContent);
  });
  return Date.now() - start;
}

async function measureRoute(browser, path, { expectCanvas = false, authenticated = true } = {}) {
  const runs = [];
  for (let i = 0; i < REPETITIONS; i++) {
    const context = await browser.newContext({
      ...PHONE_PROFILE,
    });
    if (authenticated) {
      await context.addCookies([
        {
          name: SESSION_COOKIE_NAME,
          value: sessionToken(OWNER_PASSWORD),
          domain: "localhost",
          path: "/",
        },
      ]);
    }
    const result = await withThrottledPage(context, async (page, client) => {
      const load = await measureLoad(page, client, `${BASE_URL}${path}`, { expectCanvas });
      const interactionMs = authenticated ? await measureInteraction(page) : null;
      return { load, interactionMs };
    });
    runs.push({ run: i + 1, ...result });
    await context.close();
  }
  return runs;
}

async function measureBundle() {
  const cssRes = await fetch(`${BASE_URL}/dev/phase10-spike-css`, {
    headers: { "Accept-Encoding": "gzip", Cookie: `${SESSION_COOKIE_NAME}=${sessionToken(OWNER_PASSWORD)}` },
  });
  await cssRes.arrayBuffer();
  const r3fRes = await fetch(`${BASE_URL}/dev/phase10-spike-r3f`, {
    headers: { "Accept-Encoding": "gzip", Cookie: `${SESSION_COOKIE_NAME}=${sessionToken(OWNER_PASSWORD)}` },
  });
  await r3fRes.arrayBuffer();
  return {
    note:
      "Route-chunk gzip wire bytes measured separately via curl (see DECISION.md); this fetch call only confirms both routes are reachable under the phone-profile session cookie.",
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    console.log("Measuring CSS 3D spike, authenticated (phone profile: Moto G4 + CPU 4x + Slow 4G)...");
    const css = await measureRoute(browser, "/dev/phase10-spike-css", { authenticated: true });
    console.log("Measuring CSS 3D spike, UNAUTHENTICATED shared-shell baseline...");
    const cssBaseline = await measureRoute(browser, "/dev/phase10-spike-css", { authenticated: false });
    console.log("Measuring R3F spike, authenticated (phone profile: Moto G4 + CPU 4x + Slow 4G)...");
    const r3f = await measureRoute(browser, "/dev/phase10-spike-r3f", { expectCanvas: true, authenticated: true });
    console.log("Measuring R3F spike, UNAUTHENTICATED shared-shell baseline...");
    const r3fBaseline = await measureRoute(browser, "/dev/phase10-spike-r3f", { authenticated: false });
    const bundleCheck = await measureBundle();

    const output = {
      measuredAt: new Date().toISOString(),
      phoneProfile: {
        device: "Moto G4 (Playwright built-in descriptor)",
        viewport: PHONE_PROFILE.viewport,
        deviceScaleFactor: PHONE_PROFILE.deviceScaleFactor,
        isMobile: PHONE_PROFILE.isMobile,
        hasTouch: PHONE_PROFILE.hasTouch,
        userAgent: PHONE_PROFILE.userAgent,
        cpuThrottleRate: PHONE_PROFILE.cpuThrottleRate,
        network: PHONE_PROFILE.network,
      },
      repetitions: REPETITIONS,
      frameSampleTarget: FRAME_SAMPLE_COUNT,
      frameBudgetMs: FRAME_BUDGET_MS,
      css,
      cssBaseline,
      r3f,
      r3fBaseline,
      bundleCheck,
    };

    writeFileSync(new URL("./tmp-phase10-phone-measurements-v2.json", import.meta.url), JSON.stringify(output, null, 2));
    console.log("Wrote scripts/tmp-phase10-phone-measurements-v2.json");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
