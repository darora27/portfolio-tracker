import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3400";
const OUT = path.resolve("docs/phase10-baseline/section-11/raw-review-8-mob11.json");

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

  const bannedNouns = ["PLOT", "MANIFEST", "SCOPE", "HAZARD", "SIGNALS", "COMMS", "LOG", "LAUNCH", "TELEMETRY", "TRANSMISSIONS", "EGRESS"];
  const bodyText = await page.evaluate(() => document.body.innerText);
  const wordBoundary = (w) => new RegExp(`(^|[^A-Z])${w}([^A-Z]|$)`);
  const requiredNouns = ["HOLDINGS", "RETURNS", "RISK", "CORRELATION", "NEWS", "TRADES", "EARNINGS"];

  results[`MOB-11.${width}`] = {
    overflow,
    bannedFound: bannedNouns.filter((w) => wordBoundary(w).test(bodyText)),
    requiredNounsPresent: requiredNouns.filter((w) => bodyText.includes(w)),
    requiredNounsMissing: requiredNouns.filter((w) => !bodyText.includes(w)),
  };

  await page.screenshot({ path: `docs/phase10-baseline/section-11/raw-review-8-fallback-${width}.png`, fullPage: true });
  await page.close();
  await context.close();
}

await browser.close();
await writeFile(OUT, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
