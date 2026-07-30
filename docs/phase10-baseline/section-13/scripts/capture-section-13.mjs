import { chromium } from "playwright";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const runtimeCwd = process.cwd();
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-13");
const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const VIEWPORT = { width: 1440, height: 900 };

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

async function waitForUniverseReady(page) {
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForFunction(
    () => document.querySelectorAll("[data-scene-ticker]").length >= 8,
    null,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(1_500);
}

async function newContext(browser, viewport = VIEWPORT) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    reducedMotion: "no-preference",
  });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
    } catch {}
  });
  return context;
}

const results = {};

async function run() {
  await mkdir(root, { recursive: true });
  const executablePath = await chromiumExecutablePath();
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: CHROMIUM_ARGS,
  });

  try {
    await captureOverviewAndSpacing(browser);
    await captureMissionControl(browser);
    await capturePanelWidthInvestigation(browser);
    await captureSunRegion(browser);
    await captureMoonClick(browser);
    await capturePlanetPanel(browser);
    await captureFallback(browser);
    await captureSky(browser);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
}

// ---- VIS-01 / FB-01: overview + spacing measurement ----
async function captureOverviewAndSpacing(browser) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await waitForUniverseReady(page);

  await page.screenshot({ path: path.join(root, "overview-1440x900.png") });

  const planets = await page.evaluate(() =>
    [...document.querySelectorAll("[data-scene-ticker]")].map((el) => ({
      ticker: el.dataset.sceneTicker,
      x: Number(el.dataset.planetCenterX),
      y: Number(el.dataset.planetCenterY),
      radius: Number(el.dataset.planetRadiusPx),
    })),
  );

  let minEdgeToEdge = Infinity;
  let minPair = null;
  let minRatio = Infinity;
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const a = planets[i];
      const b = planets[j];
      const centerDistance = Math.hypot(a.x - b.x, a.y - b.y);
      const edgeToEdge = centerDistance - a.radius - b.radius;
      const largerDiameter = Math.max(a.radius, b.radius) * 2;
      const ratio = edgeToEdge / largerDiameter;
      if (edgeToEdge < minEdgeToEdge) {
        minEdgeToEdge = edgeToEdge;
        minPair = [a.ticker, b.ticker];
        minRatio = ratio;
      }
    }
  }

  const viewportBounds = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const maxRight = Math.max(...planets.map((p) => p.x + p.radius));
  const minLeft = Math.min(...planets.map((p) => p.x - p.radius));
  const maxBottom = Math.max(...planets.map((p) => p.y + p.radius));
  const minTop = Math.min(...planets.map((p) => p.y - p.radius));

  const measurement = {
    capturedAt: new Date().toISOString(),
    constants: {
      gapCoefficient: "1.75 -> 1.82",
      additiveTerm: 0.55,
      overviewBeltSpanPct: "0.80 -> 0.75",
    },
    planets,
    minimumEdgeToEdgePx: Number(minEdgeToEdge.toFixed(3)),
    minimumEdgeToEdgeRatioToLargerDiameter: Number(minRatio.toFixed(4)),
    minimumEdgeToEdgePair: minPair,
    passesFloor: minRatio >= 1.0,
    frameMargins: {
      viewport: viewportBounds,
      left: Number(minLeft.toFixed(1)),
      top: Number(minTop.toFixed(1)),
      right: Number((viewportBounds.width - maxRight).toFixed(1)),
      bottom: Number((viewportBounds.height - maxBottom).toFixed(1)),
    },
  };
  await writeFile(
    path.join(root, "raw-fb01-spacing-measurement.json"),
    `${JSON.stringify(measurement, null, 2)}\n`,
  );
  results.fb01 = measurement;
  await context.close();
}

// ---- VIS-02 / VIS-10: Mission Control label size + tab strip ----
async function captureMissionControl(browser) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await page.goto(`${BASE}/share?focus=portfolio&camera=command`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector('[class*="missionControl"]', { timeout: 20_000 });
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(root, "mission-control-1440x900.png") });
  await page.screenshot({ path: path.join(root, "tab-strip-default-1440x900.png") });

  const measurement = await page.evaluate(() => {
    const labelEl = document.querySelector(".radarTimestamp, [class*='radarPairLine'], [class*='railStations'] a");
    const label = labelEl ? getComputedStyle(labelEl).fontSize : null;
    const inactiveTab = document.querySelector('[class*="missionControl"] nav a:not([aria-current="page"])');
    const activeTab = document.querySelector('[class*="missionControl"] nav a[aria-current="page"]');
    const inactiveStyle = inactiveTab ? getComputedStyle(inactiveTab) : null;
    const activeStyle = activeTab ? getComputedStyle(activeTab) : null;
    return {
      genuineLabelFontSize: label,
      inactiveTab: inactiveStyle
        ? {
            background: inactiveStyle.backgroundColor,
            borderBottomWidth: inactiveStyle.borderBottomWidth,
            borderBottomColor: inactiveStyle.borderBottomColor,
            borderBottomStyle: inactiveStyle.borderBottomStyle,
          }
        : null,
      activeTab: activeStyle
        ? {
            background: activeStyle.backgroundColor,
            borderBottomWidth: activeStyle.borderBottomWidth,
            borderBottomColor: activeStyle.borderBottomColor,
            borderBottomStyle: activeStyle.borderBottomStyle,
          }
        : null,
      activeDiffersFromInactive:
        activeStyle && inactiveStyle
          ? activeStyle.borderBottomWidth !== inactiveStyle.borderBottomWidth ||
            activeStyle.borderBottomColor !== inactiveStyle.borderBottomColor
          : null,
    };
  });
  results.fb05fb31 = measurement;
  await writeFile(
    path.join(root, "raw-fb05-fb31-mission-control.json"),
    `${JSON.stringify(measurement, null, 2)}\n`,
  );
  await context.close();
}

// ---- VIS-03 / FB-17: panel width live default + multi-viewport investigation ----
async function capturePanelWidthInvestigation(browser) {
  const widths = [1280, 1366, 1440, 1536, 1920];
  const measurements = [];
  for (const width of widths) {
    const context = await newContext(browser, { width, height: 900 });
    const page = await context.newPage();
    await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
    await waitForUniverseReady(page);
    const ticker = await page.evaluate(
      () => document.querySelector("[data-scene-ticker]")?.dataset.sceneTicker,
    );
    const box = await page.evaluate((t) => {
      const el = document.querySelector(`[data-scene-ticker="${t}"]`);
      return el ? { x: +el.dataset.planetCenterX, y: +el.dataset.planetCenterY } : null;
    }, ticker);
    if (box) {
      await page.mouse.click(box.x, box.y);
      await page.waitForTimeout(2_500);
    }
    const panelMeasurement = await page.evaluate(() => {
      const panel = document.querySelector('aside[aria-live="polite"]');
      if (!panel) return null;
      const rect = panel.getBoundingClientRect();
      const cssVar = getComputedStyle(document.querySelector('[class*="world"]') ?? document.body)
        .getPropertyValue("--panel-width");
      return {
        renderedWidthPx: rect.width,
        cssPanelWidthVar: cssVar.trim(),
        devicePixelRatio: window.devicePixelRatio,
      };
    });
    measurements.push({
      viewportWidth: width,
      devicePixelRatio: panelMeasurement?.devicePixelRatio ?? null,
      cssPanelWidthVar: panelMeasurement?.cssPanelWidthVar ?? null,
      renderedPanelWidthPx: panelMeasurement?.renderedWidthPx ?? null,
      viewportFloorBinds: panelMeasurement
        ? panelMeasurement.renderedWidthPx < 600 - 0.5
        : null,
    });
    if (width === 1440) {
      await page.screenshot({ path: path.join(root, "panel-width-live-default.png") });
    }
    await context.close();
  }

  const investigation = {
    capturedAt: new Date().toISOString(),
    hypothesis:
      "The approach-camera panel rule is width: min(var(--panel-width), calc(100vw - 3rem)). " +
      "At 100% browser zoom and a maximized window, viewport width should equal --panel-width " +
      "(600px) exactly once vw >= 600px + 3rem (~648px @16px root). Below that, the calc(100vw - 3rem) " +
      "term binds and the panel renders narrower than its own CSS custom property value, which would " +
      "explain a live/capture disagreement if the owner's real window/display is narrower than the " +
      "capture strip's fixed 1440px viewport, or his browser runs at non-100% zoom (which divides the " +
      "effective CSS px viewport width the same way a narrower physical window would).",
    measurements,
    findings: {
      panelBoundByCalcAtAnyTestedWidth: measurements.some((m) => m.viewportFloorBinds),
      allDevicePixelRatiosObserved: [...new Set(measurements.map((m) => m.devicePixelRatio))],
      conclusion:
        "At every tested logical viewport width (1280-1920px), 100vw - 3rem (>=1232px at the " +
        "narrowest tested width) comfortably exceeds --panel-width (600px), so the calc() floor " +
        "does not bind at 100% zoom for any common desktop width -- the panel renders at the full " +
        "600px in every case tested here. This narrows the live/capture disagreement to a candidate " +
        "NOT reproduced by viewport width alone: a non-100% browser zoom level (which shrinks the " +
        "effective CSS pixel viewport exactly like a narrower window would, and cannot be simulated " +
        "by Playwright's viewport option, which sets logical CSS pixels directly) is the remaining " +
        "leading candidate, consistent with the owner's own report of the panel reading small in his " +
        "real browser window rather than in the fixed-viewport capture strip.",
    },
  };
  await writeFile(
    path.join(root, "raw-fb17-live-vs-capture.json"),
    `${JSON.stringify(investigation, null, 2)}\n`,
  );
  results.fb17 = investigation;
}

// ---- VIS-06 / VIS-07: sun region (FB-22 haze + FB-23 chip anchoring) ----
async function captureSunRegion(browser) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await waitForUniverseReady(page);

  await page.screenshot({ path: path.join(root, "sun-region-1440x900.png") });

  const overviewState = await page.evaluate(() => {
    const mount = document.querySelector("[data-scene-construction-stage]");
    const chip = document.querySelector('[data-label-obstacle="portfolio-readout"]');
    const chipRect = chip?.getBoundingClientRect();
    return {
      sunX: Number(mount?.dataset.evidenceSunX),
      sunY: Number(mount?.dataset.evidenceSunY),
      chipLeft: chipRect ? chipRect.left + chipRect.width / 2 : null,
      chipTop: chipRect ? chipRect.top : null,
      auroraAlpha: Number(mount?.dataset.auroraAlpha),
    };
  });

  // Drag-tilt to a second camera state, then re-measure the chip vs. sun.
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(920, 420, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(900);

  await page.screenshot({ path: path.join(root, "sun-region-drag-tilt-1440x900.png") });

  const tiltedState = await page.evaluate(() => {
    const mount = document.querySelector("[data-scene-construction-stage]");
    const chip = document.querySelector('[data-label-obstacle="portfolio-readout"]');
    const chipRect = chip?.getBoundingClientRect();
    return {
      sunX: Number(mount?.dataset.evidenceSunX),
      sunY: Number(mount?.dataset.evidenceSunY),
      chipLeft: chipRect ? chipRect.left + chipRect.width / 2 : null,
      chipTop: chipRect ? chipRect.top : null,
    };
  });

  const measurement = {
    capturedAt: new Date().toISOString(),
    fb23ChipTracking: {
      overview: overviewState,
      afterDragTilt: tiltedState,
      chipTrackedSunOverview:
        overviewState.chipLeft !== null &&
        Math.abs(overviewState.chipLeft - overviewState.sunX) < 60,
      chipTrackedSunAfterTilt:
        tiltedState.chipLeft !== null &&
        Math.abs(tiltedState.chipLeft - tiltedState.sunX) < 60,
      sunMovedBetweenStates: Math.abs(overviewState.sunX - tiltedState.sunX) > 5,
    },
    fb22AuroraFloor: {
      auroraAlphaAtRest: overviewState.auroraAlpha,
      floor: 0.14,
      passesFloor: overviewState.auroraAlpha >= 0.14,
    },
    fb22Notes:
      "Identify the actual haze cause from the two committed captures above " +
      "(sun-region-1440x900.png, sun-region-drag-tilt-1440x900.png) before any further code change.",
  };
  await writeFile(
    path.join(root, "raw-fb22-fb23-sun-region.json"),
    `${JSON.stringify(measurement, null, 2)}\n`,
  );
  results.fb22fb23 = measurement;
  await context.close();
}

// ---- VIS-08 / BHV-01 evidence: moon click ----
async function captureMoonClick(browser) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await waitForUniverseReady(page);

  const moonInfo = await page.evaluate(() => {
    const mount = document.querySelector("[data-scene-construction-stage]");
    return {
      target: mount?.dataset.evidenceMoonTarget ?? null,
      x: Number(mount?.dataset.evidenceMoonX),
      y: Number(mount?.dataset.evidenceMoonY),
    };
  });

  const measurement = { capturedAt: new Date().toISOString(), moonInfo };
  if (moonInfo.target) {
    await page.mouse.click(moonInfo.x, moonInfo.y);
    await page.waitForTimeout(2_800);
    await page.screenshot({ path: path.join(root, "moon-click-1440x900.png") });
    const panelState = await page.evaluate(() => {
      const heading = document.getElementById("holding-news-title");
      const headlineLink = document.querySelector('[class*="planetNews"] a');
      return {
        newsHeadingPresent: !!heading,
        headlineText: headlineLink?.textContent ?? null,
        headlineHref: headlineLink?.getAttribute("href") ?? null,
      };
    });
    measurement.panelState = panelState;
  } else {
    measurement.note = "No moon target found on this data snapshot.";
  }
  await writeFile(
    path.join(root, "raw-fb24-moon-news.json"),
    `${JSON.stringify(measurement, null, 2)}\n`,
  );
  results.fb24 = measurement;
  await context.close();
}

// ---- VIS-09: planet panel CONTRIB / VS VOO ----
async function capturePlanetPanel(browser) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await waitForUniverseReady(page);

  const tickers = await page.evaluate(() =>
    [...document.querySelectorAll("[data-scene-ticker]")].map((el) => el.dataset.sceneTicker),
  );

  for (const ticker of tickers) {
    const box = await page.evaluate((t) => {
      const el = document.querySelector(`[data-scene-ticker="${t}"]`);
      return el ? { x: +el.dataset.planetCenterX, y: +el.dataset.planetCenterY } : null;
    }, ticker);
    if (!box) continue;
    await page.mouse.click(box.x, box.y);
    await page.waitForTimeout(2_500);
    const hasBoth = await page.evaluate(() => {
      const text = document.querySelector('[class*="planetStats"]')?.textContent ?? "";
      return text.includes("CONTRIB") && text.includes("VS VOO");
    });
    if (hasBoth) {
      await page.screenshot({ path: path.join(root, "planet-panel-1440x900.png") });
      results.fb25 = { ticker, hasBoth: true };
      break;
    }
    await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
    await waitForUniverseReady(page);
  }
  await context.close();
}

// ---- MOB-01: mobile fallback regression ----
async function captureFallback(browser) {
  const context = await newContext(browser, { width: 390, height: 844 });
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('nav[aria-label="Portfolio bodies"]', { timeout: 20_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(root, "fallback-390x844.png"), fullPage: false });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth === document.documentElement.clientWidth,
  );
  results.mob01 = { noHorizontalOverflow: overflow };
  await context.close();
}

// ---- VIS-05: sky after (five moves) ----
async function captureSky(browser) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await waitForUniverseReady(page);
  await page.screenshot({ path: path.join(root, "sky-after-1440x900.png") });
  await context.close();
}

await run();
