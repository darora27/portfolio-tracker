// §11 review turn 5 — BHV-34 in total isolation: fresh context, exactly one
// committed draft edit, then Back/Forward with polled URL reads. The
// combined script (review-5-draft-followup.mjs) ran BHV-31's siphon drag
// (itself a release, which per spec 7.7 pushes history) immediately before
// this check, and goBack() landed on "about:blank" — ambiguous between a
// genuine history-depth bug and cross-test contamination. This isolates
// the variable.
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100";
const PASSWORD = process.env.PHASE10_TEMP_OWNER_PASSWORD;
if (!PASSWORD) throw new Error("set PHASE10_TEMP_OWNER_PASSWORD");
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-5-bhv34-isolated.json");

const results = {};
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
const page = await context.newPage();
const loginRes = await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD }, headers: { "Content-Type": "application/json" } });
results.loginOk = loginRes.ok();

const sceneReady = async (page) => {
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1500);
};

await page.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
await sceneReady(page);
results.urlAfterInitialLoad = page.url();
const historyLengthAfterLoad = await page.evaluate(() => window.history.length);
results.historyLengthAfterLoad = historyLengthAfterLoad;

const draftButton = page.getByRole("button", { name: /DRAFT/i });
await draftButton.first().waitFor({ state: "visible", timeout: 15_000 });
await draftButton.first().click();
await page.waitForTimeout(1000);
results.urlAfterOpeningDraft = page.url();
results.historyLengthAfterOpeningDraft = await page.evaluate(() => window.history.length);

const readWeights = (page) =>
  page.evaluate(() => {
    const rows = [...document.querySelectorAll("[data-draft-index]")];
    return rows.map((r) => {
      const label = r.getAttribute("aria-label") ?? "";
      const m = label.match(/^([A-Z.]+),\s*([\d.]+)\s*percent/);
      return { index: Number(r.dataset.draftIndex), ticker: m?.[1] ?? null, weightPct: m ? Number(m[2]) : null };
    });
  });

const weightsBeforeEdit = await readWeights(page);
const circles = page.locator("[data-draft-index]");
const box0 = await circles.nth(0).boundingBox();
const cx = box0.x + box0.width / 2;
const cy = box0.y + box0.height / 2;
// Two-step outward drag, matching review-4-owner-audit.mjs's proven
// BHV-30/31 gesture exactly (cx+60 then cx+120, each followed by a short
// wait) rather than a single one-shot move — the single-move version used
// in the first pass of this script never registered as a weight change.
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx + 60, cy, { steps: 10 });
await page.waitForTimeout(200);
await page.mouse.move(cx + 120, cy, { steps: 10 });
await page.waitForTimeout(200);
await page.mouse.up();
await page.waitForTimeout(600);

const urlAfterEdit = page.url();
const weightsAfterEdit = await readWeights(page);
results.urlAfterEdit = urlAfterEdit;
results.historyLengthAfterEdit = await page.evaluate(() => window.history.length);
results.weightsBeforeEdit = weightsBeforeEdit.map((r) => r.weightPct);
results.weightsAfterEdit = weightsAfterEdit.map((r) => r.weightPct);
results.editActuallyChangedWeights = JSON.stringify(weightsBeforeEdit.map((r) => r.weightPct)) !== JSON.stringify(weightsAfterEdit.map((r) => r.weightPct));

await page.goBack();
try {
  await page.waitForFunction((prev) => window.location.href !== prev, urlAfterEdit, { timeout: 5_000 });
} catch {
  results.backPollTimedOut = true;
}
await page.waitForTimeout(400);
results.urlAfterBack = page.url();
results.historyLengthAfterBack = await page.evaluate(() => window.history.length);
const weightsAfterBack = await readWeights(page);
results.weightsAfterBack = weightsAfterBack.map((r) => r.weightPct);
results.backLandedOnBlank = page.url() === "about:blank";
results.backRestoredPreEditWeights = JSON.stringify(weightsAfterBack.map((r) => r.weightPct)) === JSON.stringify(weightsBeforeEdit.map((r) => r.weightPct));

await page.goForward();
try {
  await page.waitForFunction((prev) => window.location.href !== prev, results.urlAfterBack, { timeout: 5_000 });
} catch {
  results.forwardPollTimedOut = true;
}
await page.waitForTimeout(400);
results.urlAfterForward = page.url();
const weightsAfterForward = await readWeights(page);
results.weightsAfterForward = weightsAfterForward.map((r) => r.weightPct);
results.forwardRestoredEditedWeights = JSON.stringify(weightsAfterForward.map((r) => r.weightPct)) === JSON.stringify(weightsAfterEdit.map((r) => r.weightPct));

const copyButton = page.getByRole("button", { name: /COPY TEST LINK/i });
results.copyButtonVisible = await copyButton.first().isVisible().catch(() => false);

results.pass =
  results.editActuallyChangedWeights === true &&
  results.backLandedOnBlank === false &&
  results.urlAfterBack !== urlAfterEdit &&
  results.backRestoredPreEditWeights === true &&
  results.forwardRestoredEditedWeights === true;

await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));

await page.close();
await context.close();
await browser.close();
