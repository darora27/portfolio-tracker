import { chromium } from "playwright";
import sharp from "sharp";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const runtimeCwd = process.cwd();
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-13/f2-investigation/frames");
const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100/share";
const TARGETS = ["ASML", "COST"];
const FRAME_COUNT = 16;
const SAMPLE_INTERVAL_MS = 700;

async function chromiumExecutablePath() {
  const cacheRoot = path.join(homedir(), "Library/Caches/ms-playwright");
  const revisions = (await readdir(cacheRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium_headless_shell-"))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  for (const revision of revisions) {
    for (const relative of ["chrome-mac/headless_shell", "chrome-headless-shell-mac-arm64/chrome-headless-shell"]) {
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
  "--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist",
];

async function main() {
  await mkdir(root, { recursive: true });
  const executablePath = await chromiumExecutablePath();
  const browser = await chromium.launch({ headless: true, executablePath, args: CHROMIUM_ARGS });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.addInitScript(() => {
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(
    () => document.querySelectorAll("[data-scene-ticker][data-trail-sample-x][data-daily-return]").length === 8,
  );
  await page.waitForTimeout(1200);

  const log = [];
  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const descriptors = await page.locator("[data-scene-ticker]").evaluateAll(
      (labels, targets) =>
        labels
          .filter((l) => targets.includes(l.dataset.sceneTicker))
          .map((l) => ({
            ticker: l.dataset.sceneTicker,
            x: Number(l.dataset.trailSampleX),
            y: Number(l.dataset.trailSampleY),
            planetCenterX: Number(l.dataset.planetCenterX),
            planetCenterY: Number(l.dataset.planetCenterY),
            planetRadiusPx: Number(l.dataset.planetRadiusPx),
          })),
      TARGETS,
    );
    const screenshot = await page.screenshot();
    for (const d of descriptors) {
      const cropSize = 260;
      const left = Math.max(0, Math.min(1440 * 2 - cropSize, Math.round(d.x * 2 - cropSize / 2)));
      const top = Math.max(0, Math.min(900 * 2 - cropSize, Math.round(d.y * 2 - cropSize / 2)));
      const markerX = d.x * 2 - left;
      const markerY = d.y * 2 - top;
      const crop = await sharp(screenshot).extract({ left, top, width: cropSize, height: cropSize }).png().toBuffer();
      const clearance = Math.hypot(d.x - d.planetCenterX, d.y - d.planetCenterY) - d.planetRadiusPx;
      const overlay = Buffer.from(
        `<svg width="${cropSize}" height="${cropSize}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${markerX}" cy="${markerY}" r="9" fill="none" stroke="#ff00ff" stroke-width="2"/>
          <path d="M ${markerX - 14} ${markerY} H ${markerX + 14} M ${markerX} ${markerY - 14} V ${markerY + 14}" stroke="#ff00ff" stroke-width="1"/>
          <text x="4" y="16" fill="#ff00ff" font-family="monospace" font-size="12">f${frame} clr${clearance.toFixed(0)}</text>
        </svg>`,
      );
      const marked = await sharp(crop).composite([{ input: overlay }]).png().toBuffer();
      await writeFile(path.join(root, `${d.ticker.toLowerCase()}-f${String(frame).padStart(2, "0")}.png`), marked);
      log.push({ frame, ticker: d.ticker, x: d.x, y: d.y, clearance: Number(clearance.toFixed(2)) });
    }
    await page.waitForTimeout(SAMPLE_INTERVAL_MS);
  }
  await writeFile(path.join(root, "frame-log.json"), `${JSON.stringify(log, null, 2)}\n`);
  console.log(JSON.stringify(log, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
