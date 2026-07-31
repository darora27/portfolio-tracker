import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const BASE = "http://127.0.0.1:3417";
const PASSWORD = process.env.PHASE10_S15_TEST_PASSWORD;

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
  await p.waitForSelector(`[data-radar-ticker="ASML"][data-radar-ellipse="true"]`);

  const allRings = await p.evaluate(() => {
    return [...document.querySelectorAll('[data-radar-ellipse="true"]')].map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        ticker: el.getAttribute("data-radar-ticker"),
        zIndex: cs.zIndex,
        left: r.left, top: r.top, width: r.width, height: r.height,
      };
    });
  });
  console.log("ALL RINGS:", JSON.stringify(allRings, null, 2));

  const asml = allRings.find(r => r.ticker === "ASML");
  const x = asml.left + asml.width/2 + (asml.width/2)*0.95;
  const y = asml.top + asml.height/2;
  console.log("Click point:", x, y);

  const before = await p.evaluate(({x,y}) => {
    const stack = document.elementsFromPoint(x,y).map(el => ({tag: el.tagName, ticker: el.getAttribute?.("data-radar-ticker"), cls: el.className}));
    return stack;
  }, {x,y});
  console.log("Stack at point BEFORE click:", JSON.stringify(before, null, 2));

  p.on("console", msg => console.log("PAGE LOG:", msg.text()));
  await p.evaluate(() => {
    window.__navigations = [];
    const orig = window.location.assign.bind(window.location);
    window.location.assign = (url) => { window.__navigations.push(url); console.log("NAV ASSIGN:", url); };
  });

  await p.mouse.dblclick(x, y);
  await p.waitForTimeout(500);
  const navs = await p.evaluate(() => window.__navigations);
  console.log("Captured navigations:", navs);
  console.log("Final URL:", p.url());

  await ctx.close();
  await browser.close();
}
run().catch(e => { console.error(e); process.exit(1); });
