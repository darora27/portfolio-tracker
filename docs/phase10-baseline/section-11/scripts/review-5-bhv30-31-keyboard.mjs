// §11 review turn 5 — BHV-30 (sum stays 100) and BHV-31 pro-rata breathing,
// re-verified via the KEYBOARD path. Both prior confirmations (review-4's
// and this turn's own review-5-draft-followup.mjs) used a pointer-drag
// gesture that this turn established does not register any weight change
// under Playwright (grownWeightChanged before:29/after:29 in both runs) —
// so BHV-30's "sum before == sum after == 100" and BHV-31's "maxRatioDrift
// 0.0" were trivially true against a no-op, not a real exercise of the
// invariant. This drives real, observable weight changes via Shift+ArrowRight
// (a spec-legal, keyboard-native adjustment path) and re-checks both
// invariants against a state that has actually moved.
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100";
const PASSWORD = process.env.PHASE10_TEMP_OWNER_PASSWORD;
if (!PASSWORD) throw new Error("set PHASE10_TEMP_OWNER_PASSWORD");
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-5-bhv30-31-keyboard.json");
const results = {};

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const loginRes = await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD }, headers: { "Content-Type": "application/json" } });
results.loginOk = loginRes.ok();

await page.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 }).catch(() => {});
await page.waitForTimeout(1500);

const draftButton = page.getByRole("button", { name: /DRAFT/i });
await draftButton.first().waitFor({ state: "visible", timeout: 15_000 });
await draftButton.first().click();
await page.waitForTimeout(1000);

const readWeights = (page) =>
  page.evaluate(() => [...document.querySelectorAll("[data-draft-index]")].map((el) => {
    const label = el.getAttribute("aria-label") ?? "";
    const m = label.match(/^([A-Z.]+),\s*([\d.]+)\s*percent/);
    return { index: Number(el.dataset.draftIndex), ticker: m?.[1] ?? null, weightPct: m ? Number(m[2]) : null };
  }));

const before = await readWeights(page);
results.weightsBefore = before.map((r) => r.weightPct);
results.sumBefore = before.reduce((s, r) => s + (r.weightPct || 0), 0);

const grownIndex = 2;
const untouchedIndices = before.map((r) => r.index).filter((i) => i !== grownIndex);
const ratiosOf = (rows) => {
  const total = rows.filter((r) => r.index !== grownIndex).reduce((s, r) => s + (r.weightPct || 0), 0);
  return untouchedIndices.map((i) => ({ index: i, ratio: total > 0 ? (rows.find((r) => r.index === i)?.weightPct ?? 0) / total : 0 }));
};
const ratiosBefore = ratiosOf(before);

const circles = page.locator("[data-draft-index]");
await circles.nth(grownIndex).focus();
for (let i = 0; i < 7; i += 1) {
  await page.keyboard.press("Shift+ArrowRight");
}
await page.waitForTimeout(500);

const after = await readWeights(page);
results.weightsAfter = after.map((r) => r.weightPct);
results.sumAfter = after.reduce((s, r) => s + (r.weightPct || 0), 0);
results.grownWeightChanged = { before: before.find((r) => r.index === grownIndex)?.weightPct, after: after.find((r) => r.index === grownIndex)?.weightPct };
results.editActuallyChangedWeights = results.grownWeightChanged.before !== results.grownWeightChanged.after;

const ratiosAfter = ratiosOf(after);
results.proRataRatios = { before: ratiosBefore, after: ratiosAfter };
results.maxRatioDrift = Math.max(...untouchedIndices.map((i) => {
  const b = ratiosBefore.find((r) => r.index === i)?.ratio ?? 0;
  const a = ratiosAfter.find((r) => r.index === i)?.ratio ?? 0;
  return Math.abs(a - b);
}));

results.pass =
  results.editActuallyChangedWeights === true &&
  Math.abs(results.sumBefore - 100) < 0.01 &&
  Math.abs(results.sumAfter - 100) < 0.01 &&
  results.maxRatioDrift < 0.001;

await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
await browser.close();
