import { chromium } from "playwright";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3417";
const PASSWORD = process.env.PHASE10_S15_TEST_PASSWORD;
if (!PASSWORD) { console.error("PHASE10_S15_TEST_PASSWORD required"); process.exit(1); }

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
  await p.waitForSelector('[aria-label="Portfolio radar targets"]');
  await p.locator('[aria-label="Portfolio radar targets"]').screenshot({
    path: "docs/phase10-baseline/section-15/remediate/orbits-ring-fixed-private-1440.png",
  });
  await ctx.close();

  const ctxPublic = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pPublic = await ctxPublic.newPage();
  await pPublic.addInitScript(() => window.localStorage.setItem("stock-market-universe-orientation-seen", "true"));
  await pPublic.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
  await pPublic.waitForSelector('[aria-label="Portfolio radar targets"]');
  await pPublic.locator('[aria-label="Portfolio radar targets"]').screenshot({
    path: "docs/phase10-baseline/section-15/remediate/orbits-ring-fixed-public-1440.png",
  });
  await ctxPublic.close();

  await browser.close();
  console.log("done");
}
run().catch(e => { console.error(e); process.exit(1); });
