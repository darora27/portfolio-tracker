/**
 * Phase 10 §7 Turn B′ review — live parallax verification for the
 * remediated /dev/phase10-spike-r3f-world route (criterion 42). Reads
 * --world-pointer-x/-y and the computed transform of .atmosphere and
 * .canvasStage at two distinct pointer positions to confirm at least two
 * layers offset by different magnitudes.
 *
 *   OWNER_PASSWORD=<temporary-local-value> node docs/phase10-spike-section-7/verify-r3f-parallax.mjs
 *
 * Requires a production server. Never reads .env files.
 */
import { chromium } from "playwright";
import crypto from "node:crypto";

const BASE_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
if (!OWNER_PASSWORD) throw new Error("OWNER_PASSWORD must be provided without reading .env*");
const SESSION_COOKIE_NAME = "owner_session";
function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([{ name: SESSION_COOKIE_NAME, value: sessionToken(OWNER_PASSWORD), domain: "localhost", path: "/" }]);
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/dev/phase10-spike-r3f-world`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const world = page.locator("main[data-force-no-3d]");
  const positions = [[200, 200], [1240, 700]];
  for (const [x, y] of positions) {
    await page.mouse.move(x, y);
    await page.waitForTimeout(150);
    const vals = await world.evaluate((el) => ({
      x: el.style.getPropertyValue("--world-pointer-x"),
      y: el.style.getPropertyValue("--world-pointer-y"),
    }));
    const transforms = await page.evaluate(() => {
      const atmosphere = document.querySelector('[class*="atmosphere"]');
      const canvasStage = document.querySelector('[class*="canvasStage"]');
      return {
        atmosphere: atmosphere ? getComputedStyle(atmosphere).transform : null,
        canvasStage: canvasStage ? getComputedStyle(canvasStage).transform : null,
      };
    });
    console.log(JSON.stringify({ pos: [x, y], vals, transforms }));
  }
  await context.close();
  await browser.close();
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
