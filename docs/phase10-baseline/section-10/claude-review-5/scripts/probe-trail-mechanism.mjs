// Round-5 review probe. TST-03 still aborts on NBIS after the owner-authorised
// trail-taper remediation (floor 0.45 -> 0.85). Round 4 attributed the failure
// to sub-pixel projected trail width at the outermost orbit. A 1.89x widening
// moved NBIS's sampled deltaE by 3.3 of 33, so that attribution needs testing.
//
// This probe measures, for every holding, the trail's brightest pixel anywhere
// in a wide window around the published sample point, the run of contiguous
// trail-coloured pixels across the ribbon (its projected width in device
// pixels), and the sample point's depth proxy (distance from the sun centre in
// screen space). If the ribbon is many pixels wide and still never reaches the
// model colour anywhere along it, partial coverage is not the mechanism.
//
// Measurement only. sample-live-rgb.mjs is unmodified and remains binding.
// Usage: PHASE10_BASE_URL=http://127.0.0.1:3141/share node <this file>
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const outDir = path.resolve("docs/phase10-baseline/section-10/claude-review-5");
await mkdir(outDir, { recursive: true });

const gainStops = ["#1f7a46", "#63ef98", "#a9ffcf"];
const lossStops = ["#ff9d97", "#ff665f", "#b3241d"];

const rgb = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};
const hex = (channels) =>
  `#${channels.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

function ramp(stops, amount) {
  if (amount === 0.5) return stops[1];
  const scaled = Math.min(1, Math.max(0, amount)) * 63;
  const index = Math.round(scaled);
  const position = index / 63;
  const segment = Math.min(stops.length - 2, Math.floor(position * 2));
  const local = position * 2 - segment;
  const left = rgb(stops[segment]);
  const right = rgb(stops[segment + 1]);
  return hex(left.map((c, o) => c + (right[o] - c) * local));
}

function rampForWeekly(weekly) {
  if (weekly === null || Math.abs(weekly) <= 0.002) return "#e3b65c";
  const magnitude = Math.min(0.12, Math.max(0.002, Math.abs(weekly)));
  return ramp(weekly > 0 ? gainStops : lossStops, (magnitude - 0.002) / (0.12 - 0.002));
}

const linear = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = (c) =>
  linear(c[0]) * 0.2126 + linear(c[1]) * 0.7152 + linear(c[2]) * 0.0722;

function lab(channels) {
  const [r, g, b] = channels.map(linear);
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
const deltaE = (l, r) => {
  const a = lab(l);
  const b = lab(r);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() =>
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true"),
);
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("canvas").waitFor({ state: "visible" });
await page.waitForFunction(
  () =>
    document.querySelectorAll(
      "[data-scene-ticker][data-trail-sample-x][data-weekly-return]",
    ).length === 8,
);
await page.waitForTimeout(1_200);

const descriptors = await page.locator("[data-scene-ticker]").evaluateAll((labels) =>
  labels.map((label) => ({
    ticker: label.dataset.sceneTicker,
    weekly:
      label.dataset.weeklyReturn === "null" ? null : Number(label.dataset.weeklyReturn),
    x: Number(label.dataset.trailSampleX),
    y: Number(label.dataset.trailSampleY),
    planetX: Number(label.dataset.planetCenterX),
    planetY: Number(label.dataset.planetCenterY),
    planetRadiusPx: Number(label.dataset.planetRadiusPx),
  })),
);

const shot = path.join(outDir, "trail-mechanism-overview.png");
await page.screenshot({ path: shot });
const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({
  resolveWithObject: true,
});
const at = (x, y) => {
  const sx = Math.max(0, Math.min(info.width - 1, Math.round(x)));
  const sy = Math.max(0, Math.min(info.height - 1, Math.round(y)));
  const offset = (sy * info.width + sx) * 3;
  return [data[offset], data[offset + 1], data[offset + 2]];
};

// The sun is the scene's centre of projection for orbit radius; take it from the
// mean of the eight published planet centres' orbital focus, which the overview
// places at the viewport centre-ish. Use the screen-space distance from that
// point as a depth/eccentricity proxy only.
const focusX = descriptors.reduce((s, d) => s + d.planetX, 0) / descriptors.length;
const focusY = descriptors.reduce((s, d) => s + d.planetY, 0) / descriptors.length;

const rows = descriptors.map((d) => {
  const expected = rampForWeekly(d.weekly);
  const expectedRgb = rgb(expected);
  const expectedLuminance = luminance(expectedRgb);

  // Widest search the probe will do: 40px box around the published sample point.
  let best = null;
  let brightest = null;
  for (let oy = -20; oy <= 20; oy += 1) {
    for (let ox = -20; ox <= 20; ox += 1) {
      const channels = at(d.x + ox, d.y + oy);
      const dE = deltaE(channels, expectedRgb);
      const lum = luminance(channels);
      if (!best || dE < best.deltaE) best = { ox, oy, channels, deltaE: dE, lum };
      if (!brightest || lum > brightest.lum) brightest = { ox, oy, channels, lum, deltaE: dE };
    }
  }

  // Projected ribbon width: walk perpendicular-ish in both axes from the sample
  // point, counting contiguous pixels whose luminance stays above 55% of the
  // local peak. Report the smaller of the two axis runs as the ribbon thickness.
  const runAlong = (dx, dy) => {
    const peak = luminance(at(d.x, d.y));
    const floor = Math.max(peak * 0.55, 0.0025);
    let count = 1;
    for (const sign of [1, -1]) {
      for (let step = 1; step <= 30; step += 1) {
        if (luminance(at(d.x + dx * step * sign, d.y + dy * step * sign)) < floor) break;
        count += 1;
      }
    }
    return count;
  };
  const runX = runAlong(1, 0);
  const runY = runAlong(0, 1);

  return {
    ticker: d.ticker,
    weekly: d.weekly,
    expected,
    expectedLuminance: Number(expectedLuminance.toFixed(6)),
    atSamplePoint: {
      hex: hex(at(d.x, d.y)),
      deltaE: Number(deltaE(at(d.x, d.y), expectedRgb).toFixed(3)),
      luminance: Number(luminance(at(d.x, d.y)).toFixed(6)),
    },
    bestWithin20px: {
      hex: hex(best.channels),
      deltaE: Number(best.deltaE.toFixed(3)),
      offset: [best.ox, best.oy],
    },
    brightestWithin20px: {
      hex: hex(brightest.channels),
      deltaE: Number(brightest.deltaE.toFixed(3)),
      luminance: Number(brightest.lum.toFixed(6)),
      offset: [brightest.ox, brightest.oy],
    },
    luminanceRatioToModel: Number(
      (luminance(at(d.x, d.y)) / expectedLuminance).toFixed(4),
    ),
    peakLuminanceRatioToModel: Number((brightest.lum / expectedLuminance).toFixed(4)),
    ribbonRunPx: { horizontal: runX, vertical: runY, thinnerAxis: Math.min(runX, runY) },
    screenGeometry: {
      samplePoint: [Number(d.x.toFixed(1)), Number(d.y.toFixed(1))],
      planetCentre: [Number(d.planetX.toFixed(1)), Number(d.planetY.toFixed(1))],
      planetRadiusPx: Number(d.planetRadiusPx.toFixed(1)),
      distanceFromSceneFocusPx: Number(
        Math.hypot(d.x - focusX, d.y - focusY).toFixed(1),
      ),
    },
  };
});

await browser.close();
const output = {
  base,
  viewport: "1440x900",
  note:
    "Review-only diagnostic for TST-03's remaining NBIS failure. Measures whether the sampled colour is limited by partial pixel coverage (a thin ribbon) or by an overall darkening of the ribbon itself (peak colour never reaches the model anywhere nearby).",
  sceneFocusPx: [Number(focusX.toFixed(1)), Number(focusY.toFixed(1))],
  rows,
};
await writeFile(
  path.join(outDir, "raw-trail-mechanism.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify(output, null, 2));
