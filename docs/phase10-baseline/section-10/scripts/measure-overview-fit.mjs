// Phase 10 §9 review round 3 — Claude Lead independent live measurement.
//
// Measures, against a running production build at exactly 1440x900:
//   * every scene label's bounding rect (criterion 1 — all eight tags legible
//     at rest, fully inside the viewport)
//   * every planet's projected centre, radius and derived bounds (criterion 17
//     — no planet clipped by the viewport; criterion 18 — projected diameter)
//
// Planet geometry is read from the data-planet-center-x / data-planet-center-y /
// data-planet-radius-px attributes the render loop writes each frame, so the
// numbers come from the live three.js projection, not from the pure model.
//
// Usage: PHASE10_BASE_URL=http://127.0.0.1:3131/share node <this file>
import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const sampleCount = Number(process.env.PHASE10_SAMPLES ?? 24);
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error.message)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
await page.addInitScript(() => {
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
});
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(3_000);

const samples = [];
for (let index = 0; index < sampleCount; index += 1) {
  samples.push(
    await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      labels: [...document.querySelectorAll("[data-scene-ticker]")].map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          ticker: el.dataset.sceneTicker,
          hidden: el.hidden,
          text: el.textContent,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          planetCenterX: Number(el.dataset.planetCenterX),
          planetCenterY: Number(el.dataset.planetCenterY),
          planetRadiusPx: Number(el.dataset.planetRadiusPx),
        };
      }),
    })),
  );
  await page.waitForTimeout(500);
}

const aggregate = new Map();
for (const sample of samples) {
  for (const label of sample.labels) {
    const row = aggregate.get(label.ticker) ?? {
      ticker: label.ticker,
      labelMinLeft: Infinity,
      labelMinTop: Infinity,
      labelMaxRight: -Infinity,
      labelMaxBottom: -Infinity,
      planetMinLeft: Infinity,
      planetMinTop: Infinity,
      planetMaxRight: -Infinity,
      planetMaxBottom: -Infinity,
      minDiameterPx: Infinity,
      maxDiameterPx: -Infinity,
      diameterSum: 0,
      hiddenCount: 0,
      texts: new Set(),
    };
    const diameter = label.planetRadiusPx * 2;
    row.labelMinLeft = Math.min(row.labelMinLeft, label.left);
    row.labelMinTop = Math.min(row.labelMinTop, label.top);
    row.labelMaxRight = Math.max(row.labelMaxRight, label.right);
    row.labelMaxBottom = Math.max(row.labelMaxBottom, label.bottom);
    row.planetMinLeft = Math.min(row.planetMinLeft, label.planetCenterX - label.planetRadiusPx);
    row.planetMinTop = Math.min(row.planetMinTop, label.planetCenterY - label.planetRadiusPx);
    row.planetMaxRight = Math.max(row.planetMaxRight, label.planetCenterX + label.planetRadiusPx);
    row.planetMaxBottom = Math.max(row.planetMaxBottom, label.planetCenterY + label.planetRadiusPx);
    row.minDiameterPx = Math.min(row.minDiameterPx, diameter);
    row.maxDiameterPx = Math.max(row.maxDiameterPx, diameter);
    row.diameterSum += diameter;
    if (label.hidden) row.hiddenCount += 1;
    row.texts.add(label.text);
    aggregate.set(label.ticker, row);
  }
}

const viewportWidth = samples[0].viewportWidth;
const viewportHeight = samples[0].viewportHeight;
const round = (value) => Number(value.toFixed(2));
const rows = [...aggregate.values()].map((row, index) => ({
  ticker: row.ticker,
  weightRank: index + 1,
  texts: [...row.texts],
  hiddenCount: row.hiddenCount,
  label: {
    minLeft: round(row.labelMinLeft),
    minTop: round(row.labelMinTop),
    maxRight: round(row.labelMaxRight),
    maxBottom: round(row.labelMaxBottom),
  },
  planet: {
    minLeft: round(row.planetMinLeft),
    minTop: round(row.planetMinTop),
    maxRight: round(row.planetMaxRight),
    maxBottom: round(row.planetMaxBottom),
  },
  projectedDiameterPx: {
    min: round(row.minDiameterPx),
    max: round(row.maxDiameterPx),
    mean: round(row.diameterSum / samples.length),
  },
  labelFullyInsideViewport:
    row.labelMinLeft >= 0 &&
    row.labelMinTop >= 0 &&
    row.labelMaxRight <= viewportWidth &&
    row.labelMaxBottom <= viewportHeight,
  planetFullyInsideViewport:
    row.planetMinLeft >= 0 &&
    row.planetMinTop >= 0 &&
    row.planetMaxRight <= viewportWidth &&
    row.planetMaxBottom <= viewportHeight,
}));

console.log(
  JSON.stringify(
    {
      url: base,
      viewport: { width: viewportWidth, height: viewportHeight },
      sampleCount: samples.length,
      labelCount: rows.length,
      criterion1_allLabelsInsideViewport: rows.every((r) => r.labelFullyInsideViewport),
      criterion17_allPlanetsInsideViewport: rows.every((r) => r.planetFullyInsideViewport),
      criterion18_heaviestProjectedDiameterPx: rows[0]?.projectedDiameterPx.mean ?? null,
      criterion18_lightestProjectedDiameterPx: rows.at(-1)?.projectedDiameterPx.mean ?? null,
      anyLabelHidden: rows.some((r) => r.hiddenCount > 0),
      consoleErrors: errors,
      rows,
    },
    null,
    2,
  ),
);

await browser.close();
