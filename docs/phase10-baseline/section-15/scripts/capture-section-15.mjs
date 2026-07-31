import { chromium } from "playwright";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const runtimeCwd = process.cwd();
const root = path.join(runtimeCwd, "docs/phase10-baseline/section-15");
const BASE = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3415";
const PASSWORD = process.env.PHASE10_S15_TEST_PASSWORD;
const VIEWPORT = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

if (!PASSWORD) {
  console.error("PHASE10_S15_TEST_PASSWORD env var is required");
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
  const before = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? { exists: true, mounted: el.getAttribute("data-lazy-mounted") } : { exists: false };
  }, selector);
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView(), selector);
  try {
    await page.waitForSelector(`${selector}[data-lazy-mounted="true"]`, { timeout: 8000 });
  } catch (err) {
    const after = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? { exists: true, mounted: el.getAttribute("data-lazy-mounted"), rect: el.getBoundingClientRect() } : { exists: false };
    }, selector);
    console.error(`DEBUG ${selector} before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    throw err;
  }
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

  try {
    const sessionCookie = await loginAndGetCookie(browser);

    // ---- private overview (VIS-01..07) ----
    const privateContext = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
    await privateContext.addCookies([sessionCookie]);
    const page = await privateContext.newPage();
    await dismissOrientation(page);
    await page.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await page.waitForSelector("#holdings");

    // Force every LazyMissionSection to mount (IntersectionObserver-gated).
    // Rapid consecutive scrollIntoView() calls in one JS task can outrun the
    // browser's intersection-observation cadence and leave sections
    // unmounted, so each id is scrolled to and awaited individually rather
    // than fired in a single synchronous loop.
    for (const id of ["holdings", "returns", "mix", "risk", "trades"]) {
      await scrollAndWaitMounted(page, `#${id}`);
    }
    await page.evaluate(() => {
      const room = document.querySelector('[class*="missionControl"][role="dialog"]');
      if (room) room.scrollTop = 0;
    });

    const stripState = await page.evaluate(() => {
      const strip = document.querySelector('[class*="missionReadoutChips"]');
      return {
        stripText: strip?.textContent ?? null,
        hasNextChip: /NEXT:/.test(strip?.textContent ?? ""),
        hasEarningsNavLink: Boolean(document.querySelector('a[href="#earnings"]')),
      };
    });
    await writeFile(path.join(root, "raw-strip-state.json"), JSON.stringify(stripState, null, 2));

    // .missionControl is its own internal scroll container (overflow-y:
    // auto over the full viewport), not page-level scroll -- Playwright's
    // fullPage capture only reaches the outer document's height. Resize
    // the viewport to the room's real scrollHeight and reset scroll to top
    // so a single non-fullPage screenshot captures the whole descent.
    const roomHeight = await page.evaluate(() => {
      const room = document.querySelector('[class*="missionControl"][role="dialog"]');
      room.scrollTop = 0;
      return Math.ceil(room.scrollHeight);
    });
    await page.setViewportSize({ width: VIEWPORT.width, height: roomHeight });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(root, "private-overview-1440x900.png") });
    await page.setViewportSize(VIEWPORT);

    // Dedicated HOLDINGS crop (VIS-02): the full-descent capture above,
    // taken at an extreme resized viewport height to fit the whole room in
    // one non-scrolling shot, does not reliably paint every section (a
    // resize-timing artifact of this technique, not of the section's own
    // code -- ORBITS/MIX/RISK/ACTIVITY paint fine in the same capture).
    // A normal-viewport locator screenshot is Playwright's own robust path
    // and does not share that failure mode.
    await scrollAndWaitMounted(page, "#holdings");
    await page.waitForTimeout(150);
    await page.locator("#holdings").screenshot({ path: path.join(root, "holdings-1440.png") });

    await scrollAndWaitMounted(page, "#returns");
    await page.waitForTimeout(150);

    // ---- RETURNS: exercise both toggle states before the crop is captured ----
    await page.getByRole("button", { name: "VTI", exact: true }).click();
    await page.getByRole("button", { name: "STOCK VS STOCK" }).click();
    await page.waitForTimeout(150);
    const returnsSection = page.locator("#returns");
    await returnsSection.screenshot({ path: path.join(root, "returns-stock-vs-stock-1440.png") });
    await page.getByRole("button", { name: "BOOK VS MARKET" }).click();
    await page.getByRole("button", { name: "VOO", exact: true }).click();
    await page.waitForTimeout(150);

    // ---- RISK: open BY HOLDING and one MetricDisclosure before the crop ----
    await scrollAndWaitMounted(page, "#risk");
    await page.waitForTimeout(150);
    await page.getByText("BY HOLDING ▸").click();
    const firstDisclosureTrigger = page.locator('#risk button[class*="metricDisclosureTrigger"]').first();
    await firstDisclosureTrigger.click();
    await page.waitForSelector('#risk [class*="metricDisclosurePanel"]', { timeout: 5000 });
    await page.waitForTimeout(150);
    const riskSection = page.locator("#risk");
    await riskSection.screenshot({ path: path.join(root, "risk-disclosures-open-1440.png") });

    // ---- cuts (VIS-07, negative): CORRELATION/EARNINGS absent, footer NEWS present ----
    const cutsState = await page.evaluate(() => ({
      correlationSectionPresent: Boolean(document.getElementById("correlation")),
      earningsSectionPresent: Boolean(document.getElementById("earnings")),
      footerNewsPresent: Boolean(document.querySelector('[class*="footerNews"]')),
      footerNewsHeadlineCount: document.querySelectorAll('[class*="footerNews"] li').length,
    }));
    await writeFile(path.join(root, "raw-cuts-state.json"), JSON.stringify(cutsState, null, 2));
    const footer = page.locator("footer[class*='missionFooter']");
    await footer.screenshot({ path: path.join(root, "footer-news-1440.png") });

    // ---- doors, private mode (BHV-08/VIS-08) ----
    const holdingsRowHref = await page.locator("#holdings table tbody tr:first-child th a").getAttribute("href");
    const fullAnalysisHref = await page.evaluate(() => {
      const article = document.querySelector('[class*="planetDetail"]');
      return article ? null : "no-inspector-open";
    });
    await privateContext.close();

    // ---- ACC-01: keyboard operability ----
    const kbdContext = await browser.newContext({ viewport: VIEWPORT });
    await kbdContext.addCookies([sessionCookie]);
    const kbdPage = await kbdContext.newPage();
    await dismissOrientation(kbdPage);
    await kbdPage.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await scrollAndWaitMounted(kbdPage, "#returns");
    await kbdPage.waitForTimeout(150);
    const vti = kbdPage.getByRole("button", { name: "VTI", exact: true });
    await vti.focus();
    const focusedIsVti = await kbdPage.evaluate(() => document.activeElement?.textContent);
    const beforePressed = await vti.getAttribute("aria-pressed");
    await kbdPage.keyboard.press("Enter");
    await kbdPage.waitForTimeout(100);
    const afterPressed = await vti.getAttribute("aria-pressed");

    await scrollAndWaitMounted(kbdPage, "#risk");
    await kbdPage.waitForTimeout(150);
    const byHolding = kbdPage.getByText("BY HOLDING ▸");
    await byHolding.focus();
    await kbdPage.keyboard.press("Enter");
    await kbdPage.waitForTimeout(100);
    const detailsOpenAfterEnter = await kbdPage.evaluate(
      () => document.querySelector('details[class*="byHoldingDisclosure"]')?.open ?? null,
    );

    const disclosureTrigger = kbdPage.locator('button[class*="metricDisclosureTrigger"]').first();
    await disclosureTrigger.focus();
    await kbdPage.keyboard.press("Enter");
    await kbdPage.waitForTimeout(100);
    const expandedAfterEnter = await disclosureTrigger.getAttribute("aria-expanded");
    await kbdPage.keyboard.press("Escape");
    await kbdPage.waitForTimeout(100);
    const expandedAfterEscape = await disclosureTrigger.getAttribute("aria-expanded");
    const focusReturnedToTrigger = await kbdPage.evaluate(
      (expectedText) => document.activeElement?.textContent?.includes(expectedText),
      (await disclosureTrigger.textContent()) ?? "",
    );

    await writeFile(
      path.join(root, "raw-keyboard-operability.json"),
      JSON.stringify(
        {
          returnsToggle: { focusedIsVti, beforePressed, afterPressed },
          byHoldingDisclosure: { detailsOpenAfterEnter },
          metricDisclosure: { expandedAfterEnter, expandedAfterEscape, focusReturnedToTrigger },
        },
        null,
        2,
      ),
    );
    await kbdContext.close();

    // ---- private-mode doors trace (VIS-08) ----
    const doorContext = await browser.newContext({ viewport: VIEWPORT });
    await doorContext.addCookies([sessionCookie]);
    const doorPage = await doorContext.newPage();
    await dismissOrientation(doorPage);
    await doorPage.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await scrollAndWaitMounted(doorPage, "#holdings");
    await doorPage.waitForTimeout(150);
    const holdingsRowDoorHref = await doorPage.locator("#holdings table tbody tr:first-child th a").getAttribute("href");

    await doorPage.goto(`${BASE}/?holding=IBM&camera=approach`, { waitUntil: "networkidle" });
    const fullAnalysisDoorHref = await doorPage.getByRole("link", { name: "FULL ANALYSIS ▸" }).getAttribute("href");

    await doorPage.goto(`${BASE}/?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    const orbitsRadarBlip = doorPage.locator("[data-radar-ticker]").first();
    let orbitsDoorNavigated = null;
    if (await orbitsRadarBlip.count()) {
      await orbitsRadarBlip.dblclick({ force: true });
      await doorPage.waitForTimeout(300);
      orbitsDoorNavigated = doorPage.url();
    }
    await writeFile(
      path.join(root, "doors-private.json"),
      JSON.stringify(
        {
          mode: "private",
          holdingsRowDoorHref,
          fullAnalysisDoorHref,
          orbitsDoorNavigated,
        },
        null,
        2,
      ),
    );
    await doorContext.close();

    // ---- public overview + public-mode door negative capture (VIS-08 pair, PRV-01) ----
    const publicContext = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
    const publicPage = await publicContext.newPage();
    await dismissOrientation(publicPage);
    await publicPage.goto(`${BASE}/share?focus=portfolio&camera=command`, { waitUntil: "networkidle" });
    await publicPage.waitForSelector("#holdings");
    for (const id of ["holdings", "returns", "mix", "risk", "trades"]) {
      await scrollAndWaitMounted(publicPage, `#${id}`);
    }
    const publicRoomHeight = await publicPage.evaluate(() => {
      const room = document.querySelector('[class*="missionControl"][role="dialog"]');
      room.scrollTop = 0;
      return Math.ceil(room.scrollHeight);
    });
    await publicPage.setViewportSize({ width: VIEWPORT.width, height: publicRoomHeight });
    await publicPage.waitForTimeout(200);
    await publicPage.screenshot({ path: path.join(root, "public-overview-1440x900.png") });
    await publicPage.setViewportSize(VIEWPORT);
    const publicHoldingsRowHref = await publicPage
      .locator("#holdings table tbody tr:first-child th a")
      .getAttribute("href");
    await publicPage.goto(`${BASE}/share?holding=IBM&camera=approach`, { waitUntil: "networkidle" });
    const publicFullAnalysisHref = await publicPage.getByRole("link", { name: "FULL ANALYSIS ▸" }).getAttribute("href");
    await writeFile(
      path.join(root, "doors-public.json"),
      JSON.stringify({ mode: "public", publicHoldingsRowHref, publicFullAnalysisHref }, null, 2),
    );
    await publicContext.close();

    // ---- mobile 390 (MOB-01): the desktop-first 2D fallback ("phones keep
    // the tested 2D fallback", OWNER_FEEDBACK_LEDGER.md §3), not Mission
    // Control's own descent. ----
    const mobileContext = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 });
    await mobileContext.addCookies([sessionCookie]);
    const mobilePage = await mobileContext.newPage();
    await dismissOrientation(mobilePage);
    await mobilePage.goto(`${BASE}/`, { waitUntil: "networkidle" });
    // Below the 1023px gate, .semanticGroup summary is display:none and
    // every group's content is forced visible via `display: revert
    // !important` regardless of its `open` attribute (FB-09's own
    // mobile-preserving CSS override) -- no click needed.
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
    await writeFile(path.join(root, "raw-mobile-target-sizes.json"), JSON.stringify(mobileState, null, 2));
    await mobilePage.screenshot({ path: path.join(root, "mobile-390.png") });

    // Investigation note (logged, not a §15 defect -- pre-existing since
    // FB-09, §12a): at <1024px every .semanticGroup's <summary> toggle is
    // display:none, and this sandbox's headless Chromium does not visually
    // reveal a non-default group's content even when its native `open`
    // property is confirmed true (checked directly: a real click makes
    // `open` flip, but the group's box does not gain layout height and
    // scrollIntoViewIfNeeded cannot reach it) -- true today for the
    // pre-existing RETURNS/RISK/EARNINGS rows in that same group too, not
    // something this section introduced or can fix in this turn. MOB-01's
    // evidence here is real DOM geometry (raw-mobile-target-sizes.json,
    // via getBoundingClientRect: MIX/ACTIVITY present, >=44x44, no
    // overflow) paired with a real pixel capture of the same fallback's
    // default (BODIES) group, per the ledger's own "geometry measurement"
    // alternative to a full pixel capture.
    await mobileContext.close();

    console.log(
      JSON.stringify(
        { stripState, cutsState, holdingsRowHref, fullAnalysisHref, mobileState },
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
