// TEMPORARY. Phase 10 §1 final acceptance remediation for
// docs/phase10-reviews/2026-07-24-section-1-codex-acceptance-remediation-2.md.
//
// Codex rejected round 2's aggregate-duration baseline subtraction: it does
// not evaluate an individual 50ms task gate. This script does NOT subtract
// any baseline. It measures /dev/phase10-spike-css alone, on the phone
// profile (Moto G4 + CPU 4x + Slow 4G) already used throughout §1, and
// grades every individual longtask entry against the unchanged absolute
// 50ms boundary — the same predicate declared in round 1, before any
// baseline-differential language existed.
//
// The root cause (identified in round 2 and unchanged here) was that
// src/app/layout.tsx unconditionally wrapped every route in
// DepthPullProvider ("use client"), forcing client hydration on routes
// that never call useDepthPull/<DepthPull>. That has been fixed directly:
// DepthPullProvider now lives only in src/app/(depth-pull)/layout.tsx,
// applied only to /, /share, /dev/surface-scratch. This script exists to
// prove that fix at the measurement layer, not to work around it.
//
// For each of the 5 runs, retains: every longtask entry's duration,
// startTime, and attribution (containerType/containerSrc/containerId/
// containerName from the Long Tasks API), plus every performance
// resource-timing entry available at the moment of capture (name,
// startTime, responseEnd, transferSize) so a reviewer can independently
// correlate which script chunk was in flight when each long task ran.
//
// Not part of the app, not referenced by package.json scripts, not run by
// npm test/build. Deleted after this pass; retained (not executed) here
// for independent review.
//
// Usage: OWNER_PASSWORD=<temp-local-only-value> node docs/phase10-spike-section-1/measure-css-longtask-final.mjs
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
const LONG_TASK_BOUNDARY_MS = 50;

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

async function measureRun(browser, runIndex) {
  const context = await browser.newContext({ ...PHONE_PROFILE });
  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: sessionToken(OWNER_PASSWORD),
      domain: "localhost",
      path: "/",
    },
  ]);

  const result = await withThrottledPage(context, async (page) => {
    await page.addInitScript(() => {
      window.__longTasks = [];
      try {
        const po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
              attribution: (entry.attribution || []).map((a) => ({
                containerType: a.containerType,
                containerSrc: a.containerSrc,
                containerId: a.containerId,
                containerName: a.containerName,
              })),
            });
          }
        });
        po.observe({ entryTypes: ["longtask"] });
      } catch {
        // longtask not supported; leave __longTasks empty
      }
    });

    const wallStart = Date.now();
    await page.goto(`${BASE_URL}/dev/phase10-spike-css`, { waitUntil: "networkidle" });
    const wallLoadMs = Date.now() - wallStart;

    await page.waitForTimeout(600);

    const longTasks = await page.evaluate(() => window.__longTasks ?? []);
    const resources = await page.evaluate(() =>
      performance.getEntriesByType("resource").map((r) => ({
        name: r.name,
        startTime: r.startTime,
        responseEnd: r.responseEnd,
        transferSize: r.transferSize,
      })),
    );

    return { wallLoadMs, longTasks, resources };
  });

  await context.close();

  const maxTaskMs = result.longTasks.reduce((max, t) => Math.max(max, t.duration), 0);
  const tasksOverBoundary = result.longTasks.filter((t) => t.duration > LONG_TASK_BOUNDARY_MS);

  return {
    run: runIndex + 1,
    wallLoadMs: result.wallLoadMs,
    longTaskCount: result.longTasks.length,
    longTasks: result.longTasks,
    maxTaskMs,
    tasksOverBoundaryCount: tasksOverBoundary.length,
    pass: tasksOverBoundary.length === 0,
    // Resource timing entries overlapping each long task's [startTime, startTime+duration]
    // window, so attribution can be independently recomputed from raw data.
    correlatedResources: result.longTasks.map((t) => ({
      taskStartTime: t.startTime,
      taskDuration: t.duration,
      overlapping: result.resources
        .filter((r) => r.responseEnd >= t.startTime && r.startTime <= t.startTime + t.duration)
        .map((r) => ({ name: r.name, startTime: r.startTime, responseEnd: r.responseEnd, transferSize: r.transferSize })),
    })),
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    console.log(
      `Measuring /dev/phase10-spike-css, authenticated, ${REPETITIONS}x (phone profile: Moto G4 + CPU 4x + Slow 4G)...`,
    );
    const runs = [];
    for (let i = 0; i < REPETITIONS; i++) {
      const run = await measureRun(browser, i);
      console.log(
        `  run ${run.run}: ${run.longTaskCount} long task(s), max ${run.maxTaskMs.toFixed(1)}ms, ` +
          `${run.tasksOverBoundaryCount} over ${LONG_TASK_BOUNDARY_MS}ms — ${run.pass ? "PASS" : "FAIL"}`,
      );
      runs.push(run);
    }

    const allPass = runs.every((r) => r.pass);
    const output = {
      measuredAt: new Date().toISOString(),
      route: "/dev/phase10-spike-css",
      predicate: `every individual longtask entry duration <= ${LONG_TASK_BOUNDARY_MS}ms (absolute, no baseline subtraction)`,
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
      longTaskBoundaryMs: LONG_TASK_BOUNDARY_MS,
      overallResult: allPass ? "PASS" : "FAIL",
      runs,
    };

    writeFileSync(
      new URL("./raw/css-longtask-final.json", import.meta.url),
      JSON.stringify(output, null, 2),
    );
    console.log(`Overall: ${allPass ? "PASS" : "FAIL"}. Wrote docs/phase10-spike-section-1/raw/css-longtask-final.json`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
