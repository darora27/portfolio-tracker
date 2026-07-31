// Systematic angle sweep for §15 F1 re-review: for every ring, samples 24
// angles (every 15deg) at 98% of the way to that ring's own ellipse boundary,
// and records which ticker actually resolves (topmost interactive element,
// blip included, matching what a real click would hit). No navigation --
// pure elementFromPoint read, to cheaply characterize how much of each
// ring's own visible stroke misroutes to a different (smaller, on-top) ring.
import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { writeFile } from "node:fs/promises";

const BASE = "http://127.0.0.1:3418";
const PASSWORD = "review2-s15-temp-pw";
const TICKERS = ["ASML", "GOOG", "COST", "MSFT", "INTC", "IBM", "CBRS", "CRM"];

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

async function run() {
  const executablePath = await chromiumExecutablePath();
  const browser = await chromium.launch({ headless: true, executablePath });
  const loginContext = await browser.newContext();
  const loginPage = await loginContext.newPage();
  await loginPage.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD } });
  const cookies = await loginContext.cookies();
  const ownerCookie = cookies.find((c) => c.name === "owner_session");
  await loginContext.close();

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([ownerCookie]);
  const p = await ctx.newPage();
  await p.addInitScript(() => window.localStorage.setItem("stock-market-universe-orientation-seen", "true"));
  await p.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
  await p.waitForSelector(`[data-radar-ticker="CRM"][data-radar-ellipse="true"]`);

  const sweep = await p.evaluate((tickers) => {
    const out = [];
    for (let index = 0; index < tickers.length; index++) {
      const ticker = tickers[index];
      const el = document.querySelector(`button[class*="radarRingTarget"][data-radar-ticker="${ticker}"]`);
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const angles = [];
      for (let deg = 0; deg < 360; deg += 15) angles.push(deg);
      const rowsForRing = angles.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = cx + Math.cos(rad) * (r.width / 2) * 0.98;
        const y = cy + Math.sin(rad) * (r.height / 2) * 0.98;
        const els = document.elementsFromPoint(x, y);
        const topInteractive = els.find(
          (e) => e.matches?.('button[class*="radarRingTarget"], button[class*="radarBlipTarget"]'),
        );
        return {
          deg,
          resolvedTicker: topInteractive?.getAttribute("data-radar-ticker") ?? null,
          resolvedKind: topInteractive?.className.includes("radarBlipTarget") ? "blip" : "ring",
          correct: topInteractive?.getAttribute("data-radar-ticker") === ticker,
        };
      });
      out.push({ ticker, index, rows: rowsForRing });
    }
    return out;
  }, TICKERS);

  await writeFile(
    "docs/phase10-baseline/section-15/review-2/raw-radar-ring-sweep.json",
    JSON.stringify(sweep, null, 2),
  );

  for (const ring of sweep) {
    const bad = ring.rows.filter((r) => !r.correct);
    console.log(
      ring.ticker,
      "wrong at",
      bad.length,
      "/24 angles:",
      bad.map((b) => `${b.deg}deg->${b.resolvedTicker}(${b.resolvedKind})`).join(", "),
    );
  }

  await browser.close();
}
run();
