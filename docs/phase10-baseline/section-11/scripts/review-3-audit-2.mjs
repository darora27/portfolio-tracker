// §11 review turn 3 — follow-up audit fixing two selector bugs from
// review-3-audit.mjs (case-sensitive class match; correlation checked before
// its LazyMissionSection had mounted).
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-3-audit-2.json");

const sceneReady = async (page) => {
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 });
  await page.waitForTimeout(1500);
};

const results = {};
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });

const page = await context.newPage();
await page.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "domcontentloaded" });
await sceneReady(page);
await page.waitForTimeout(1000);

const stripInfo = await page.evaluate(() => {
  const header = document.querySelector('header[class*="missionStrip" i], header[class*="Strip"]');
  if (!header) return { found: false };
  const style = getComputedStyle(header);
  return { found: true, position: style.position, top: header.getBoundingClientRect().top };
});
results["BHV-14.stripBeforeScroll"] = stripInfo;

// Scroll to bring CORRELATION into view (lazy-mounts on idle/first scroll).
await page.evaluate(() => document.getElementById("correlation")?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(1200);
const correlationText = await page.evaluate(() => document.getElementById("correlation")?.innerText ?? "");
results["BHV-18.correlationSectionText"] = correlationText;
results["BHV-18.correlationCopyPresent"] = /independent paths|co-?movement|move together/i.test(correlationText);

// Scroll to the very bottom (past TRADES) and re-check the strip stays pinned.
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
const stripAfter = await page.evaluate(() => {
  const header = document.querySelector('header[class*="missionStrip" i], header[class*="Strip"]');
  if (!header) return { found: false };
  const style = getComputedStyle(header);
  return { found: true, position: style.position, top: header.getBoundingClientRect().top, text: header.innerText.slice(0, 150) };
});
results["BHV-14.stripAfterScrollToBottom"] = stripAfter;

// Radar pause off-screen (BLD-11): once scrolled past, the radar canvas'
// containing IntersectionObserver target should report isIntersecting=false.
// We check via a data attribute the room sets, if present.
results["BLD-11.radarDataAttr"] = await page.evaluate(() => {
  const el = document.querySelector("[data-radar-paused]");
  return el ? el.dataset.radarPaused : "attribute-not-found";
});

await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-3-room-bottom.png" });
await page.close();
await context.close();
await browser.close();
await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, out: OUT }, null, 2));
