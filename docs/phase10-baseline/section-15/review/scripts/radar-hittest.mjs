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
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD } });
  const cookies = await context.cookies();
  const cookie = cookies.find((c) => c.name === "owner_session");
  await context.close();

  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx2.addCookies([cookie]);
  const p = await ctx2.newPage();
  await p.addInitScript(() => window.localStorage.setItem("stock-market-universe-orientation-seen", "true"));
  await p.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
  await p.waitForSelector("[data-radar-ticker]");

  const info = await p.evaluate(() => {
    const frame = document.querySelector('[aria-label="Portfolio radar targets"]');
    const rect = frame.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const stackAtCenter = document.elementsFromPoint(cx, cy).map((el) => ({
      tag: el.tagName,
      ticker: el.getAttribute?.("data-radar-ticker") ?? null,
      cls: el.className,
    }));
    const allRings = [...document.querySelectorAll('[data-radar-ellipse="true"]')].map((el, i) => {
      const r = el.getBoundingClientRect();
      return { i, ticker: el.getAttribute("data-radar-ticker"), width: r.width, height: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    });
    const allBlips = [...document.querySelectorAll('[class*="radarBlipTarget"]')].map((el, i) => {
      const r = el.getBoundingClientRect();
      return { i, ticker: el.getAttribute("data-radar-ticker"), left: r.left, top: r.top, w: r.width, h: r.height };
    });
    return { cx, cy, stackAtCenter, allRings, allBlips };
  });
  console.log(JSON.stringify(info, null, 2));
  await ctx2.close();
  await browser.close();
}
run().catch((e) => { console.error(e); process.exit(1); });
