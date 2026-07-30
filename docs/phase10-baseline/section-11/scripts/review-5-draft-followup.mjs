// §11 review turn 5 — cleaner re-harness for the two DRAFT-rig items
// review-4 left `not_run` as inconclusive rather than asserted:
//  - BHV-31 siphon latch: review-4's synthetic drag-into-B sequence never
//    observed [data-counterparty="true"]. This version dwells inside B's
//    bounds for longer (multiple intermediate mouse.move calls plus an
//    explicit wait) before checking, per review-4's own suggested fix.
//  - BHV-34 Back/Forward history: review-4 read page.url() with only a
//    fixed 500ms wait after goBack(), and got a contradictory result (URL
//    unchanged while rendered weights changed). This version polls with
//    page.waitForFunction on window.location.href until it differs from
//    the pre-back URL (or times out), which is the harness fix review-4
//    named as needed.
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100";
const PASSWORD = process.env.PHASE10_TEMP_OWNER_PASSWORD;
if (!PASSWORD) throw new Error("set PHASE10_TEMP_OWNER_PASSWORD");
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-5-draft-followup.json");

const results = {};
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

const sceneReady = async (page) => {
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1500);
};

const openDraft = async (page) => {
  await page.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
  await sceneReady(page);
  const draftButton = page.getByRole("button", { name: /DRAFT/i });
  await draftButton.first().waitFor({ state: "visible", timeout: 15_000 });
  await draftButton.first().click();
  await page.waitForTimeout(1000);
};

const readWeights = (page) =>
  page.evaluate(() => {
    const rows = [...document.querySelectorAll("[data-draft-index]")];
    return rows.map((r) => {
      const label = r.getAttribute("aria-label") ?? "";
      const m = label.match(/^([A-Z.]+),\s*([\d.]+)\s*percent/);
      return { index: Number(r.dataset.draftIndex), ticker: m?.[1] ?? null, weightPct: m ? Number(m[2]) : null };
    });
  });

const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
const page = await context.newPage();
const loginRes = await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD }, headers: { "Content-Type": "application/json" } });
results.loginOk = loginRes.ok();

await openDraft(page);

/* ---------------- BHV-31 siphon latch, longer dwell ---------------- */
{
  const circles = page.locator("[data-draft-index]");
  const box1 = await circles.nth(1).boundingBox();
  const box2 = await circles.nth(2).boundingBox();
  await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
  await page.mouse.down();
  // Move in several intermediate steps, ending well inside circle 2's
  // bounds, then dwell there with additional small moves (a real drag
  // continues to emit pointermove events while stationary-ish) before
  // checking the latch.
  const target = { x: box2.x + box2.width / 2, y: box2.y + box2.height / 2 };
  await page.mouse.move(target.x, target.y, { steps: 25 });
  for (let i = 0; i < 6; i += 1) {
    await page.mouse.move(target.x + (i % 2 === 0 ? 1 : -1), target.y, { steps: 2 });
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);
  results["BHV-31.siphonLatch"] = await page.evaluate(() => {
    const latched = document.querySelector('[data-counterparty="true"]');
    return {
      latchedFound: !!latched,
      latchedIndex: latched?.getAttribute("data-draft-index") ?? null,
      allCounterpartyAttrs: [...document.querySelectorAll("[data-draft-index]")].map((el) => ({
        index: el.getAttribute("data-draft-index"),
        counterparty: el.getAttribute("data-counterparty"),
      })),
    };
  });
  await page.mouse.up();
  await page.waitForTimeout(500);
}

/* ---------------- BHV-34, polled URL read ---------------- */
{
  // Make a fresh edit so there is a real committed history entry to undo.
  const circles = page.locator("[data-draft-index]");
  const box0 = await circles.nth(0).boundingBox();
  await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2);
  await page.mouse.down();
  await page.mouse.move(box0.x + box0.width / 2 + 50, box0.y + box0.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(500);

  const urlAfterEdits = page.url();
  const weightsAfterEdits = await readWeights(page);
  results["BHV-34.urlHasDraftParam"] = /[?&]draft=/.test(urlAfterEdits);
  results["BHV-34.urlAfterEdits"] = urlAfterEdits;

  await page.goBack();
  // Poll instead of a fixed wait: history navigation is async, so read
  // location.href in a loop until it differs from the pre-back URL or a
  // 5s timeout elapses (recorded either way, not silently swallowed).
  let urlAfterBack = null;
  let pollError = null;
  try {
    await page.waitForFunction(
      (prev) => window.location.href !== prev,
      urlAfterEdits,
      { timeout: 5_000 },
    );
  } catch (e) {
    pollError = "timeout: location.href never changed within 5s of goBack()";
  }
  urlAfterBack = page.url();
  await page.waitForTimeout(300); // let React settle after the popstate handler
  const weightsAfterBack = await readWeights(page);
  results["BHV-34.urlAfterBackPolled"] = urlAfterBack;
  results["BHV-34.pollError"] = pollError;
  results["BHV-34.backChangedUrl"] = urlAfterBack !== urlAfterEdits;
  results["BHV-34.weightsChangedAfterBack"] =
    JSON.stringify(weightsAfterBack.map((r) => r.weightPct)) !== JSON.stringify(weightsAfterEdits.map((r) => r.weightPct));

  await page.goForward();
  try {
    await page.waitForFunction(
      (prev) => window.location.href !== prev,
      urlAfterBack,
      { timeout: 5_000 },
    );
  } catch (e) {
    results["BHV-34.forwardPollError"] = "timeout: location.href never changed within 5s of goForward()";
  }
  await page.waitForTimeout(300);
  const urlAfterForward = page.url();
  const weightsAfterForward = await readWeights(page);
  results["BHV-34.urlAfterForwardPolled"] = urlAfterForward;
  results["BHV-34.urlRestoredAfterForward"] = urlAfterForward === urlAfterEdits;
  results["BHV-34.weightsRestoredAfterForward"] =
    JSON.stringify(weightsAfterForward.map((r) => r.weightPct)) === JSON.stringify(weightsAfterEdits.map((r) => r.weightPct));

  const copyButton = page.getByRole("button", { name: /COPY TEST LINK/i });
  results["BHV-34.copyButtonVisible"] = await copyButton.first().isVisible().catch(() => false);
}

await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));

await page.close();
await context.close();
await browser.close();
