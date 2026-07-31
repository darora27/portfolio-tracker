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
  await p.waitForSelector("[data-radar-ticker]");
  await p.waitForTimeout(300);
  const frame = p.locator('[aria-label="Portfolio radar targets"]');
  await frame.screenshot({ path: "docs/phase10-baseline/section-15/review/orbits-ring-overlap-1440.png" });
  await ctx.close();
  await browser.close();
}
run();
