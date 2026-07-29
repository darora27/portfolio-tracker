// Round-4 review probe, second pass. Corrects two selectors the first pass got
// wrong: the rendered belt bodies are tracked by the canvas overlay labels
// (data-belt-ticker), not by the off-screen accessible list (data-belt-holding);
// and the radar targets live inside the SIGNALS bay.
//
//   DEF-04  every belt holding has a visible rendered body at OVERVIEW
//   VIS-10  radar ring colour / ticker label / blip size proportional to weight
//   VIS-02  a carved capital faces the camera at the approach view
//
// Usage: PHASE10_BASE_URL=http://127.0.0.1:3141/share node <this file>
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const outDir = path.resolve("docs/phase10-baseline/section-10/claude-review-4");
await mkdir(outDir, { recursive: true });
const result = {};
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const seen = () =>
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");

// ---------------------------------------------------------------- DEF-04 ----
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(seen);
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(2_500);
  const labels = await page.locator("[data-belt-ticker]").evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        ticker: node.dataset.beltTicker,
        hidden: node.hidden,
        labelCentreX: rect.x + rect.width / 2,
        labelTopY: rect.y,
      };
    }),
  );
  const shot = await page.screenshot();
  await writeFile(path.join(outDir, "def-04-overview.png"), shot);
  const meta = await sharp(shot).metadata();
  const raw = await sharp(shot).removeAlpha().raw().toBuffer();
  const width = meta.width ?? 1440;
  const height = meta.height ?? 900;
  const luma = (x, y) => {
    const offset = (y * width + x) * 3;
    return (
      0.2126 * raw[offset] + 0.7152 * raw[offset + 1] + 0.0722 * raw[offset + 2]
    );
  };
  // The rock is drawn immediately above its label. Search a 40x40 window
  // centred on the label's horizontal centre, spanning the 34px above it.
  const bodies = labels.map((label) => {
    let brightest = 0;
    let litPixels = 0;
    let brightestAt = null;
    for (let y = Math.round(label.labelTopY - 34); y < Math.round(label.labelTopY); y += 1) {
      for (let x = Math.round(label.labelCentreX - 20); x <= Math.round(label.labelCentreX + 20); x += 1) {
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const value = luma(x, y);
        if (value > brightest) {
          brightest = value;
          brightestAt = { x, y };
        }
        if (value > 40) litPixels += 1;
      }
    }
    return {
      ...label,
      brightest: Number(brightest.toFixed(1)),
      litPixels,
      brightestAt,
      visibleBody: brightest > 40 && litPixels >= 3,
    };
  });
  result["DEF-04"] = { voidReference: Number(luma(20, 880).toFixed(1)), bodies };
  await page.close();
}

// ---------------------------------------------------------------- VIS-10 ----
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(seen);
  await page.goto(`${base}?focus=portfolio&camera=command&station=signals`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1_500);
  result["VIS-10"] = await page.evaluate(() => {
    const rings = [...document.querySelectorAll("[data-radar-ticker]")].map(
      (node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          ticker: node.dataset.radarTicker,
          tag: node.tagName,
          dataset: { ...node.dataset },
          stroke: node.getAttribute("stroke") ?? style.stroke,
          borderColor: style.borderColor,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      },
    );
    const svgText = [...document.querySelectorAll("svg text")].map((node) => ({
      text: (node.textContent ?? "").trim(),
      fill: node.getAttribute("fill") ?? getComputedStyle(node).fill,
      fontSize: getComputedStyle(node).fontSize,
    }));
    const blips = [...document.querySelectorAll("svg circle, svg ellipse")]
      .map((node) => ({
        r: node.getAttribute("r"),
        fill: node.getAttribute("fill"),
        stroke: node.getAttribute("stroke"),
        cls: [...node.classList].map((name) => name.split("__").pop()).join(" "),
      }))
      .slice(0, 40);
    return { rings, svgText, blips };
  });
  await page.screenshot({
    path: path.join(outDir, "vis-10-signals-radar.png"),
  });
  await page.close();
}

// ---------------------------------------------------------------- VIS-02 ----
// At the approach camera, crop the planet disc and record whether a mark-shaped
// luminance structure faces the camera. Reported, not asserted.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(seen);
  const marks = [];
  for (const ticker of ["ASML", "GOOG", "MSFT", "IBM", "COST", "INTC", "CBRS", "NBIS"]) {
    await page.goto(`${base}?holding=${ticker}&camera=approach`, {
      waitUntil: "networkidle",
    });
    await page.locator("canvas").waitFor({ state: "visible" });
    await page.waitForTimeout(1_500);
    const geometry = await page
      .locator(`[data-scene-ticker="${ticker}"]`)
      .evaluate((label) => ({
        x: Number(label.dataset.planetCenterX),
        y: Number(label.dataset.planetCenterY),
        radius: Number(label.dataset.planetRadiusPx),
      }));
    const shot = await page.screenshot();
    const diameter = Math.max(64, Math.ceil(geometry.radius * 2));
    const left = Math.max(0, Math.min(1440 - diameter, Math.round(geometry.x - diameter / 2)));
    const top = Math.max(0, Math.min(900 - diameter, Math.round(geometry.y - diameter / 2)));
    const crop = await sharp(shot)
      .extract({ left, top, width: diameter, height: diameter })
      .resize(160, 160)
      .png()
      .toBuffer();
    await writeFile(path.join(outDir, `vis-02-${ticker.toLowerCase()}-approach.png`), crop);
    const grey = await sharp(crop).greyscale().raw().toBuffer();
    // Contrast structure across the disc's central band, the same band the
    // chirality verifier reads.
    const band = [];
    for (let y = 60; y < 100; y += 1) {
      for (let x = 30; x < 130; x += 1) band.push(grey[y * 160 + x]);
    }
    const mean = band.reduce((sum, value) => sum + value, 0) / band.length;
    const stdDev = Math.sqrt(
      band.reduce((sum, value) => sum + (value - mean) ** 2, 0) / band.length,
    );
    marks.push({
      ticker,
      radiusPx: Number(geometry.radius.toFixed(1)),
      bandMean: Number(mean.toFixed(2)),
      bandStdDev: Number(stdDev.toFixed(2)),
      bandMin: Math.min(...band),
      bandMax: Math.max(...band),
    });
  }
  result["VIS-02"] = { marks };
  await page.close();
}

await browser.close();
await writeFile(
  path.join(outDir, "raw-belt-radar-marks.json"),
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result, null, 2));
