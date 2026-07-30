import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "http://127.0.0.1:3100";
const OUT = "docs/phase10-baseline/section-13/review-scripts/out";

async function newContext(browser, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  await context.addInitScript(() => {
    try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {}
  });
  return context;
}

async function waitForUniverseReady(page) {
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20000 });
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = {};

  // VIS-01: spacing re-measurement
  {
    const context = await newContext(browser);
    const page = await context.newPage();
    await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
    await waitForUniverseReady(page);
    const planets = await page.evaluate(() =>
      [...document.querySelectorAll("[data-scene-ticker]")].map((el) => ({
        ticker: el.dataset.sceneTicker,
        x: Number(el.dataset.planetCenterX),
        y: Number(el.dataset.planetCenterY),
        radius: Number(el.dataset.planetRadiusPx),
      })),
    );
    let minEdge = Infinity, minPair = null, minRatio = Infinity;
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const a = planets[i], b = planets[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const edge = dist - a.radius - b.radius;
        const largerDiam = 2 * Math.max(a.radius, b.radius);
        const ratio = edge / largerDiam;
        if (edge < minEdge) { minEdge = edge; minPair = [a.ticker, b.ticker]; minRatio = ratio; }
      }
    }
    results.vis01 = { minEdge, minPair, minRatio, planetCount: planets.length };
    await page.screenshot({ path: path.join(OUT, "overview-recheck.png") });
    await context.close();
  }

  // VIS-03: panel width across viewports
  {
    const widths = [1280, 1366, 1440, 1536, 1920];
    const measurements = [];
    for (const width of widths) {
      const context = await newContext(browser, { width, height: 900 });
      const page = await context.newPage();
      await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
      await waitForUniverseReady(page);
      const ticker = await page.evaluate(() => document.querySelector("[data-scene-ticker]")?.dataset.sceneTicker);
      const box = await page.evaluate((t) => {
        const el = document.querySelector(`[data-scene-ticker="${t}"]`);
        return el ? { x: +el.dataset.planetCenterX, y: +el.dataset.planetCenterY } : null;
      }, ticker);
      if (box) { await page.mouse.click(box.x, box.y); await page.waitForTimeout(2000); }
      const panelWidth = await page.evaluate(() => {
        const panel = document.querySelector('aside[aria-live="polite"]');
        return panel ? panel.getBoundingClientRect().width : null;
      });
      measurements.push({ width, panelWidth });
      await context.close();
    }
    results.vis03 = measurements;
  }

  // VIS-06/VIS-07: sun region, overview + approach
  {
    const context = await newContext(browser);
    const page = await context.newPage();
    await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
    await waitForUniverseReady(page);
    await page.screenshot({ path: path.join(OUT, "sun-region-overview.png") });
    const sunPos1 = await page.evaluate(() => {
      const mount = document.querySelector("[data-evidence-sun-x]") || document.querySelector('[class*="sceneMount"]');
      return mount ? { x: mount.dataset.evidenceSunX, y: mount.dataset.evidenceSunY } : null;
    });
    // vertical scan above sun for haze
    const scan = await page.evaluate(async () => {
      const mount = document.querySelector('[class*="sceneMount"]') || document.querySelector("canvas").parentElement;
      const canvas = document.querySelector("canvas");
      const rect = canvas.getBoundingClientRect();
      return { canvasW: rect.width, canvasH: rect.height };
    });
    const chipPos1 = await page.evaluate(() => {
      const chip = document.querySelector('[data-label-obstacle="portfolio-readout"]');
      if (!chip) return null;
      const r = chip.getBoundingClientRect();
      return { left: chip.style.left, top: chip.style.top, rectX: r.x + r.width / 2, rectY: r.y };
    });
    // click a planet to go to approach camera
    const ticker = await page.evaluate(() => document.querySelector("[data-scene-ticker]")?.dataset.sceneTicker);
    const box = await page.evaluate((t) => {
      const el = document.querySelector(`[data-scene-ticker="${t}"]`);
      return el ? { x: +el.dataset.planetCenterX, y: +el.dataset.planetCenterY } : null;
    }, ticker);
    if (box) { await page.mouse.click(box.x, box.y); await page.waitForTimeout(2500); }
    await page.screenshot({ path: path.join(OUT, "sun-region-approach.png") });
    const chipPos2 = await page.evaluate(() => {
      const chip = document.querySelector('[data-label-obstacle="portfolio-readout"]');
      if (!chip) return null;
      const r = chip.getBoundingClientRect();
      return { left: chip.style.left, top: chip.style.top, rectX: r.x + r.width / 2, rectY: r.y };
    });
    results.vis07 = { chipPos1, chipPos2 };
    await context.close();
  }

  // VIS-08/BHV-01: moon click
  {
    const context = await newContext(browser);
    const page = await context.newPage();
    await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
    await waitForUniverseReady(page);
    const moon = await page.evaluate(() => {
      const el = document.querySelector("[data-moon-ticker], [data-scene-moon]");
      return el ? { x: +el.dataset.moonCenterX, y: +el.dataset.moonCenterY, ticker: el.dataset.moonTicker } : null;
    });
    results.vis08_moonFound = moon;
    if (moon && moon.x) {
      await page.mouse.click(moon.x, moon.y);
      await page.waitForTimeout(2000);
      const headline = await page.evaluate(() => {
        const links = [...document.querySelectorAll('a[href^="http"]')];
        return links.map((l) => l.textContent?.trim()).filter(Boolean).slice(0, 3);
      });
      results.vis08_headlines = headline;
      await page.screenshot({ path: path.join(OUT, "moon-click-recheck.png") });
    }
    await context.close();
  }

  // VIS-09: planet panel fields for ASML
  {
    const context = await newContext(browser);
    const page = await context.newPage();
    await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
    await waitForUniverseReady(page);
    const box = await page.evaluate(() => {
      const el = document.querySelector('[data-scene-ticker="ASML"]');
      return el ? { x: +el.dataset.planetCenterX, y: +el.dataset.planetCenterY } : null;
    });
    if (box) {
      await page.mouse.click(box.x, box.y);
      await page.waitForTimeout(2000);
      const panelText = await page.evaluate(() => {
        const panel = document.querySelector('aside[aria-live="polite"]');
        return panel ? panel.innerText : null;
      });
      results.vis09_panelText = panelText;
      await page.screenshot({ path: path.join(OUT, "planet-panel-recheck.png") });
    }
    await context.close();
  }

  // MOB-01: fallback at 390px
  {
    const context = await newContext(browser, { width: 390, height: 844 });
    const page = await context.newPage();
    await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth);
    results.mob01_noOverflow = overflow;
    await page.screenshot({ path: path.join(OUT, "fallback-recheck.png") });
    await context.close();
  }

  await writeFile(path.join(OUT, "review-results.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
