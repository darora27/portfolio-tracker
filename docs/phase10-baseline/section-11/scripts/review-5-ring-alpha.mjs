// §11 review turn 5 — VIS-16: orbital ring far-side visibility, sampled on
// at least two rings. review-4 (raw-review-4-ring-alpha.json) located the
// sun by a warm-pixel horizontal-run scan, which was accurate for the
// smallest-orbit planet but drifted enough at a larger orbit radius to miss
// the ring band entirely (the second sample read identical to background).
// This turn uses the render loop's own existing DOM signal instead of
// re-deriving sun position from pixels: OrreryScene already writes the
// sun's exact projected screen position to
// mount.dataset.evidenceSunX/evidenceSunY (.sceneMount) every frame for
// its own evidence purposes (see OrreryScene.tsx ~line 1924-1929). No new
// attribute was added — this is an existing signal, consistent with the
// project's readiness-signal convention (AGENTS.md / spec 11.1).
import { chromium } from "playwright";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100";
const OUT_PNG = path.resolve("docs/phase10-baseline/section-11/raw-review-5-ring-alpha.png");
const OUT_JSON = path.resolve("docs/phase10-baseline/section-11/raw-review-5-ring-alpha.json");

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

const sunFromDom = await page.evaluate(() => {
  const mount = document.querySelector("[class*='sceneMount']");
  if (!mount) return null;
  const x = Number(mount.dataset.evidenceSunX);
  const y = Number(mount.dataset.evidenceSunY);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
});

await page.screenshot({ path: OUT_PNG });
await page.close();
await context.close();
await browser.close();

if (!sunFromDom) {
  const failResult = {
    error: "mount.dataset.evidenceSunX/Y not found or non-finite — DOM signal unavailable this run",
  };
  await writeFile(OUT_JSON, `${JSON.stringify(failResult, null, 2)}\n`);
  console.log(JSON.stringify(failResult, null, 2));
  process.exit(1);
}

const { data, info } = await sharp(OUT_PNG).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const at = (x, y) => {
  x = Math.max(0, Math.min(width - 1, Math.round(x)));
  y = Math.max(0, Math.min(height - 1, Math.round(y)));
  const o = (y * width + x) * channels;
  return [data[o], data[o + 1], data[o + 2]];
};
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const sunCenter = sunFromDom;

// Sample the smallest-orbit and largest-orbit planets — maximum spread,
// the case review-4's estimation error was most likely to miss.
const withOrbit = planetGeom.map((p) => ({
  ...p,
  orbitRadius: Math.hypot(p.x - sunCenter.x, p.y - sunCenter.y),
  angle: Math.atan2(p.y - sunCenter.y, p.x - sunCenter.x),
}));
withOrbit.sort((a, b) => a.orbitRadius - b.orbitRadius);
const sampled = [withOrbit[0], withOrbit[withOrbit.length - 1]];

const measurements = sampled.map((p) => {
  const farAngle = p.angle + Math.PI;
  const farX = sunCenter.x + p.orbitRadius * Math.cos(farAngle);
  const farY = sunCenter.y + p.orbitRadius * Math.sin(farAngle);
  const refX = sunCenter.x + (p.orbitRadius + 40) * Math.cos(farAngle);
  const refY = sunCenter.y + (p.orbitRadius + 40) * Math.sin(farAngle);
  const perpAngle = farAngle + Math.PI / 2;
  let peakLum = -Infinity;
  let peakPixel = null;
  for (let d = -6; d <= 6; d += 1) {
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
  sunCenterSource: "mount.dataset.evidenceSunX/evidenceSunY (existing render-loop DOM signal, not pixel-estimated)",
  sunCenter,
  tokenPair: { note: "OVERVIEW_RING_ALPHA = { peak: 0.55, floor: 0.22 } — src/lib/observatory/scene-model.ts:20" },
  measurements,
  allSampledRingsVisibleAboveBackground: measurements.every((m) => m.ringVisibleAboveBackground),
};
await writeFile(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
