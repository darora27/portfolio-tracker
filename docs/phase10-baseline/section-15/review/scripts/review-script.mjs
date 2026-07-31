import { chromium } from "playwright";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const runtimeCwd = process.cwd();
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-15/review");
const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3416";
const PASSWORD = process.env.PHASE10_S15_REVIEW_PASSWORD;
const VIEWPORT = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

if (!PASSWORD) {
  console.error("PHASE10_S15_REVIEW_PASSWORD env var is required");
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

async function scrollAndWaitMounted(page, selector) {
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView(), selector);
  await page.waitForSelector(`${selector}[data-lazy-mounted="true"]`, { timeout: 8000 });
}

async function dismissOrientation(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  });
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

    // ---- reviewer-owned private-mode doors trace (BHV-08 / VIS-08) ----
    const doorContext = await browser.newContext({ viewport: VIEWPORT });
    await doorContext.addCookies([sessionCookie]);
    const doorPage = await doorContext.newPage();
    await dismissOrientation(doorPage);
    await doorPage.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await scrollAndWaitMounted(doorPage, "#holdings");
    await doorPage.waitForTimeout(150);
    // Pick a DIFFERENT row than the implementer's evidence (not first row) to
    // independently confirm the destination isn't hardcoded to one ticker.
    const rowLinks = doorPage.locator("#holdings table tbody tr th a");
    const rowCount = await rowLinks.count();
    const secondRowTicker = await rowLinks.nth(1).textContent();
    const secondRowHref = await rowLinks.nth(1).getAttribute("href");
    const firstRowHref = await rowLinks.nth(0).getAttribute("href");

    await doorPage.goto(`${BASE}/?holding=GOOG&camera=approach`, { waitUntil: "networkidle" });
    const fullAnalysisDoorHref = await doorPage.getByRole("link", { name: "FULL ANALYSIS ▸" }).getAttribute("href");

    await doorPage.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    const orbitsRadarBlip = doorPage.locator("[data-radar-ticker]").first();
    let orbitsDoorNavigated = null;
    let orbitsTicker = null;
    if (await orbitsRadarBlip.count()) {
      orbitsTicker = await orbitsRadarBlip.getAttribute("data-radar-ticker");
      await orbitsRadarBlip.dblclick({ force: true });
      await doorPage.waitForTimeout(300);
      orbitsDoorNavigated = doorPage.url();
    }
    results.doorsPrivate = {
      mode: "private",
      rowCount,
      firstRowHref,
      secondRowTicker,
      secondRowHref,
      fullAnalysisDoorHref,
      orbitsTicker,
      orbitsDoorNavigated,
    };
    await doorContext.close();

    // ---- reviewer-owned public-mode doors trace (PRV-01 / VIS-08 negative) ----
    const publicContext = await browser.newContext({ viewport: VIEWPORT });
    const publicPage = await publicContext.newPage();
    await dismissOrientation(publicPage);
    await publicPage.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await scrollAndWaitMounted(publicPage, "#holdings");
    await publicPage.waitForTimeout(150);
    const publicRowLinks = publicPage.locator("#holdings table tbody tr th a");
    const publicSecondRowTicker = await publicRowLinks.nth(1).textContent();
    const publicSecondRowHref = await publicRowLinks.nth(1).getAttribute("href");
    const publicFirstRowHref = await publicRowLinks.nth(0).getAttribute("href");
    // Confirm no VALUE column and no dollar figures anywhere in the private-only rows.
    const publicHasValueColumn = await publicPage.evaluate(() =>
      Boolean(document.querySelector("#holdings thead th") &&
        [...document.querySelectorAll("#holdings thead th")].some((th) => th.textContent?.trim() === "VALUE")));

    await publicPage.goto(`${BASE}/share?holding=GOOG&camera=approach`, { waitUntil: "networkidle" });
    const publicFullAnalysisHref = await publicPage.getByRole("link", { name: "FULL ANALYSIS ▸" }).getAttribute("href");

    await publicPage.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    const publicOrbitsBlip = publicPage.locator("[data-radar-ticker]").first();
    let publicOrbitsNavigated = null;
    if (await publicOrbitsBlip.count()) {
      await publicOrbitsBlip.dblclick({ force: true });
      await publicPage.waitForTimeout(300);
      publicOrbitsNavigated = publicPage.url();
    }

    // Direct-navigation privacy probe: does /share ever expose a raw link to
    // /stock/[ticker] anywhere in its DOM (not just the three named doors)?
    await publicPage.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    for (const id of ["holdings", "returns", "mix", "risk", "trades"]) {
      await scrollAndWaitMounted(publicPage, `#${id}`);
    }
    const anyStockLinkInPublicDom = await publicPage.evaluate(() =>
      [...document.querySelectorAll("a[href]")].some((a) => a.getAttribute("href")?.includes("/stock/")));

    results.doorsPublic = {
      mode: "public",
      publicFirstRowHref,
      publicSecondRowTicker,
      publicSecondRowHref,
      publicFullAnalysisHref,
      publicOrbitsNavigated,
      publicHasValueColumn,
      anyStockLinkInPublicDom,
    };
    await publicContext.close();

    // ---- reviewer-owned STRIP / cuts state, private mode ----
    const stateContext = await browser.newContext({ viewport: VIEWPORT });
    await stateContext.addCookies([sessionCookie]);
    const statePage = await stateContext.newPage();
    await dismissOrientation(statePage);
    await statePage.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await statePage.waitForSelector("#holdings");
    for (const id of ["holdings", "returns", "mix", "risk", "trades"]) {
      await scrollAndWaitMounted(statePage, `#${id}`);
    }
    const stripAndCuts = await statePage.evaluate(() => {
      const strip = document.querySelector('[class*="missionReadoutChips"]');
      return {
        stripText: strip?.textContent ?? null,
        hasNextChip: /NEXT:/.test(strip?.textContent ?? ""),
        hasEarningsNavLink: Boolean(document.querySelector('a[href="#earnings"]')),
        correlationSectionPresent: Boolean(document.getElementById("correlation")),
        earningsSectionPresent: Boolean(document.getElementById("earnings")),
        footerNewsPresent: Boolean(document.querySelector('[class*="footerNews"]')),
        footerNewsHeadlineCount: document.querySelectorAll('[class*="footerNews"] li').length,
        mixSectionPresent: Boolean(document.getElementById("mix")),
        activityTitlePresent: /ACTIVITY/.test(document.getElementById("trades")?.textContent ?? ""),
        bookImpactAbsent: !/BOOK IMPACT/.test(document.getElementById("trades")?.textContent ?? ""),
        effectOnPortfolioPresent: /EFFECT ON PORTFOLIO/.test(document.getElementById("trades")?.textContent ?? ""),
      };
    });
    results.stripAndCuts = stripAndCuts;
    await statePage.screenshot({ path: path.join(root, "overview-1440x900.png"), fullPage: false });
    await stateContext.close();

    // ---- reviewer-owned keyboard operability (ACC-01) ----
    const kbdContext = await browser.newContext({ viewport: VIEWPORT });
    await kbdContext.addCookies([sessionCookie]);
    const kbdPage = await kbdContext.newPage();
    await dismissOrientation(kbdPage);
    await kbdPage.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await scrollAndWaitMounted(kbdPage, "#returns");
    await kbdPage.waitForTimeout(150);
    const xlk = kbdPage.getByRole("button", { name: "XLK", exact: true });
    await xlk.focus();
    const beforePressed = await xlk.getAttribute("aria-pressed");
    await kbdPage.keyboard.press("Enter");
    await kbdPage.waitForTimeout(100);
    const afterPressed = await xlk.getAttribute("aria-pressed");
    const stockVsStock = kbdPage.getByRole("button", { name: "STOCK VS STOCK" });
    await stockVsStock.focus();
    await kbdPage.keyboard.press("Enter");
    await kbdPage.waitForTimeout(100);
    const stockVsStockPressed = await stockVsStock.getAttribute("aria-pressed");

    await scrollAndWaitMounted(kbdPage, "#risk");
    await kbdPage.waitForTimeout(150);
    const byHolding = kbdPage.getByText("BY HOLDING ▸");
    await byHolding.focus();
    await kbdPage.keyboard.press("Enter");
    await kbdPage.waitForTimeout(100);
    const detailsOpenAfterEnter = await kbdPage.evaluate(
      () => document.querySelector('details[class*="byHoldingDisclosure"]')?.open ?? null,
    );

    const disclosureTrigger = kbdPage.locator('#risk button[class*="metricDisclosureTrigger"]').nth(1);
    await disclosureTrigger.focus();
    const triggerLabel = await disclosureTrigger.textContent();
    await kbdPage.keyboard.press("Enter");
    await kbdPage.waitForTimeout(100);
    const expandedAfterEnter = await disclosureTrigger.getAttribute("aria-expanded");
    // Verify the room itself does NOT also close on this same Escape keydown
    // (the regression the implementer says they fixed with stopPropagation).
    const roomVisibleBeforeEscape = await kbdPage.evaluate(
      () => Boolean(document.querySelector('[class*="missionControl"][role="dialog"]')),
    );
    await kbdPage.keyboard.press("Escape");
    await kbdPage.waitForTimeout(100);
    const expandedAfterEscape = await disclosureTrigger.getAttribute("aria-expanded");
    const roomVisibleAfterEscape = await kbdPage.evaluate(
      () => Boolean(document.querySelector('[class*="missionControl"][role="dialog"]')),
    );
    const focusReturnedToTrigger = await kbdPage.evaluate(
      (expectedText) => document.activeElement?.textContent?.includes(expectedText),
      (triggerLabel ?? "").trim(),
    );

    results.keyboard = {
      benchmarkToggle: { beforePressed, afterPressed },
      stockVsStockPressed,
      byHoldingDisclosure: { detailsOpenAfterEnter },
      metricDisclosure: {
        triggerLabel,
        expandedAfterEnter,
        expandedAfterEscape,
        focusReturnedToTrigger,
        roomVisibleBeforeEscape,
        roomVisibleAfterEscape,
        roomStayedOpenAcrossEscape: roomVisibleBeforeEscape === true && roomVisibleAfterEscape === true,
      },
    };
    await kbdContext.close();

    // ---- reviewer-owned mobile 390 geometry (MOB-01) ----
    const mobileContext = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 });
    await mobileContext.addCookies([sessionCookie]);
    const mobilePage = await mobileContext.newPage();
    await dismissOrientation(mobilePage);
    await mobilePage.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(300);
    const mobileState = await mobilePage.evaluate(() => {
      const controls = [
        ...document.querySelectorAll('a[data-holding], button, a[href^="/stock"], summary, a.bodyControl, [class*="bodyControl"]'),
      ];
      const rects = controls.map((el) => {
        const r = el.getBoundingClientRect();
        return { text: el.textContent?.trim().slice(0, 40), width: r.width, height: r.height };
      }).filter((r) => r.width > 0 && r.height > 0);
      const undersized = rects.filter((r) => r.width < 44 || r.height < 44);
      return {
        controlCount: rects.length,
        undersizedCount: undersized.length,
        undersized: undersized.slice(0, 10),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        bodyScrollWidth: document.documentElement.scrollWidth,
        bodyClientWidth: document.documentElement.clientWidth,
        mixRowPresent: /MIX \/ TOP/.test(document.body.textContent ?? ""),
        activityRowPresent: /ACTIVITY \/ \d+ TRADES LOGGED/.test(document.body.textContent ?? ""),
      };
    });
    results.mobile = mobileState;
    await mobilePage.screenshot({ path: path.join(root, "mobile-390.png") });
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
