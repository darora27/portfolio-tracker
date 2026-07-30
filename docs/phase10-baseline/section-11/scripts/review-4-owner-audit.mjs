// §11 review turn 4 (Claude Lead re-review) — owner-authenticated audit.
// Covers the still-unperformed DRAFT-rig and reduced-motion review-3 matrix
// items: BHV-31, BHV-32, BHV-33, BHV-34, BHV-35, VIS-20, ACC-13.
// Logs in via a throwaway OWNER_PASSWORD the server was started with for
// this review turn only (never reads/prints .env*).
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const PASSWORD = process.env.PHASE10_TEMP_OWNER_PASSWORD;
if (!PASSWORD) throw new Error("set PHASE10_TEMP_OWNER_PASSWORD");
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-4-owner-audit.json");

const results = {};
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

const sceneReady = async (page) => {
  // Mission Control (camera=command) does not always mount the eight
  // overview [data-scene-ticker] nodes on the same timeline as the
  // overview scene, so per the established review-3-owner-audit.mjs
  // pattern these waits are advisory, not fatal.
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
      return { index: Number(r.dataset.draftIndex), ticker: m?.[1] ?? null, weightPct: m ? Number(m[2]) : null, zero: r.closest("[data-zero]")?.getAttribute("data-zero") === "true" };
    });
  });

/* ---------------- BHV-31 / BHV-33: pro-rata breathing, siphon, pit rail, live readouts ---------------- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const loginRes = await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD }, headers: { "Content-Type": "application/json" } });
  results.loginOk = loginRes.ok();

  await openDraft(page);
  const before = await readWeights(page);
  results["BHV-30.sumBefore"] = before.reduce((s, r) => s + (r.weightPct || 0), 0);

  const circles = page.locator("[data-draft-index]");
  const count = await circles.count();
  const grownIndex = 0;
  const untouchedIndices = before.map((r) => r.index).filter((i) => i !== grownIndex);
  const untouchedRatiosBefore = untouchedIndices.map((i) => {
    const total = before.filter((r) => r.index !== grownIndex).reduce((s, r) => s + (r.weightPct || 0), 0);
    const w = before.find((r) => r.index === i)?.weightPct ?? 0;
    return { index: i, ratio: total > 0 ? w / total : 0 };
  });

  // Grab-and-pull: drag the first circle's box outward from its center.
  const box0 = await circles.nth(grownIndex).boundingBox();
  const cx = box0.x + box0.width / 2;
  const cy = box0.y + box0.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 60, cy, { steps: 10 });
  await page.waitForTimeout(200);

  // BHV-33: live readout mid-drag.
  results["BHV-33.midDragReadouts"] = await page.evaluate(() => {
    const week = [...document.querySelectorAll("*")].find((el) => el.children.length === 0 && /DRAFT MIX/i.test(el.textContent ?? ""));
    const drift = [...document.querySelectorAll("*")].find((el) => el.children.length === 0 && /MOVED .* OF 100/i.test(el.textContent ?? ""));
    const conc = [...document.querySelectorAll("*")].find((el) => el.children.length === 0 && /TOP-2/i.test(el.textContent ?? ""));
    return { weekText: week?.textContent ?? null, driftText: drift?.textContent ?? null, concText: conc?.textContent ?? null };
  });

  await page.mouse.move(cx + 120, cy, { steps: 10 });
  await page.waitForTimeout(200);
  await page.mouse.up();
  await page.waitForTimeout(500);

  const after = await readWeights(page);
  results["BHV-30.sumAfter"] = after.reduce((s, r) => s + (r.weightPct || 0), 0);
  results["BHV-33.settledReadouts"] = await page.evaluate(() => {
    const week = [...document.querySelectorAll("*")].find((el) => el.children.length === 0 && /DRAFT MIX/i.test(el.textContent ?? ""));
    return week?.textContent ?? null;
  });

  const untouchedRatiosAfter = untouchedIndices.map((i) => {
    const total = after.filter((r) => r.index !== grownIndex).reduce((s, r) => s + (r.weightPct || 0), 0);
    const w = after.find((r) => r.index === i)?.weightPct ?? 0;
    return { index: i, ratio: total > 0 ? w / total : 0 };
  });
  results["BHV-31.grownWeightChanged"] = { before: before.find((r) => r.index === grownIndex)?.weightPct, after: after.find((r) => r.index === grownIndex)?.weightPct };
  results["BHV-31.proRataRatios"] = { before: untouchedRatiosBefore, after: untouchedRatiosAfter, maxRatioDrift: Math.max(...untouchedIndices.map((i) => {
    const b = untouchedRatiosBefore.find((r) => r.index === i)?.ratio ?? 0;
    const a = untouchedRatiosAfter.find((r) => r.index === i)?.ratio ?? 0;
    return Math.abs(a - b);
  })) };

  // Siphon: drag circle 1 into circle 2's area, expect counterparty latch.
  const box1 = await circles.nth(1).boundingBox();
  const box2 = await circles.nth(2).boundingBox();
  await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
  await page.mouse.down();
  await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2, { steps: 15 });
  await page.waitForTimeout(300);
  results["BHV-31.siphonLatch"] = await page.evaluate(() => {
    const latched = document.querySelector('[data-counterparty="true"]');
    return { latchedFound: !!latched, latchedIndex: latched?.getAttribute("data-draft-index") ?? null };
  });
  await page.mouse.up();
  await page.waitForTimeout(500);

  // Zero a circle via keyboard (focus it, arrow-left repeatedly) then check pit rail.
  const lastCircle = circles.last();
  await lastCircle.focus();
  for (let i = 0; i < 80; i += 1) {
    await page.keyboard.press("Shift+ArrowLeft");
  }
  await page.waitForTimeout(300);
  results["BHV-31.pitRail"] = await page.evaluate(() => {
    const pit = document.querySelector('[aria-label="Pit rail for zero-weight holdings"]');
    const zeroed = document.querySelector('[data-zero="true"]');
    return {
      pitRailFound: !!pit,
      zeroedCircleFound: !!zeroed,
      zeroedStillLabelled: zeroed ? !!zeroed.querySelector("[data-draft-index]")?.getAttribute("aria-label") : null,
    };
  });

  // VIS-20: ghost rings.
  results["VIS-20.ghostOn"] = await page.evaluate(() => document.querySelectorAll('[data-draft-ghost="true"]').length);
  const ghostToggle = page.getByRole("switch", { name: /GHOST/i });
  await ghostToggle.first().click().catch(() => {});
  await page.waitForTimeout(300);
  results["VIS-20.ghostOff"] = await page.evaluate(() => document.querySelectorAll('[data-draft-ghost="true"]').length);
  results["VIS-20.rackNotches"] = await page.evaluate(() => document.querySelectorAll('[data-real-notch="true"]').length);

  // BHV-34: URL history — draft encoded, Back/Forward, COPY TEST LINK.
  const urlAfterEdits = page.url();
  results["BHV-34.urlHasDraftParam"] = /[?&]draft=/.test(urlAfterEdits);
  await page.goBack();
  await page.waitForTimeout(500);
  const urlAfterBack = page.url();
  const weightsAfterBack = await readWeights(page);
  results["BHV-34.backChangedUrl"] = urlAfterBack !== urlAfterEdits;
  results["BHV-34.weightsAfterBack"] = weightsAfterBack.map((r) => r.weightPct);
  await page.goForward();
  await page.waitForTimeout(500);
  results["BHV-34.urlAfterForward"] = page.url();

  const copyButton = page.getByRole("button", { name: /COPY TEST LINK/i });
  const copyVisible = await copyButton.first().isVisible().catch(() => false);
  results["BHV-34.copyButtonVisible"] = copyVisible;

  // BHV-35: RESET TO BOOK two-step arm.
  const resetButton = page.getByRole("button", { name: /RESET TO BOOK|SURE\? FLIP AGAIN/i });
  const beforeResetWeights = await readWeights(page);
  await resetButton.first().click().catch(() => {});
  await page.waitForTimeout(200);
  const armedText = await resetButton.first().textContent().catch(() => null);
  const weightsAfterFirstClick = await readWeights(page);
  await resetButton.first().click().catch(() => {});
  await page.waitForTimeout(400);
  const weightsAfterSecondClick = await readWeights(page);
  results["BHV-35"] = {
    armedTextAfterFirstClick: armedText,
    weightsUnchangedAfterFirstClick: JSON.stringify(beforeResetWeights.map((r) => r.weightPct)) === JSON.stringify(weightsAfterFirstClick.map((r) => r.weightPct)),
    weightsChangedAfterSecondClick: JSON.stringify(weightsAfterFirstClick.map((r) => r.weightPct)) !== JSON.stringify(weightsAfterSecondClick.map((r) => r.weightPct)),
  };
  const urlAfterReset = page.url();
  await page.goBack();
  await page.waitForTimeout(500);
  const weightsAfterUndoReset = await readWeights(page);
  results["BHV-35.backUndoesReset"] = JSON.stringify(weightsAfterUndoReset.map((r) => r.weightPct)) !== JSON.stringify(weightsAfterSecondClick.map((r) => r.weightPct));

  await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-4-draft-rig.png" });
  await page.close();
  await context.close();
}

/* ---------------- BHV-32: draft rig under reduced motion ---------------- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD }, headers: { "Content-Type": "application/json" } });
  await openDraft(page);
  results["BHV-32"] = await page.evaluate(() => {
    const section = document.querySelector('[role="dialog"][aria-labelledby="draft-rig-title"]');
    const dish = document.querySelector('[data-motion]');
    const chevrons = document.querySelectorAll('[data-draft-direction="true"]');
    const ghosts = document.querySelectorAll('[data-draft-ghost="true"]');
    const circles = document.querySelectorAll('[data-draft-index]');
    return {
      reducedMotionFlag: section?.getAttribute("data-reduced-motion") ?? null,
      dishMotionAttr: dish?.getAttribute("data-motion") ?? null,
      chevronCount: chevrons.length,
      ghostCount: ghosts.length,
      circleCount: circles.length,
    };
  });
  await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-4-draft-reduced-motion.png" });
  await page.close();
  await context.close();
}

/* ---------------- ACC-13: Mission Control under reduced motion ---------------- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD }, headers: { "Content-Type": "application/json" } });
  await page.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
  await sceneReady(page);
  await page.waitForTimeout(800);

  const beforeScroll = await page.evaluate(() => document.body.innerText.slice(0, 200));
  const stripBefore = await page.evaluate(() => {
    const strip = document.querySelector('[class*="strip" i]');
    return strip ? strip.getBoundingClientRect().top : null;
  });
  await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(500);
  const stripAfter = await page.evaluate(() => {
    const strip = document.querySelector('[class*="strip" i]');
    return strip ? strip.getBoundingClientRect().top : null;
  });
  const sectionsPresent = await page.evaluate(() => {
    const ids = ["holdings", "returns", "risk", "correlation", "earnings", "news", "trades"];
    return ids.map((id) => !!document.getElementById(id));
  });
  const escWorks = await (async () => {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    const stillInRoom = await page.evaluate(() => !!document.getElementById("holdings"));
    return { stillInRoom };
  })();

  results["ACC-13"] = {
    stripStickyBefore: stripBefore,
    stripStickyAfterScroll: stripAfter,
    stripStaysNearTop: stripAfter !== null && Math.abs(stripAfter) < 100,
    allSectionsPresent: sectionsPresent.every(Boolean),
    escBehaviour: escWorks,
    bodyTextSnippet: beforeScroll,
  };
  await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-4-reduced-motion-mc.png" });
  await page.close();
  await context.close();
}

await browser.close();
await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, out: OUT }, null, 2));
