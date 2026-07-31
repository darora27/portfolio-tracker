import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

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
  await p.waitForSelector(`[data-radar-ticker="CBRS"][data-radar-ellipse="true"]`);

  const info = await p.evaluate(() => {
    const angle = 6 * 0.89; // CBRS is index 6
    const el = document.querySelector(`button[class*="radarRingTarget"][data-radar-ticker="CBRS"]`);
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const x = cx + Math.cos(angle) * (r.width / 2) * 0.98;
    const y = cy + Math.sin(angle) * (r.height / 2) * 0.98;
    const stack = document.elementsFromPoint(x, y).map((e) => ({
      tag: e.tagName,
      cls: e.className,
      ticker: e.getAttribute?.("data-radar-ticker"),
      zIndex: getComputedStyle(e).zIndex,
    }));
    return { x, y, rect: r, stack };
  });
  console.log(JSON.stringify(info, null, 2));

  // Attach a capture-phase logger on document to see who actually receives dblclick.
  await p.evaluate(() => {
    window.__dblclickLog = [];
    document.addEventListener(
      "dblclick",
      (e) => {
        window.__dblclickLog.push({
          target: e.target.tagName + "." + e.target.className,
          ticker: e.target.getAttribute?.("data-radar-ticker"),
        });
      },
      true,
    );
  });

  await p.mouse.dblclick(info.x, info.y);
  await p.waitForTimeout(500);
  const log = await p.evaluate(() => window.__dblclickLog);
  console.log("dblclick log:", JSON.stringify(log, null, 2));
  console.log("final URL:", p.url());

  await browser.close();
}
run();
