// §11 remediation (F9 / BHV-20) — live verifier for the first-visit-only
// legend bar. Fresh unseeded context against a real production server.
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3100";
const OUT = path.resolve(
  "docs/phase10-baseline/section-11/raw-legend-first-visit.json",
);

const LEGEND_PATTERN = /SUN\s*=\s*WHOLE PORTFOLIO/i;

const sceneReady = async (page) => {
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForFunction(
    () => document.querySelectorAll("[data-scene-ticker]").length >= 8,
    null,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(800);
};

const legendPresent = (page) =>
  page.evaluate(
    (src) => new RegExp(src, "i").test(document.body.innerText),
    LEGEND_PATTERN.source,
  );

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
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});
const page = await context.newPage();

await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
await sceneReady(page);

const legendPresentFirstVisit = await legendPresent(page);

// Interact (neutral point, away from any control) — first interaction.
await page.mouse.click(50, 50);
await page.waitForTimeout(500);
const legendPresentAfterInteraction = await legendPresent(page);
const legendStorageAfterInteraction = await page.evaluate(() =>
  window.localStorage.getItem("stock-market-universe-legend-seen"),
);

// Reload — must not return.
await page.reload({ waitUntil: "domcontentloaded" });
await sceneReady(page);
const legendPresentAfterReload = await legendPresent(page);

// Summon from the Systems Manual: open it, click SHOW LEGEND specifically.
const manualButton = page.getByRole("button", { name: /open systems manual/i });
const manualButtonVisible = await manualButton.isVisible().catch(() => false);
let legendSummonedFromManual = null;
let manualClosedAfterSummon = null;
let legendDismissedAgainAfterSummon = null;
if (manualButtonVisible) {
  await manualButton.click();
  await page.waitForTimeout(200);
  const showLegendButton = page.getByRole("button", { name: "SHOW LEGEND" });
  await showLegendButton.waitFor({ state: "visible", timeout: 5_000 });
  await showLegendButton.click();
  await page.waitForTimeout(300);
  legendSummonedFromManual = await legendPresent(page);
  manualClosedAfterSummon = !(await page
    .getByRole("dialog", { name: "Systems manual" })
    .isVisible()
    .catch(() => false));

  // Dismiss again via a second interaction, confirming re-summon behaves
  // the same as first-visit dismissal.
  await page.mouse.click(50, 50);
  await page.waitForTimeout(400);
  legendDismissedAgainAfterSummon = !(await legendPresent(page));
}

const result = {
  criterion: "BHV-20",
  base: BASE,
  legendPresentFirstVisit,
  legendPresentAfterInteraction,
  legendStorageAfterInteraction,
  legendPresentAfterReload,
  manualButtonVisible,
  legendSummonedFromManual,
  manualClosedAfterSummon,
  legendDismissedAgainAfterSummon,
  dismissedOnFirstInteraction: legendPresentFirstVisit && !legendPresentAfterInteraction,
  doesNotReturnAfterReload: !legendPresentAfterReload,
  pass:
    legendPresentFirstVisit === true &&
    legendPresentAfterInteraction === false &&
    legendPresentAfterReload === false &&
    legendSummonedFromManual === true &&
    legendDismissedAgainAfterSummon === true,
};

await writeFile(OUT, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

await page.close();
await context.close();
await browser.close();
