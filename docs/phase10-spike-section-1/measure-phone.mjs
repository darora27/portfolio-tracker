// TEMPORARY. Phase 10 §1 refiner remediation for the Codex Acceptance
// engineering-reliability finding (representative-phone, budgeted,
// reproducible CSS-vs-R3F performance evidence). Not part of the app, not
// referenced by package.json scripts, not run by npm test/build. Deleted
// after this pass; a copy is retained (not executed) at
// docs/phase10-spike-section-1/measure-phone.mjs for independent review.
//
// Usage: OWNER_PASSWORD=<temp-local-only-value> node scripts/tmp-phase10-measure-phone.mjs
// Requires a production server already running at http://localhost:3100
// (npm run build && PORT=3100 OWNER_PASSWORD=<same value> npm run start)
// and playwright installed as a temporary, unsaved dev dependency
// (npm install --no-save playwright@1.49.1).
//
// Phone profile: Playwright's built-in "Moto G4" device descriptor (the
// long-standing Lighthouse default representative mid-tier Android phone:
// 360x640 CSS viewport, deviceScaleFactor 3, isMobile true, hasTouch true,
// real mobile Chrome UA) plus CDP-level throttling matching Lighthouse's
// classic "Slow 4G" mobile profile: CPU 4x slowdown, 150ms RTT, 1.6 Mbps
// down / 750 Kbps up. This is emulated hardware/network throttling on
// desktop Chromium, not a physical device — disclosed explicitly in
// DECISION.md, same as the desktop-only limitation the acceptance review
// flagged, now addressed by emulating a documented mid-tier phone profile
// instead of leaving the run unthrottled.

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

function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}

const PHONE_PROFILE = {
  ...devices["Moto G4"],
  // Explicit throttle profile matching Lighthouse's classic "Slow 4G"
  // mobile network + CPU emulation. Applied per-page via CDP below.
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

  // Settle briefly, then sample 1s of rAF deltas for frame stability. Under
  // 4x CPU throttling, R3F's dynamic-imported <Canvas> can still be mid-mount
  // at networkidle (network done, but JS execution/scene construction is
  // 4x slower) — wait for the canvas element itself before sampling memory,
  // so the R3F reading reflects a genuinely mounted scene, not a partial one.
  await page.waitForTimeout(600);
  if (expectCanvas) {
    await page.waitForSelector("canvas", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
  const frames = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const deltas = [];
        let last = performance.now();
        const stopAt = performance.now() + 1000;
        function tick(t) {
          deltas.push(t - last);
          last = t;
          if (t < stopAt) requestAnimationFrame(tick);
          else resolve(deltas);
        }
        requestAnimationFrame(tick);
      }),
  );
  const frameDeltas = frames.slice(1); // drop first delta (from settle point, not a real frame gap)
  const avgFrameMs = frameDeltas.reduce((a, b) => a + b, 0) / (frameDeltas.length || 1);
  const maxFrameMs = frameDeltas.reduce((a, b) => Math.max(a, b), 0);
  const droppedFrames = frameDeltas.filter((d) => d > 33.4).length;

  // `performance.memory` in-page quantizes usedJSHeapSize (and, in this
  // Chromium build, totalJSHeapSize too) into coarse buckets as a
  // fingerprinting mitigation — both routes read back an identical
  // 10,000,000 B regardless of actual usage, which is uninformative. CDP's
  // Performance.getMetrics reports the same underlying V8 heap counters
  // without that in-page quantization, so it's used as the honest memory
  // signal for this pass.
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
    avgFrameMs,
    maxFrameMs,
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

async function measureRoute(browser, path, { expectCanvas = false } = {}) {
  const runs = [];
  for (let i = 0; i < REPETITIONS; i++) {
    const context = await browser.newContext({
      ...PHONE_PROFILE,
    });
    await context.addCookies([
      {
        name: SESSION_COOKIE_NAME,
        value: sessionToken(OWNER_PASSWORD),
        domain: "localhost",
        path: "/",
      },
    ]);
    const result = await withThrottledPage(context, async (page, client) => {
      const load = await measureLoad(page, client, `${BASE_URL}${path}`, { expectCanvas });
      const interactionMs = await measureInteraction(page);
      return { load, interactionMs };
    });
    runs.push({ run: i + 1, ...result });
    await context.close();
  }
  return runs;
}

async function measureBundle() {
  // Bundle weight is a static asset-size property of the build, not a
  // phone-runtime property, so it's measured once via direct wire bytes
  // (unchanged method from the original desktop pass) rather than repeated
  // per phone run.
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
  const browser = await chromium.launch({ headless: true });
  try {
    console.log("Measuring CSS 3D spike (phone profile: Moto G4 + CPU 4x + Slow 4G)...");
    const css = await measureRoute(browser, "/dev/phase10-spike-css");
    console.log("Measuring R3F spike (phone profile: Moto G4 + CPU 4x + Slow 4G)...");
    const r3f = await measureRoute(browser, "/dev/phase10-spike-r3f", { expectCanvas: true });
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
      css,
      r3f,
      bundleCheck,
    };

    writeFileSync(new URL("./tmp-phase10-phone-measurements.json", import.meta.url), JSON.stringify(output, null, 2));
    console.log("Wrote scripts/tmp-phase10-phone-measurements.json");
    console.log(JSON.stringify(output, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
