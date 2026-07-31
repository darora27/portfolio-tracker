import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { writeFile } from "node:fs/promises";

const BASE = "http://127.0.0.1:3418";
const PASSWORD = "review2-s15-temp-pw";

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

async function testOne(browser, ownerCookie, mode, ticker, index, deg) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (mode === "private") await ctx.addCookies([ownerCookie]);
  const p = await ctx.newPage();
  await p.addInitScript(() => window.localStorage.setItem("stock-market-universe-orientation-seen", "true"));
  const base = mode === "private" ? BASE : `${BASE}/share`;
  await p.goto(`${base}?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
  await p.waitForSelector(`[data-radar-ticker="${ticker}"][data-radar-ellipse="true"]`);
  const point = await p.evaluate(({ t, rad }) => {
    const el = document.querySelector(`button[class*="radarRingTarget"][data-radar-ticker="${t}"]`);
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return { x: cx + Math.cos(rad) * (r.width / 2) * 0.98, y: cy + Math.sin(rad) * (r.height / 2) * 0.98 };
  }, { t: ticker, rad: (deg * Math.PI) / 180 });
  const before = p.url();
  await p.screenshot({ path: `docs/phase10-baseline/section-15/review-2/${mode}-${ticker}-${deg}deg-before.png` });
  await p.mouse.dblclick(point.x, point.y);
  await p.waitForTimeout(400);
  const after = p.url();
  await ctx.close();
  return { mode, ticker, deg, before, after, navigated: after !== before };
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

  const results = [];
  results.push(await testOne(browser, ownerCookie, "private", "CRM", 7, 45));
  results.push(await testOne(browser, ownerCookie, "public", "CRM", 7, 45));
  results.push(await testOne(browser, ownerCookie, "private", "CBRS", 6, 45));
  results.push(await testOne(browser, ownerCookie, "public", "CBRS", 6, 45));

  await writeFile(
    "docs/phase10-baseline/section-15/review-2/raw-confirm-diagonal-misroute.json",
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}
run();
