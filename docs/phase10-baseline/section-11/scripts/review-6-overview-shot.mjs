// Review turn 6 — plain visual confirmation shot for F10/VIS-16 re-verification:
// does the corrected ring alpha/width still read as "subtle/atmospheric" rather
// than "uniform graph paper" (VIS-16's own non-uniformity clause)?
import { chromium } from "playwright";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3200";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await context.addInitScript(() => {
  try {
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
    window.localStorage.setItem("stock-market-universe-legend-seen", "true");
  } catch {}
});
const page = await context.newPage();
await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 });
await page.waitForTimeout(1800);
await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-6-overview-ring-check.png" });
await browser.close();
console.log("done");
