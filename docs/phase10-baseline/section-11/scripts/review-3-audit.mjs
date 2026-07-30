// §11 review turn 3 — consolidated live audit against the rebuilt candidate.
// Public /share route, unauthenticated. One browser session, many checks.
// Not a permanent capture-harness shot list; a reviewer verifier script per
// AGENTS.md's Live Verification section (retained scripts, not the in-app
// browser tool).
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-3-audit.json");

const BANNED = ["PLOT", "MANIFEST", "SCOPE", "HAZARD", "SIGNALS", "COMMS", "LOG", "LAUNCH", "TELEMETRY", "TRANSMISSIONS", "EGRESS"];
const REQUIRED_NOUNS = ["ORBITS", "HOLDINGS", "RETURNS", "RISK", "CORRELATION", "NEWS", "TRADES", "EARNINGS"];

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
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });

/* ---------------- Overview: naming, legend, zoom, sun/ring geometry ---------------- */
{
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await sceneReady(page);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const wordBoundary = (w) => new RegExp(`(^|[^A-Z])${w}([^A-Z]|$)`);
  results["BHV-10.overview"] = {
    bannedFound: BANNED.filter((w) => wordBoundary(w).test(bodyText)),
    requiredPresent: REQUIRED_NOUNS.filter((w) => bodyText.includes(w)),
    requiredMissing: REQUIRED_NOUNS.filter((w) => !bodyText.includes(w)),
  };

  // BHV-20: legend/hint first-visit only. This build gates the first-visit
  // orientation overlay via localStorage; we already seeded it "seen" so we
  // instead check the manual button + no permanent legend bar exists.
  results["BHV-20.legendBarPersistent"] = await page.evaluate(() => {
    const text = document.body.innerText;
    return /SUN\s*=\s*WHOLE PORTFOLIO/i.test(text);
  });

  // BHV-17: error furniture.
  results["BHV-17.errorFurniturePresent"] = /VOO UNAVAILABLE/i.test(bodyText);
  results["BHV-17.zeroAsRealPattern"] = /\b0\.0%\s*\(unavailable\)/i.test(bodyText);

  // VIS-19 / VIS-18 / VIS-16: sun + ring + label geometry from live scene data attrs.
  const sunPlanetGeom = await page.evaluate(() => {
    const sun = document.querySelector("[data-sun-radius-px]");
    const planets = [...document.querySelectorAll("[data-scene-ticker]")].map((el) => ({
      ticker: el.dataset.sceneTicker,
      radius: Number(el.dataset.planetRadiusPx),
    }));
    return {
      sunRadiusPx: sun ? Number(sun.dataset.sunRadiusPx) : null,
      sunFound: !!sun,
      planets,
      largestPlanetRadius: planets.length ? Math.max(...planets.map((p) => p.radius)) : null,
    };
  });
  results["VIS-18.sunDominance"] = sunPlanetGeom;

  // Zoom rubber-band (BHV-21): dispatch a large wheel-out and confirm we
  // remain on the overview framing (no sector-map DOM, camera state unchanged).
  await page.mouse.move(720, 450);
  for (let i = 0; i < 10; i += 1) {
    await page.mouse.wheel(0, 400); // zoom out
  }
  await page.waitForTimeout(500);
  results["BHV-21.afterZoomOut"] = await page.evaluate(() => ({
    sectorMapPresent: !!document.querySelector('[data-sector-map], [class*="sectorMap"]'),
    growthLinkPresent: /OBSERVATORY-GROWTH/i.test(document.body.innerText),
    stillOverviewLabel: document.body.innerText.includes("OVERVIEW"),
  }));

  await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-3-overview-postzoom.png" });
  await page.close();
}

/* ---------------- Planet panel: figures, cuts, window attachment ---------------- */
{
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await sceneReady(page);
  const box = await page.evaluate(() => {
    const el = document.querySelector('[data-scene-ticker="ASML"]');
    return el ? { x: +el.dataset.planetCenterX, y: +el.dataset.planetCenterY } : null;
  });
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(2500);

  const panelText = await page.evaluate(() => document.querySelector("aside")?.innerText ?? "");
  results["BHV-16.duplicateHero"] = (panelText.match(/TODAY/g) ?? []).length > 1;
  results["BHV-16.emptyNewsZoneWhenNoLinks"] = "n/a-ASML-has-news";
  results["VIS-12.weightNoSign"] = (() => {
    const m = panelText.match(/WEIGHT\s*([^\n]+)/);
    return m ? { raw: m[1].trim(), hasArrow: /[▲▼◆]/.test(m[1]), hasExplicitSign: /[+\-]\d/.test(m[1]) } : null;
  })();

  // BHV-12 window-attachment sweep: every figure (TODAY/WEEK/30D/SINCE BUY/
  // WEIGHT/VOL/BETA) must have its window word in the SAME line of text.
  const lines = panelText.split("\n").filter(Boolean);
  results["BHV-12.panelLines"] = lines;

  // BHV-13 / VIS-13: planet outside panel rect, live geometry (independent
  // of the capture harness's own copy).
  results["BHV-13.geometry"] = await page.evaluate(() => {
    const planet = document.querySelector('[data-scene-ticker="ASML"]');
    const panel = document.querySelector("aside");
    if (!planet || !panel) return null;
    const rect = panel.getBoundingClientRect();
    const cx = Number(planet.dataset.planetCenterX);
    const r = Number(planet.dataset.planetRadiusPx);
    return { discRight: cx + r, panelLeft: rect.left, unoccluded: cx + r <= rect.left };
  });

  await page.close();
}

/* ---------------- Mission Control room: descent order, strip, correlation copy ---------------- */
{
  const page = await context.newPage();
  await page.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
  await sceneReady(page);
  await page.waitForTimeout(1000);

  const roomText = await page.evaluate(() => document.body.innerText);
  results["BHV-18.correlationCopyPresent"] = /moves? together|co-?movement|independent paths/i.test(roomText);
  results["BHV-10.room"] = {
    bannedFound: BANNED.filter((w) => new RegExp(`(^|[^A-Z])${w}([^A-Z]|$)`).test(roomText)),
    requiredPresent: REQUIRED_NOUNS.filter((w) => roomText.includes(w)),
  };

  // VIS-15: descent section order + strip presence.
  results["VIS-15.sectionOrder"] = await page.evaluate(() => {
    const ids = ["holdings", "returns", "risk", "correlation", "earnings", "news", "trades"];
    return ids.map((id) => ({ id, present: !!document.getElementById(id) }));
  });
  const stripBefore = await page.evaluate(() => {
    const strip = document.querySelector('[class*="strip"]');
    return strip ? strip.getBoundingClientRect().top : null;
  });
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(400);
  const stripAfter = await page.evaluate(() => {
    const strip = document.querySelector('[class*="strip"]');
    const radar = document.getElementById("holdings")?.previousElementSibling;
    return {
      stripTop: strip ? strip.getBoundingClientRect().top : null,
      bodyText: document.body.innerText.slice(0, 300),
    };
  });
  results["BHV-14.stripSticky"] = { stripBeforeScrollTop: stripBefore, stripAfterScrollTop: stripAfter.stripTop, staysNearZero: stripAfter.stripTop !== null && Math.abs(stripAfter.stripTop) < 100 };

  await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-3-room-scrolled.png", fullPage: false });
  await page.close();
}

await context.close();
await browser.close();
await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, out: OUT }, null, 2));
