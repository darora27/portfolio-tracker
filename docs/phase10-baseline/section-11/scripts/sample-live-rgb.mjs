import { chromium } from "playwright";
import sharp from "sharp";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const CRITERION = "TST-03";
const runtimeProcess = globalThis.process;
const runtimeCwd = runtimeProcess?.cwd() ?? globalThis.nodeRepl?.cwd;
if (!runtimeCwd) throw new Error("Unable to resolve the repository working directory.");
const runtimeEnv = runtimeProcess?.env ?? {};
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-11");
const output = path.join(root, "pixel-samples");
const temporalFrames = path.join(output, "temporal-trail-frames");
const base = runtimeEnv.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const MAX_WAIT_MS = 150_000;
const SAMPLE_INTERVAL_MS = 350;
const SAMPLE_RADIUS_PX = 4;
const MIN_PLANET_CLEARANCE_PX = 1;

const gainStops = ["#1f7a46", "#63ef98", "#a9ffcf"];
const lossStops = ["#ff9d97", "#ff665f", "#b3241d"];

function emitResult(criterion, pass, measured, error = null) {
  console.log(
    `machine-readable: ${JSON.stringify({ criterion, pass, measured, error })}`,
  );
  if (runtimeProcess) runtimeProcess.exitCode = pass ? 0 : 1;
}

async function chromiumExecutablePath() {
  const explicit = runtimeEnv.PHASE10_CHROMIUM_EXECUTABLE;
  if (explicit) {
    try {
      await access(explicit);
      return explicit;
    } catch {
      // Continue to the retained Playwright cache used by this repository.
    }
  }

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
      } catch {
        // Try the next retained revision/layout.
      }
    }
  }
  const playwrightExecutable = chromium.executablePath();
  await access(playwrightExecutable);
  return playwrightExecutable;
}

function rgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function hex(channels) {
  return `#${channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
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
  return hex(left.map((channel, offset) =>
    channel + (right[offset] - channel) * local
  ));
}

function rampForWeeklyFromPayload(weekly) {
  if (weekly === null || Math.abs(weekly) <= 0.002) return "#e3b65c";
  const magnitude = Math.min(0.12, Math.max(0.002, Math.abs(weekly)));
  const amount = (magnitude - 0.002) / (0.12 - 0.002);
  return ramp(weekly > 0 ? gainStops : lossStops, amount);
}

function linear(channel) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(channels) {
  return (
    linear(channels[0]) * 0.2126 +
    linear(channels[1]) * 0.7152 +
    linear(channels[2]) * 0.0722
  );
}

function hueChroma(channels) {
  const values = channels.map((channel) => channel / 255);
  const maximum = Math.max(...values);
  const minimum = Math.min(...values);
  const chroma = maximum - minimum;
  if (!chroma) return { hue: null, chroma: 0 };
  let sector;
  if (maximum === values[0]) sector = ((values[1] - values[2]) / chroma) % 6;
  else if (maximum === values[1]) sector = (values[2] - values[0]) / chroma + 2;
  else sector = (values[0] - values[1]) / chroma + 4;
  return { hue: (sector * 60 + 360) % 360, chroma };
}

function hueDistance(left, right) {
  const difference = Math.abs(left - right) % 360;
  return Math.min(difference, 360 - difference);
}

function lab(channels) {
  const [red, green, blue] = channels.map(linear);
  const x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047;
  const y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  const z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883;
  const transform = (value) =>
    value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
  return [
    116 * transform(y) - 16,
    500 * (transform(x) - transform(y)),
    200 * (transform(y) - transform(z)),
  ];
}

function deltaE(left, right) {
  const a = lab(left);
  const b = lab(right);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

// Readiness contract (pinned in docs/phase10-workflow/specs/section-11.md
// §11): ready once the canvas is visible and every holding has painted its
// trail-sample coordinates and weekly-return payload — the exact data this
// script samples against, so waiting for it is waiting for the thing being
// measured to exist, not an arbitrary delay.
async function waitForUniverseReady(page) {
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(
    () =>
      document.querySelectorAll(
        "[data-scene-ticker][data-trail-sample-x][data-weekly-return]",
      ).length === 8,
  );
  await page.waitForTimeout(1_200);
}

function sampleAt(x, y, expected, data, info) {
  const expectedRgb = rgb(expected);
  const candidates = [];
  for (let offsetY = -SAMPLE_RADIUS_PX; offsetY <= SAMPLE_RADIUS_PX; offsetY += 1) {
    for (let offsetX = -SAMPLE_RADIUS_PX; offsetX <= SAMPLE_RADIUS_PX; offsetX += 1) {
      const sampleX = Math.max(0, Math.min(info.width - 1, Math.round(x + offsetX)));
      const sampleY = Math.max(0, Math.min(info.height - 1, Math.round(y + offsetY)));
      const offset = (sampleY * info.width + sampleX) * 3;
      const channels = [data[offset], data[offset + 1], data[offset + 2]];
      candidates.push({
        x: sampleX,
        y: sampleY,
        channels,
        deltaE: deltaE(channels, expectedRgb),
      });
    }
  }
  return candidates.sort((left, right) => left.deltaE - right.deltaE)[0];
}

async function readDescriptors(page) {
  return page
    .locator("[data-scene-ticker]")
    .evaluateAll((labels) =>
      labels.map((label) => ({
        ticker: label.dataset.sceneTicker,
        weekly: label.dataset.weeklyReturn === "null"
          ? null
          : Number(label.dataset.weeklyReturn),
        x: Number(label.dataset.trailSampleX),
        y: Number(label.dataset.trailSampleY),
        planetCenterX: Number(label.dataset.planetCenterX),
        planetCenterY: Number(label.dataset.planetCenterY),
        planetRadiusPx: Number(label.dataset.planetRadiusPx),
      })),
    );
}

function evaluateSample(descriptor, descriptors, sampled, elapsedMs, frameIndex) {
  const { hue, chroma } = hueChroma(sampled.channels);
  const anchor =
    descriptor.weekly === null || Math.abs(descriptor.weekly) <= 0.002
      ? null
      : descriptor.weekly > 0 ? 143 : 3;
  const minimumPlanetClearancePx = Math.min(
    ...descriptors.map((planet) =>
      Math.hypot(
        sampled.x - planet.planetCenterX,
        sampled.y - planet.planetCenterY,
      ) - planet.planetRadiusPx
    ),
  );
  const result = {
    ticker: descriptor.ticker,
    weekly: descriptor.weekly,
    expected: rampForWeeklyFromPayload(descriptor.weekly),
    publishedSample: {
      x: Number(descriptor.x.toFixed(3)),
      y: Number(descriptor.y.toFixed(3)),
    },
    sampledAt: {
      x: sampled.x,
      y: sampled.y,
    },
    sampled: hex(sampled.channels),
    deltaE: Number(sampled.deltaE.toFixed(3)),
    hue: hue === null ? null : Number(hue.toFixed(3)),
    chroma: Number(chroma.toFixed(3)),
    luminance: Number(luminance(sampled.channels).toFixed(6)),
    hueDistance: anchor === null || hue === null
      ? null
      : Number(hueDistance(hue, anchor).toFixed(3)),
    minimumPlanetClearancePx: Number(minimumPlanetClearancePx.toFixed(3)),
    elapsedMs,
    frameIndex,
  };
  return {
    result,
    pass:
      result.deltaE <= 8 &&
      (anchor === null ||
        (result.chroma > 0.3 && result.hueDistance <= 10)) &&
      result.minimumPlanetClearancePx >= MIN_PLANET_CLEARANCE_PX,
  };
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function buildTemporalPlate(samples, destination) {
  const columns = 4;
  const cropWidth = 300;
  const cropHeight = 160;
  const captionHeight = 42;
  const tileHeight = cropHeight + captionHeight;
  const titleHeight = 42;
  const plateWidth = columns * cropWidth;
  const plateHeight =
    titleHeight + Math.ceil(samples.length / columns) * tileHeight;
  const composites = [];

  for (const [index, sample] of samples.entries()) {
    const left = Math.max(
      0,
      Math.min(1440 - cropWidth, Math.round(sample.sampledAt.x - cropWidth / 2)),
    );
    const top = Math.max(
      0,
      Math.min(900 - cropHeight, Math.round(sample.sampledAt.y - cropHeight / 2)),
    );
    const markerX = sample.sampledAt.x - left;
    const markerY = sample.sampledAt.y - top;
    const crop = await sharp(sample.framePath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .png()
      .toBuffer();
    const overlay = Buffer.from(
      `<svg width="${cropWidth}" height="${tileHeight}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${markerX}" cy="${markerY}" r="8" fill="none" stroke="#fff0cf" stroke-width="1.5"/>
        <path d="M ${markerX - 13} ${markerY} H ${markerX + 13} M ${markerX} ${markerY - 13} V ${markerY + 13}" stroke="#fff0cf" stroke-width="1"/>
        <rect x="0" y="${cropHeight}" width="${cropWidth}" height="${captionHeight}" fill="#0a0c10"/>
        <text x="10" y="${cropHeight + 16}" fill="#fff0cf" font-family="monospace" font-size="12" font-weight="700">${escapeXml(sample.ticker)}</text>
        <text x="10" y="${cropHeight + 33}" fill="#d5ba8c" font-family="monospace" font-size="10">expected ${escapeXml(sample.expected)} · sampled ${escapeXml(sample.sampled)} · ΔE ${sample.deltaE} · ${(sample.elapsedMs / 1000).toFixed(1)}s</text>
      </svg>`,
    );
    const tile = await sharp({
      create: {
        width: cropWidth,
        height: tileHeight,
        channels: 3,
        background: "#0a0c10",
      },
    })
      .composite([
        { input: crop, left: 0, top: 0 },
        { input: overlay, left: 0, top: 0 },
      ])
      .png()
      .toBuffer();
    composites.push({
      input: tile,
      left: (index % columns) * cropWidth,
      top: titleHeight + Math.floor(index / columns) * tileHeight,
    });
  }

  const title = Buffer.from(
    `<svg width="${plateWidth}" height="${titleHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${plateWidth}" height="${titleHeight}" fill="#020706"/>
      <text x="14" y="26" fill="#fff0cf" font-family="monospace" font-size="15" font-weight="700">VIS-04 / TST-03 · TEMPORAL PER-HOLDING TRAIL SAMPLES · 1440×900 · OWNER-CONFIRMED ARC 18–30°</text>
    </svg>`,
  );
  composites.unshift({ input: title, left: 0, top: 0 });

  await sharp({
    create: {
      width: plateWidth,
      height: plateHeight,
      channels: 3,
      background: "#020706",
    },
  })
    .composite(composites)
    .png()
    .toFile(destination);
}

let browser;
try {
  await mkdir(temporalFrames, { recursive: true });
  const chromiumArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    ...(runtimeEnv.PHASE10_CHROMIUM_SINGLE_PROCESS === "1"
      ? ["--single-process", "--no-zygote"]
      : [
          "--use-gl=angle",
          "--use-angle=swiftshader",
          "--enable-unsafe-swiftshader",
          "--enable-webgl",
          "--ignore-gpu-blocklist",
        ]),
  ];
  browser = await chromium.launch({
    headless: true,
    executablePath: await chromiumExecutablePath(),
    args: chromiumArgs,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const browserLog = [];
  page.on("console", (message) => {
    browserLog.push({
      type: message.type(),
      text: message.text(),
    });
  });
  page.on("pageerror", (error) => {
    browserLog.push({
      type: "pageerror",
      text: error.message,
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  try {
    await waitForUniverseReady(page);
  } catch (error) {
    const safePageRead = async (read) => {
      try {
        return await read();
      } catch (readError) {
        return { error: readError.message };
      }
    };
    const readinessFailure = {
      url: await safePageRead(() => page.url()),
      title: await safePageRead(() => page.title()),
      bodyText: await safePageRead(async () =>
        (await page.locator("body").innerText()).slice(0, 4_000)
      ),
      canvasCount: await safePageRead(() => page.locator("canvas").count()),
      sceneTickerCount: await safePageRead(() =>
        page.locator("[data-scene-ticker]").count()
      ),
      browserLog,
      error: error.message,
    };
    readinessFailure.screenshot = await safePageRead(async () => {
      const destination = path.join(
        root,
        "raw-temporal-sampler-readiness-failure.png",
      );
      await page.screenshot({ path: destination, fullPage: true });
      return path.relative(runtimeCwd, destination);
    });
    await writeFile(
      path.join(root, "raw-temporal-sampler-readiness-failure.json"),
      `${JSON.stringify(readinessFailure, null, 2)}\n`,
    );
    throw new Error(
      `Temporal sampler readiness failed: ${JSON.stringify(readinessFailure)}`,
    );
  }

  const initialDescriptors = await readDescriptors(page);
  const fixtureOrder = initialDescriptors.map(({ ticker }) => ticker);
  const accepted = new Map();
  const bestAttempts = new Map();
  const startedAt = Date.now();
  let frameIndex = 0;

  while (accepted.size < fixtureOrder.length) {
    const descriptors = await readDescriptors(page);
    const screenshot = await page.screenshot();
    const { data, info } = await sharp(screenshot)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const elapsedMs = Date.now() - startedAt;

    for (const descriptor of descriptors) {
      if (accepted.has(descriptor.ticker)) continue;
      const expected = rampForWeeklyFromPayload(descriptor.weekly);
      const sampled = sampleAt(descriptor.x, descriptor.y, expected, data, info);
      const attempt = evaluateSample(
        descriptor,
        descriptors,
        sampled,
        elapsedMs,
        frameIndex,
      );
      const priorBest = bestAttempts.get(descriptor.ticker);
      if (
        !priorBest ||
        attempt.result.deltaE < priorBest.deltaE ||
        (
          attempt.result.deltaE === priorBest.deltaE &&
          attempt.result.minimumPlanetClearancePx >
            priorBest.minimumPlanetClearancePx
        )
      ) {
        bestAttempts.set(descriptor.ticker, attempt.result);
      }
      if (!attempt.pass) continue;
      const framePath = path.join(
        temporalFrames,
        `${descriptor.ticker.toLowerCase()}-trail-phase.png`,
      );
      await writeFile(framePath, screenshot);
      accepted.set(descriptor.ticker, {
        ...attempt.result,
        framePath,
        frameArtifact: path.relative(runtimeCwd, framePath),
      });
      console.error(
        `captured ${descriptor.ticker} at ${(elapsedMs / 1000).toFixed(1)}s ` +
        `(ΔE ${attempt.result.deltaE}, clearance ${attempt.result.minimumPlanetClearancePx}px)`,
      );
    }

    if (accepted.size === fixtureOrder.length) break;
    if (elapsedMs >= MAX_WAIT_MS) {
      const unresolved = fixtureOrder
        .filter((ticker) => !accepted.has(ticker))
        .map((ticker) => ({ ticker, best: bestAttempts.get(ticker) }));
      throw new Error(
        `Temporal sampling timed out after ${MAX_WAIT_MS}ms: ${JSON.stringify(unresolved)}`,
      );
    }
    frameIndex += 1;
    await page.waitForTimeout(SAMPLE_INTERVAL_MS);
  }

  const samples = fixtureOrder.map((ticker) => accepted.get(ticker));

  for (const direction of [1, -1]) {
    const sameDirection = samples
      .filter(({ weekly }) => weekly !== null && Math.sign(weekly) === direction)
      .sort((left, right) => Math.abs(left.weekly) - Math.abs(right.weekly));
    for (let index = 1; index < sameDirection.length; index += 1) {
      const prior = sameDirection[index - 1];
      const current = sameDirection[index];
      const ordered = direction > 0
        ? current.luminance >= prior.luminance
        : current.luminance <= prior.luminance;
      if (!ordered) {
        throw new Error(
          `Magnitude ordering failed: ${JSON.stringify({ prior, current })}`,
        );
      }
    }
  }

  const platePath = path.join(output, "temporal-trail-samples.png");
  await buildTemporalPlate(samples, platePath);
  const measured = {
    viewport: "1440x900",
    fixtureCount: fixtureOrder.length,
    everyFixtureHoldingSampled: fixtureOrder.length === samples.length,
    temporalSampling: {
      authorisedBy: "Devan, July 29 2026",
      method: "Each holding is sampled at its own naturally unoccluded orbital phase.",
      elapsedMs: Date.now() - startedAt,
      inspectedFrameCount: frameIndex + 1,
      capturedFrameCount: new Set(samples.map(({ frameIndex: value }) => value)).size,
      sampleIntervalMs: SAMPLE_INTERVAL_MS,
      maximumWaitMs: MAX_WAIT_MS,
      minimumPlanetClearancePx: MIN_PLANET_CLEARANCE_PX,
      sampleRadiusPx: SAMPLE_RADIUS_PX,
    },
    unchangedGates: {
      deltaEMaximum: 8,
      hueDistanceMaximumDegrees: 10,
      chromaMinimumExclusive: 0.3,
      magnitudeOrdering: true,
      fixtureSubsetAllowed: false,
      trailArcDegrees: [18, 30],
    },
    samples: samples.map(({ framePath: _framePath, ...sample }) => sample),
    visualEvidence: {
      plate: path.relative(runtimeCwd, platePath),
      frames: samples.map(({ frameArtifact }) => frameArtifact),
    },
    literalReferences: {
      flat: "#e3b65c",
      comet: "#f4f0df",
      sunUp: "#f5c45d",
      sunDown: "#d65a24",
    },
  };
  await writeFile(
    path.join(root, "raw-temporal-trail-samples.json"),
    `${JSON.stringify(measured, null, 2)}\n`,
  );
  console.log(JSON.stringify(measured));
  emitResult(CRITERION, true, measured);
} catch (error) {
  emitResult(CRITERION, false, null, error.message);
} finally {
  if (browser) await browser.close();
}
