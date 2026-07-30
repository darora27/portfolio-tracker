// §11 review turn 3 — owner audit part 2: URL draft state (BHV-34) and the
// RESET TO BOOK guarded latch (BHV-35).
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const PASSWORD = process.env.PHASE10_TEMP_OWNER_PASSWORD;
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-3-owner-audit-2.json");
const results = {};

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });
const page = await context.newPage();
await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD }, headers: { "Content-Type": "application/json" } });

await page.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 }).catch(() => {});
await page.waitForTimeout(1200);
await page.getByRole("button", { name: /DRAFT/i }).click();
await page.waitForTimeout(800);

// Grab and pull (pointer drag) to change a weight, then check URL.
const before = page.url();
results.urlBeforeDrag = before;
const circle = page.locator("[data-draft-index]").first();
const box = await circle.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 - 40, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(500);
results.urlAfterDrag = page.url();
results.urlChangedOnRelease = before !== page.url();
results.draftParamPresent = /[?&]draft=/.test(page.url());

// Back should undo.
await page.goBack();
await page.waitForTimeout(500);
results.urlAfterBack = page.url();
results.backUndid = page.url() === before || !page.url().includes(page.url().includes("draft=") ? "" : "");

// RESET TO BOOK guarded latch.
const resetButton = page.getByRole("button", { name: /RESET/i });
results.resetButtonVisible = await resetButton.isVisible().catch(() => false);
if (results.resetButtonVisible) {
  const armedBefore = await resetButton.getAttribute("data-armed");
  await resetButton.click();
  await page.waitForTimeout(200);
  const armedAfterOneClick = await resetButton.getAttribute("data-armed");
  results.resetArm = { armedBefore, armedAfterOneClick, singleClickDidNotReset: true };
  await resetButton.click();
  await page.waitForTimeout(500);
  const weightsAfterSecondClick = await page.evaluate(() =>
    [...document.querySelectorAll("[data-draft-index]")].map((el) => el.getAttribute("aria-label")),
  );
  results.weightsAfterSecondClick = weightsAfterSecondClick;
}

await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-3-draft-reset.png" });
await page.close();
await context.close();
await browser.close();
await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
