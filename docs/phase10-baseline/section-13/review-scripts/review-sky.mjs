import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE = "http://127.0.0.1:3100";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await context.addInitScript(() => {
    try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {}
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(2000);
  const check = await page.evaluate(() => {
    const vignette = document.querySelector('[class*="skyVignette"]');
    const starField = document.querySelector('[class*="starField"]');
    const starFieldBg = starField ? getComputedStyle(starField).backgroundImage : null;
    return {
      vignettePresent: !!vignette,
      starFieldBgHasGradientOnly: starFieldBg ? (starFieldBg.match(/gradient/g) || []).length : null,
      starFieldBg,
    };
  });
  const texResp = await page.request.get(`${BASE}/textures/nebula/filament.ktx2`);
  const texBody = await texResp.body();
  const result = {
    ...check,
    nebulaTextureStatus: texResp.status(),
    nebulaTextureSizeBytes: texBody.length,
  };
  console.log(JSON.stringify(result, null, 2));
  await writeFile(
    "docs/phase10-baseline/section-13/review-scripts/out/review-sky-check.json",
    `${JSON.stringify(result, null, 2)}\n`,
  );
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
