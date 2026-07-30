import { chromium } from "playwright";
import sharp from "sharp";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const runtimeCwd = process.cwd();
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-13/f2-investigation");
const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100/share";
const TARGETS = ["ASML", "COST"];
const MAX_WAIT_MS = 60_000;
const SAMPLE_INTERVAL_MS = 350;
const SAMPLE_RADIUS_PX = 10;

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

function rgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
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
  return `#${left.map((c, i) => Math.round(c + (right[i] - c) * local).toString(16).padStart(2, "0")).join("")}`;
}
const gainStops = ["#1f7a46", "#63ef98", "#a9ffcf"];
const lossStops = ["#ff9d97", "#ff665f", "#b3241d"];
function rampForReturnFromPayload(dayReturn) {
  if (dayReturn === null || Math.abs(dayReturn) <= 0.002) return "#e3b65c";
  const magnitude = Math.min(0.12, Math.max(0.002, Math.abs(dayReturn)));
  const amount = (magnitude - 0.002) / (0.12 - 0.002);
  return ramp(dayReturn > 0 ? gainStops : lossStops, amount);
}
function linear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function lab(channels) {
  const [r, g, b] = channels.map(linear);
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  return [116 * t(y) - 16, 500 * (t(x) - t(y)), 200 * (t(y) - t(z))];
}
function deltaE(l, r) {
  const a = lab(l);
  const b = lab(r);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function sampleAt(x, y, expectedRgb, data, info) {
  const candidates = [];
  for (let oy = -SAMPLE_RADIUS_PX; oy <= SAMPLE_RADIUS_PX; oy += 1) {
    for (let ox = -SAMPLE_RADIUS_PX; ox <= SAMPLE_RADIUS_PX; ox += 1) {
      const sx = Math.max(0, Math.min(info.width - 1, Math.round(x + ox)));
      const sy = Math.max(0, Math.min(info.height - 1, Math.round(y + oy)));
      const offset = (sy * info.width + sx) * 3;
      const channels = [data[offset], data[offset + 1], data[offset + 2]];
      candidates.push({ x: sx, y: sy, channels, deltaE: deltaE(channels, expectedRgb) });
    }
  }
  return candidates.sort((a, b) => a.deltaE - b.deltaE)[0];
}

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

  const startedAt = Date.now();
  const best = new Map();
  let frameIndex = 0;
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    const descriptors = await page.locator("[data-scene-ticker]").evaluateAll((labels, targets) =>
      labels
        .filter((l) => targets.includes(l.dataset.sceneTicker))
        .map((l) => ({
          ticker: l.dataset.sceneTicker,
          dayReturn: l.dataset.dailyReturn === "null" ? null : Number(l.dataset.dailyReturn),
          x: Number(l.dataset.trailSampleX),
          y: Number(l.dataset.trailSampleY),
          planetCenterX: Number(l.dataset.planetCenterX),
          planetCenterY: Number(l.dataset.planetCenterY),
          planetRadiusPx: Number(l.dataset.planetRadiusPx),
        })),
      TARGETS,
    );
    const mountData = await page.evaluate(() => {
      const mount = document.querySelector("[data-scene-construction-stage]");
      const labelRects = [...document.querySelectorAll('button[class*="sceneLabel"]')].map((el) => {
        const r = el.getBoundingClientRect();
        return { ticker: el.dataset.sceneTicker, left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      });
      return {
        sunX: Number(mount?.dataset.evidenceSunX),
        sunY: Number(mount?.dataset.evidenceSunY),
        labelRects,
      };
    });
    const screenshot = await page.screenshot();
    const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const elapsedMs = Date.now() - startedAt;

    for (const d of descriptors) {
      const expected = rampForReturnFromPayload(d.dayReturn);
      const expectedRgb = rgb(expected);
      const sampled = sampleAt(d.x * 2, d.y * 2, expectedRgb, data, info);
      const de = sampled.deltaE;
      const prior = best.get(d.ticker);
      if (!prior || de < prior.deltaE) {
        // Check overlap with any label box (native px, so *2 for device px comparisons is not needed since rects are in CSS px)
        const overlappingLabels = mountData.labelRects.filter(
          (r) => d.x >= r.left - 20 && d.x <= r.right + 20 && d.y >= r.top - 20 && d.y <= r.bottom + 20,
        );
        best.set(d.ticker, {
          ticker: d.ticker,
          dayReturn: d.dayReturn,
          expected,
          sampledHex: `#${sampled.channels.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`,
          deltaE: Number(de.toFixed(3)),
          sampleCssXY: { x: d.x, y: d.y },
          sampledAtDevicePx: { x: sampled.x, y: sampled.y },
          distanceToSunPx: Number(Math.hypot(d.x - mountData.sunX, d.y - mountData.sunY).toFixed(1)),
          minimumPlanetClearancePx: Math.min(
            ...descriptors.map((p) => Math.hypot(d.x - p.planetCenterX, d.y - p.planetCenterY) - p.planetRadiusPx),
          ),
          overlappingLabels,
          elapsedMs,
          frameIndex,
          screenshotBuffer: screenshot,
        });
      }
    }
    frameIndex += 1;
    await page.waitForTimeout(SAMPLE_INTERVAL_MS);
  }

  const findings = { capturedAt: new Date().toISOString(), targets: {} };
  for (const ticker of TARGETS) {
    const b = best.get(ticker);
    if (!b) continue;
    const cropSize = 300;
    const left = Math.max(0, Math.min(1440 * 2 - cropSize, b.sampledAtDevicePx.x - cropSize / 2));
    const top = Math.max(0, Math.min(900 * 2 - cropSize, b.sampledAtDevicePx.y - cropSize / 2));
    const markerX = b.sampledAtDevicePx.x - left;
    const markerY = b.sampledAtDevicePx.y - top;
    const crop = await sharp(b.screenshotBuffer).extract({ left: Math.round(left), top: Math.round(top), width: cropSize, height: cropSize }).png().toBuffer();
    const overlay = Buffer.from(
      `<svg width="${cropSize}" height="${cropSize}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${markerX}" cy="${markerY}" r="10" fill="none" stroke="#ff00ff" stroke-width="2"/>
        <path d="M ${markerX - 16} ${markerY} H ${markerX + 16} M ${markerX} ${markerY - 16} V ${markerY + 16}" stroke="#ff00ff" stroke-width="1"/>
      </svg>`,
    );
    const marked = await sharp(crop).composite([{ input: overlay }]).png().toBuffer();
    await writeFile(path.join(root, `${ticker.toLowerCase()}-best-marked.png`), marked);
    const { screenshotBuffer: _s, ...rest } = b;
    findings.targets[ticker] = rest;
  }

  await writeFile(path.join(root, "raw-f2-temporal-investigation.json"), `${JSON.stringify(findings, null, 2)}\n`);
  console.log(JSON.stringify(findings, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
