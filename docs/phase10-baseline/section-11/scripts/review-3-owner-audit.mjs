// §11 review turn 3 — owner-authenticated audit (Mission Control private
// mode + DRAFT rig). Logs in via a throwaway OWNER_PASSWORD the server was
// started with for this review turn only (never reads/prints .env*).
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const PASSWORD = process.env.PHASE10_TEMP_OWNER_PASSWORD;
if (!PASSWORD) throw new Error("set PHASE10_TEMP_OWNER_PASSWORD");
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-3-owner-audit.json");

const results = {};
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });
const page = await context.newPage();

// Log in.
const loginRes = await page.request.post(`${BASE}/api/auth/login`, {
  data: { password: PASSWORD },
  headers: { "Content-Type": "application/json" },
});
results.loginOk = loginRes.ok();

await page.goto(`${BASE}/?focus=portfolio&camera=command&station=manifest`, { waitUntil: "domcontentloaded" });
await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 }).catch(() => {});
await page.waitForTimeout(1500);

results.missionControlMode = await page.evaluate(() => document.querySelector('[role="dialog"][aria-labelledby="mission-control-title"]')?.getAttribute("data-mode") ?? "not-found");

// XIRR readout under 90 days (VIS-12).
results.xirrText = await page.evaluate(() => {
  const el = [...document.querySelectorAll("p")].find((p) => p.textContent?.includes("XIRR"));
  return el?.textContent ?? null;
});

// VALUE column present in owner mode HOLDINGS table.
results.valueColumnPresent = await page.evaluate(() => {
  const ths = [...document.querySelectorAll("th")].map((th) => th.textContent);
  return ths.includes("VALUE");
});

// Open the DRAFT rig.
const draftButton = page.getByRole("button", { name: /DRAFT/i });
results.draftButtonVisible = await draftButton.isVisible().catch(() => false);
if (results.draftButtonVisible) {
  await draftButton.click();
  await page.waitForTimeout(1000);
  results.draftRigOpened = await page.evaluate(() => !!document.querySelector('[class*="draftRig" i], [class*="flightCase" i], [class*="caseShell" i]'));

  // Ledger sum invariant + weight readouts (aria-label carries the percent,
  // e.g. "ASML, 30.0 percent. Arrow keys adjust...").
  results.draftWeightRows = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("[data-draft-index]")];
    return rows.map((r) => {
      const label = r.getAttribute("aria-label") ?? "";
      const m = label.match(/^([A-Z.]+),\s*([\d.]+)\s*percent/);
      return { index: r.dataset.draftIndex, label, ticker: m?.[1] ?? null, weightPct: m ? Number(m[2]) : null };
    });
  });
  results.draftWeightSum = results.draftWeightRows.reduce((s, r) => s + (r.weightPct || 0), 0);

  // ACC-10: keyboard operation. Focus the first circle, arrow-adjust.
  const firstCircle = page.locator("[data-draft-index]").first();
  await firstCircle.focus().catch(() => {});
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-draft-index") ?? document.activeElement?.tagName ?? null);
  results.keyboardFocusReachesCircle = focused;
  const before = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  results.keyboardArrowChangedWeight = { before, after, changed: before !== after };
  // Shift+Arrow should move by a bigger step (5% vs 0.5%).
  await page.keyboard.press("Shift+ArrowRight");
  await page.waitForTimeout(300);
  const afterShift = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  results.shiftArrowChangedWeight = { after, afterShift, changed: after !== afterShift };

  // aria-live region (ACC-11) — scoped to the rig, not the room-level one.
  results.ariaLiveRegionText = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('span[aria-live="polite"]')];
    return spans.map((s) => s.textContent);
  });

  // GHOST toggle (VIS-20).
  const ghostToggle = page.getByRole("button", { name: /GHOST/i }).or(page.getByRole("switch", { name: /GHOST/i }));
  results.ghostToggleVisible = await ghostToggle.first().isVisible().catch(() => false);

  await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-3-draft-rig.png" });
} else {
  results.draftBodyTextSnippet = (await page.evaluate(() => document.body.innerText)).slice(0, 500);
}

await page.close();
await context.close();
await browser.close();
await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
