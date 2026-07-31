// §15 review round 3 (BHV-08/VIS-08 re-verification of remediate round 3,
// candidate 3bb0374). Independent of the implementer's own
// remediate-3/scripts/radar-ring-angle-sweep-full.mjs: that script samples
// every 15deg (0,15,30,...345) at 98% of each ring's radius. This script
// deliberately uses a DIFFERENT grid (offset by 7.5deg: 7.5, 22.5, 37.5...)
// and a point closer to the true edge (99.5% of radius, plus a 99.9% probe
// on the two largest rings only) to stress-test the clip-path boundary
// itself rather than re-running the same sample points.
import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { writeFile } from "node:fs/promises";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3421";
const PASSWORD = process.env.PHASE10_S15_TEST_PASSWORD ?? "s15review3-Xk92qLp";
const ANGLES = Array.from({ length: 24 }, (_, i) => i * 15 + 7.5);
const EDGE_FRACTIONS = [0.995, 0.999];

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

async function discoverTickers(page, gotoUrl) {
  await page.goto(gotoUrl, { waitUntil: "networkidle" });
  await page.waitForSelector('button[class*="radarRingTarget"][data-radar-ellipse="true"]');
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button[class*="radarRingTarget"]')).map((el) =>
      el.getAttribute("data-radar-ticker"),
    ),
  );
}

async function attempt(page, gotoUrl, ticker, deg, fraction) {
  await page.goto(gotoUrl, { waitUntil: "networkidle" });
  await page.waitForSelector(`[data-radar-ticker="${ticker}"][data-radar-ellipse="true"]`);
  await page.waitForTimeout(500);
  const point = await page.evaluate(
    ({ t, deg, fraction }) => {
      const el = document.querySelector(
        `button[class*="radarRingTarget"][data-radar-ticker="${t}"]`,
      );
      const r = el.getBoundingClientRect();
      const rad = (deg * Math.PI) / 180;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return {
        x: cx + Math.cos(rad) * (r.width / 2) * fraction,
        y: cy + Math.sin(rad) * (r.height / 2) * fraction,
      };
    },
    { t: ticker, deg, fraction },
  );
  const before = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.getAttribute("data-radar-ticker") ?? el.closest("[data-radar-ticker]")?.getAttribute("data-radar-ticker") ?? null : null;
  }, point);
  await page.mouse.dblclick(point.x, point.y);
  await page.waitForTimeout(200);
  return { url: page.url(), elementFromPointTicker: before };
}

async function run() {
  const executablePath = await chromiumExecutablePath();
  const browser = await chromium.launch({ headless: true, executablePath });

  const loginContext = await browser.newContext();
  const loginPage = await loginContext.newPage();
  const loginResp = await loginPage.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD } });
  if (loginResp.status() !== 200) {
    console.error("login failed", loginResp.status(), await loginResp.text());
    process.exit(1);
  }
  const cookies = await loginContext.cookies();
  const ownerCookie = cookies.find((c) => c.name === "owner_session");
  await loginContext.close();

  const results = { private: [], public: [], edge: [] };

  const privateCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await privateCtx.addCookies([ownerCookie]);
  const privatePage = await privateCtx.newPage();
  await privatePage.addInitScript(() =>
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true"),
  );
  const tickers = await discoverTickers(privatePage, `${BASE}/?focus=portfolio&camera=command`);
  console.log("live ticker order (index 0 = smallest ring):", tickers);

  for (const ticker of tickers) {
    const rows = [];
    for (const deg of ANGLES) {
      const { url, elementFromPointTicker } = await attempt(
        privatePage, `${BASE}/?focus=portfolio&camera=command`, ticker, deg, 0.995,
      );
      rows.push({ deg, navigatedTo: url, correct: url.includes(`/stock/${ticker}`), elementFromPointTicker });
    }
    const wrong = rows.filter((r) => !r.correct);
    results.private.push({ ticker, wrongCount: wrong.length, wrong, rows });
    console.log(`private ${ticker}: wrong at ${wrong.length}/24 offset angles`, wrong.map((w) => `${w.deg}->${w.navigatedTo}`));
  }
  await privateCtx.close();

  const publicCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const publicPage = await publicCtx.newPage();
  await publicPage.addInitScript(() =>
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true"),
  );
  for (const ticker of tickers) {
    const rows = [];
    for (const deg of ANGLES) {
      const { url, elementFromPointTicker } = await attempt(
        publicPage, `${BASE}/share?focus=portfolio&camera=command`, ticker, deg, 0.995,
      );
      rows.push({
        deg,
        navigatedTo: url,
        correct: url.includes(`holding=${ticker}`) && url.includes("camera=approach"),
        noStockLink: !url.includes("/stock/"),
        elementFromPointTicker,
      });
    }
    const wrong = rows.filter((r) => !r.correct || !r.noStockLink);
    results.public.push({ ticker, wrongCount: wrong.length, wrong, rows });
    console.log(`public ${ticker}: wrong at ${wrong.length}/24 offset angles`, wrong.map((w) => `${w.deg}->${w.navigatedTo}`));
  }
  await publicCtx.close();

  // Edge-proximity stress test: the two LARGEST rings (index -1, -2) at the
  // exact diagonal angles the round-2 finding named (45/135/225/315), at
  // 99.5% and 99.9% of radius -- closest to the clip-path boundary itself.
  const edgeCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await edgeCtx.addCookies([ownerCookie]);
  const edgePage = await edgeCtx.newPage();
  await edgePage.addInitScript(() =>
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true"),
  );
  const largest = tickers.slice(-2);
  for (const ticker of largest) {
    for (const deg of [45, 135, 225, 315]) {
      for (const fraction of EDGE_FRACTIONS) {
        const { url, elementFromPointTicker } = await attempt(
          edgePage, `${BASE}/?focus=portfolio&camera=command`, ticker, deg, fraction,
        );
        const correct = url.includes(`/stock/${ticker}`);
        results.edge.push({ ticker, deg, fraction, navigatedTo: url, correct, elementFromPointTicker });
        console.log(`edge ${ticker} deg=${deg} frac=${fraction}: correct=${correct} -> ${url} (elementFromPoint=${elementFromPointTicker})`);
      }
    }
  }
  await edgeCtx.close();

  results.tickers = tickers;
  await writeFile(
    "docs/phase10-baseline/section-15/review-3/raw-radar-ring-independent-sweep.json",
    JSON.stringify(results, null, 2),
  );

  const totalWrongPrivate = results.private.reduce((sum, r) => sum + r.wrongCount, 0);
  const totalWrongPublic = results.public.reduce((sum, r) => sum + r.wrongCount, 0);
  const totalWrongEdge = results.edge.filter((r) => !r.correct).length;
  console.log(`\nTOTAL private wrong: ${totalWrongPrivate}/${tickers.length * ANGLES.length}`);
  console.log(`TOTAL public wrong: ${totalWrongPublic}/${tickers.length * ANGLES.length}`);
  console.log(`TOTAL edge wrong: ${totalWrongEdge}/${results.edge.length}`);

  await browser.close();
  process.exit(totalWrongPrivate === 0 && totalWrongPublic === 0 && totalWrongEdge === 0 ? 0 : 1);
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
