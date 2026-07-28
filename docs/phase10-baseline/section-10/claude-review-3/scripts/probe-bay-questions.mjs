import { chromium } from "playwright";
const base = process.env.PHASE10_BASE_URL;
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); });
const out = {};
for (const station of ["plot","manifest","scope","hazard","signals","comms","log"]) {
  await page.goto(`${base}?focus=portfolio&camera=command&station=${station}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  out[station] = await page.evaluate(() => {
    const rows = [];
    for (const node of document.querySelectorAll("[class*='bayQuestion'], [class*='question']")) {
      const r = node.getBoundingClientRect();
      rows.push({ cls: node.className, text: (node.textContent??"").trim(), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return rows;
  });
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
