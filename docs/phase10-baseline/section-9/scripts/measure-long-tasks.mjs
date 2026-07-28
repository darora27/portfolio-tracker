import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const browser = await chromium.launch({ headless: true });
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
        ...list.getEntries().map(({ duration, startTime }) => ({
          duration,
          startTime,
        })),
      );
    }).observe({ type: "longtask", buffered: true });
  });
  await page.goto(base, { waitUntil: "networkidle" });
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

console.log(JSON.stringify({
  viewport: "1440x900",
  cpuThrottle: 2,
  freshContexts: 5,
  maximumMs: Math.max(...runs.map(({ maximumMs }) => maximumMs),
}));
await browser.close();
