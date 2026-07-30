// §11 review turn 4 (Claude Lead re-review) — consolidated live audit,
// public /share route, unauthenticated. Covers the still-unperformed
// review-3 matrix items that do not require owner auth:
// BHV-20 (legend first-visit), VIS-14 (chart geometry), VIS-16 (ring alpha),
// VIS-19 (label collision), MOB-10/MOB-11 (mobile fallback).
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-4-audit.json");

const sceneReady = async (page) => {
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 });
  await page.waitForTimeout(1500);
};

const results = {};
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

/* ---------------- BHV-20: legend bar first-visit only ---------------- */
{
  // Fresh context, NOT seeding orientation-seen, so the first-visit state is real.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await sceneReady(page);
  const legendPresentFirstVisit = await page.evaluate(() => /SUN\s*=\s*WHOLE PORTFOLIO/i.test(document.body.innerText));
  // Interact (click somewhere neutral) to dismiss first-visit orientation.
  await page.mouse.click(50, 50);
  await page.waitForTimeout(500);
  const legendPresentAfterInteraction = await page.evaluate(() => /SUN\s*=\s*WHOLE PORTFOLIO/i.test(document.body.innerText));
  // Reload — should NOT return (dismissed persists via localStorage).
  await page.reload({ waitUntil: "domcontentloaded" });
  await sceneReady(page);
  const legendPresentAfterReload = await page.evaluate(() => /SUN\s*=\s*WHOLE PORTFOLIO/i.test(document.body.innerText));
  // Summonable from the manual?
  const manualButton = page.getByRole("button", { name: /manual/i }).or(page.getByText(/systems manual/i));
  const manualVisible = await manualButton.first().isVisible().catch(() => false);
  let legendSummonedFromManual = null;
  if (manualVisible) {
    await manualButton.first().click().catch(() => {});
    await page.waitForTimeout(400);
    legendSummonedFromManual = await page.evaluate(() => /SUN\s*=\s*WHOLE PORTFOLIO|legend/i.test(document.body.innerText));
  }
  results["BHV-20"] = {
    legendPresentFirstVisit,
    legendPresentAfterInteraction,
    legendPresentAfterReload,
    manualButtonVisible: manualVisible,
    legendSummonedFromManual,
    dismissedOnInteraction: legendPresentFirstVisit && !legendPresentAfterInteraction,
    doesNotReturnAfterReload: !legendPresentAfterReload,
  };
  await page.close();
  await context.close();
}

/* ---------------- VIS-14: chart geometry at panel + room scale ---------------- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await sceneReady(page);
  const box = await page.evaluate(() => {
    const el = document.querySelector('[data-scene-ticker="ASML"]');
    return el ? { x: +el.dataset.planetCenterX, y: +el.dataset.planetCenterY } : null;
  });
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(2500);

  results["VIS-14.panelChart"] = await page.evaluate(() => {
    const svg = document.querySelector('aside svg, [class*="chart" i] svg, [class*="Chart" i] svg');
    if (!svg) return { found: false };
    const hairlines = svg.querySelectorAll('line[stroke-opacity], line[opacity], [class*="hairline" i], [class*="axis" i] line');
    const baseline = svg.querySelector('[class*="baseline" i], line[stroke-width="1.5"], line[stroke-width="1.5px"]');
    const dots = svg.querySelectorAll('circle');
    const chip = document.querySelector('[class*="endpointChip" i], [class*="endpoint-chip" i], [class*="chip" i]');
    const rect = svg.getBoundingClientRect();
    return {
      found: true,
      heightPx: rect.height,
      hairlineCount: hairlines.length,
      baselineFound: !!baseline,
      dotCount: dots.length,
      endpointChipFound: !!chip,
      endpointChipText: chip?.textContent ?? null,
    };
  });

  await page.close();
  await context.close();
}

/* ---------------- VIS-14 room-scale + VIS-16 ring alpha + VIS-19 label collision ---------------- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });
  const page = await context.newPage();
  await page.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
  await sceneReady(page);
  await page.waitForTimeout(1000);

  const returnsEl = await page.$('#returns');
  if (returnsEl) {
    await returnsEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
  }
  results["VIS-14.roomChart"] = await page.evaluate(() => {
    const section = document.getElementById("returns");
    if (!section) return { found: false };
    const svg = section.querySelector("svg");
    if (!svg) return { found: false, sectionFound: true };
    const rect = svg.getBoundingClientRect();
    const hairlines = svg.querySelectorAll('line[stroke-opacity], line[opacity], [class*="hairline" i], [class*="axis" i] line');
    const dots = svg.querySelectorAll("circle");
    return { found: true, heightPx: rect.height, hairlineCount: hairlines.length, dotCount: dots.length };
  });

  // VIS-19: PORTFOLIO readout label collision — scroll back to overview / orbits.
  const orbitsEl = await page.$("#holdings");
  if (orbitsEl) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
  }
  results["VIS-19.portfolioLabelCollision"] = await page.evaluate(() => {
    const portfolioLabel = [...document.querySelectorAll("*")].find(
      (el) => el.children.length === 0 && /^PORTFOLIO$/.test(el.textContent?.trim() ?? ""),
    );
    if (!portfolioLabel) return { portfolioLabelFound: false };
    const pRect = portfolioLabel.getBoundingClientRect();
    const tickerLabels = [...document.querySelectorAll("[data-scene-ticker]")];
    const overlaps = tickerLabels
      .map((el) => {
        const r = el.getBoundingClientRect();
        const overlap = !(r.right < pRect.left || r.left > pRect.right || r.bottom < pRect.top || r.top > pRect.bottom);
        return { ticker: el.dataset.sceneTicker, overlap };
      })
      .filter((x) => x.overlap);
    return { portfolioLabelFound: true, portfolioLabelRect: pRect, overlappingTickers: overlaps };
  });

  // VIS-16: ring alpha via direct pixel sampling isn't reliable from DOM;
  // record whether ring geometry data attrs (peak/floor tokens) are present
  // in the scene, as a geometry-adjacent signal, and flag pixel-sampling as
  // the authoritative method still outstanding if absent.
  results["VIS-16.ringTokenSignal"] = await page.evaluate(() => {
    const ringEls = [...document.querySelectorAll("[data-ring-peak-alpha], [data-ring-floor-alpha]")];
    return {
      ringElementCount: ringEls.length,
      sample: ringEls.slice(0, 2).map((el) => ({
        peak: el.dataset.ringPeakAlpha ?? null,
        floor: el.dataset.ringFloorAlpha ?? null,
      })),
    };
  });

  await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-4-room.png" });
  await page.close();
  await context.close();
}

/* ---------------- MOB-10 / MOB-11: mobile fallback at 390 and 320 ---------------- */
{
  for (const width of [390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, reducedMotion: "no-preference" });
    await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });
    const page = await context.newPage();
    await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
    await page.locator('nav[aria-label="Portfolio bodies"]').waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
    const canvasPresent = await page.evaluate(() => !!document.querySelector("canvas"));
    const fallbackNavPresent = await page.evaluate(() => !!document.querySelector('nav[aria-label="Portfolio bodies"]'));

    const smallTargets = await page.evaluate(() => {
      const interactive = [...document.querySelectorAll('a, button, [role="button"], [tabindex]')];
      return interactive
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { tag: el.tagName, text: (el.textContent ?? "").trim().slice(0, 30), width: r.width, height: r.height };
        })
        .filter((t) => t.width > 0 && t.height > 0 && (t.width < 44 || t.height < 44));
    });

    const bannedNouns = ["PLOT", "MANIFEST", "SCOPE", "HAZARD", "SIGNALS", "COMMS", "LOG", "LAUNCH", "TELEMETRY", "TRANSMISSIONS", "EGRESS"];
    const bodyText = await page.evaluate(() => document.body.innerText);
    const wordBoundary = (w) => new RegExp(`(^|[^A-Z])${w}([^A-Z]|$)`);
    const requiredNouns = ["HOLDINGS", "RETURNS", "RISK", "CORRELATION", "NEWS", "TRADES", "EARNINGS"];
    const windowWords = ["TODAY", "WEEK", "30D", "SINCE BUY", "SINCE START"];

    results[`MOB-10.${width}`] = { overflow, canvasPresent, fallbackNavPresent, smallTargetCount: smallTargets.length, smallTargets: smallTargets.slice(0, 10) };
    results[`MOB-11.${width}`] = {
      bannedFound: bannedNouns.filter((w) => wordBoundary(w).test(bodyText)),
      requiredNounsPresent: requiredNouns.filter((w) => bodyText.includes(w)),
      requiredNounsMissing: requiredNouns.filter((w) => !bodyText.includes(w)),
      windowWordsPresent: windowWords.filter((w) => bodyText.includes(w)),
      windowWordsMissing: windowWords.filter((w) => !bodyText.includes(w)),
    };

    await page.screenshot({ path: `docs/phase10-baseline/section-11/raw-review-4-fallback-${width}.png`, fullPage: true });
    await page.close();
    await context.close();
  }
}

await browser.close();
await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, out: OUT }, null, 2));
