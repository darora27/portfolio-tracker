import { chromium } from "playwright";

// Diagnostic control for BLD-04-1: does a trivial page (no scene construction
// at all) still produce spurious >=50ms long tasks under 2x CPU throttle on
// this environment? If so, the noise is environmental, not app JS.
const html = `<!doctype html><html><body>
<canvas></canvas>
${Array.from({ length: 8 }, (_, i) => `<button data-scene-ticker="T${i}"></button>`).join("")}
</body></html>`;

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const results = [];
for (let run = 1; run <= 5; run += 1) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 2 });
  await page.addInitScript(() => {
    window.__longTasks = [];
    new PerformanceObserver((list) => {
      window.__longTasks.push(...list.getEntries().map((e) => ({ duration: e.duration, startTime: e.startTime })));
    }).observe({ type: "longtask", buffered: true });
  });
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length === 8);
  await page.waitForTimeout(5000);
  const entries = (await page.evaluate(() => window.__longTasks)) ?? [];
  const maximumMs = entries.reduce((m, e) => Math.max(m, e.duration), 0);
  results.push({ run, maximumMs, entries });
  console.log(JSON.stringify({ run, maximumMs, entries }));
  await context.close();
}
console.log("control maximumMs:", Math.max(...results.map((r) => r.maximumMs)));
await browser.close();
