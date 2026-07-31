import { chromium } from "playwright";
import { access, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const BASE = "http://127.0.0.1:3401";
const PASSWORD = process.env.REVIEW_PW;

async function chromiumExecutablePath() {
  const cacheRoot = path.join(homedir(), "Library/Caches/ms-playwright");
  const revisions = (await readdir(cacheRoot, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && e.name.startsWith("chromium-"))
    .map((e) => e.name).sort().reverse();
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
  const loginResp = await page.request.post(`${BASE}/api/auth/login`, { data: { password: PASSWORD } });
  const cookies = await context.cookies();
  const cookie = cookies.find((c) => c.name === "owner_session");
  await context.addCookies([cookie]);
  await page.goto(`${BASE}/stock/IBM`, { waitUntil: "networkidle" });
  await page.waitForSelector("svg[aria-label*='indexed return']");

  const sevenD = page.locator('button[aria-pressed]:has-text("7D")').first();
  await sevenD.focus();
  const focusInfo = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return { tag: el.tagName, text: el.textContent.trim(), outlineStyle: cs.outlineStyle, ariaPressedBefore: el.getAttribute("aria-pressed") };
  });
  await page.screenshot({
    path: path.join(process.cwd(), "docs/phase10-baseline/section-14/review/keyboard-focus-7d.png"),
    clip: { x: 0, y: 180, width: 1440, height: 200 },
  });
  await sevenD.press("Enter");
  await page.waitForTimeout(200);
  const afterEnter = await sevenD.getAttribute("aria-pressed");

  const result = { focusInfo, ariaPressedAfterEnter: afterEnter };
  await writeFile(path.join(process.cwd(), "docs/phase10-baseline/section-14/review/raw-keyboard-review.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}
run().catch((e) => { console.error(e); process.exit(1); });
