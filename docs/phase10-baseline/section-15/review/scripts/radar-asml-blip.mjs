import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const BASE = "http://127.0.0.1:3416";
const PASSWORD = "review-s15-temp-pw";

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
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD } });
  const cookies = await context.cookies();
  const cookie = cookies.find((c) => c.name === "owner_session");
  await context.close();

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([cookie]);
  const p = await ctx.newPage();
  await p.addInitScript(() => window.localStorage.setItem("stock-market-universe-orientation-seen", "true"));
  await p.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });

  const info = await p.evaluate(() => {
    const blip = document.querySelector('button[class*="radarBlipTarget"][data-radar-ticker="ASML"]');
    const r = blip.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const stack = document.elementsFromPoint(cx, cy).slice(0, 4).map((el) => ({
      tag: el.tagName, ticker: el.getAttribute?.("data-radar-ticker") ?? null, cls: el.className,
    }));
    return { cx, cy, rect: r, stack };
  });
  console.log(JSON.stringify(info, null, 2));

  const blip = p.locator('button[class*="radarBlipTarget"][data-radar-ticker="ASML"]');
  await blip.dblclick({ force: true });
  await p.waitForTimeout(400);
  console.log("after dblclick url:", p.url());
  await ctx.close();
  await browser.close();
}
run().catch((e) => { console.error(e); process.exit(1); });
