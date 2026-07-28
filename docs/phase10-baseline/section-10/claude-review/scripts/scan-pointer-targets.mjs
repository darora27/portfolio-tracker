import { chromium } from "playwright";
const base = process.env.PHASE10_BASE_URL;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(()=>{window.localStorage.setItem("stock-market-universe-orientation-seen","true");});
await page.goto(base,{waitUntil:"networkidle"});
await page.locator("canvas").waitFor({state:"visible"});
await page.waitForTimeout(2500);
const mount = page.locator("[class*='sceneMount']");
const box = await page.locator("canvas").boundingBox();
// find belt label screen positions from the DOM
const labels = await page.evaluate(()=>[...document.querySelectorAll("[data-belt-ticker],[data-scene-belt],[class*='beltLabel']")].map(e=>{const r=e.getBoundingClientRect();return {t:e.textContent.trim().slice(0,10),x:r.x+r.width/2,y:r.y+r.height/2};}));
console.log("belt label elements found:", JSON.stringify(labels));
// coarse scan of the whole viewport for belt-body targets
const found = {}; const seen = new Set();
for (let y = 60; y < 880; y += 22) {
  for (let x = 40; x < 1420; x += 22) {
    await page.mouse.move(box.x + x, box.y + y);
    const t = await mount.evaluate(e => e.dataset.orreryTarget ?? "");
    if (t) { seen.add(t); if (t.startsWith("belt-body:") && !found[t]) found[t] = {x,y}; }
  }
}
console.log("distinct pointer targets acquired in full-viewport scan:", JSON.stringify([...seen].sort()));
console.log("belt bodies acquired by pointer:", JSON.stringify(found));
await browser.close();
