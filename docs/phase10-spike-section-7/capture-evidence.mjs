/**
 * Phase 10 §7 Turn B evidence capture — screenshots and video recordings for
 * the storytelling rubric (§2.4) and DECISION.md. Not part of the retained
 * measurement budget tooling (measure-phone.mjs/measure-desktop.mjs handle
 * that); this script exists purely to produce visual evidence artifacts.
 *
 *   OWNER_PASSWORD=<temporary-local-value> node docs/phase10-spike-section-7/capture-evidence.mjs
 *
 * Requires a production server and the same temporary, unsaved Playwright
 * install used by the measurement scripts. Never reads .env files.
 */
import { chromium } from "playwright";
import crypto from "node:crypto";
import { mkdirSync, writeFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
if (!OWNER_PASSWORD) throw new Error("OWNER_PASSWORD must be provided without reading .env*");

const ROOT = resolve(process.cwd(), "docs/phase10-baseline/section-7");
const SHOTS = resolve(ROOT, "screenshots");
const FILMS = resolve(ROOT, "filmstrips");
mkdirSync(SHOTS, { recursive: true });
mkdirSync(FILMS, { recursive: true });

const SESSION_COOKIE_NAME = "owner_session";
function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}

const VARIANTS = {
  css: { path: "/dev/phase10-spike-css-world", label: "css-world" },
  r3f: { path: "/dev/phase10-spike-r3f-world", label: "r3f-world" },
};

async function newAuthedContext(browser, opts = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: sessionToken(OWNER_PASSWORD),
      domain: new URL(BASE_URL).hostname,
      path: "/",
    },
  ]);
  return context;
}

const report = { measuredAt: new Date().toISOString(), variants: {} };

async function captureVariant(browser, key, { path, label }) {
  const out = { screenshots: {}, filmstrips: {}, checks: {} };

  // --- World entry recording (cold load through entrance completion) ---
  {
    const videoDir = resolve(FILMS, `${label}-world-entry`);
    mkdirSync(videoDir, { recursive: true });
    const context = await newAuthedContext(browser, { recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(200);
    await page.screenshot({ path: resolve(SHOTS, `${label}-entrance-mid.png`) });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: resolve(SHOTS, `${label}-idle.png`) });
    const video = page.video();
    await context.close();
    const savedPath = await video.path();
    const finalPath = resolve(videoDir, "world-entry.webm");
    renameSync(savedPath, finalPath);
    out.filmstrips.worldEntry = finalPath;
  }

  // --- Pointer exploration recording + occlusion/parallax read (row 6) ---
  {
    const videoDir = resolve(FILMS, `${label}-pointer-exploration`);
    mkdirSync(videoDir, { recursive: true });
    const context = await newAuthedContext(browser, { recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const positions = [
      { x: 300, y: 300 },
      { x: 720, y: 450 },
      { x: 1140, y: 600 },
      { x: 400, y: 700 },
    ];
    const reads = [];
    for (const pos of positions) {
      await page.mouse.move(pos.x, pos.y, { steps: 12 });
      await page.waitForTimeout(220);
      const read = await page.evaluate(() => {
        const stage = document.querySelector('[class*="world"]');
        const cameraEl = document.querySelector('[data-testid="css-camera"], [class*="semanticCamera"]');
        const atmosphere = document.querySelector('[class*="atmosphere"]');
        const bodies = [...document.querySelectorAll('[class*="body"]')].filter((el) => el.tagName === "A");
        const rects = bodies.map((el) => el.getBoundingClientRect());
        return {
          pointerX: stage ? getComputedStyle(stage).getPropertyValue("--world-pointer-x") : null,
          pointerY: stage ? getComputedStyle(stage).getPropertyValue("--world-pointer-y") : null,
          cameraTransform: cameraEl ? getComputedStyle(cameraEl).transform : null,
          atmosphereTransform: atmosphere ? getComputedStyle(atmosphere).transform : null,
          bodyRects: rects.map((r) => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) })),
        };
      });
      reads.push({ pos, read });
    }
    out.checks.pointerReads = reads;
    const video = page.video();
    await context.close();
    const savedPath = await video.path();
    const finalPath = resolve(videoDir, "pointer-exploration.webm");
    renameSync(savedPath, finalPath);
    out.filmstrips.pointerExploration = finalPath;
  }

  // --- Discovery hover pair (row 9) ---
  {
    const context = await newAuthedContext(browser);
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: resolve(SHOTS, `${label}-discovery-idle.png`) });
    const nonActiveLink = page.locator('a[class*="body"]:not([aria-current="page"])').first();
    await nonActiveLink.hover();
    await page.waitForTimeout(300);
    await page.screenshot({ path: resolve(SHOTS, `${label}-discovery-hover.png`) });
    const discoveryOpacity = await nonActiveLink.evaluate((el) => {
      const label = el.querySelector('[class*="discovery"]');
      return label ? getComputedStyle(label).opacity : null;
    });
    out.checks.discoveryHoverOpacity = discoveryOpacity;
    await context.close();
  }

  // --- Chapter-travel transition recording + before/mid/after (row 4) + 3x chapter changes (row 3) ---
  {
    const videoDir = resolve(FILMS, `${label}-chapter-travel`);
    mkdirSync(videoDir, { recursive: true });
    const context = await newAuthedContext(browser, { recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const before = await page.evaluate(() => {
      const cameraEl = document.querySelector('[data-testid="css-camera"], [class*="semanticCamera"]');
      return cameraEl ? getComputedStyle(cameraEl).transform : null;
    });
    const atmosphereBefore = await page.evaluate(() => document.querySelector('[class*="atmosphere"]')?.outerHTML?.slice(0, 80));

    const sequence = ["Forces", "Structure", "Timeline"];
    const atmosphereChecks = [];
    for (const label of sequence) {
      await page.getByRole("link", { name: new RegExp(label, "i") }).click();
      await page.waitForTimeout(50);
      const mid = await page.evaluate(() => {
        const cameraEl = document.querySelector('[data-testid="css-camera"], [class*="semanticCamera"]');
        return cameraEl ? getComputedStyle(cameraEl).transform : null;
      });
      await page.waitForTimeout(750);
      const after = await page.evaluate(() => {
        const cameraEl = document.querySelector('[data-testid="css-camera"], [class*="semanticCamera"]');
        return cameraEl ? getComputedStyle(cameraEl).transform : null;
      });
      const atmosphereNow = await page.evaluate(() => document.querySelector('[class*="atmosphere"]')?.outerHTML?.slice(0, 80));
      atmosphereChecks.push({ label, mid, after, atmosphereUnchangedNode: atmosphereNow === atmosphereBefore });
    }
    out.checks.cameraTransformBefore = before;
    out.checks.chapterTravelSequence = atmosphereChecks;

    await page.screenshot({ path: resolve(SHOTS, `${label}-settled-timeline.png`) });
    const video = page.video();
    await context.close();
    const savedPath = await video.path();
    const finalPath = resolve(videoDir, "chapter-travel.webm");
    renameSync(savedPath, finalPath);
    out.filmstrips.chapterTravel = finalPath;
  }

  // --- Depth-layer stacking check (row 5) ---
  {
    const context = await newAuthedContext(browser);
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const layers = await page.evaluate(() => {
      function info(selector) {
        const el = document.querySelector(selector);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return { position: cs.position, zIndex: cs.zIndex, transform: cs.transform, rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) } };
      }
      return {
        atmosphere: info('[class*="atmosphere"]'),
        camera: info('[data-testid="css-camera"], [class*="semanticCamera"]'),
        canvasStage: info('[class*="canvasStage"]'),
        plate: info('[class*="plate"]'),
      };
    });
    out.checks.depthLayers = layers;
    await context.close();
  }

  return out;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [key, variant] of Object.entries(VARIANTS)) {
      console.log(`Capturing ${key}...`);
      report.variants[key] = await captureVariant(browser, key, variant);
      console.log(`Done ${key}`);
    }
  } finally {
    await browser.close();
  }
  writeFileSync(resolve(ROOT, "capture-report.json"), JSON.stringify(report, null, 2));
  console.log(`Wrote ${resolve(ROOT, "capture-report.json")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
