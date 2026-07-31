// Re-verification for §15 F2 (BHV-08/VIS-08, round 2): the F1 remediation's
// z-index-by-size stacking is exactly right for rectangle-vs-rectangle
// containment, but a ring's TRUE visible curve is an ellipse inscribed
// short of its own rectangle's edge at every non-cardinal angle. F2's fix
// (commit under review here) resolves the correct ring in JS
// (SystemPlot.tsx's resolveRingTicker/pointInRingEllipse) rather than via
// CSS, so this script dispatches REAL double-clicks -- not a static
// elementFromPoint/elementsFromPoint read -- at a 24-angle sweep (every
// 15deg) around each of the 8 real rings, at 98% of the way to that ring's
// own ellipse boundary, and asserts the resulting navigation resolves to
// that same ring's own ticker. A static hit-test read would only show which
// DOM rectangle is topmost, not what the click handler resolves to, so it
// cannot exercise this fix.
//
// Full 24-angle sweep runs in PRIVATE mode (BHV-08: doors resolve to
// /stock/<ticker>). PUBLIC mode is confirmed only at the angles the F2
// review found failing (CBRS/CRM's diagonals) plus their own cardinal
// points, since the resolution logic is identical in both modes and only
// the destination URL construction differs (§2 of the section spec).
import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { writeFile } from "node:fs/promises";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3419";
const PASSWORD = process.env.PHASE10_S15_TEST_PASSWORD;
const TICKERS = ["ASML", "GOOG", "COST", "MSFT", "INTC", "IBM", "CBRS", "CRM"];
const ANGLES = Array.from({ length: 24 }, (_, i) => i * 15);
const PUBLIC_CONFIRM_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

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

async function attempt(page, gotoUrl, ticker, deg) {
  await page.goto(gotoUrl, { waitUntil: "networkidle" });
  await page.waitForSelector(`[data-radar-ticker="${ticker}"][data-radar-ellipse="true"]`);
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
  await page.waitForTimeout(250);
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

  // Full 24-angle sweep, private mode.
  const privateCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await privateCtx.addCookies([ownerCookie]);
  const privatePage = await privateCtx.newPage();
  await privatePage.addInitScript(() =>
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true"),
  );
  for (const ticker of TICKERS) {
    const rows = [];
    for (const deg of ANGLES) {
      const url = await attempt(
        privatePage,
        `${BASE}/?focus=portfolio&camera=command`,
        ticker,
        deg,
      );
      rows.push({ deg, navigatedTo: url, correct: url.includes(`/stock/${ticker}`) });
    }
    const wrong = rows.filter((r) => !r.correct);
    results.private.push({ ticker, wrongCount: wrong.length, wrong, rows });
    console.log(`private ${ticker}: wrong at ${wrong.length}/24 angles`, wrong.map((w) => w.deg));
  }
  await privateCtx.close();

  // Confirmation sweep, public mode (cardinals + the previously-failing
  // diagonals), asserting the PRE-EXISTING destination is unchanged and no
  // /stock/ link ever appears (PRV-01).
  const publicCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const publicPage = await publicCtx.newPage();
  await publicPage.addInitScript(() =>
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true"),
  );
  for (const ticker of TICKERS) {
    const rows = [];
    for (const deg of PUBLIC_CONFIRM_ANGLES) {
      const url = await attempt(
        publicPage,
        `${BASE}/share?focus=portfolio&camera=command`,
        ticker,
        deg,
      );
      rows.push({
        deg,
        navigatedTo: url,
        correct: url.includes(`holding=${ticker}`) && url.includes("camera=approach"),
        noStockLink: !url.includes("/stock/"),
      });
    }
    const wrong = rows.filter((r) => !r.correct || !r.noStockLink);
    results.public.push({ ticker, wrongCount: wrong.length, wrong, rows });
    console.log(`public ${ticker}: wrong at ${wrong.length}/${PUBLIC_CONFIRM_ANGLES.length} angles`, wrong.map((w) => w.deg));
  }
  await publicCtx.close();

  await writeFile(
    "docs/phase10-baseline/section-15/remediate-2/raw-radar-ring-angle-sweep-confirm.json",
    JSON.stringify(results, null, 2),
  );

  const totalWrongPrivate = results.private.reduce((sum, r) => sum + r.wrongCount, 0);
  const totalWrongPublic = results.public.reduce((sum, r) => sum + r.wrongCount, 0);
  console.log(`\nTOTAL private wrong: ${totalWrongPrivate}/${TICKERS.length * ANGLES.length}`);
  console.log(`TOTAL public wrong: ${totalWrongPublic}/${TICKERS.length * PUBLIC_CONFIRM_ANGLES.length}`);

  await browser.close();
  process.exit(totalWrongPrivate === 0 && totalWrongPublic === 0 ? 0 : 1);
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
