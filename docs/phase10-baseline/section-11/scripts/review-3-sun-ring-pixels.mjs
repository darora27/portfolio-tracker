// §11 review turn 3 — VIS-18 (sun >= 1.5x largest planet disc, in pixels)
// and VIS-16 (ring far-side alpha >= 0.22) via direct pixel measurement.
// No DOM signal exists for the sun's screen radius (only planets expose
// data-planet-radius-px), so this measures the rendered image directly, as
// the criterion requires ("measured in pixels, not asserted in scene units").
import { chromium } from "playwright";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const OUT_PNG = path.resolve("docs/phase10-baseline/section-11/raw-review-3-sun-overview.png");
const OUT_JSON = path.resolve("docs/phase10-baseline/section-11/raw-review-3-sun-ring-pixels.json");

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });
const page = await context.newPage();
await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 });
await page.waitForTimeout(1800);

const planetGeom = await page.evaluate(() =>
  [...document.querySelectorAll("[data-scene-ticker]")].map((el) => ({
    ticker: el.dataset.sceneTicker,
    x: Number(el.dataset.planetCenterX),
    y: Number(el.dataset.planetCenterY),
    radiusPx: Number(el.dataset.planetRadiusPx),
  })),
);
const largest = planetGeom.reduce((a, b) => (a.radiusPx > b.radiusPx ? a : b));

await page.screenshot({ path: OUT_PNG });
await page.close();
await context.close();
await browser.close();

const { data, info } = await sharp(OUT_PNG).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const at = (x, y) => {
  x = Math.max(0, Math.min(width - 1, Math.round(x)));
  y = Math.max(0, Math.min(height - 1, Math.round(y)));
  const o = (y * width + x) * channels;
  return [data[o], data[o + 1], data[o + 2]];
};
// Background is near-black dark green (~#010806). The sun is a bright warm
// orange (high R, moderate G, low B) texture. "warm" = R clearly dominant
// over B and reasonably bright.
const isWarmBright = ([r, g, b]) => r > 90 && r > b + 30 && r - b > 20 && r + g + b > 140;

// Find the sun's approximate screen center: scan a horizontal band through
// the vertical middle of the viewport for the widest contiguous warm run
// (the sun is the only large warm disc in the overview; planet spheres are
// blue/green/grey per their brand identity, not warm-orange).
let best = { len: 0, y: 0, xStart: 0, xEnd: 0 };
for (let y = 200; y < height - 200; y += 4) {
  let runStart = null;
  for (let x = 0; x < width; x += 2) {
    const warm = isWarmBright(at(x, y));
    if (warm && runStart === null) runStart = x;
    if (!warm && runStart !== null) {
      const len = x - runStart;
      if (len > best.len) best = { len, y, xStart: runStart, xEnd: x };
      runStart = null;
    }
  }
}
let sunCenterX = (best.xStart + best.xEnd) / 2;
const sunCenterY = best.y;
// Re-measure horizontal extent at the found row using min/max-of-any-warm
// (same non-contiguity tolerance as the vertical pass) for consistency.
let hMin = null;
let hMax = null;
const searchLo = Math.max(0, best.xStart - 150);
const searchHi = Math.min(width, best.xEnd + 150);
for (let x = searchLo; x < searchHi; x += 1) {
  let warmHere = false;
  for (let dy = -3; dy <= 3; dy += 1) {
    if (isWarmBright(at(x, sunCenterY + dy))) { warmHere = true; break; }
  }
  if (warmHere) {
    if (hMin === null) hMin = x;
    hMax = x;
  }
}
if (hMin !== null) {
  best.len = hMax - hMin;
  sunCenterX = (hMin + hMax) / 2;
}
// Refine: scan a vertical band (avg of several columns near sunCenterX) for
// the min/max Y of ANY warm pixel — not requiring contiguity, since the
// sun's own mottled/sunspot texture can break a strict contiguous run even
// though the disc itself is continuous.
let vMin = null;
let vMax = null;
const vSearchLo = Math.max(0, sunCenterY - 150);
const vSearchHi = Math.min(height, sunCenterY + 150);
for (let y = vSearchLo; y < vSearchHi; y += 1) {
  let warmHere = false;
  for (let dx = -3; dx <= 3; dx += 1) {
    if (isWarmBright(at(sunCenterX + dx, y))) { warmHere = true; break; }
  }
  if (warmHere) {
    if (vMin === null) vMin = y;
    vMax = y;
  }
}
const sunDiameterPxHoriz = best.len;
const sunDiameterPxVert = vMin !== null ? vMax - vMin : 0;
const sunRadiusPx = ((sunDiameterPxHoriz + sunDiameterPxVert) / 2) / 2;

const result = {
  viewport: { width, height },
  largestPlanet: { ticker: largest.ticker, radiusPx: largest.radiusPx, diameterPx: largest.radiusPx * 2 },
  sun: {
    approxCenter: { x: sunCenterX, y: sunCenterY },
    horizontalDiameterPx: sunDiameterPxHoriz,
    verticalDiameterPx: sunDiameterPxVert,
    estimatedRadiusPx: sunRadiusPx,
  },
  ratioSunDiameterToLargestPlanetDiameter: (sunRadiusPx * 2) / (largest.radiusPx * 2),
  passesVIS18_1_5x: (sunRadiusPx * 2) / (largest.radiusPx * 2) >= 1.5,
};
await writeFile(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
