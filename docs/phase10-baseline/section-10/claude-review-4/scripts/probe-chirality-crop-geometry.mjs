// Round-4 diagnostic: what does capture-live-sphere-strip.mjs's chirality crop
// actually contain?
//
// The verifier crops a square of side max(64, round(planetRadiusPx * 2)) centred
// on the planet's published centre, clamps it to the viewport, resizes to 96x96
// and reads a luminance profile from rows 32..63, columns 16..79. This probe
// reproduces that crop geometry exactly and reports, per world, how much of the
// crop is covered by the holding info panel and how much falls outside the
// planet's own disc — i.e. whether the profile the chirality test correlates is
// even sampling the carved mark.
//
// Measurement only. The verifier is unmodified and remains the binding check.
//
// Usage: PHASE10_BASE_URL=http://127.0.0.1:3141/share node <this file>
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const outDir = path.resolve("docs/phase10-baseline/section-10/claude-review-4");
await mkdir(outDir, { recursive: true });

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
  await page.waitForTimeout(1_500);

  const live = await page
    .locator(`[data-scene-ticker="${ticker}"]`)
    .evaluate((label) => ({
      x: Number(label.dataset.planetCenterX),
      y: Number(label.dataset.planetCenterY),
      radius: Number(label.dataset.planetRadiusPx),
    }));

  // Every DOM panel/overlay rect that sits above the canvas.
  const overlays = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const canvasRect = canvas?.getBoundingClientRect();
    const panels = [...document.querySelectorAll("div, section, aside, article")]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          cls: [...node.classList].map((name) => name.split("__").pop()).join(" "),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          opaque:
            style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
            style.backgroundColor !== "transparent",
        };
      })
      .filter(
        (rect) =>
          rect.opaque && rect.width > 260 && rect.height > 260 && rect.x > 40,
      )
      .sort((left, right) => right.width * right.height - left.width * left.height);
    return { canvasRect, panels: panels.slice(0, 3) };
  });

  const shot = await page.screenshot();
  const diameter = Math.max(64, Math.ceil(live.radius * 2));
  const left = Math.max(0, Math.min(1440 - diameter, Math.round(live.x - diameter / 2)));
  const top = Math.max(0, Math.min(900 - diameter, Math.round(live.y - diameter / 2)));

  await writeFile(
    path.join(outDir, `chirality-crop-${ticker.toLowerCase()}.png`),
    await sharp(shot)
      .extract({ left, top, width: diameter, height: diameter })
      .resize(96, 96)
      .png()
      .toBuffer(),
  );

  // Fraction of the verifier's sampled band (96x96 space, rows 32..63,
  // cols 16..79 -> source-space rectangle) that lies inside the planet disc,
  // and the fraction covered by the largest opaque panel.
  const scale = diameter / 96;
  const bandLeft = left + 16 * scale;
  const bandRight = left + 80 * scale;
  const bandTop = top + 32 * scale;
  const bandBottom = top + 64 * scale;

  let insideDisc = 0;
  let underPanel = 0;
  let total = 0;
  const panel = overlays.panels[0];
  for (let y = bandTop; y < bandBottom; y += 2) {
    for (let x = bandLeft; x < bandRight; x += 2) {
      total += 1;
      const distance = Math.hypot(x - live.x, y - live.y);
      if (distance <= live.radius) insideDisc += 1;
      if (
        panel &&
        x >= panel.x &&
        x <= panel.x + panel.width &&
        y >= panel.y &&
        y <= panel.y + panel.height
      ) {
        underPanel += 1;
      }
    }
  }

  rows.push({
    ticker,
    planet: {
      x: Number(live.x.toFixed(1)),
      y: Number(live.y.toFixed(1)),
      radiusPx: Number(live.radius.toFixed(1)),
    },
    cropWindow: { left, top, side: diameter },
    cropClampedX: left !== Math.round(live.x - diameter / 2),
    cropClampedY: top !== Math.round(live.y - diameter / 2),
    largestOpaquePanel: panel
      ? {
          cls: panel.cls,
          x: Math.round(panel.x),
          y: Math.round(panel.y),
          width: Math.round(panel.width),
          height: Math.round(panel.height),
        }
      : null,
    sampledBand: {
      fractionInsidePlanetDisc: Number((insideDisc / total).toFixed(3)),
      fractionUnderOpaquePanel: Number((underPanel / total).toFixed(3)),
    },
  });
}

await browser.close();
const output = { base, note: "crop geometry reproduced from capture-live-sphere-strip.mjs", rows };
await writeFile(
  path.join(outDir, "raw-chirality-crop-geometry.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify(output, null, 2));
