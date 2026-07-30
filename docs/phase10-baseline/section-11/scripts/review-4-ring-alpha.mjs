// §11 review turn 4 — VIS-16: orbital ring far-side visibility, sampled on
// at least two rings. No DOM signal exposes ring radius/opacity (rings are
// drawn in WebGL), so this locates the sun by the same warm-pixel scan as
// review-3-sun-ring-pixels.mjs, computes each sampled planet's orbital
// radius from its own on-screen position, and samples the pixel on the
// FAR side of that orbit (opposite the planet, same radius from the sun)
// against a further-out background-only reference point at the same
// bearing. If the ring is present at the floor alpha it must be visibly
// brighter than raw background at that far-side point.
import { chromium } from "playwright";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const OUT_PNG = path.resolve("docs/phase10-baseline/section-11/raw-review-4-ring-alpha.png");
const OUT_JSON = path.resolve("docs/phase10-baseline/section-11/raw-review-4-ring-alpha.json");

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
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const isWarmBright = ([r, g, b]) => r > 90 && r > b + 30 && r - b > 20 && r + g + b > 140;

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
const sunCenter = { x: (best.xStart + best.xEnd) / 2, y: best.y };

// Sample the two smallest-orbit planets (least likely to be occluded by UI
// chrome at their far side) plus the largest-orbit planet for spread.
const withOrbit = planetGeom.map((p) => ({
  ...p,
  orbitRadius: Math.hypot(p.x - sunCenter.x, p.y - sunCenter.y),
  angle: Math.atan2(p.y - sunCenter.y, p.x - sunCenter.x),
}));
withOrbit.sort((a, b) => a.orbitRadius - b.orbitRadius);
const sampled = [withOrbit[0], withOrbit[Math.floor(withOrbit.length / 2)]];

const measurements = sampled.map((p) => {
  const farAngle = p.angle + Math.PI; // opposite side of the same orbit
  const farX = sunCenter.x + p.orbitRadius * Math.cos(farAngle);
  const farY = sunCenter.y + p.orbitRadius * Math.sin(farAngle);
  // Reference background point further out along the same bearing, clear
  // of the ring band, to isolate ring contribution from ambient starfield.
  const refX = sunCenter.x + (p.orbitRadius + 40) * Math.cos(farAngle);
  const refY = sunCenter.y + (p.orbitRadius + 40) * Math.sin(farAngle);
  // Sample a small perpendicular cross-section to find the ring's peak
  // luminance near the expected radius (anti-aliasing / line width means
  // the exact pixel may be off by a few px).
  const perpAngle = farAngle + Math.PI / 2;
  let peakLum = -Infinity;
  let peakPixel = null;
  for (let d = -4; d <= 4; d += 1) {
    const sx = farX + d * Math.cos(perpAngle);
    const sy = farY + d * Math.sin(perpAngle);
    const px = at(sx, sy);
    const lum = luminance(px);
    if (lum > peakLum) {
      peakLum = lum;
      peakPixel = px;
    }
  }
  const refPixel = at(refX, refY);
  const refLum = luminance(refPixel);
  return {
    ticker: p.ticker,
    orbitRadiusPx: p.orbitRadius,
    farSidePoint: { x: farX, y: farY },
    farSidePeakPixel: peakPixel,
    farSidePeakLuminance: peakLum,
    referencePoint: { x: refX, y: refY },
    referencePixel: refPixel,
    referenceLuminance: refLum,
    ringVisibleAboveBackground: peakLum - refLum > 6,
    luminanceDelta: peakLum - refLum,
  };
});

const result = {
  viewport: { width, height },
  sunCenterEstimate: sunCenter,
  tokenPair: { note: "OVERVIEW_RING_ALPHA = { peak: 0.55, floor: 0.22 } — src/lib/observatory/scene-model.ts:20, confirmed by source read (this criterion also requires pixel evidence, provided below)" },
  measurements,
  allSampledRingsVisibleAboveBackground: measurements.every((m) => m.ringVisibleAboveBackground),
};
await writeFile(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
