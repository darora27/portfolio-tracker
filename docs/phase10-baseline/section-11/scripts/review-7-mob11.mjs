// §11 review turn 7 (Claude Lead) — fresh MOB-10/MOB-11 live check against
// current HEAD, post owner ruling that MOB-11 does NOT require the fallback
// to grow CORRELATION/TRADES/ORBITS sections. Reuses review-4-audit.mjs's
// method unchanged; only the grading of requiredNounsMissing changes.
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000";
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-7-mob11.json");

const results = {};
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

for (const width of [390, 320]) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, reducedMotion: "no-preference" });
  await context.addInitScript(() => { try { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); } catch {} });
  const page = await context.newPage();
  await page.goto(`${BASE}/share`, { waitUntil: "domcontentloaded" });
  await page.locator('nav[aria-label="Portfolio bodies"]').waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1200);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  const canvasPresent = await page.evaluate(() => !!document.querySelector("canvas"));
  const fallbackNavPresent = await page.evaluate(() => !!document.querySelector('nav[aria-label="Portfolio bodies"]'));

  const smallTargets = await page.evaluate(() => {
    const interactive = [...document.querySelectorAll('a, button, [role="button"], [tabindex]')];
    return interactive
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, text: (el.textContent ?? "").trim().slice(0, 30), width: r.width, height: r.height };
      })
      .filter((t) => t.width > 0 && t.height > 0 && (t.width < 44 || t.height < 44));
  });

  const bannedNouns = ["PLOT", "MANIFEST", "SCOPE", "HAZARD", "SIGNALS", "COMMS", "LOG", "LAUNCH", "TELEMETRY", "TRANSMISSIONS", "EGRESS"];
  const bodyText = await page.evaluate(() => document.body.innerText);
  const wordBoundary = (w) => new RegExp(`(^|[^A-Z])${w}([^A-Z]|$)`);
  const requiredNouns = ["HOLDINGS", "RETURNS", "RISK", "CORRELATION", "NEWS", "TRADES", "EARNINGS"];
  const windowWords = ["TODAY", "WEEK", "30D", "SINCE BUY", "SINCE START"];

  results[`MOB-10.${width}`] = { overflow, canvasPresent, fallbackNavPresent, smallTargetCount: smallTargets.length, smallTargets: smallTargets.slice(0, 10) };
  results[`MOB-11.${width}`] = {
    bannedFound: bannedNouns.filter((w) => wordBoundary(w).test(bodyText)),
    requiredNounsPresent: requiredNouns.filter((w) => bodyText.includes(w)),
    requiredNounsMissing: requiredNouns.filter((w) => !bodyText.includes(w)),
    windowWordsPresent: windowWords.filter((w) => bodyText.includes(w)),
    windowWordsMissing: windowWords.filter((w) => !bodyText.includes(w)),
  };

  await page.screenshot({ path: `docs/phase10-baseline/section-11/raw-review-7-fallback-${width}.png`, fullPage: true });
  await page.close();
  await context.close();
}

await browser.close();
await writeFile(OUT, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
