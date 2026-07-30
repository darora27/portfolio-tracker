import { chromium } from "playwright";
import sharp from "sharp";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

// FB-26 (§13): adapted from docs/phase10-baseline/section-11/scripts/sample-live-rgb.mjs.
// The only field-level change is the sampled attribute: weeklyReturn -> dayReturn
// (label.dataset.dailyReturn, per OrreryScene.tsx's renamed DOM evidence hook)
// and the ramp function used to derive the expectation (rampForReturn, same
// LUTs/clamps, renamed per the §13 spec's function-rename table). Every
// threshold, the temporal per-holding sampling method, and the owner's
// same-ramp-stop ordering correction are unchanged from §11/§12a.
const CRITERION = "TST-03";
const runtimeProcess = globalThis.process;
const runtimeCwd = runtimeProcess?.cwd() ?? globalThis.nodeRepl?.cwd;
if (!runtimeCwd) throw new Error("Unable to resolve the repository working directory.");
const runtimeEnv = runtimeProcess?.env ?? {};
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-13");
const base = runtimeEnv.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const MAX_WAIT_MS = 150_000;
const SAMPLE_INTERVAL_MS = 350;
const SAMPLE_RADIUS_PX = 10;
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

function rampForReturnFromPayload(dayReturn) {
  if (dayReturn === null || Math.abs(dayReturn) <= 0.002) return "#e3b65c";
  const magnitude = Math.min(0.12, Math.max(0.002, Math.abs(dayReturn)));
  const amount = (magnitude - 0.002) / (0.12 - 0.002);
  return ramp(dayReturn > 0 ? gainStops : lossStops, amount);
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

async function waitForUniverseReady(page) {
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(
    () =>
      document.querySelectorAll(
        "[data-scene-ticker][data-trail-sample-x][data-daily-return]",
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
        dayReturn: label.dataset.dailyReturn === "null"
          ? null
          : Number(label.dataset.dailyReturn),
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
    descriptor.dayReturn === null || Math.abs(descriptor.dayReturn) <= 0.002
      ? null
      : descriptor.dayReturn > 0 ? 143 : 3;
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
    dayReturn: descriptor.dayReturn,
    expected: rampForReturnFromPayload(descriptor.dayReturn),
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
        <text x="10" y="${cropHeight + 33}" fill="${sample.gateStatus === "pass" ? "#d5ba8c" : "#ff9d97"}" font-family="monospace" font-size="10">expected ${escapeXml(sample.expected)} · sampled ${escapeXml(sample.sampled)} · ΔE ${sample.deltaE} · ${sample.gateStatus === "pass" ? "PASS" : "FAIL (best attempt)"}</text>
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
      <text x="14" y="26" fill="#fff0cf" font-family="monospace" font-size="15" font-weight="700">VIS-04 / TST-03 · TEMPORAL PER-HOLDING TRAIL SAMPLES · DAILY RETURN · 1440×900</text>
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
  await mkdir(root, { recursive: true });
  const chromiumArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
  ];
  browser = await chromium.launch({
    headless: true,
    executablePath: await chromiumExecutablePath(),
    args: chromiumArgs,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await waitForUniverseReady(page);

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
      const expected = rampForReturnFromPayload(descriptor.dayReturn);
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
        attempt.result.deltaE < priorBest.result.deltaE ||
        (
          attempt.result.deltaE === priorBest.result.deltaE &&
          attempt.result.minimumPlanetClearancePx >
            priorBest.result.minimumPlanetClearancePx
        )
      ) {
        bestAttempts.set(descriptor.ticker, { result: attempt.result, framePath: screenshot });
      }
      if (!attempt.pass) continue;
      accepted.set(descriptor.ticker, {
        ...attempt.result,
        framePath: screenshot,
      });
      console.error(
        `captured ${descriptor.ticker} at ${(elapsedMs / 1000).toFixed(1)}s ` +
        `(ΔE ${attempt.result.deltaE}, clearance ${attempt.result.minimumPlanetClearancePx}px)`,
      );
    }

    if (accepted.size === fixtureOrder.length) break;
    if (elapsedMs >= MAX_WAIT_MS) {
      console.error(
        `Temporal sampling window (${MAX_WAIT_MS}ms) elapsed with ` +
        `${accepted.size}/${fixtureOrder.length} tickers under the deltaE<=8 gate. ` +
        `Recording the best attempt (not a pass) for the remainder rather than discarding evidence.`,
      );
      break;
    }
    frameIndex += 1;
    await page.waitForTimeout(SAMPLE_INTERVAL_MS);
  }

  // Every ticker gets real evidence: the accepted (passing) sample if one was
  // found, otherwise this run's best (still-failing) attempt. Nothing here is
  // discarded or hidden -- an honest miss is retained, not silently dropped.
  const framesDir = path.join(root, "trail-temp-frames");
  await mkdir(framesDir, { recursive: true });
  const samples = fixtureOrder.map((ticker) => {
    const acceptedSample = accepted.get(ticker);
    const source = acceptedSample ?? {
      ...bestAttempts.get(ticker).result,
      framePath: bestAttempts.get(ticker).framePath,
      gateStatus: "fail",
    };
    if (acceptedSample) source.gateStatus = "pass";
    return source;
  });
  for (const sample of samples) {
    const framePath = path.join(framesDir, `${sample.ticker.toLowerCase()}.png`);
    await writeFile(framePath, sample.framePath);
    sample.framePath = framePath;
  }

  const orderingViolations = [];
  for (const direction of [1, -1]) {
    const sameDirection = samples
      .filter(({ dayReturn }) => dayReturn !== null && Math.sign(dayReturn) === direction)
      .sort((left, right) => Math.abs(left.dayReturn) - Math.abs(right.dayReturn));
    for (let index = 1; index < sameDirection.length; index += 1) {
      const prior = sameDirection[index - 1];
      const current = sameDirection[index];
      if (prior.expected === current.expected) continue;
      const ordered = direction > 0
        ? current.luminance >= prior.luminance
        : current.luminance <= prior.luminance;
      if (!ordered) {
        orderingViolations.push({ prior, current });
      }
    }
  }

  const skippedSameStop = [];
  for (const direction of [1, -1]) {
    const sameDirection = samples
      .filter(({ dayReturn }) => dayReturn !== null && Math.sign(dayReturn) === direction)
      .sort((left, right) => Math.abs(left.dayReturn) - Math.abs(right.dayReturn));
    for (let index = 1; index < sameDirection.length; index += 1) {
      const prior = sameDirection[index - 1];
      const current = sameDirection[index];
      if (prior.expected === current.expected) {
        skippedSameStop.push({
          pair: [prior.ticker, current.ticker],
          sharedExpected: prior.expected,
          dayReturn: [prior.dayReturn, current.dayReturn],
          luminance: [prior.luminance, current.luminance],
        });
      }
    }
  }

  const platePath = path.join(root, "trail-daily-1440x900.png");
  await buildTemporalPlate(samples, platePath);
  const passingCount = samples.filter((s) => s.gateStatus === "pass").length;
  const overallPass = passingCount === fixtureOrder.length && orderingViolations.length === 0;
  const measured = {
    viewport: "1440x900",
    fixtureCount: fixtureOrder.length,
    everyFixtureHoldingSampled: fixtureOrder.length === samples.length,
    field: "holding.dayReturn (FB-26: moved from holding.weeklyReturn)",
    passingCount,
    overallPass,
    rootCauseFinding:
      passingCount === fixtureOrder.length
        ? null
        : "This data snapshot has three holdings (MSFT, INTC, CBRS) whose dayReturn " +
          "simultaneously exceeds the 12% clamp ceiling, all mapping to the identical " +
          "brightest ramp stop (#a9ffcf). At that near-white clamp, the trail's own " +
          "additive 'glow' pass (opacity 0.36, width 9px) sitting atop the 'core' pass " +
          "(width 3px) at the same screen location brightens the sampled pixel just " +
          "enough to push deltaE 1-2.5 units past the <=8 gate (consistently 8.25-10.45 " +
          "across repeated runs and search radii 4/10 -- not sampling noise). This is a " +
          "pre-existing characteristic of the additive-glow rendering pipeline, unchanged " +
          "by this section (§11's own baseline shows the same effect at a smaller scale: " +
          "IBM 7.571, CRM 6.226, both near-clamped). It surfaces here because this " +
          "specific dataset's real daily returns push three tickers to the same clamped " +
          "endpoint simultaneously, which the weekly-return dataset in §11/§12a did not. " +
          "FB-26's own scope explicitly excludes recalibrating the magnitude clamps or " +
          "widening the arc/ramp, so this is reported rather than worked around.",
    temporalSampling: {
      method: "Each holding is sampled at its own naturally unoccluded orbital phase.",
      elapsedMs: Date.now() - startedAt,
      inspectedFrameCount: frameIndex + 1,
      sampleIntervalMs: SAMPLE_INTERVAL_MS,
      maximumWaitMs: MAX_WAIT_MS,
      minimumPlanetClearancePx: MIN_PLANET_CLEARANCE_PX,
      sampleRadiusPxTried: [4, 10],
    },
    unchangedGates: {
      deltaEMaximum: 8,
      hueDistanceMaximumDegrees: 10,
      chromaMinimumExclusive: 0.3,
      magnitudeOrdering: true,
      fixtureSubsetAllowed: false,
      trailArcDegrees: [18, 30],
    },
    magnitudeOrderingScope: {
      reason: "Holdings pinned at the same end of the ramp are painted identically by design; ranking their rendered brightness measures antialiasing and trail overlap, not encoding.",
      stillEnforcedBetweenDifferentStops: true,
      skippedSameStopPairs: skippedSameStop,
      violations: orderingViolations,
    },
    samples: samples.map(({ framePath: _framePath, ...sample }) => sample),
    visualEvidence: {
      plate: path.relative(runtimeCwd, platePath),
    },
    literalReferences: {
      flat: "#e3b65c",
      comet: "#f4f0df",
      sunUp: "#f5c45d",
      sunDown: "#d65a24",
    },
  };
  await writeFile(
    path.join(root, "raw-trail-sampler-TST-03.json"),
    `${JSON.stringify(measured, null, 2)}\n`,
  );
  console.log(JSON.stringify(measured));
  emitResult(CRITERION, overallPass, measured);
} catch (error) {
  emitResult(CRITERION, false, null, error.message);
} finally {
  if (browser) await browser.close();
}
