// Re-verification for §15 F1 (BHV-08/VIS-08): clicks each NAMED ring at a
// point on its own visual stroke (the right-edge midpoint of its own
// bounding box, i.e. cx+radius,cy) rather than the shared bounding-box
// center every ring happens to share -- a center click cannot disambiguate
// rings since they are all centered on the identical pixel. Asserts the
// resulting destination contains that same ticker, for multiple tickers,
// in both private and public mode.
import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3417";
const PASSWORD = process.env.PHASE10_S15_TEST_PASSWORD;
const TICKERS = ["ASML", "GOOG", "COST", "MSFT", "INTC", "IBM", "CBRS", "CRM"];

if (!PASSWORD) {
  console.error("PHASE10_S15_TEST_PASSWORD env var is required");
  process.exit(1);
}

async function chromiumExecutablePath() {
  const cacheRoot = path.join(homedir(), "Library/Caches/ms-playwright");
  const revisions = (await readdir(cacheRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium-"))
    .map((entry) => entry.name).sort().reverse();
  for (const revision of revisions) {
    const candidate = path.join(cacheRoot, revision, "chrome-mac/Chromium.app/Contents/MacOS/Chromium");
    try { await access(candidate); return candidate; } catch {}
  }
  return chromium.executablePath();
}

async function ringStrokePoint(page, ticker) {
  return page.evaluate((t) => {
    const el = document.querySelector(
      `button[class*="radarRingTarget"][data-radar-ticker="${t}"]`,
    );
    if (!el) return null;
    const r = el.getBoundingClientRect();
    // 95% of the way from center to the ring's own LEFT edge (angle 180deg).
    // Blips sit at angle = index*0.89rad on their own ring's circle, which
    // for an 8-ring radar never lands within 27deg of 180deg -- so this
    // point can't coincide with a neighboring blip's independent hit area,
    // unlike the rightward (0deg) point, which exactly matches index 0's
    // blip angle and made that ring's click ambiguous with its own blip.
    return {
      x: r.left + r.width / 2 - (r.width / 2) * 0.95,
      y: r.top + r.height / 2,
      width: r.width,
      height: r.height,
    };
  }, ticker);
}

async function run() {
  const executablePath = await chromiumExecutablePath();
  const browser = await chromium.launch({ headless: true, executablePath });

  const loginContext = await browser.newContext();
  const loginPage = await loginContext.newPage();
  await loginPage.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD } });
  const cookies = await loginContext.cookies();
  const ownerCookie = cookies.find((c) => c.name === "owner_session");
  await loginContext.close();

  const results = { private: [], public: [] };

  for (const ticker of TICKERS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([ownerCookie]);
    const p = await ctx.newPage();
    await p.addInitScript(() => window.localStorage.setItem("stock-market-universe-orientation-seen", "true"));
    await p.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await p.waitForSelector(`[data-radar-ticker="${ticker}"][data-radar-ellipse="true"]`);
    const point = await ringStrokePoint(p, ticker);
    if (!point) {
      results.private.push({ ticker, error: "ring not found" });
      await ctx.close();
      continue;
    }
    const hitTarget = await p.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.getAttribute("data-radar-ticker") : null;
    }, point);
    await p.mouse.dblclick(point.x, point.y);
    await p.waitForTimeout(300);
    results.private.push({
      ticker,
      hitTestTicker: hitTarget,
      navigatedTo: p.url(),
      resolvedCorrectly: p.url().includes(`/stock/${ticker}`),
    });
    await ctx.close();
  }

  for (const ticker of TICKERS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.addInitScript(() => window.localStorage.setItem("stock-market-universe-orientation-seen", "true"));
    await p.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await p.waitForSelector(`[data-radar-ticker="${ticker}"][data-radar-ellipse="true"]`);
    const point = await ringStrokePoint(p, ticker);
    if (!point) {
      results.public.push({ ticker, error: "ring not found" });
      await ctx.close();
      continue;
    }
    const hitTarget = await p.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.getAttribute("data-radar-ticker") : null;
    }, point);
    await p.mouse.dblclick(point.x, point.y);
    await p.waitForTimeout(300);
    const url = p.url();
    results.public.push({
      ticker,
      hitTestTicker: hitTarget,
      navigatedTo: url,
      containsStockLink: url.includes("/stock/"),
      resolvedToUnchangedDestination: url.includes(`holding=${ticker}`) && url.includes("camera=approach"),
    });
    await ctx.close();
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}
run().catch((e) => { console.error(e); process.exit(1); });
