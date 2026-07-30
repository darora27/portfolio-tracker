import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100";
const PASSWORD = process.env.PHASE10_TEMP_OWNER_PASSWORD;
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-5-bhv34-keyboard.json");
const results = {};

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const loginRes = await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD }, headers: { "Content-Type": "application/json" } });
results.loginOk = loginRes.ok();

await page.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
await page.locator("canvas").waitFor({ state: "visible", timeout: 20000 }).catch(() => {});
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1500);

const draftButton = page.getByRole("button", { name: /DRAFT/i });
await draftButton.first().waitFor({ state: "visible", timeout: 15000 });
await draftButton.first().click();
await page.waitForTimeout(1000);

const readWeights = (page) => page.evaluate(() => {
  const rows = [...document.querySelectorAll("[data-draft-index]")];
  return rows.map((r) => {
    const label = r.getAttribute("aria-label") ?? "";
    const m = label.match(/^([A-Z.]+),\s*([\d.]+)\s*percent/);
    return { index: Number(r.dataset.draftIndex), ticker: m?.[1] ?? null, weightPct: m ? Number(m[2]) : null };
  });
});

const weightsBeforeEdit = await readWeights(page);
results.weightsBeforeEdit = weightsBeforeEdit.map(r => r.weightPct);
results.urlBeforeEdit = page.url();

const circles = page.locator("[data-draft-index]");
await circles.nth(0).focus();
for (let i = 0; i < 5; i += 1) {
  await page.keyboard.press("Shift+ArrowRight");
}
await page.waitForTimeout(500);

const weightsAfterEdit = await readWeights(page);
results.weightsAfterEdit = weightsAfterEdit.map(r => r.weightPct);
results.urlAfterEdit = page.url();
results.editActuallyChangedWeights = JSON.stringify(results.weightsBeforeEdit) !== JSON.stringify(results.weightsAfterEdit);

const urlBeforeBack = page.url();
await page.goBack();
try {
  await page.waitForFunction((prev) => window.location.href !== prev, urlBeforeBack, { timeout: 5000 });
} catch { results.backPollTimedOut = true; }
await page.waitForTimeout(400);
results.urlAfterBack = page.url();
results.backLandedOnBlank = page.url() === "about:blank";
const weightsAfterBack = await readWeights(page);
results.weightsAfterBack = weightsAfterBack.map(r => r.weightPct);
results.backRestoredPreEditWeights = JSON.stringify(results.weightsAfterBack) === JSON.stringify(results.weightsBeforeEdit);

await page.goForward();
try {
  await page.waitForFunction((prev) => window.location.href !== prev, results.urlAfterBack, { timeout: 5000 });
} catch { results.forwardPollTimedOut = true; }
await page.waitForTimeout(400);
results.urlAfterForward = page.url();
const weightsAfterForward = await readWeights(page);
results.weightsAfterForward = weightsAfterForward.map(r => r.weightPct);
results.forwardRestoredEditedWeights = JSON.stringify(results.weightsAfterForward) === JSON.stringify(results.weightsAfterEdit);

results.pass = results.editActuallyChangedWeights && !results.backLandedOnBlank && results.backRestoredPreEditWeights && results.forwardRestoredEditedWeights;

await writeFile(OUT, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify(results, null, 2));
await browser.close();
