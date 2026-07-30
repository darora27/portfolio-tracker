// §11 review turn 4 — follow-up fixes to two review-4-audit.mjs checks
// whose first pass was inconclusive because of harness limitations, not
// confirmed product defects: VIS-19 (label text is compound, not an exact
// "PORTFOLIO" leaf node) and MOB-11 (below-fold sections lazy-mount on
// scroll per BLD-11, so the initial-viewport text sweep missed them).
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-4-followup.json");
const results = {};

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

/* ---------------- VIS-19: PORTFOLIO label collision, compound-text-aware ---------------- */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length >= 8, null, { timeout: 20_000 });
  await page.waitForTimeout(1800);

  results["VIS-19"] = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll("*")].filter(
      (el) => el.children.length === 0 && /^PORTFOLIO\b/.test(el.textContent?.trim() ?? ""),
    );
    if (candidates.length === 0) return { portfolioLabelFound: false };
    const label = candidates[0];
    const pRect = label.getBoundingClientRect();
    const tickerLabels = [...document.querySelectorAll("[data-scene-ticker]")];
    const overlaps = tickerLabels
      .map((el) => {
        const r = el.getBoundingClientRect();
        const overlap = !(r.right < pRect.left || r.left > pRect.right || r.bottom < pRect.top || r.top > pRect.bottom);
        return { ticker: el.dataset.sceneTicker, overlap, rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom } };
      })
      .filter((x) => x.overlap);
    return {
      portfolioLabelFound: true,
      portfolioLabelText: label.textContent.trim(),
      portfolioLabelRect: pRect,
      overlappingTickers: overlaps,
      noOverlap: overlaps.length === 0,
    };
  });
  await page.screenshot({ path: "docs/phase10-baseline/section-11/raw-review-4-vis19.png" });
  await page.close();
  await context.close();
}

/* ---------------- MOB-11: mobile fallback naming/window words after scroll ---------------- */
{
  for (const width of [390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, reducedMotion: "no-preference" });
    await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });
    const page = await context.newPage();
    await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
    await page.locator('nav[aria-label="Portfolio bodies"]').waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Scroll to the bottom in steps to trigger any idle/first-scroll lazy mounts.
    await page.evaluate(async () => {
      const step = () => new Promise((resolve) => {
        window.scrollBy(0, window.innerHeight);
        setTimeout(resolve, 350);
      });
      for (let i = 0; i < 12; i += 1) await step();
    });
    await page.waitForTimeout(800);

    const bannedNouns = ["PLOT", "MANIFEST", "SCOPE", "HAZARD", "SIGNALS", "COMMS", "LOG", "LAUNCH", "TELEMETRY", "TRANSMISSIONS", "EGRESS"];
    const bodyText = await page.evaluate(() => document.body.innerText);
    const wordBoundary = (w) => new RegExp(`(^|[^A-Z])${w}([^A-Z]|$)`);
    const requiredNouns = ["HOLDINGS", "RETURNS", "RISK", "CORRELATION", "NEWS", "TRADES", "EARNINGS"];
    const windowWords = ["TODAY", "WEEK", "30D", "SINCE BUY", "SINCE START"];

    results[`MOB-11.${width}`] = {
      bannedFound: bannedNouns.filter((w) => wordBoundary(w).test(bodyText)),
      requiredNounsPresent: requiredNouns.filter((w) => bodyText.includes(w)),
      requiredNounsMissing: requiredNouns.filter((w) => !bodyText.includes(w)),
      windowWordsPresent: windowWords.filter((w) => bodyText.includes(w)),
      windowWordsMissing: windowWords.filter((w) => !bodyText.includes(w)),
    };
    await page.screenshot({ path: `docs/phase10-baseline/section-11/raw-review-4-fallback-scrolled-${width}.png`, fullPage: true });
    await page.close();
    await context.close();
  }
}

await browser.close();
await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
