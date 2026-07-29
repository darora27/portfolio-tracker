// Round-4 diagnostic: is the approach-camera planet where the scene says it is,
// and is the carved mark reachable by a pixel verifier at all?
//
// For each world it captures the approach frame twice — once as shipped, once
// with the inspector panel hidden via a review-only CSS override that touches no
// application source — then measures the rendered disc directly from pixels and
// compares it with the data-planet-center-x/y/radius-px the scene publishes.
// It also recomputes the chirality correlation on the panel-free frame using the
// verifier's own band geometry.
//
// Measurement only. capture-live-sphere-strip.mjs is unmodified and remains the
// binding check for DEF-02.
//
// Usage: PHASE10_BASE_URL=http://127.0.0.1:3141/share node <this file>
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const outDir = path.resolve("docs/phase10-baseline/section-10/claude-review-4");
await mkdir(outDir, { recursive: true });

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

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() =>
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true"),
);

const rows = [];
for (const ticker of ["ASML", "GOOG", "COST", "MSFT", "IBM", "INTC", "CBRS", "NBIS"]) {
  await page.goto(`${base}?holding=${ticker}&camera=approach`, {
    waitUntil: "networkidle",
  });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(1_800);

  const published = await page
    .locator(`[data-scene-ticker="${ticker}"]`)
    .evaluate((label) => ({
      x: Number(label.dataset.planetCenterX),
      y: Number(label.dataset.planetCenterY),
      radius: Number(label.dataset.planetRadiusPx),
    }));

  // Hide every non-canvas overlay for the measurement frame only.
  const hidden = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const keep = new Set();
    for (let node = canvas; node; node = node.parentElement) keep.add(node);
    let count = 0;
    for (const node of document.body.querySelectorAll("*")) {
      if (keep.has(node) || node.contains(canvas)) continue;
      const style = getComputedStyle(node);
      if (style.display === "none") continue;
      node.setAttribute("data-review-hidden", "true");
      node.style.setProperty("visibility", "hidden", "important");
      count += 1;
    }
    return count;
  });
  await page.waitForTimeout(400);
  const clean = await page.screenshot();
  await writeFile(
    path.join(outDir, `panel-free-${ticker.toLowerCase()}.png`),
    clean,
  );

  const meta = await sharp(clean).metadata();
  const width = meta.width ?? 1440;
  const height = meta.height ?? 900;
  const raw = await sharp(clean).removeAlpha().raw().toBuffer();
  const luma = (x, y) => {
    const offset = (y * width + x) * 3;
    return (
      0.2126 * raw[offset] + 0.7152 * raw[offset + 1] + 0.0722 * raw[offset + 2]
    );
  };

  // Rendered disc: the largest bright blob. Scan on a 4px grid, take the
  // bounding box of everything above a void threshold, ignoring the thin
  // starfield by requiring a 3x3 lit neighbourhood.
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let litCount = 0;
  for (let y = 4; y < height - 4; y += 2) {
    for (let x = 4; x < width - 4; x += 2) {
      if (luma(x, y) <= 45) continue;
      if (
        luma(x - 2, y) <= 30 ||
        luma(x + 2, y) <= 30 ||
        luma(x, y - 2) <= 30 ||
        luma(x, y + 2) <= 30
      ) {
        continue;
      }
      litCount += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const measured =
    litCount > 0
      ? {
          centreX: Number(((minX + maxX) / 2).toFixed(1)),
          centreY: Number(((minY + maxY) / 2).toFixed(1)),
          radiusX: Number(((maxX - minX) / 2).toFixed(1)),
          radiusY: Number(((maxY - minY) / 2).toFixed(1)),
          litSamples: litCount,
        }
      : null;

  // Chirality recomputed on the panel-free frame, verifier band geometry.
  const diameter = Math.max(64, Math.ceil(published.radius * 2));
  const left = Math.max(0, Math.min(width - diameter, Math.round(published.x - diameter / 2)));
  const top = Math.max(0, Math.min(height - diameter, Math.round(published.y - diameter / 2)));
  const planetRaw = await sharp(clean)
    .extract({ left, top, width: diameter, height: diameter })
    .resize(96, 96)
    .greyscale()
    .raw()
    .toBuffer();
  const liveProfile = Array.from({ length: 64 }, (_, x) => {
    let total = 0;
    for (let y = 32; y < 64; y += 1) total += planetRaw[y * 96 + x + 16];
    return total / 32;
  });
  const markSvg = await readFile(
    path.resolve("assets/planet-textures/marks", `${ticker.toLowerCase()}.svg`),
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
  const profileMean =
    liveProfile.reduce((sum, value) => sum + value, 0) / liveProfile.length;
  const profileStdDev = Math.sqrt(
    liveProfile.reduce((sum, value) => sum + (value - profileMean) ** 2, 0) /
      liveProfile.length,
  );

  rows.push({
    ticker,
    overlaysHidden: hidden,
    published: {
      x: Number(published.x.toFixed(1)),
      y: Number(published.y.toFixed(1)),
      radiusPx: Number(published.radius.toFixed(1)),
    },
    measuredFromPixels: measured,
    publishedCentreMatchesRender:
      measured !== null &&
      Math.abs(measured.centreX - published.x) <= 24 &&
      Math.abs(measured.centreY - published.y) <= 24,
    chiralityOnPanelFreeFrame: {
      normalScore: Number(normalScore.toFixed(6)),
      mirroredScore: Number(mirroredScore.toFixed(6)),
      margin: Number((normalScore - mirroredScore).toFixed(6)),
      profileStdDev: Number(profileStdDev.toFixed(3)),
      pass: normalScore > mirroredScore,
    },
  });
}

await browser.close();
const output = {
  base,
  note:
    "Overlays hidden with a review-only visibility override applied in the page; no application source changed.",
  rows,
};
await writeFile(
  path.join(outDir, "raw-panel-occlusion.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify(output, null, 2));
