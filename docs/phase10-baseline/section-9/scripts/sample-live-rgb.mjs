import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("docs/phase10-baseline/section-9");
const output = path.join(root, "pixel-samples");
await mkdir(output, { recursive: true });
const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
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
await page.waitForTimeout(1_200);

const idlePath = path.join(output, "overview-idle.png");
const dockedPath = path.join(output, "overview-docked.png");
await page.screenshot({ path: idlePath });
const canvasBox = await page.locator("canvas").boundingBox();
if (!canvasBox) throw new Error("Canvas has no live bounding box.");
const sunPoint = await page.locator("[data-evidence-sun-x]").evaluate(
  (element) => ({
    x: Number(element.dataset.evidenceSunX),
    y: Number(element.dataset.evidenceSunY),
  }),
);
const centerX = canvasBox.x + sunPoint.x;
const centerY = canvasBox.y + sunPoint.y;
await page.mouse.move(centerX, centerY);
await page.waitForFunction(() =>
  document.querySelector("[data-docking='true']"),
);
await page.waitForTimeout(400);
await page.screenshot({ path: dockedPath });

async function pixels(file) {
  const { data, info } = await sharp(file)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, info };
}

const idle = await pixels(idlePath);
const docked = await pixels(dockedPath);
let changedAnnulusPixels = 0;
let signedTrailPixels = 0;
for (let y = 0; y < idle.info.height; y += 1) {
  for (let x = 0; x < idle.info.width; x += 1) {
    const offset = (y * idle.info.width + x) * 3;
    const distance = Math.hypot(x - centerX, y - centerY);
    const delta =
      Math.abs(idle.data[offset] - docked.data[offset]) +
      Math.abs(idle.data[offset + 1] - docked.data[offset + 1]) +
      Math.abs(idle.data[offset + 2] - docked.data[offset + 2]);
    if (distance >= 52 && distance <= 115 && delta >= 24) {
      changedAnnulusPixels += 1;
    }
    const red = idle.data[offset];
    const green = idle.data[offset + 1];
    const blue = idle.data[offset + 2];
    if (
      distance > 120 &&
      ((green > red * 1.25 && green > blue * 1.15 && green > 80) ||
        (red > green * 1.25 && red > blue * 1.15 && red > 80))
    ) {
      signedTrailPixels += 1;
    }
  }
}

console.log(JSON.stringify({
  viewport: "1440x900",
  changedAnnulusPixels,
  signedTrailPixels,
  dockingVisible: changedAnnulusPixels > 40,
  trailsVisible: signedTrailPixels > 120,
}));
await browser.close();
