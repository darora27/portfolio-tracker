import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:3100";
const OUT_DIR = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  ".",
);

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
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await context.addCookies([
    {
      name: "owner_session",
      value: "a22d371dd5fdc61ccdd5818cc1d8fba840526a7c92b77aaf196afc5924c880c3",
      domain: "localhost",
      path: "/",
      httpOnly: true,
    },
  ]);
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
    } catch {}
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForTimeout(1500);

  const holdingCount = await page.evaluate(
    () => document.querySelectorAll("[data-scene-ticker]").length,
  );
  console.log("holdingCount", holdingCount);

  // Navigate into Mission Control (portfolio focus, command camera) to find the DRAFT latch.
  await page.evaluate(() => {
    const sun = document.querySelector("[data-portfolio-sun]");
    if (sun) sun.click();
  });
  await page.waitForTimeout(2000);

  const draftLatch = page.locator('button:has-text("DRAFT")').first();
  const latchVisible = await draftLatch.isVisible().catch(() => false);
  console.log("draftLatchVisible", latchVisible);

  if (latchVisible) {
    await draftLatch.click();
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(OUT_DIR, "draft-rig-1440x900.png"),
      fullPage: false,
    });
    const motionSwitch = await page.getByRole("switch", { name: /MOTION/ }).first().textContent().catch(() => null);
    const coachVisible = await page
      .getByText(/PULL A CIRCLE/)
      .first()
      .isVisible()
      .catch(() => false);
    console.log("motionSwitchText", motionSwitch);
    console.log("coachVisible", coachVisible);
  }

  console.log("consoleErrors", JSON.stringify(consoleErrors));

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
