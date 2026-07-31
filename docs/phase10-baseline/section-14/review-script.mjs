import { chromium } from "playwright";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const root = "/Users/devanarora/Desktop/portfolio-tracker/docs/phase10-baseline/section-14/review";
const BASE = "http://127.0.0.1:3401";
const PASSWORD = process.env.REVIEW_PW;
const TICKER = "IBM";
const VIEWPORT = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

if (!PASSWORD) {
  console.error("REVIEW_PW env var is required");
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
  return chromium.executablePath();
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
  const executablePath = await chromiumExecutablePath();
  const browser = await chromium.launch({ headless: true, executablePath });

  const results = {};

  try {
    const sessionCookie = await loginAndGetCookie(browser);

    // ---- Unauthenticated check (PRV-01 spot-check) ----
    const anonContext = await browser.newContext({ viewport: VIEWPORT });
    const anonPage = await anonContext.newPage();
    await anonPage.goto(`${BASE}/stock/${TICKER}`, { waitUntil: "networkidle" });
    const anonBodyText = await anonPage.evaluate(() => document.body.innerText);
    results.prv01_unauth_has_chart_room = anonBodyText.includes("CHART ROOM");
    results.prv01_unauth_has_login_hint = /sign in/i.test(anonBodyText) || /password/i.test(anonBodyText);
    await anonContext.close();

    // ---- desktop overview (VIS-01, VIS-06, VIS-08) ----
    const desktopContext = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
    await desktopContext.addCookies([sessionCookie]);
    const page = await desktopContext.newPage();
    await page.goto(`${BASE}/stock/${TICKER}`, { waitUntil: "networkidle" });
    await page.waitForSelector("svg[aria-label*='indexed return']", { timeout: 15000 });

    const demoStampCount = await page.getByText("DEMO DATA", { exact: false }).count();
    results.demoStampCount = demoStampCount;

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
    results.graphState = graphState;

    await page.screenshot({ path: path.join(root, "overview-1440x900.png"), fullPage: true });

    // ---- CONTRIBUTION bench overflow check (VIS-06 bug-fix regression) ----
    const contribCheck = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll("svg")];
      const contribSvg = svgs.find((s) => s.closest("section")?.textContent?.includes("CONTRIBUTION"));
      if (!contribSvg) return { found: false };
      const rect = contribSvg.getBoundingClientRect();
      const section = contribSvg.closest("section");
      const sectionRect = section.getBoundingClientRect();
      return {
        found: true,
        svgHeight: rect.height,
        svgOverflowsSection: rect.bottom > sectionRect.bottom + 2,
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
      };
    });
    results.contributionOverflowCheck = contribCheck;

    // ---- text roles (VIS-08), real getComputedStyle ----
    const textRoles = await page.evaluate(() => {
      function fontSizeOf(text, tag = "*") {
        const el = [...document.querySelectorAll(tag)].find((e) => e.textContent.trim() === text);
        return el ? getComputedStyle(el).fontSize : null;
      }
      return {
        kicker: fontSizeOf("CHART ROOM", "span"),
        typeLabelCustomProp: getComputedStyle(document.documentElement).getPropertyValue("--type-label").trim(),
      };
    });
    results.textRoles = textRoles;

    await desktopContext.close();

    // ---- mobile (MOB-01) ----
    const mobileContext = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 });
    await mobileContext.addCookies([sessionCookie]);
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE}/stock/${TICKER}`, { waitUntil: "networkidle" });
    await mobilePage.waitForSelector("svg[aria-label*='indexed return']", { timeout: 15000 });

    const mobileCheck = await mobilePage.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")];
      const undersized = buttons
        .map((b) => {
          const r = b.getBoundingClientRect();
          return { text: b.textContent.trim().slice(0, 20), w: r.width, h: r.height };
        })
        .filter((b) => b.w > 0 && b.h > 0 && (b.w < 44 || b.h < 44));
      return {
        buttonCount: buttons.length,
        undersizedCount: undersized.length,
        undersized: undersized.slice(0, 10),
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
        horizontalOverflow: document.body.scrollWidth > document.body.clientWidth,
      };
    });
    results.mobileCheck = mobileCheck;

    await mobilePage.screenshot({ path: path.join(root, "mobile-390.png"), fullPage: true });

    await mobileContext.close();

    await writeFile(path.join(root, "raw-independent-review.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
