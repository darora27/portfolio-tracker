import { chromium } from "playwright";
const base = process.env.PHASE10_BASE_URL;
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(()=>{window.localStorage.setItem("stock-market-universe-orientation-seen","true");});
await page.goto(base,{waitUntil:"networkidle"});
await page.locator("canvas").waitFor({state:"visible"});
await page.waitForTimeout(2000);
const mount = page.locator("[class*='sceneMount']");
const box = await page.locator("canvas").boundingBox();
// 1. pointer acquisition, 60 attempts, record what target IS hit
const hits={};
let ok=false;
for(let i=0;i<60&&!ok;i++){
  const p = await mount.evaluate(e=>({x:+e.dataset.evidenceSatelliteX,y:+e.dataset.evidenceSatelliteY,t:e.dataset.evidenceSatelliteTarget}));
  await page.mouse.move(box.x+p.x, box.y+p.y);
  const got = await mount.evaluate(e=>e.dataset.orreryTarget ?? "(none)");
  hits[got]=(hits[got]||0)+1;
  if(got===p.t) ok=true;
}
console.log("satellite pointer acquired:", ok);
console.log("targets hit while aiming at satellite:", JSON.stringify(hits));
// 2. same probe for the moon, as a control
const mhits={}; let mok=false;
for(let i=0;i<60&&!mok;i++){
  const p = await mount.evaluate(e=>({x:+e.dataset.evidenceMoonX,y:+e.dataset.evidenceMoonY,t:e.dataset.evidenceMoonTarget}));
  await page.mouse.move(box.x+p.x, box.y+p.y);
  const got = await mount.evaluate(e=>e.dataset.orreryTarget ?? "(none)");
  mhits[got]=(mhits[got]||0)+1;
  if(got===p.t) mok=true;
}
console.log("moon pointer acquired:", mok, JSON.stringify(mhits));
// 3. keyboard reachability: is there a focusable control for the satellite?
console.log("=== focusable scene controls ===");
console.log(JSON.stringify(await page.evaluate(()=>{
  const els=[...document.querySelectorAll('[data-orrery-control],[data-holding],[data-scene-target],button,a')]
    .filter(e=>e.tabIndex>=0);
  return els.map(e=>({tag:e.tagName,d:JSON.stringify(Object.fromEntries(Object.entries(e.dataset).slice(0,3))),label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,45)}))
    .filter(e=>/satellite|hazard|moon|sun|portfolio/i.test(e.d+e.label));
}),null,1));
await browser.close();
