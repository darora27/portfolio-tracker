import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const output = path.resolve(
  "docs/phase10-baseline/section-10/after/live-sphere-strip-32.png",
);
await mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.localStorage.setItem(
    "stock-market-universe-orientation-seen",
    "true",
  );
});
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("canvas").waitFor({ state: "visible" });
await page.waitForFunction(
  () =>
    document.querySelectorAll(
      "[data-scene-ticker][data-planet-center-x][data-planet-radius-px]",
    ).length === 8,
);
await page.waitForTimeout(1_500);

const descriptors = await page
  .locator("[data-scene-ticker]")
  .evaluateAll((labels) =>
    labels.map((label) => ({
      ticker: label.dataset.sceneTicker,
      x: Number(label.dataset.planetCenterX),
      y: Number(label.dataset.planetCenterY),
      radius: Number(label.dataset.planetRadiusPx),
    })),
  );
const screenshot = await page.screenshot();
const metadata = await sharp(screenshot).metadata();
const tiles = [];
const measurements = [];

function linearChannel(value) {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function correlation(left, right) {
  const leftMean = left.reduce((sum, value) => sum + value, 0) / left.length;
  const rightMean = right.reduce((sum, value) => sum + value, 0) / right.length;
  let numerator = 0;
  let leftSquare = 0;
  let rightSquare = 0;
  for (let index = 0; index < left.length; index += 1) {
    const leftDelta = left[index] - leftMean;
    const rightDelta = right[index] - rightMean;
    numerator += leftDelta * rightDelta;
    leftSquare += leftDelta ** 2;
    rightSquare += rightDelta ** 2;
  }
  return numerator / Math.sqrt(leftSquare * rightSquare || 1);
}

for (const descriptor of descriptors) {
  const diameter = Math.max(12, Math.ceil(descriptor.radius * 2.2));
  const left = Math.max(
    0,
    Math.min(
      (metadata.width ?? 1440) - diameter,
      Math.round(descriptor.x - diameter / 2),
    ),
  );
  const top = Math.max(
    0,
    Math.min(
      (metadata.height ?? 900) - diameter,
      Math.round(descriptor.y - diameter / 2),
    ),
  );
  const input = await sharp(screenshot)
      .extract({ left, top, width: diameter, height: diameter })
      .resize(32, 32, { fit: "fill" })
      .png()
      .toBuffer();
  const raw = await sharp(input).removeAlpha().raw().toBuffer();
  const luminances = [];
  for (let y = 11; y <= 20; y += 1) {
    for (let x = 5; x <= 26; x += 1) {
      const offset = (y * 32 + x) * 3;
      luminances.push(
        0.2126 * linearChannel(raw[offset]) +
          0.7152 * linearChannel(raw[offset + 1]) +
          0.0722 * linearChannel(raw[offset + 2]),
      );
    }
  }
  const equatorialMean =
    luminances.reduce((sum, value) => sum + value, 0) / luminances.length;
  if (equatorialMean < 0.16 || equatorialMean > 0.55) {
    throw new Error(
      `${descriptor.ticker} live equatorial luminance ${equatorialMean.toFixed(4)} outside [0.16, 0.55]`,
    );
  }
  measurements.push({
    ticker: descriptor.ticker,
    equatorialMean: Number(equatorialMean.toFixed(6)),
  });
  tiles.push({ ticker: descriptor.ticker, input });
}

await sharp({
  create: {
    width: tiles.length * 32,
    height: 32,
    channels: 3,
    background: "#020706",
  },
})
  .composite(
    tiles.map((tile, index) => ({
      input: tile.input,
      left: index * 32,
      top: 0,
    })),
  )
  .png()
  .toFile(output);

const chirality = [];
for (const descriptor of descriptors) {
  await page.goto(
    `${base}?holding=${encodeURIComponent(descriptor.ticker)}&camera=approach`,
    { waitUntil: "networkidle" },
  );
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(1_500);
  const live = await page
    .locator(`[data-scene-ticker="${descriptor.ticker}"]`)
    .evaluate((label) => ({
      x: Number(label.dataset.planetCenterX),
      y: Number(label.dataset.planetCenterY),
      radius: Number(label.dataset.planetRadiusPx),
    }));
  const approachScreenshot = await page.screenshot();
  const approachMetadata = await sharp(approachScreenshot).metadata();
  const diameter = Math.max(64, Math.ceil(live.radius * 2));
  const left = Math.max(
    0,
    Math.min(
      (approachMetadata.width ?? 1440) - diameter,
      Math.round(live.x - diameter / 2),
    ),
  );
  const top = Math.max(
    0,
    Math.min(
      (approachMetadata.height ?? 900) - diameter,
      Math.round(live.y - diameter / 2),
    ),
  );
  const planetRaw = await sharp(approachScreenshot)
    .extract({ left, top, width: diameter, height: diameter })
    .resize(96, 96)
    .greyscale()
    .raw()
    .toBuffer();
  const liveProfile = Array.from({ length: 64 }, (_, x) => {
    let total = 0;
    for (let y = 32; y < 64; y += 1) {
      total += planetRaw[y * 96 + x + 16];
    }
    return total / 32;
  });
  const markSvg = await readFile(
    path.resolve(
      "assets/planet-textures/marks",
      `${descriptor.ticker.toLowerCase()}.svg`,
    ),
  );
  const markRaw = await sharp(markSvg)
    .resize({ width: 64, height: 32, fit: "contain" })
    .ensureAlpha()
    .extractChannel("alpha")
    .raw()
    .toBuffer();
  const expectedProfile = Array.from({ length: 64 }, (_, x) => {
    let total = 0;
    for (let y = 0; y < 32; y += 1) total += markRaw[y * 64 + x];
    return total / 32;
  });
  const normalScore = correlation(liveProfile, expectedProfile);
  const mirroredScore = correlation(liveProfile, [...expectedProfile].reverse());
  if (normalScore <= mirroredScore) {
    throw new Error(
      `${descriptor.ticker} chirality failed: normal=${normalScore.toFixed(4)} mirrored=${mirroredScore.toFixed(4)}`,
    );
  }
  chirality.push({
    ticker: descriptor.ticker,
    normalScore: Number(normalScore.toFixed(6)),
    mirroredScore: Number(mirroredScore.toFixed(6)),
    pass: true,
  });
}

console.log(
  JSON.stringify({
    viewport: "1440x900",
    tileSize: "32x32",
    order: tiles.map(({ ticker }) => ticker),
    measurements,
    chirality,
    output,
  }),
);
await browser.close();
