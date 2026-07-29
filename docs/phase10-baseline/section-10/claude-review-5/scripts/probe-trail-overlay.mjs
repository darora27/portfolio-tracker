import { chromium } from "playwright";
import sharp from "sharp";
const base = process.env.PHASE10_BASE_URL;
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox","--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => window.localStorage.setItem("stock-market-universe-orientation-seen","true"));
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("canvas").waitFor({ state: "visible" });
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker][data-trail-sample-x]").length === 8);
await page.waitForTimeout(1200);
const d = await page.locator('[data-scene-ticker="NBIS"]').evaluate(l => ({
  x: Number(l.dataset.trailSampleX), y: Number(l.dataset.trailSampleY) }));
// What DOM elements sit over the NBIS sample point, and what does the canvas itself hold there?
const stack = await page.evaluate(({x,y}) => {
  const els = document.elementsFromPoint(x, y);
  return els.slice(0, 8).map(e => {
    const s = getComputedStyle(e);
    return { tag: e.tagName, cls: (e.className && e.className.baseVal !== undefined ? e.className.baseVal : String(e.className||"")).slice(0,70),
      bg: s.backgroundColor, bgImage: s.backgroundImage.slice(0,90), opacity: s.opacity, mixBlend: s.mixBlendMode, filter: s.filter };
  });
}, d);
// Read the pixel straight out of the WebGL canvas, bypassing every DOM layer.
const canvasPixel = await page.evaluate(({x,y}) => {
  const c = document.querySelector("canvas");
  const r = c.getBoundingClientRect();
  const sx = Math.round((x - r.left) * (c.width / r.width));
  const sy = Math.round((y - r.top) * (c.height / r.height));
  const two = document.createElement("canvas");
  two.width = c.width; two.height = c.height;
  two.getContext("2d").drawImage(c, 0, 0);
  const p = two.getContext("2d").getImageData(sx, sy, 1, 1).data;
  return { sx, sy, rgba: [p[0],p[1],p[2],p[3]], canvasW: c.width, rectW: r.width, dpr: window.devicePixelRatio };
}, d);
const shipped = await page.screenshot();
const hidden = await page.evaluate(() => {
  const c = document.querySelector("canvas"); const keep = new Set();
  for (let n = c; n; n = n.parentElement) keep.add(n);
  let k = 0;
  for (const n of document.body.querySelectorAll("*")) {
    if (keep.has(n) || n.contains(c)) continue;
    if (getComputedStyle(n).display === "none") continue;
    n.style.setProperty("visibility","hidden","important"); k++;
  }
  return k;
});
await page.waitForTimeout(400);
const clean = await page.screenshot();
const px = async (buf) => {
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const o = (Math.round(d.y) * info.width + Math.round(d.x)) * 3;
  return `#${[data[o],data[o+1],data[o+2]].map(v=>v.toString(16).padStart(2,"0")).join("")}`;
};
console.log(JSON.stringify({ samplePoint: d, shippedPixel: await px(shipped), panelFreePixel: await px(clean),
  rawCanvasPixel: canvasPixel, overlaysHidden: hidden, domStackAtSamplePoint: stack }, null, 2));
await browser.close();
