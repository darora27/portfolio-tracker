// §11 remediation — F10 (VIS-16). review-5-ring-alpha-v2.mjs assumed the
// overview projection of an orbit ring is a circle centered on the sun
// (farPoint = sunCenter + orbitRadiusPx * (cos(angle+pi), sin(angle+pi))),
// using the SAME screen-space radius as the planet's own (near-side)
// position. The overview camera is oblique (cameraForOverview: height ratio
// 0.82, depth ratio 1.62 of the outer planet radius -- an elevated,
// forward-offset camera, not a top-down orthographic one), so a ring lying
// flat in the XZ plane projects onto the screen as an ELLIPSE, not a
// circle. The near-side estimate is always correct by construction (it IS
// the planet's own projected position), but the far-side estimate, built
// from the same scalar radius 180 degrees around an assumed circle, drifts
// off the true ellipse and can miss the rendered ring band entirely.
// Confirmed directly: CBRS's assumed circular far point fell off-canvas at
// y=-68 (excluded by v2 as unmeasurable); its true camera-projected far
// point is on-canvas at y=124 -- a 192px error, far larger than the ring's
// own line width.
//
// This script reads a new render-loop DOM signal
// (planet.label.dataset.ringFarArc, OrreryScene.tsx) -- a short arc of
// EXACT 3D points on the planet's own ring, each run through the real
// camera projection matrix every frame. No circle assumed, no estimation.
// The arc (vs. one exact point) stays robust to a single ticker label
// overlapping one sample, same rationale review turn 5 already established
// for v2. The off-ring reference is a small FIXED screen-space offset (40px
// radially outward from the sun through each far-arc point), not a larger
// 3D-space radius: an earlier attempt at a 1.5x-radius 3D reference arc
// drifted across the scene's own radial background vignette for outer
// rings (CBRS), reading as signal unrelated to the ring. A 40px screen
// offset stays close enough to the true ring band to avoid the vignette
// while still comfortably clearing the ring's own ~1px line width.
import { chromium } from "playwright";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100";
const REF_OFFSET_PX = 40;
const OUT_PNG = path.resolve("docs/phase10-baseline/section-11/raw-remediation-f10-ring-farside.png");
const OUT_JSON = path.resolve("docs/phase10-baseline/section-11/raw-remediation-f10-ring-farside.json");

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
    farArc: JSON.parse(el.dataset.ringFarArc ?? "[]"),
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
const onCanvas = ([x, y]) => x > 20 && x < width - 20 && y > 20 && y < height - 20;
const refPoint = ([x, y]) => {
  const dx = x - sunCenter.x;
  const dy = y - sunCenter.y;
  const len = Math.hypot(dx, dy) || 1;
  return [x + (dx / len) * REF_OFFSET_PX, y + (dy / len) * REF_OFFSET_PX];
};

const withOrbit = planetGeom.map((p) => ({
  ...p,
  orbitRadiusPx: Math.hypot(p.x - sunCenter.x, p.y - sunCenter.y),
  farArcOnCanvas: p.farArc.length > 0 && p.farArc.every(onCanvas),
}));
withOrbit.sort((a, b) => a.orbitRadiusPx - b.orbitRadiusPx);
const onCanvasSorted = withOrbit.filter((p) => p.farArcOnCanvas);
const sampled = [onCanvasSorted[0], onCanvasSorted[onCanvasSorted.length - 1]].filter(Boolean);

const arcLuminances = (arc) => arc.map(([x, y]) => luminance(at(x, y)));

const measurements = sampled.map((p) => {
  const refArc = p.farArc.map(refPoint);
  const farSamples = arcLuminances(p.farArc);
  const refSamples = arcLuminances(refArc);
  const farMedian = median(farSamples);
  const refMedian = median(refSamples);
  return {
    ticker: p.ticker,
    orbitRadiusPx: p.orbitRadiusPx,
    ringFarArcScreen: p.farArc,
    ringRefArcScreen: refArc,
    farSideArcSamples: farSamples,
    farSideMedianLuminance: farMedian,
    referenceArcSamples: refSamples,
    referenceMedianLuminance: refMedian,
    ringVisibleAboveBackground: farMedian - refMedian > 6,
    luminanceDelta: farMedian - refMedian,
  };
});

const excludedOffCanvas = withOrbit.filter((p) => !p.farArcOnCanvas).map((p) => ({
  ticker: p.ticker,
  orbitRadiusPx: p.orbitRadiusPx,
  ringFarArcScreen: p.farArc,
  reason: "one or more projected far-arc points fall outside the 1440x900 canvas",
}));

const result = {
  viewport: { width, height },
  sunCenterSource: "mount.dataset.evidenceSunX/evidenceSunY (existing render-loop DOM signal)",
  sunCenter,
  method: `far-side arc sourced from the render loop's own camera projection (planet.label.dataset.ringFarArc, OrreryScene.tsx) -- 5 exact 3D points at +/-14deg (7deg steps) around each ring's true far side, run through the real (oblique) overview camera; no circle assumed. Reference is each far point offset ${REF_OFFSET_PX}px radially outward from the sun in screen space (fixed pixel offset, not a larger 3D radius, to avoid the background's own radial vignette). Median across the arc, same robustness rationale as review-5-ring-alpha-v2.mjs.`,
  tokenPair: { note: "OVERVIEW_RING_ALPHA — src/lib/observatory/scene-model.ts:20 (see value at measurement time in the accompanying handoff/review note)" },
  measurements,
  excludedOffCanvas,
  allSampledRingsVisibleAboveBackground: measurements.length >= 2 && measurements.every((m) => m.ringVisibleAboveBackground),
};
await writeFile(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
