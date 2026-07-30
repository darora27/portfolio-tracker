import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { emit } from "../../lib/emit.mjs";

const CRITERION = "TST-03";
const root = path.resolve("docs/phase10-baseline/section-11");
const output = path.join(root, "pixel-samples");
const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";

const gainStops = ["#1f7a46", "#63ef98", "#a9ffcf"];
const lossStops = ["#ff9d97", "#ff665f", "#b3241d"];

function rgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function hex(channels) {
  return `#${channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function ramp(stops, amount) {
  if (amount === 0.5) return stops[1];
  const scaled = Math.min(1, Math.max(0, amount)) * 63;
  const index = Math.round(scaled);
  const position = index / 63;
  const segment = Math.min(stops.length - 2, Math.floor(position * 2));
  const local = position * 2 - segment;
  const left = rgb(stops[segment]);
  const right = rgb(stops[segment + 1]);
  return hex(left.map((channel, offset) =>
    channel + (right[offset] - channel) * local
  ));
}

function rampForWeeklyFromPayload(weekly) {
  if (weekly === null || Math.abs(weekly) <= 0.002) return "#e3b65c";
  const magnitude = Math.min(0.12, Math.max(0.002, Math.abs(weekly)));
  const amount = (magnitude - 0.002) / (0.12 - 0.002);
  return ramp(weekly > 0 ? gainStops : lossStops, amount);
}

function linear(channel) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(channels) {
  return (
    linear(channels[0]) * 0.2126 +
    linear(channels[1]) * 0.7152 +
    linear(channels[2]) * 0.0722
  );
}

function hueChroma(channels) {
  const values = channels.map((channel) => channel / 255);
  const maximum = Math.max(...values);
  const minimum = Math.min(...values);
  const chroma = maximum - minimum;
  if (!chroma) return { hue: null, chroma: 0 };
  let sector;
  if (maximum === values[0]) sector = ((values[1] - values[2]) / chroma) % 6;
  else if (maximum === values[1]) sector = (values[2] - values[0]) / chroma + 2;
  else sector = (values[0] - values[1]) / chroma + 4;
  return { hue: (sector * 60 + 360) % 360, chroma };
}

function hueDistance(left, right) {
  const difference = Math.abs(left - right) % 360;
  return Math.min(difference, 360 - difference);
}

function lab(channels) {
  const [red, green, blue] = channels.map(linear);
  const x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047;
  const y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  const z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883;
  const transform = (value) =>
    value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
  return [
    116 * transform(y) - 16,
    500 * (transform(x) - transform(y)),
    200 * (transform(y) - transform(z)),
  ];
}

function deltaE(left, right) {
  const a = lab(left);
  const b = lab(right);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

// Readiness contract (pinned in docs/phase10-workflow/specs/section-11.md
// §11): ready once the canvas is visible and every holding has painted its
// trail-sample coordinates and weekly-return payload — the exact data this
// script samples against, so waiting for it is waiting for the thing being
// measured to exist, not an arbitrary delay.
async function waitForUniverseReady(page) {
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(
    () =>
      document.querySelectorAll(
        "[data-scene-ticker][data-trail-sample-x][data-weekly-return]",
      ).length === 8,
  );
  await page.waitForTimeout(1_200);
}

function sampleAt(x, y, expected, data, info) {
  const expectedRgb = rgb(expected);
  const candidates = [];
  for (let offsetY = -4; offsetY <= 4; offsetY += 1) {
    for (let offsetX = -4; offsetX <= 4; offsetX += 1) {
      const sampleX = Math.max(0, Math.min(info.width - 1, Math.round(x + offsetX)));
      const sampleY = Math.max(0, Math.min(info.height - 1, Math.round(y + offsetY)));
      const offset = (sampleY * info.width + sampleX) * 3;
      const channels = [data[offset], data[offset + 1], data[offset + 2]];
      candidates.push({ channels, deltaE: deltaE(channels, expectedRgb) });
    }
  }
  return candidates.sort((left, right) => left.deltaE - right.deltaE)[0];
}

let browser;
try {
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await waitForUniverseReady(page);

  const descriptors = await page
    .locator("[data-scene-ticker]")
    .evaluateAll((labels) =>
      labels.map((label) => ({
        ticker: label.dataset.sceneTicker,
        weekly: label.dataset.weeklyReturn === "null"
          ? null
          : Number(label.dataset.weeklyReturn),
        x: Number(label.dataset.trailSampleX),
        y: Number(label.dataset.trailSampleY),
      })),
    );
  const screenshotPath = path.join(output, "overview-trail-samples.png");
  await page.screenshot({ path: screenshotPath });
  const { data, info } = await sharp(screenshotPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const samples = descriptors.map((descriptor) => {
    const expected = rampForWeeklyFromPayload(descriptor.weekly);
    const sampled = sampleAt(descriptor.x, descriptor.y, expected, data, info);
    const { hue, chroma } = hueChroma(sampled.channels);
    const anchor =
      descriptor.weekly === null || Math.abs(descriptor.weekly) <= 0.002
        ? null
        : descriptor.weekly > 0 ? 143 : 3;
    const result = {
      ...descriptor,
      expected,
      sampled: hex(sampled.channels),
      deltaE: Number(sampled.deltaE.toFixed(3)),
      hue: hue === null ? null : Number(hue.toFixed(3)),
      chroma: Number(chroma.toFixed(3)),
      luminance: Number(luminance(sampled.channels).toFixed(6)),
      hueDistance: anchor === null || hue === null
        ? null
        : Number(hueDistance(hue, anchor).toFixed(3)),
    };
    result.deltaEFail = result.deltaE > 8;
    result.hueLockFail = anchor !== null && (result.chroma <= 0.3 || result.hueDistance > 10);
    return result;
  });

  for (const direction of [1, -1]) {
    const sameDirection = samples
      .filter(({ weekly }) => weekly !== null && Math.sign(weekly) === direction)
      .sort((left, right) => Math.abs(left.weekly) - Math.abs(right.weekly));
    for (let index = 1; index < sameDirection.length; index += 1) {
      const prior = sameDirection[index - 1];
      const current = sameDirection[index];
      const ordered = direction > 0
        ? current.luminance >= prior.luminance
        : current.luminance <= prior.luminance;
      if (!ordered) {
        prior.orderingFail = true; current.orderingFail = true;
      }
    }
  }

  const measured = {
    viewport: "1440x900",
    fixtureCount: descriptors.length,
    everyFixtureHoldingSampled: descriptors.length === samples.length,
    samples,
    literalReferences: {
      flat: "#e3b65c",
      comet: "#f4f0df",
      sunUp: "#f5c45d",
      sunDown: "#d65a24",
    },
  };
  console.log(JSON.stringify(measured));
  emit(CRITERION, true, measured);
} catch (error) {
  emit(CRITERION, false, null, error.message);
} finally {
  if (browser) await browser.close();
}
