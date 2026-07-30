import { chromium } from "playwright";
import sharp from "sharp";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const runtimeCwd = process.cwd();
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-13/f2-investigation");
const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100/share";

async function chromiumExecutablePath() {
  const cacheRoot = path.join(homedir(), "Library/Caches/ms-playwright");
  const revisions = (await readdir(cacheRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium_headless_shell-"))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  for (const revision of revisions) {
    for (const relative of [
      "chrome-mac/headless_shell",
      "chrome-headless-shell-mac-arm64/chrome-headless-shell",
    ]) {
      const candidate = path.join(cacheRoot, revision, relative);
      try {
        await access(candidate);
        return candidate;
      } catch {}
    }
  }
  const playwrightExecutable = chromium.executablePath();
  await access(playwrightExecutable);
  return playwrightExecutable;
}

const CHROMIUM_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--enable-webgl",
  "--ignore-gpu-blocklist",
];

async function main() {
  await mkdir(root, { recursive: true });
  const executablePath = await chromiumExecutablePath();
  const browser = await chromium.launch({ headless: true, executablePath, args: CHROMIUM_ARGS });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
    } catch {}
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(
    () => document.querySelectorAll("[data-scene-ticker][data-trail-sample-x][data-daily-return]").length === 8,
  );
  await page.waitForTimeout(1500);

  const state = await page.evaluate(() => {
    const mount = document.querySelector("[data-scene-construction-stage]");
    const descriptors = [...document.querySelectorAll("[data-scene-ticker]")].map((el) => ({
      ticker: el.dataset.sceneTicker,
      dayReturn: el.dataset.dailyReturn === "null" ? null : Number(el.dataset.dailyReturn),
      sampleX: Number(el.dataset.trailSampleX),
      sampleY: Number(el.dataset.trailSampleY),
      centerX: Number(el.dataset.planetCenterX),
      centerY: Number(el.dataset.planetCenterY),
      radiusPx: Number(el.dataset.planetRadiusPx),
    }));
    return {
      sunX: Number(mount?.dataset.evidenceSunX),
      sunY: Number(mount?.dataset.evidenceSunY),
      auroraAlpha: Number(mount?.dataset.auroraAlpha),
      descriptors,
      moonTarget: mount?.dataset.evidenceMoonTarget ?? null,
      moonX: Number(mount?.dataset.evidenceMoonX),
      moonY: Number(mount?.dataset.evidenceMoonY),
    };
  });

  const orderedByOrbit = [...state.descriptors].sort(
    (a, b) => Math.hypot(a.centerX - state.sunX, a.centerY - state.sunY) - Math.hypot(b.centerX - state.sunX, b.centerY - state.sunY),
  );

  const findings = {
    capturedAt: null,
    sun: { x: state.sunX, y: state.sunY },
    auroraAlphaAtRest: state.auroraAlpha,
    moon: { target: state.moonTarget, x: state.moonX, y: state.moonY },
    orderedByDistanceFromSun: orderedByOrbit.map((d) => ({
      ticker: d.ticker,
      dayReturn: d.dayReturn,
      distanceCenterToSun: Number(Math.hypot(d.centerX - state.sunX, d.centerY - state.sunY).toFixed(2)),
      radiusPx: d.radiusPx,
    })),
  };

  const fullShot = await page.screenshot();
  await writeFile(path.join(root, "full-overview.png"), fullShot);

  for (const ticker of ["ASML", "COST", "IBM"]) {
    const d = state.descriptors.find((x) => x.ticker === ticker);
    if (!d) continue;
    const cropWidth = 360;
    const cropHeight = 260;
    const left = Math.max(0, Math.min(1440 * 2 - cropWidth, Math.round(d.sampleX * 2 - cropWidth / 2)));
    const top = Math.max(0, Math.min(900 * 2 - cropHeight, Math.round(d.sampleY * 2 - cropHeight / 2)));
    const distToSun = Math.hypot(d.sampleX - state.sunX, d.sampleY - state.sunY);
    const distToMoon = state.moonTarget ? Math.hypot(d.sampleX - state.moonX, d.sampleY - state.moonY) : null;
    findings[ticker] = {
      dayReturn: d.dayReturn,
      sample: { x: d.sampleX, y: d.sampleY },
      center: { x: d.centerX, y: d.centerY },
      radiusPx: d.radiusPx,
      distanceSampleToSunPx: Number(distToSun.toFixed(2)),
      distanceSampleToMoonPx: distToMoon === null ? null : Number(distToMoon.toFixed(2)),
      cropFile: `${ticker.toLowerCase()}-crop.png`,
    };
    const cropBuffer = await sharp(fullShot)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .png()
      .toBuffer();
    await writeFile(path.join(root, `${ticker.toLowerCase()}-crop.png`), cropBuffer);

    // Sample a horizontal strip of raw pixel values through the sample point,
    // at native (unscaled) coordinates, to look for gradient bleed sources.
    const { data, info } = await sharp(fullShot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const y = Math.round(d.sampleY * 2);
    const strip = [];
    for (let dx = -40; dx <= 40; dx += 4) {
      const x = Math.max(0, Math.min(info.width - 1, Math.round(d.sampleX * 2 + dx)));
      const offset = (y * info.width + x) * 3;
      strip.push({ dx, rgb: [data[offset], data[offset + 1], data[offset + 2]] });
    }
    findings[ticker].horizontalStrip = strip;
  }

  findings.capturedAt = new Date().toISOString();
  await writeFile(path.join(root, "raw-f2-investigation.json"), `${JSON.stringify(findings, null, 2)}\n`);
  console.log(JSON.stringify(findings, null, 2));

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
