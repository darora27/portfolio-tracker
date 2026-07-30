import { chromium } from "playwright";
import sharp from "sharp";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

// Independent reviewer-owned re-derivation of TST-03/VIS-04 (Claude Lead,
// §13 review round 3). Written fresh from the spec's own gate description
// rather than copied from docs/phase10-baseline/section-13/scripts/sample-live-rgb.mjs,
// to catch any bug that script might share with itself. Uses the app's own
// published data-trail-sample-candidates (scene-model.ts's
// TRAIL_SAMPLE_SEARCH_FRACTIONS, owner-authorized 2026-07-30) as the search
// space, same as the implementer, since that field is production evidence,
// not a script-authored shortcut.
const runtimeProcess = globalThis.process;
const runtimeCwd = runtimeProcess.cwd();
const runtimeEnv = runtimeProcess.env;
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-13/review-scripts-3/out");
const base = runtimeEnv.PHASE10_BASE_URL ?? "http://127.0.0.1:3200/share";
const MAX_WAIT_MS = 150_000;
const SAMPLE_INTERVAL_MS = 350;
const SAMPLE_RADIUS_PX = 10;
const MIN_CLEARANCE_PX = 1;
const DELTA_E_MAX = 8;
const HUE_DISTANCE_MAX = 10;
const CHROMA_MIN = 0.3;

const gainStops = ["#1f7a46", "#63ef98", "#a9ffcf"];
const lossStops = ["#ff9d97", "#ff665f", "#b3241d"];

async function chromiumExecutablePath() {
  const cacheRoot = path.join(homedir(), "Library/Caches/ms-playwright");
  const revisions = (await readdir(cacheRoot, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && e.name.startsWith("chromium_headless_shell-"))
    .map((e) => e.name)
    .sort()
    .reverse();
  for (const revision of revisions) {
    for (const rel of [
      "chrome-mac/headless_shell",
      "chrome-headless-shell-mac-arm64/chrome-headless-shell",
    ]) {
      const candidate = path.join(cacheRoot, revision, rel);
      try {
        await access(candidate);
        return candidate;
      } catch {}
    }
  }
  return chromium.executablePath();
}

function rgbFromHex(hex) {
  const v = Number.parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function rampInterp(stops, amount) {
  if (amount === 0.5) return stops[1];
  const scaled = Math.min(1, Math.max(0, amount)) * 63;
  const idx = Math.round(scaled);
  const pos = idx / 63;
  const seg = Math.min(stops.length - 2, Math.floor(pos * 2));
  const local = pos * 2 - seg;
  const left = rgbFromHex(stops[seg]);
  const right = rgbFromHex(stops[seg + 1]);
  return left.map((c, i) => Math.round(c + (right[i] - c) * local));
}

function expectedRgbForDailyReturn(dayReturn) {
  if (dayReturn === null || Math.abs(dayReturn) <= 0.002) return rgbFromHex("#e3b65c");
  const magnitude = Math.min(0.12, Math.max(0.002, Math.abs(dayReturn)));
  const amount = (magnitude - 0.002) / (0.12 - 0.002);
  return rampInterp(dayReturn > 0 ? gainStops : lossStops, amount);
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function toLab([r, g, b]) {
  const rl = srgbToLinear(r), gl = srgbToLinear(g), bl = srgbToLinear(b);
  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047;
  const y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function deltaE76(rgbA, rgbB) {
  const [l1, a1, b1] = toLab(rgbA);
  const [l2, a2, b2] = toLab(rgbB);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

function toHueChroma([r, g, b]) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const chroma = max - min;
  if (chroma === 0) return { hue: null, chroma: 0 };
  let h;
  if (max === rn) h = ((gn - bn) / chroma) % 6;
  else if (max === gn) h = (bn - rn) / chroma + 2;
  else h = (rn - gn) / chroma + 4;
  h = (h * 60 + 360) % 360;
  return { hue: h, chroma };
}

function angularHueDistance(a, b) {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

function relLuminance([r, g, b]) {
  return srgbToLinear(r) * 0.2126 + srgbToLinear(g) * 0.7152 + srgbToLinear(b) * 0.0722;
}

async function waitReady(page) {
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(
    () =>
      document.querySelectorAll(
        "[data-scene-ticker][data-trail-sample-x][data-daily-return]",
      ).length === 8,
  );
  await page.waitForTimeout(1200);
}

async function readDescriptors(page) {
  return page.locator("[data-scene-ticker]").evaluateAll((labels) =>
    labels.map((label) => {
      let candidates = null;
      try {
        candidates = JSON.parse(label.dataset.trailSampleCandidates ?? "null");
      } catch {}
      return {
        ticker: label.dataset.sceneTicker,
        dayReturn:
          label.dataset.dailyReturn === "null" ? null : Number(label.dataset.dailyReturn),
        candidates:
          Array.isArray(candidates) && candidates.length > 0
            ? candidates
            : [{ fraction: null, x: Number(label.dataset.trailSampleX), y: Number(label.dataset.trailSampleY) }],
        planetCenterX: Number(label.dataset.planetCenterX),
        planetCenterY: Number(label.dataset.planetCenterY),
        planetRadiusPx: Number(label.dataset.planetRadiusPx),
      };
    }),
  );
}

function pixelsNear(x, y, data, info) {
  const pixels = [];
  for (let dy = -SAMPLE_RADIUS_PX; dy <= SAMPLE_RADIUS_PX; dy += 1) {
    for (let dx = -SAMPLE_RADIUS_PX; dx <= SAMPLE_RADIUS_PX; dx += 1) {
      const sx = Math.max(0, Math.min(info.width - 1, Math.round(x + dx)));
      const sy = Math.max(0, Math.min(info.height - 1, Math.round(y + dy)));
      const off = (sy * info.width + sx) * 3;
      pixels.push({ x: sx, y: sy, rgb: [data[off], data[off + 1], data[off + 2]] });
    }
  }
  return pixels;
}

let browser;
try {
  await mkdir(root, { recursive: true });
  browser = await chromium.launch({
    headless: true,
    executablePath: await chromiumExecutablePath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await waitReady(page);

  const initial = await readDescriptors(page);
  const order = initial.map((d) => d.ticker);
  const accepted = new Map();
  const bestByTicker = new Map();
  const triedCount = new Map(order.map((t) => [t, 0]));
  const startedAt = Date.now();
  let frameIndex = 0;

  while (accepted.size < order.length) {
    const descriptors = await readDescriptors(page);
    const screenshot = await page.screenshot();
    const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const elapsedMs = Date.now() - startedAt;

    for (const d of descriptors) {
      if (accepted.has(d.ticker)) continue;
      const expectedRgb = expectedRgbForDailyReturn(d.dayReturn);
      const anchorHue = d.dayReturn === null || Math.abs(d.dayReturn) <= 0.002 ? null : d.dayReturn > 0 ? 143 : 3;

      for (const candidate of d.candidates) {
        const nearby = pixelsNear(candidate.x, candidate.y, data, info);
        let bestNearby = null;
        for (const px of nearby) {
          const de = deltaE76(px.rgb, expectedRgb);
          if (!bestNearby || de < bestNearby.deltaE) bestNearby = { ...px, deltaE: de };
        }
        triedCount.set(d.ticker, triedCount.get(d.ticker) + 1);

        const { hue, chroma } = toHueChroma(bestNearby.rgb);
        const clearance = Math.min(
          ...descriptors.map((p) => Math.hypot(bestNearby.x - p.planetCenterX, bestNearby.y - p.planetCenterY) - p.planetRadiusPx),
        );
        const hueDist = anchorHue === null || hue === null ? null : angularHueDistance(hue, anchorHue);
        const pass =
          bestNearby.deltaE <= DELTA_E_MAX &&
          (anchorHue === null || (chroma > CHROMA_MIN && hueDist <= HUE_DISTANCE_MAX)) &&
          clearance >= MIN_CLEARANCE_PX;

        const record = {
          ticker: d.ticker,
          dayReturn: d.dayReturn,
          fraction: candidate.fraction,
          deltaE: Number(bestNearby.deltaE.toFixed(3)),
          hue: hue === null ? null : Number(hue.toFixed(3)),
          hueDistance: hueDist === null ? null : Number(hueDist.toFixed(3)),
          chroma: Number(chroma.toFixed(3)),
          clearancePx: Number(clearance.toFixed(3)),
          luminance: Number(relLuminance(bestNearby.rgb).toFixed(6)),
          elapsedMs,
          frameIndex,
        };
        const prior = bestByTicker.get(d.ticker);
        if (!prior || record.deltaE < prior.deltaE) bestByTicker.set(d.ticker, record);

        if (pass) {
          accepted.set(d.ticker, record);
          console.error(
            `[review-3] ${d.ticker} PASS deltaE=${record.deltaE} fraction=${record.fraction} clearance=${record.clearancePx}px tried=${triedCount.get(d.ticker)}`,
          );
          break;
        }
      }
    }

    if (accepted.size === order.length) break;
    if (elapsedMs >= MAX_WAIT_MS) {
      console.error(`[review-3] window elapsed with ${accepted.size}/${order.length} passing`);
      break;
    }
    frameIndex += 1;
    await page.waitForTimeout(SAMPLE_INTERVAL_MS);
  }

  const results = order.map((ticker) => {
    const acc = accepted.get(ticker);
    const best = bestByTicker.get(ticker);
    return {
      ticker,
      pass: Boolean(acc),
      ...(acc ?? best),
      candidatesTried: triedCount.get(ticker),
    };
  });

  const passingCount = results.filter((r) => r.pass).length;
  const overallPass = passingCount === order.length;

  const summary = {
    viewport: "1440x900",
    fixtureCount: order.length,
    passingCount,
    overallPass,
    results,
  };
  await writeFile(path.join(root, "review3-tst03-vis04.json"), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`machine-readable: ${JSON.stringify({ criterion: "TST-03/VIS-04", pass: overallPass, passingCount, fixtureCount: order.length })}`);
} catch (error) {
  console.error("[review-3] error", error);
  runtimeProcess.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
