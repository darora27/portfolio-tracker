/**
 * Claude Lead Turn D independent re-verification of Finding 4.
 * The first straight-order rerun (prod all 5, then baseline all 5) showed
 * the OPPOSITE direction from Codex's claimed regression, which raises an
 * order/thermal-drift confound. This interleaves prod/baseline runs to
 * cancel that out, and does more repetitions for a steadier median.
 */
import { chromium, devices } from "playwright";
import { writeFileSync } from "node:fs";

const PROD_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";
const BASELINE_URL = process.env.PHASE10_BASELINE_URL ?? "http://localhost:3101";
const REPETITIONS = 10;

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

async function measureMobileRun(browser, baseUrl, run, label) {
  const context = await browser.newContext(MOBILE_PROFILE);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", MOBILE_PROFILE.network);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: MOBILE_PROFILE.cpuThrottleRate });

  const started = Date.now();
  await page.goto(`${baseUrl}/share`, { waitUntil: "networkidle" });
  const wallLoadMs = Date.now() - started;
  const canvasCount = await page.locator("canvas").count();
  await context.close();
  return { label, run, wallLoadMs, canvasCount };
}

function median(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (let run = 1; run <= REPETITIONS; run += 1) {
      // Alternate which server goes first each round to cancel warm-up/thermal drift.
      if (run % 2 === 1) {
        results.push(await measureMobileRun(browser, PROD_URL, run, "prod"));
        results.push(await measureMobileRun(browser, BASELINE_URL, run, "baseline"));
      } else {
        results.push(await measureMobileRun(browser, BASELINE_URL, run, "baseline"));
        results.push(await measureMobileRun(browser, PROD_URL, run, "prod"));
      }
    }
  } finally {
    await browser.close();
  }
  const prodLoads = results.filter((r) => r.label === "prod").map((r) => r.wallLoadMs);
  const baselineLoads = results.filter((r) => r.label === "baseline").map((r) => r.wallLoadMs);
  const summary = {
    prodLoads,
    baselineLoads,
    prodMedian: median(prodLoads),
    baselineMedian: median(baselineLoads),
    deltaMedianMs: median(prodLoads) - median(baselineLoads),
  };
  console.log(JSON.stringify({ results, summary }, null, 2));
  writeFileSync(
    "docs/phase10-spike-section-7/raw/turn-d-claude-interleaved-mobile.json",
    JSON.stringify({ results, summary }, null, 2),
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
