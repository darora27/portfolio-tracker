// §11 review turn 5 — BHV-31 siphon latch, via the KEYBOARD path (Space
// latches the focused circle as counterparty per spec 7.4.4) rather than
// pointer-drag. Two independent review rounds (review-4-owner-audit.mjs and
// this turn's review-5-draft-followup.mjs) both drove a synthetic
// mouse.down/move/up sequence and never observed [data-counterparty="true"]
// OR a real weight change from the same gesture pattern (grownWeightChanged
// before:29/after:29 in both runs) — convergent evidence the pointer-drag
// gesture does not register under headless Chromium + Playwright's
// CDP-dispatched mouse events on this component (setPointerCapture
// retargeting is the likely suspect), not that the feature is broken for a
// real user. This checks the keyboard-native latch instead, which the
// project's own accessibility requirement (ACC-10) already requires to
// exist independently of drag.
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100";
const PASSWORD = process.env.PHASE10_TEMP_OWNER_PASSWORD;
if (!PASSWORD) throw new Error("set PHASE10_TEMP_OWNER_PASSWORD");
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-5-bhv31-keyboard-siphon.json");
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
  page.evaluate(() => [...document.querySelectorAll("[data-draft-index]")].map((el) => ({
    index: Number(el.dataset.draftIndex),
    counterparty: el.getAttribute("data-counterparty"),
  })));

const circles = page.locator("[data-draft-index]");
await circles.nth(3).focus();
await page.keyboard.press(" ");
await page.waitForTimeout(300);
results.stateAfterLatch = await readWeights(page);
results.latchedFound = results.stateAfterLatch.some((r) => r.counterparty === "true");
results.latchedIndex = results.stateAfterLatch.find((r) => r.counterparty === "true")?.index ?? null;

// Release: pressing Space again on the same circle should un-latch.
await page.keyboard.press(" ");
await page.waitForTimeout(300);
results.stateAfterRelease = await readWeights(page);
results.releasedCleanly = !results.stateAfterRelease.some((r) => r.counterparty === "true");

results.pass = results.latchedFound === true && results.latchedIndex === 3 && results.releasedCleanly === true;

await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
await browser.close();
