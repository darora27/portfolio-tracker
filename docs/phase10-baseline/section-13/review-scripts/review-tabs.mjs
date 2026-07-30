import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3100";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
    } catch {}
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[class*="missionControl"]', { timeout: 20000 });
  await page.waitForTimeout(1000);

  const result = await page.evaluate(() => {
    const navAnchors = [...document.querySelectorAll('[class*="missionControl"] nav a')];
    return navAnchors.map((el) => {
      const cs = getComputedStyle(el);
      return {
        text: el.textContent?.trim(),
        ariaCurrent: el.getAttribute("aria-current"),
        backgroundColor: cs.backgroundColor,
        borderBottomWidth: cs.borderBottomWidth,
        borderBottomColor: cs.borderBottomColor,
        borderBottomStyle: cs.borderBottomStyle,
        borderTopWidth: cs.borderTopWidth,
        borderTopColor: cs.borderTopColor,
        className: el.className,
      };
    });
  });
  console.log(JSON.stringify(result, null, 2));
  await page.screenshot({ path: "/tmp/review-tab-strip.png" });
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
