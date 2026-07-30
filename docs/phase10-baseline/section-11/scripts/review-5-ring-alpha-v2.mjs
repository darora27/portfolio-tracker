// §11 review turn 5 — VIS-16, second pass. review-5-ring-alpha.mjs (v1)
// fixed the sun-center source (DOM signal instead of pixel estimation) but
// its ASML far-side reference point landed directly on the "GOOG" ticker
// label overlay (visually confirmed: /tmp/asml-region.png), producing a
// false-negative delta. This version samples a short arc of candidate
// points near the far side and near the reference radius instead of one
// exact point each, and uses the MEDIAN across those samples rather than a
// single point or single-window peak — a label is a narrow, localized
// outlier along the arc; the ring (if rendered) is present continuously
// around the circle at its floor alpha, so the median is robust to one
// contaminated sample while still reflecting what a viewer actually sees.
// Sun center still sourced from mount.dataset.evidenceSunX/Y (exact,
// existing render-loop signal — see review-5-ring-alpha.mjs header).
import { chromium } from "playwright";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100";
const OUT_PNG = path.resolve("docs/phase10-baseline/section-11/raw-review-5-ring-alpha-v2.png");
const OUT_JSON = path.resolve("docs/phase10-baseline/section-11/raw-review-5-ring-alpha-v2.json");

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); window.localStorage.setItem("stock-market-universe-legend-seen", "true"); } catch {} });
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

const sunCenter = await page.evaluate(() => {
  const mount = document.querySelector("[class*='sceneMount']");
  const x = Number(mount?.dataset.evidenceSunX);
  const y = Number(mount?.dataset.evidenceSunY);
  return { x, y };
});

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
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

// Only sample orbits whose far side stays within the canvas (excludes the
// largest orbit at this viewport if its far side would be clipped — a
// harness/geometry limit, not a scene defect; recorded per-planet below).
const withOrbit = planetGeom
  .map((p) => ({
    ...p,
    orbitRadius: Math.hypot(p.x - sunCenter.x, p.y - sunCenter.y),
    angle: Math.atan2(p.y - sunCenter.y, p.x - sunCenter.x),
  }))
  .map((p) => {
    const farAngle = p.angle + Math.PI;
    const farX = sunCenter.x + p.orbitRadius * Math.cos(farAngle);
    const farY = sunCenter.y + p.orbitRadius * Math.sin(farAngle);
    return { ...p, farAngle, farX, farY, onCanvas: farX > 20 && farX < width - 20 && farY > 20 && farY < height - 20 };
  });
withOrbit.sort((a, b) => a.orbitRadius - b.orbitRadius);
const onCanvasSorted = withOrbit.filter((p) => p.onCanvas);
const sampled = [onCanvasSorted[0], onCanvasSorted[onCanvasSorted.length - 1]].filter(Boolean);

const ARC_SAMPLES = 15; // +/- 14 degrees around the far side, 2deg steps
const arcLuminances = (centerAngle, radius) => {
  const out = [];
  for (let i = -Math.floor(ARC_SAMPLES / 2); i <= Math.floor(ARC_SAMPLES / 2); i += 1) {
    const a = centerAngle + (i * 2 * Math.PI) / 180;
    const x = sunCenter.x + radius * Math.cos(a);
    const y = sunCenter.y + radius * Math.sin(a);
    // small perpendicular window to catch anti-aliasing of the ring line
    let peak = -Infinity;
    const perp = a + Math.PI / 2;
    for (let d = -3; d <= 3; d += 1) {
      const sx = x + d * Math.cos(perp);
      const sy = y + d * Math.sin(perp);
      peak = Math.max(peak, luminance(at(sx, sy)));
    }
    out.push(peak);
  }
  return out;
};

const measurements = sampled.map((p) => {
  const farSamples = arcLuminances(p.farAngle, p.orbitRadius);
  const refSamples = arcLuminances(p.farAngle, p.orbitRadius + 40);
  const farMedian = median(farSamples);
  const refMedian = median(refSamples);
  return {
    ticker: p.ticker,
    orbitRadiusPx: p.orbitRadius,
    farSideCenterPoint: { x: p.farX, y: p.farY },
    farSideArcSamples: farSamples,
    farSideMedianLuminance: farMedian,
    referenceArcSamples: refSamples,
    referenceMedianLuminance: refMedian,
    ringVisibleAboveBackground: farMedian - refMedian > 6,
    luminanceDelta: farMedian - refMedian,
  };
});

const excludedOffCanvas = withOrbit.filter((p) => !p.onCanvas).map((p) => ({ ticker: p.ticker, orbitRadiusPx: p.orbitRadius, farPoint: { x: p.farX, y: p.farY }, reason: "far side falls outside the 1440x900 canvas at this sun position/orbit radius" }));

const result = {
  viewport: { width, height },
  sunCenterSource: "mount.dataset.evidenceSunX/evidenceSunY (existing render-loop DOM signal)",
  sunCenter,
  method: "median luminance over a 15-point, +/-14deg arc at the far-side radius vs. the same arc offset +40px further out, robust to a single label-text collision at one exact angle",
  tokenPair: { note: "OVERVIEW_RING_ALPHA = { peak: 0.55, floor: 0.22 } — src/lib/observatory/scene-model.ts:20" },
  measurements,
  excludedOffCanvas,
  allSampledRingsVisibleAboveBackground: measurements.length >= 2 && measurements.every((m) => m.ringVisibleAboveBackground),
};
await writeFile(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
