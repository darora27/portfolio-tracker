import { chromium } from "playwright";
import { emit } from "../../lib/emit.mjs";

const CRITERION = "BLD-04";
const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";

// Readiness contract (pinned in docs/phase10-workflow/specs/section-11.md
// §11): the view is "ready" once the canvas is visible and all eight scene
// labels have been written by the render loop's first frame. Collection
// itself starts at navigation (the PerformanceObserver is installed via
// addInitScript before goto, buffered:true), so readiness does not gate
// collection — it gates how long we wait afterward before reading the
// buffer. A fixed 5000ms post-readiness window follows to catch trailing
// long tasks (shader compilation, deferred hydration).
async function waitForUniverseReady(page) {
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(
    () => document.querySelectorAll("[data-scene-ticker]").length === 8,
  );
}

let browser;
try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const runs = [];

  for (let run = 1; run <= 5; run += 1) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 2 });
    await page.addInitScript(() => {
      window.__phase10LongTasks = [];
      new PerformanceObserver((list) => {
        window.__phase10LongTasks.push(
          ...list.getEntries().map(({ duration, startTime, attribution }) => ({
            duration,
            startTime,
            attribution: attribution.map(
              ({ name, entryType, containerType, containerName, containerId }) => ({
                name,
                entryType,
                containerType,
                containerName,
                containerId,
              }),
            ),
          })),
        );
      }).observe({ type: "longtask", buffered: true });
    });
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await waitForUniverseReady(page);
    await page.waitForTimeout(5000);
    const entries = await page.evaluate(() => window.__phase10LongTasks);
    const maximumMs = entries.reduce(
      (maximum, entry) => Math.max(maximum, entry.duration),
      0,
    );
    runs.push({ run, maximumMs, entries });
    console.log(JSON.stringify({ run, maximumMs, entries }));
    await context.close();
  }

  const maximumMs = Math.max(...runs.map(({ maximumMs }) => maximumMs));
  const measured = {
    viewport: "1440x900",
    cpuThrottle: 2,
    freshContexts: 5,
    maximumMs,
    runs: runs.map(({ run, maximumMs: runMaximumMs }) => ({ run, maximumMs: runMaximumMs })),
  };
  emit(CRITERION, maximumMs < 50, measured);
} catch (error) {
  emit(CRITERION, false, null, error.message);
} finally {
  if (browser) await browser.close();
}
