import { chromium } from "playwright";
const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3700";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
const page = await context.newPage();
await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
await page.locator("canvas").waitFor({ state: "visible", timeout: 20000 });
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20000 });
await page.waitForTimeout(1500);
const legendPresentFirstVisit = await page.evaluate(() => /SUN\s*=\s*WHOLE PORTFOLIO/i.test(document.body.innerText));
await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-8-legend-first-visit.png" });
await page.mouse.move(700, 400);
await page.mouse.click(700, 400);
await page.waitForTimeout(500);
const legendPresentAfterInteraction = await page.evaluate(() => /SUN\s*=\s*WHOLE PORTFOLIO/i.test(document.body.innerText));
console.log(JSON.stringify({ legendPresentFirstVisit, legendPresentAfterInteraction }));
await browser.close();
