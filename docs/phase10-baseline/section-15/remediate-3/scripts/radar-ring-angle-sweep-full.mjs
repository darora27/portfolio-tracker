// §15 F2 remediation round 3: re-verification of BHV-08/VIS-08 after
// replacing the JS ellipse-containment-with-margin walk (round 2's fix,
// which itself replaced round 1's z-index-only stacking) with a clip-path
// on each ring button, sized to the exact same ellipse its ::before border
// draws. This removes the rectangle-vs-ellipse mismatch at the source
// instead of patching around it with a magic-number margin.
//
// Full 24-angle-per-ring sweep (every 15deg), dispatched as REAL double
// clicks (not a static elementFromPoint read, which cannot exercise a
// native clip-path hit-test the way a real click does), in BOTH private and
// public mode, against whatever the live portfolio's actual holdings are
// (discovered at runtime -- do not hardcode a ticker list, since holdings
// membership has already been observed to change between evidence rounds
// for this exact section, e.g. CRM being replaced by NBIS).
import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { writeFile } from "node:fs/promises";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3419";
const PASSWORD = process.env.PHASE10_S15_TEST_PASSWORD;
const ANGLES = Array.from({ length: 24 }, (_, i) => i * 15);

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

async function discoverTickers(page, gotoUrl) {
  await page.goto(gotoUrl, { waitUntil: "networkidle" });
  await page.waitForSelector('button[class*="radarRingTarget"][data-radar-ellipse="true"]');
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button[class*="radarRingTarget"]')).map((el) =>
      el.getAttribute("data-radar-ticker"),
    ),
  );
}

async function attempt(page, gotoUrl, ticker, deg) {
  await page.goto(gotoUrl, { waitUntil: "networkidle" });
  await page.waitForSelector(`[data-radar-ticker="${ticker}"][data-radar-ellipse="true"]`);
  // A 200ms settle (round 2's own script) was sometimes too short: geometry
  // measured immediately after networkidle occasionally raced the radar's
  // post-mount layout settle, producing a stale rect and a missed click
  // that looked like a hit-test gap but reproduced as a false negative on
  // retry with more settle time (see .scratch-debug/diag-asml0.mjs during
  // this round's investigation). 500ms removes that race.
  await page.waitForTimeout(500);
  const point = await page.evaluate(
    ({ t, deg }) => {
      const el = document.querySelector(
        `button[class*="radarRingTarget"][data-radar-ticker="${t}"]`,
      );
      const r = el.getBoundingClientRect();
      const rad = (deg * Math.PI) / 180;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return {
        x: cx + Math.cos(rad) * (r.width / 2) * 0.98,
        y: cy + Math.sin(rad) * (r.height / 2) * 0.98,
      };
    },
    { t: ticker, deg },
  );
  await page.mouse.dblclick(point.x, point.y);
  await page.waitForTimeout(200);
  return page.url();
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
      const url = await attempt(privatePage, `${BASE}/?focus=portfolio&camera=command`, ticker, deg);
      rows.push({ deg, navigatedTo: url, correct: url.includes(`/stock/${ticker}`) });
    }
    const wrong = rows.filter((r) => !r.correct);
    results.private.push({ ticker, wrongCount: wrong.length, wrong, rows });
    console.log(`private ${ticker}: wrong at ${wrong.length}/24 angles`, wrong.map((w) => `${w.deg}->${w.navigatedTo}`));
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
      const url = await attempt(publicPage, `${BASE}/share?focus=portfolio&camera=command`, ticker, deg);
      rows.push({
        deg,
        navigatedTo: url,
        correct: url.includes(`holding=${ticker}`) && url.includes("camera=approach"),
        noStockLink: !url.includes("/stock/"),
      });
    }
    const wrong = rows.filter((r) => !r.correct || !r.noStockLink);
    results.public.push({ ticker, wrongCount: wrong.length, wrong, rows });
    console.log(`public ${ticker}: wrong at ${wrong.length}/24 angles`, wrong.map((w) => `${w.deg}->${w.navigatedTo}`));
  }
  await publicCtx.close();

  results.tickers = tickers;
  await writeFile(
    "docs/phase10-baseline/section-15/remediate-3/raw-radar-ring-angle-sweep-full.json",
    JSON.stringify(results, null, 2),
  );

  const totalWrongPrivate = results.private.reduce((sum, r) => sum + r.wrongCount, 0);
  const totalWrongPublic = results.public.reduce((sum, r) => sum + r.wrongCount, 0);
  console.log(`\nTOTAL private wrong: ${totalWrongPrivate}/${tickers.length * ANGLES.length}`);
  console.log(`TOTAL public wrong: ${totalWrongPublic}/${tickers.length * ANGLES.length}`);

  await browser.close();
  process.exit(totalWrongPrivate === 0 && totalWrongPublic === 0 ? 0 : 1);
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
