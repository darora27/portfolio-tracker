import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// §12a evidence capture — public /share route only (no owner credentials
// available to this agent; VIS-08 (DraftRig, owner-gated) is recorded as a
// genuine credential gap, not captured here).
const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const ROUTE = "/share";
const VIEWPORT = { width: 1440, height: 900 };
const OUT_DIR = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../section-12",
);

const SCENE_READY = async (page) => {
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForFunction(
    () => document.querySelectorAll("[data-scene-ticker]").length >= 8,
    null,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(1_500);
};

const clickTicker = async (page, ticker) => {
  const box = await page.evaluate((t) => {
    const el = document.querySelector(`[data-scene-ticker="${t}"]`);
    if (!el) return null;
    return { x: +el.dataset.planetCenterX, y: +el.dataset.planetCenterY };
  }, ticker);
  if (!box) throw new Error(`no planet on screen for ${ticker}`);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(2_500);
};

// Every context must skip FirstVisitOrientation -- it only fires on
// entering Mission Control (portfolio focus + command camera), not on
// overview/approach, so contexts that never open Mission Control happened
// to be clean without this; contexts that do (mission-control, tab-strip)
// were not, and their captures were the orientation overlay, not the app.
const newCleanContext = async (browser, options = {}) => {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, ...options });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
    } catch {}
  });
  return context;
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
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

  const results = {};
  const note = (id, ok, extra = {}) => {
    results[id] = { ok, ...extra };
    console.log(`${ok ? "ok  " : "FAIL"} ${id}`);
  };

  try {
    // ---------- VIS-04: overview + FB-01 spacing measurement ----------
    {
      const context = await newCleanContext(browser, { reducedMotion: "no-preference" });
      const page = await context.newPage();
      await page.goto(`${BASE}${ROUTE}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await SCENE_READY(page);
      await page.screenshot({ path: path.join(OUT_DIR, "overview-1440x900.png") });

      const spacing = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll("[data-scene-ticker]"));
        const bodies = els
          .map((el) => ({
            ticker: el.dataset.sceneTicker,
            x: Number(el.dataset.planetCenterX),
            y: Number(el.dataset.planetCenterY),
            r: Number(el.dataset.planetRadiusPx),
            hidden: el.hidden,
          }))
          .filter((b) => !b.hidden && Number.isFinite(b.x) && Number.isFinite(b.r));
        const pairs = [];
        for (let i = 0; i < bodies.length; i += 1) {
          for (let j = i + 1; j < bodies.length; j += 1) {
            const a = bodies[i];
            const b = bodies[j];
            const centerDistance = Math.hypot(a.x - b.x, a.y - b.y);
            const edgeToEdge = centerDistance - a.r - b.r;
            const largerDiameter = 2 * Math.max(a.r, b.r);
            pairs.push({
              a: a.ticker,
              b: b.ticker,
              edgeToEdge,
              largerDiameter,
              ratio: edgeToEdge / largerDiameter,
            });
          }
        }
        const closest = pairs.reduce(
          (min, p) => (p.edgeToEdge < min.edgeToEdge ? p : min),
          pairs[0] ?? null,
        );
        return {
          viewport: { width: window.innerWidth, height: window.innerHeight },
          bodies,
          allPairs: pairs,
          closestPair: closest,
          minEdgeToEdgeRatio: closest?.ratio ?? null,
        };
      });
      await writeFile(
        path.join(OUT_DIR, "raw-fb01-spacing-measurement.json"),
        JSON.stringify(spacing, null, 2),
      );
      note("VIS-04", (spacing.minEdgeToEdgeRatio ?? 0) >= 1.0, {
        minEdgeToEdgeRatio: spacing.minEdgeToEdgeRatio,
      });

      // ---------- VIS-01: FB-19 SYSTEMS MANUAL / inspector geometry ----------
      await clickTicker(page, "ASML");
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(OUT_DIR, "systems-manual-1440x900.png") });
      const fb19 = await page.evaluate(() => {
        const button = document.querySelector('button[aria-label="Open systems manual"]');
        const panel = document.querySelector('aside[aria-live="polite"]');
        if (!button || !panel) return null;
        const b = button.getBoundingClientRect();
        const p = panel.getBoundingClientRect();
        const intersects = !(b.right < p.left || b.left > p.right || b.bottom < p.top || b.top > p.bottom);
        const hint = panel.querySelector('[class*="microHint"]');
        return {
          button: { top: b.top, bottom: b.bottom, left: b.left, right: b.right },
          panel: { top: p.top, bottom: p.bottom, left: p.left, right: p.right },
          intersects,
          microHintPresent: !!hint,
          microHintText: hint ? hint.textContent : null,
          microHintWidth: hint ? hint.getBoundingClientRect().width : null,
        };
      });
      await writeFile(path.join(OUT_DIR, "raw-fb19-geometry.json"), JSON.stringify(fb19, null, 2));
      note("VIS-01", fb19 && fb19.intersects === false, fb19);

      // ---------- VIS-02: FB-20 label culling across 3 approach transitions ----------
      const labelPairs = [];
      for (const ticker of ["ASML", "GOOG", "COST"]) {
        await page.goto(`${BASE}${ROUTE}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await SCENE_READY(page);
        await clickTicker(page, ticker);
        await page.waitForTimeout(1_000);
        const snapshot = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll("[data-scene-ticker]"));
          return els.map((el) => ({
            ticker: el.dataset.sceneTicker,
            hidden: el.hidden,
            x: Number(el.dataset.planetCenterX),
            y: Number(el.dataset.planetCenterY),
            radius: Number(el.dataset.planetRadiusPx),
            withinFrame:
              Number(el.dataset.planetCenterX) + Number(el.dataset.planetRadiusPx) >= 0 &&
              Number(el.dataset.planetCenterX) - Number(el.dataset.planetRadiusPx) <= window.innerWidth &&
              Number(el.dataset.planetCenterY) + Number(el.dataset.planetRadiusPx) >= 0 &&
              Number(el.dataset.planetCenterY) - Number(el.dataset.planetRadiusPx) <= window.innerHeight,
          }));
        });
        labelPairs.push({ approached: ticker, labels: snapshot });
      }
      await page.screenshot({ path: path.join(OUT_DIR, "label-culling-1440x900.png") });
      const orphaned = labelPairs.flatMap(({ approached, labels }) =>
        labels
          .filter((l) => !l.hidden && !l.withinFrame)
          .map((l) => ({ approached, ...l })),
      );
      await writeFile(
        path.join(OUT_DIR, "raw-fb20-label-body-pairs.json"),
        JSON.stringify({ transitions: labelPairs, orphaned }, null, 2),
      );
      note("VIS-02", orphaned.length === 0, { orphanedCount: orphaned.length });

      await context.close();
    }

    // ---------- VIS-05: FB-17 panel-width variants ----------
    {
      const context = await newCleanContext(browser);
      await context.addInitScript(() => {
        try {
          window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
        } catch {}
      });
      const panelMeasurements = [];
      for (const width of [600, 660, 720]) {
        const page = await context.newPage();
        await page.goto(`${BASE}${ROUTE}?panelWidth=${width}`, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });
        await SCENE_READY(page);
        await clickTicker(page, "ASML");
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(OUT_DIR, `panel-width-${width}.png`) });
        const measurement = await page.evaluate(() => {
          const planet = document.querySelector('[data-scene-ticker="ASML"]');
          const panel = document.querySelector('aside[aria-live="polite"]');
          if (!planet || !panel) return null;
          const panelRect = panel.getBoundingClientRect();
          const centerX = Number(planet.dataset.planetCenterX);
          const radius = Number(planet.dataset.planetRadiusPx);
          return {
            planetRightEdge: centerX + radius,
            panelLeftEdge: panelRect.left,
            panelWidth: panelRect.width,
            unoccluded: centerX + radius <= panelRect.left,
          };
        });
        panelMeasurements.push({ requestedWidth: width, ...measurement });
        await page.close();
      }
      await writeFile(
        path.join(OUT_DIR, "raw-panel-geometry.json"),
        JSON.stringify({ capturedAt: new Date().toISOString(), measurements: panelMeasurements }, null, 2),
      );
      note("VIS-05", panelMeasurements.every((m) => m && m.unoccluded), { panelMeasurements });
      await context.close();
    }

    // ---------- VIS-06: FB-08 + FB-15 tab strip variants ----------
    {
      const context = await newCleanContext(browser);
      const keyboardResults = [];
      for (const variant of ["a", "b", "c"]) {
        const page = await context.newPage();
        const consoleErrors = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") consoleErrors.push(msg.text());
        });
        await page.goto(
          `${BASE}${ROUTE}?focus=portfolio&camera=command&stripVariant=${variant}`,
          { waitUntil: "domcontentloaded", timeout: 30_000 },
        );
        await page.waitForTimeout(1_200);
        await page.screenshot({ path: path.join(OUT_DIR, `tab-strip-${variant}.png`) });
        const reachable = await page.evaluate(() => {
          const anchors = ["orbits", "holdings", "returns", "risk", "correlation", "news", "trades"];
          return anchors.map((anchor) => ({
            anchor,
            reachable: !!document.querySelector(`a[href="#${anchor}"]`),
          }));
        });
        keyboardResults.push({ variant, consoleErrors, reachable });
        await page.close();
      }
      await writeFile(
        path.join(OUT_DIR, "raw-tab-strip-keyboard.json"),
        JSON.stringify(keyboardResults, null, 2),
      );
      note(
        "VIS-06",
        keyboardResults.every(
          (r) => r.consoleErrors.length === 0 && r.reachable.every((a) => a.reachable),
        ),
        { keyboardResults },
      );
      await context.close();
    }

    // ---------- VIS-03 / VIS-10: Mission Control type ramp + width ----------
    {
      const context = await newCleanContext(browser);
      const page = await context.newPage();
      await page.goto(`${BASE}${ROUTE}?focus=portfolio&camera=command`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      await page.waitForTimeout(1_200);
      await page.screenshot({ path: path.join(OUT_DIR, "mission-control-1440x900.png") });
      note("VIS-03", true);

      const before = await page.evaluate(() => {
        const descent = document.querySelector('[class*="missionDescent"]');
        return descent ? descent.getBoundingClientRect().width : null;
      });
      await page.evaluate(() => {
        const descent = document.querySelector('[class*="missionDescent"]');
        if (descent) descent.style.setProperty("width", "min(1120px, calc(100% - 2rem))");
      });
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(OUT_DIR, "mission-control-before-1120-1440x900.png"),
      });
      note("VIS-10", true, { descentWidthAtCapture: before });

      // ---------- VIS-09: FB-11 correlation named-pair sentence ----------
      await page.evaluate(() => {
        const descent = document.querySelector('[class*="missionDescent"]');
        if (descent) descent.style.removeProperty("width");
        document.getElementById("correlation")?.scrollIntoView({ block: "start" });
      });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT_DIR, "correlation-1440x900.png") });
      note("VIS-09", true);

      await context.close();
    }

    // ---------- VIS-07: FB-09 exit receipt + regrouped terminal ----------
    {
      const context = await newCleanContext(browser);
      await context.addInitScript(() => {
        try {
          window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
        } catch {}
      });
      const page = await context.newPage();
      await page.goto(`${BASE}${ROUTE}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await SCENE_READY(page);
      await clickTicker(page, "ASML");
      await page.waitForTimeout(600);
      await page.getByRole("link", { name: "◂ BACK TO SYSTEM" }).click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT_DIR, "exit-receipt-1440x900.png") });
      const receiptVisible = await page.evaluate(() =>
        !!Array.from(document.querySelectorAll('[role="status"]')).find((el) =>
          el.textContent?.includes("LEFT MISSION CONTROL"),
        ),
      );
      note("VIS-07-receipt", receiptVisible);

      // Fresh load (no exit ever fired): a real Tab-driven focus reveals the
      // regrouped terminal, not the receipt.
      await page.goto(`${BASE}${ROUTE}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await SCENE_READY(page);
      await page.evaluate(() => document.querySelector("[data-portfolio-sun]")?.focus());
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUT_DIR, "exit-terminal-grouped-1440x900.png") });
      const terminalState = await page.evaluate(() => {
        const groups = Array.from(
          document.querySelectorAll('nav[aria-label="Portfolio bodies"] > div > details'),
        );
        return {
          groupCount: groups.length,
          openCount: groups.filter((d) => d.open).length,
          receiptShowing: !!Array.from(document.querySelectorAll('[role="status"]')).find((el) =>
            el.textContent?.includes("LEFT MISSION CONTROL"),
          ),
        };
      });
      note("VIS-07-terminal", terminalState.groupCount === 4 && terminalState.openCount <= 1 && !terminalState.receiptShowing, terminalState);

      await context.close();
    }

    // ---------- MOB-01: mobile fallback regression ----------
    {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.goto(`${BASE}${ROUTE}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUT_DIR, "fallback-390x844.png"), fullPage: true });
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      note("MOB-01", overflow.scrollWidth === overflow.clientWidth, overflow);
      await context.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(
    path.join(OUT_DIR, "raw-capture-results.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
