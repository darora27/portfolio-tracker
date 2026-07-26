/**
 * Phase 10 §7 Turn D production evidence capture — /share (public, no auth).
 * Captures the required R.11/§8 item-10/15 evidence against the SHIPPED
 * production build, which Codex's Turn C sandbox could not produce
 * (localhost bind EPERM). Adapted from capture-orrery-evidence.mjs.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";
const BASELINE_URL = process.env.PHASE10_BASELINE_URL ?? "http://localhost:3101";
const OUT = "docs/phase10-baseline/section-7/screenshots/share-turn-d";
const FILMSTRIPS = "docs/phase10-baseline/section-7/filmstrips";
const IDLE_FILMSTRIP = "share-turn-d-idle-orbit";
const ENTRY_FILMSTRIP = "share-turn-d-world-entry";
const CAMERA_FILMSTRIP = "share-turn-d-camera-travel";
const POINTER_FILMSTRIP = "share-turn-d-pointer-exploration";
mkdirSync(OUT, { recursive: true });
for (const dir of [IDLE_FILMSTRIP, ENTRY_FILMSTRIP, CAMERA_FILMSTRIP, POINTER_FILMSTRIP]) {
  mkdirSync(`${FILMSTRIPS}/${dir}`, { recursive: true });
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Before: pre-§7 /share baseline (today's committed state before Turn C)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASELINE_URL}/share`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/00-before-pre-turn-c-share.png` });
    await context.close();

    const contextM = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageM = await contextM.newPage();
    await pageM.goto(`${BASELINE_URL}/share`, { waitUntil: "networkidle" });
    await pageM.waitForTimeout(800);
    await pageM.screenshot({ path: `${OUT}/00-before-mobile-390x844.png`, fullPage: true });
    await contextM.close();
  }

  // World entry filmstrip: cold load through entrance completion (fresh session)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    for (let i = 0; i < 10; i++) {
      await page.screenshot({ path: `${FILMSTRIPS}/${ENTRY_FILMSTRIP}/frame-${String(i).padStart(2, "0")}.png` });
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: `${OUT}/01-initial-solar-system-entry.png` });
    await context.close();
  }

  // Idle orbit filmstrip: multiple differently sized planets + simultaneous CW/CCW motion
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share?no3d=1`, { waitUntil: "networkidle" });
    // no3d=1 disables the entrance overlay (per ObservatoryEntrance's disabled prop)
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/02-multiple-differently-sized-planets.png` });
    await context.close();
  }
  // Real canvas idle-orbit filmstrip (entrance skipped via click, then settle)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page.mouse.click(700, 450); // dismiss entrance if present
    await page.waitForTimeout(2500);
    for (let i = 0; i < 8; i++) {
      await page.screenshot({ path: `${FILMSTRIPS}/${IDLE_FILMSTRIP}/frame-${String(i).padStart(2, "0")}.png` });
      await page.waitForTimeout(350);
    }
    await context.close();
  }

  // Pointer exploration filmstrip
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share?no3d=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const positions = [
      [200, 200], [400, 300], [700, 450], [1000, 600], [1240, 750], [700, 450],
    ];
    for (let i = 0; i < positions.length; i++) {
      await page.mouse.move(...positions[i]);
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${FILMSTRIPS}/${POINTER_FILMSTRIP}/frame-${String(i).padStart(2, "0")}.png` });
    }
    await context.close();
  }

  // Planet focus, selection, camera-travel filmstrip, holding inspector, discovery-hover
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share?no3d=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const firstHoldingLink = page.locator("a[data-holding]").first();
    await firstHoldingLink.hover();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${OUT}/09-discovery-hover-state.png` });
    await firstHoldingLink.focus();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${OUT}/04-planet-focus.png` });
    await page.screenshot({ path: `${FILMSTRIPS}/${CAMERA_FILMSTRIP}/frame-00-before.png` });
    await firstHoldingLink.click();
    for (let i = 1; i <= 7; i++) {
      await page.waitForTimeout(100);
      await page.screenshot({ path: `${FILMSTRIPS}/${CAMERA_FILMSTRIP}/frame-${String(i).padStart(2, "0")}.png` });
    }
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/05-camera-moved-to-selected-holding.png` });
    await page.screenshot({ path: `${OUT}/06-holding-inspector.png` });
    await context.close();
  }

  // Reduced motion fallback
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/07-reduced-motion-fallback.png` });
    await context.close();
  }

  // Mobile fallback: 390x844 and 320px
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/08-mobile-fallback-390x844.png`, fullPage: true });
    await context.close();

    const context2 = await browser.newContext({ viewport: { width: 320, height: 700 } });
    const page2 = await context2.newPage();
    await page2.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(600);
    await page2.screenshot({ path: `${OUT}/08b-mobile-fallback-320px.png`, fullPage: true });
    await context2.close();
  }

  await browser.close();
  console.log("done");
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
