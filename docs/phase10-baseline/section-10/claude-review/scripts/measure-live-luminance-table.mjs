import { chromium } from "playwright";
import sharp from "sharp";
const base = process.env.PHASE10_BASE_URL;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => { window.localStorage.setItem("stock-market-universe-orientation-seen","true"); });
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("canvas").waitFor({ state: "visible" });
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker][data-planet-center-x][data-planet-radius-px]").length === 8);
await page.waitForTimeout(1500);
const descriptors = await page.locator("[data-scene-ticker]").evaluateAll((ls) => ls.map((l) => ({
  ticker: l.dataset.sceneTicker, x: Number(l.dataset.planetCenterX), y: Number(l.dataset.planetCenterY), radius: Number(l.dataset.planetRadiusPx),
})));
const shot = await page.screenshot();
const meta = await sharp(shot).metadata();
function lin(v){const c=v/255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;}
const rows=[];
for (const d of descriptors) {
  const diameter = Math.max(12, Math.ceil(d.radius * 2.2));
  const left = Math.max(0, Math.min((meta.width??1440)-diameter, Math.round(d.x-diameter/2)));
  const top  = Math.max(0, Math.min((meta.height??900)-diameter, Math.round(d.y-diameter/2)));
  const input = await sharp(shot).extract({left,top,width:diameter,height:diameter}).resize(32,32,{fit:"fill"}).png().toBuffer();
  const raw = await sharp(input).removeAlpha().raw().toBuffer();
  const L=[];
  for(let y=11;y<=20;y+=1) for(let x=5;x<=26;x+=1){const o=(y*32+x)*3;L.push(0.2126*lin(raw[o])+0.7152*lin(raw[o+1])+0.0722*lin(raw[o+2]));}
  const mean=L.reduce((s,v)=>s+v,0)/L.length;
  rows.push({ticker:d.ticker,radiusPx:Number(d.radius.toFixed(2)),tilePx:diameter,equatorialMean:Number(mean.toFixed(4)),inWindow:mean>=0.16&&mean<=0.55});
}
console.table(rows);
console.log("FAIL:", rows.filter(r=>!r.inWindow).map(r=>`${r.ticker}=${r.equatorialMean}`).join(" ") || "none");
await browser.close();
