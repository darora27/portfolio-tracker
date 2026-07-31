import { chromium } from "playwright";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const runtimeCwd = process.cwd();
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-14");
const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3400";
const PASSWORD = process.env.CHART_ROOM_TEST_PASSWORD;
const TICKER = process.env.CHART_ROOM_TEST_TICKER ?? "IBM";
const VIEWPORT = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

if (!PASSWORD) {
  console.error("CHART_ROOM_TEST_PASSWORD env var is required");
  process.exit(1);
}

async function chromiumExecutablePath() {
  const cacheRoot = path.join(homedir(), "Library/Caches/ms-playwright");
  const revisions = (await readdir(cacheRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium-"))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  for (const revision of revisions) {
    for (const relative of ["chrome-mac/Chromium.app/Contents/MacOS/Chromium"]) {
      const candidate = path.join(cacheRoot, revision, relative);
      try {
        await access(candidate);
        return candidate;
      } catch {}
    }
  }
  const playwrightExecutable = chromium.executablePath();
  await access(playwrightExecutable);
  return playwrightExecutable;
}

async function loginAndGetCookie(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const response = await page.request.post(`${BASE}/api/auth/login`, {
    data: { password: PASSWORD },
  });
  if (!response.ok()) {
    throw new Error(`login failed: ${response.status()} ${await response.text()}`);
  }
  const cookies = await context.cookies();
  await context.close();
  return cookies.find((c) => c.name === "owner_session");
}

async function run() {
  await mkdir(root, { recursive: true });
  await mkdir(path.join(root, "scripts"), { recursive: true });
  const executablePath = await chromiumExecutablePath();
  const browser = await chromium.launch({ headless: true, executablePath });

  try {
    const sessionCookie = await loginAndGetCookie(browser);

    // ---- desktop overview (VIS-01..09) ----
    const desktopContext = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
    await desktopContext.addCookies([sessionCookie]);
    const page = await desktopContext.newPage();
    await page.goto(`${BASE}/stock/${TICKER}`, { waitUntil: "networkidle" });
    await page.waitForSelector("svg[aria-label*='indexed return']");

    const demoStampCount = await page.getByText("DEMO DATA", { exact: false }).count();

    const graphState = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('[aria-label="Full-scale graph"] button')].map((b) => ({
        label: b.textContent.trim(),
        ariaPressed: b.getAttribute("aria-pressed"),
      }));
      const title = document.querySelector('[aria-label="Full-scale graph"] h2')?.textContent.trim();
      const tracePath = document.querySelector('svg[aria-label*="indexed return"] path');
      const vooPath = [...document.querySelectorAll("svg path")].find(
        (p) => getComputedStyle(p).stroke === "rgb(95, 168, 201)",
      );
      return {
        title,
        buttons,
        tracePathPointCount: tracePath ? (tracePath.getAttribute("d").match(/[ML]/g) ?? []).length : 0,
        vooOverlayRendered: Boolean(vooPath),
      };
    });
    await writeFile(path.join(root, "raw-graph-state.json"), JSON.stringify(graphState, null, 2));

    await page.screenshot({ path: path.join(root, "overview-1440x900.png"), fullPage: true });

    // ---- text roles (VIS-08), real getComputedStyle, not source-parse ----
    const textRoles = await page.evaluate(() => {
      function fontSizeOf(text, tag = "*") {
        const el = [...document.querySelectorAll(tag)].find((e) => e.textContent.trim() === text);
        return el ? getComputedStyle(el).fontSize : null;
      }
      return {
        kicker: fontSizeOf("CHART ROOM", "span"),
        benchHeader: fontSizeOf("DISTRIBUTION", "h2"),
        benchQuestion: fontSizeOf("is today normal?", "span"),
        chipLabelWeight: (() => {
          const span = [...document.querySelectorAll("header span")].find((s) => s.textContent.includes("WEIGHT"));
          return span ? getComputedStyle(span).fontSize : null;
        })(),
      };
    });
    await writeFile(path.join(root, "raw-chart-room-text-roles.json"), JSON.stringify(textRoles, null, 2));

    // ---- keyboard operability (ACC-01) ----
    const keyboard = await page.evaluate(async () => {
      const rangeButtons = [...document.querySelectorAll('[aria-label="Full-scale graph"] button')];
      const sevenD = rangeButtons.find((b) => b.textContent.trim() === "7D");
      sevenD.focus();
      const focusedIsSevenD = document.activeElement === sevenD;
      const outline = getComputedStyle(sevenD).outlineStyle;
      const before = sevenD.getAttribute("aria-pressed");
      sevenD.click();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const after = sevenD.getAttribute("aria-pressed");
      return { focusedIsSevenD, outlineOnFocus: outline, ariaPressedBefore: before, ariaPressedAfterActivation: after };
    });
    await writeFile(path.join(root, "raw-keyboard-operability.json"), JSON.stringify(keyboard, null, 2));

    await desktopContext.close();

    // ---- mobile 390 (MOB-01) ----
    const mobileContext = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 });
    await mobileContext.addCookies([sessionCookie]);
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE}/stock/${TICKER}`, { waitUntil: "networkidle" });
    await mobilePage.waitForSelector("svg[aria-label*='indexed return']");

    const mobileSizes = await mobilePage.evaluate(() => {
      const buttons = [...document.querySelectorAll('[aria-label="Full-scale graph"] button')];
      const rects = buttons.map((b) => {
        const r = b.getBoundingClientRect();
        return { label: b.textContent.trim(), width: r.width, height: r.height };
      });
      const smallest = rects.reduce(
        (min, r) => (Math.min(r.width, r.height) < Math.min(min.width, min.height) ? r : min),
        rects[0],
      );
      return {
        buttonCount: rects.length,
        allAtLeast44: rects.every((r) => r.width >= 44 && r.height >= 44),
        smallest,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        bodyScrollWidth: document.documentElement.scrollWidth,
        bodyClientWidth: document.documentElement.clientWidth,
      };
    });
    await writeFile(path.join(root, "raw-mobile-target-sizes.json"), JSON.stringify(mobileSizes, null, 2));
    await mobilePage.screenshot({ path: path.join(root, "mobile-390.png"), fullPage: true });

    await mobileContext.close();

    console.log(
      JSON.stringify(
        { demoStampCount, graphState, textRoles, keyboard, mobileSizes },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
