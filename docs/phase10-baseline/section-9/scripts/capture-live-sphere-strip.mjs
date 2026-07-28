import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const output = path.resolve(
  "docs/phase10-baseline/section-9/after/live-sphere-strip-32.png",
);
await mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
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
  tiles.push({
    ticker: descriptor.ticker,
    input: await sharp(screenshot)
      .extract({ left, top, width: diameter, height: diameter })
      .resize(32, 32, { fit: "fill" })
      .png()
      .toBuffer(),
  });
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

console.log(
  JSON.stringify({
    viewport: "1440x900",
    tileSize: "32x32",
    order: tiles.map(({ ticker }) => ticker),
    output,
  }),
);
await browser.close();
