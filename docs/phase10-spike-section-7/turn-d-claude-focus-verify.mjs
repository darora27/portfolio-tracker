/**
 * Claude Lead Turn D independent verification of Finding 3 (focus restoration).
 * Checks all three ObservatoryEntrance end paths against the shipped
 * production /share: Skip-button click, keydown, and the natural
 * OBSERVATORY_ENTRANCE_DURATION_MS (1800ms) timeout. Asserts
 * document.activeElement is the real [data-portfolio-sun] link in every
 * case, never BODY and never trapped inside the (unmounted) overlay.
 */
import { chromium } from "playwright";

const BASE_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";

async function checkSkip(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
  const skip = page.locator("button", { hasText: "Skip intro" });
  await skip.waitFor({ state: "visible", timeout: 3000 });
  await skip.click();
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => ({
    activeTag: document.activeElement?.tagName ?? null,
    hasSunAttr: document.activeElement?.hasAttribute("data-portfolio-sun") ?? false,
    isBody: document.activeElement === document.body,
    overlayCount: document.querySelectorAll("[class*=entranceRoot]").length,
  }));
  await context.close();
  return result;
}

async function checkKeydown(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
  await page.locator("button", { hasText: "Skip intro" }).waitFor({ state: "visible", timeout: 3000 });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => ({
    activeTag: document.activeElement?.tagName ?? null,
    hasSunAttr: document.activeElement?.hasAttribute("data-portfolio-sun") ?? false,
    isBody: document.activeElement === document.body,
    overlayCount: document.querySelectorAll("[class*=entranceRoot]").length,
  }));
  await context.close();
  return result;
}

async function checkTimeout(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
  await page.locator("button", { hasText: "Skip intro" }).waitFor({ state: "visible", timeout: 3000 });
  // OBSERVATORY_ENTRANCE_DURATION_MS is 1800ms; wait past it without any input.
  await page.waitForTimeout(2200);
  const result = await page.evaluate(() => ({
    activeTag: document.activeElement?.tagName ?? null,
    hasSunAttr: document.activeElement?.hasAttribute("data-portfolio-sun") ?? false,
    isBody: document.activeElement === document.body,
    overlayCount: document.querySelectorAll("[class*=entranceRoot]").length,
  }));
  await context.close();
  return result;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = {};
  try {
    // Fresh context per check (sessionStorage is per-context) so each run gets its own arrival.
    results.skipButtonClick = await checkSkip(browser);
    results.keydown = await checkKeydown(browser);
    results.naturalTimeout = await checkTimeout(browser);
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(results, null, 2));
  const allPass = [results.skipButtonClick, results.keydown, results.naturalTimeout].every(
    (r) => r.hasSunAttr && !r.isBody && r.overlayCount === 0,
  );
  console.log(allPass ? "\nALL THREE END PATHS: PASS" : "\nFAIL — see above");
  process.exitCode = allPass ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
