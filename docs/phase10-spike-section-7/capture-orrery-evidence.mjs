/**
 * Phase 10 §7 Turn B′ review evidence capture — screenshots and filmstrips
 * for the R.11 required visual evidence (Portfolio Orrery remediation
 * route). Not part of the Turn A/B spike tooling (capture-evidence.mjs,
 * measure-desktop.mjs); this script targets /dev/phase10-portfolio-orrery.
 *
 *   OWNER_PASSWORD=<temporary-local-value> node docs/phase10-spike-section-7/capture-orrery-evidence.mjs
 *
 * Requires a production server and the same temporary, unsaved Playwright
 * install used by the other spike/measurement scripts. Never reads .env
 * files.
 */
import { chromium } from "playwright";
import crypto from "node:crypto";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
if (!OWNER_PASSWORD) throw new Error("OWNER_PASSWORD must be provided without reading .env*");
const SESSION_COOKIE_NAME = "owner_session";
function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}
const OUT = "docs/phase10-baseline/section-7/screenshots/orrery-turn-bprime";
const FILMSTRIPS = "docs/phase10-baseline/section-7/filmstrips";
mkdirSync(`${FILMSTRIPS}/orrery-idle-orbit`, { recursive: true });
mkdirSync(`${FILMSTRIPS}/orrery-camera-travel`, { recursive: true });

async function authedContext(browser, viewport, extra = {}) {
  const context = await browser.newContext({ viewport, ...extra });
  await context.addCookies([
    { name: SESSION_COOKIE_NAME, value: sessionToken(OWNER_PASSWORD), domain: "localhost", path: "/" },
  ]);
  return context;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Item 1 + 2 + 3: idle first viewport with orbit motion filmstrip (CW/CCW simultaneous)
  let context = await authedContext(browser, { width: 1440, height: 900 });
  let page = await context.newPage();
  await page.goto(`${BASE_URL}/dev/phase10-portfolio-orrery`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/01-initial-solar-system-entry.png` });
  await page.screenshot({ path: `${OUT}/02-multiple-differently-sized-planets.png` });
  for (let i = 0; i < 8; i++) {
    await page.screenshot({ path: `${FILMSTRIPS}/orrery-idle-orbit/frame-${String(i).padStart(2, "0")}.png` });
    await page.waitForTimeout(350);
  }
  await context.close();

  // Item 4 + 5: planet focus, selection, camera-travel filmstrip
  context = await authedContext(browser, { width: 1440, height: 900 });
  page = await context.newPage();
  await page.goto(`${BASE_URL}/dev/phase10-portfolio-orrery`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const firstHoldingLink = page.locator("a[data-holding]").first();
  await firstHoldingLink.focus();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/04-planet-focus.png` });
  await page.screenshot({ path: `${FILMSTRIPS}/orrery-camera-travel/frame-00-before.png` });
  await firstHoldingLink.click();
  for (let i = 1; i <= 7; i++) {
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${FILMSTRIPS}/orrery-camera-travel/frame-${String(i).padStart(2, "0")}.png` });
  }
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/05-camera-moved-to-selected-holding.png` });
  await page.screenshot({ path: `${OUT}/06-holding-inspector.png` });
  await context.close();

  // Item 7: reduced motion
  context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await context.addCookies([{ name: SESSION_COOKIE_NAME, value: sessionToken(OWNER_PASSWORD), domain: "localhost", path: "/" }]);
  page = await context.newPage();
  await page.goto(`${BASE_URL}/dev/phase10-portfolio-orrery`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/07-reduced-motion-fallback.png` });
  await context.close();

  // Item 8: mobile fallback (390 and 320)
  context = await authedContext(browser, { width: 390, height: 844 });
  page = await context.newPage();
  await page.goto(`${BASE_URL}/dev/phase10-portfolio-orrery`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/08-mobile-fallback-390x844.png`, fullPage: true });
  await context.close();

  context = await authedContext(browser, { width: 320, height: 700 });
  page = await context.newPage();
  await page.goto(`${BASE_URL}/dev/phase10-portfolio-orrery`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/08b-mobile-fallback-320px.png`, fullPage: true });
  await context.close();

  await browser.close();
  console.log("done");
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
