import { chromium } from "playwright";

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
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20000 });
  await page.waitForTimeout(1500);

  const moonInfo = await page.evaluate(() => {
    const mount = document.querySelector("[data-scene-construction-stage]");
    return {
      target: mount?.dataset.evidenceMoonTarget ?? null,
      x: Number(mount?.dataset.evidenceMoonX),
      y: Number(mount?.dataset.evidenceMoonY),
    };
  });
  console.log("moonInfo", moonInfo);

  if (moonInfo.target) {
    await page.mouse.click(moonInfo.x, moonInfo.y);
    await page.waitForTimeout(2800);
    await page.screenshot({ path: "docs/phase10-baseline/section-13/review-scripts/out/moon-click-recheck.png" });
    const panelState = await page.evaluate(() => {
      const heading = document.getElementById("holding-news-title");
      const headlineLink = document.querySelector('[class*="planetNews"] a');
      return {
        newsHeadingPresent: !!heading,
        headlineText: headlineLink?.textContent ?? null,
        headlineHref: headlineLink?.getAttribute("href") ?? null,
      };
    });
    console.log("panelState", panelState);
  } else {
    console.log("No moon target found on this live data snapshot.");
  }
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
