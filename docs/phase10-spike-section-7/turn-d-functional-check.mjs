/**
 * Phase 10 §7 Turn D functional/accessibility/mobile/privacy verification.
 * Targets the shipped production /share (port 3100 by default).
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";
const results = {};

function log(key, value) {
  results[key] = value;
  console.log(`[${key}]`, JSON.stringify(value));
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

  // 1. Entrance: fresh session shows overlay; reload in same context does not; new context does.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    const overlayFirstLoad = await page.locator("[class*=entranceRoot]").count();
    const skipBtn = page.locator("button", { hasText: "Skip intro" });
    const skipVisible = await skipBtn.isVisible().catch(() => false);
    // content must be present/operable even while overlay shows
    const sunOperableDuringEntrance = await page.locator("[data-portfolio-sun]").isVisible();
    if (skipVisible) await skipBtn.click();
    await page.waitForTimeout(200);
    const overlayAfterSkip = await page.locator("[class*=entranceRoot]").count();
    // reload same context/session -> should not replay
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const overlayOnReload = await page.locator("[class*=entranceRoot]").count();
    await context.close();

    // fresh context (new session) -> should replay
    const context2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page2 = await context2.newPage();
    await page2.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    const overlayFreshSession = await page2.locator("[class*=entranceRoot]").count();
    await context2.close();

    log("entrance", {
      overlayFirstLoad,
      skipVisible,
      sunOperableDuringEntrance,
      overlayAfterSkip,
      overlayOnReloadSameSession: overlayOnReload,
      overlayFreshSession,
    });
  }

  // 2. Sun/planet selection, URL restoration, focus, inspector fields, back/forward
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share?no3d=1`, { waitUntil: "networkidle" }); // no3d avoids entrance overlay complications
    const tickers = await page.locator("[data-holding]").evaluateAll((els) => els.map((e) => e.getAttribute("data-holding")));
    const firstTicker = tickers[0];
    await page.locator(`[data-holding="${firstTicker}"]`).click();
    await page.waitForURL(new RegExp(`holding=${firstTicker}`));
    const inspectorText = await page.locator("#orrery-inspector-heading").isVisible();
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    const inspectorFields = await page.locator("[class*=inspectorGrid] dt").allTextContents();
    const deepLink = await page.locator("a", { hasText: "Open deeper stock information" }).getAttribute("href");

    await page.goBack();
    await page.waitForTimeout(300);
    const urlAfterBack = page.url();

    await page.goto(`${BASE_URL}/share?focus=portfolio&no3d=1`, { waitUntil: "networkidle" });
    const portfolioHeading = await page.locator("h2", { hasText: "Portfolio summary" }).isVisible();
    const noDollarInPortfolioSummary = !/\$[0-9]/.test(await page.locator("[class*=inspector]").first().innerText());

    await context.close();
    log("selection", {
      tickers,
      firstTicker,
      inspectorText,
      focusedId,
      inspectorFields,
      deepLink,
      urlAfterBack,
      portfolioHeading,
      noDollarInPortfolioSummary,
    });
  }

  // 3. Legend + dollar/privacy sweep (full page, authenticated-off)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    const legendText = await page.locator('[aria-label="Orbit encoding legend"]').innerText();
    const bodyText = await page.locator("body").innerText();
    const dollarMatches = bodyText.match(/\$[0-9]{1,3}(,[0-9]{3})*\.[0-9]{2}/g) ?? [];
    const html = await page.content();
    const htmlDollarMatches = html.match(/\$[0-9]{1,3}(,[0-9]{3})*\.[0-9]{2}/g) ?? [];
    await context.close();
    log("legendAndPrivacy", { legendText, dollarMatches, htmlDollarMatches });
  }

  // 4. Mobile fallback at 390x844 and 320px: no canvas, no overflow, 44px targets, byte-identical semantics
  for (const width of [390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const canvasCount = await page.locator("canvas").count();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    const smallTargets = await page.evaluate(() => {
      const interactive = [...document.querySelectorAll("a,button")];
      return interactive
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
        })
        .map((el) => ({ tag: el.tagName, text: el.textContent?.slice(0, 30), w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }));
    });
    await page.screenshot({ path: `docs/phase10-baseline/section-7/turn-d-mobile-${width}.png`, fullPage: false });
    await context.close();
    log(`mobile-${width}`, { canvasCount, overflow, scrollWidth, clientWidth, smallTargets });
  }

  // 5. Reduced motion: no entrance, no canvas, orbit facts still present as text
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const canvasCount = await page.locator("canvas").count();
    const overlayCount = await page.locator("[class*=entranceRoot]").count();
    const orbitFactsVisible = await page.locator("[class*=orbitFacts]").first().isVisible();
    await context.close();
    log("reducedMotion", { canvasCount, overlayCount, orbitFactsVisible });
  }

  // 6. Forced no3d and forced WebGL failure
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share?no3d=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const canvasCountNo3d = await page.locator("canvas").count();
    const allHoldingsOperableNo3d = await page.locator("[data-holding]").count();
    await context.close();

    const context2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page2 = await context2.newPage();
    await page2.addInitScript(() => {
      // Force WebGL context creation failure
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (type === "webgl2" || type === "webgl") return null;
        return orig.call(this, type, ...args);
      };
    });
    const consoleErrors = [];
    page2.on("pageerror", (e) => consoleErrors.push(String(e)));
    await page2.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(2500);
    const canvasCountForcedFail = await page2.locator("canvas").count();
    const holdingsOperableForcedFail = await page2.locator("[data-holding]").count();
    await context2.close();

    log("fallbacks", { canvasCountNo3d, allHoldingsOperableNo3d, canvasCountForcedFail, holdingsOperableForcedFail, consoleErrors });
  }

  // 7. Accessibility tree: canvas aria-hidden, atmosphere/starfield aria-hidden, accessible-tree node count for canvas
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    const canvasAriaHidden = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return null;
      let el = canvas;
      while (el) {
        if (el.getAttribute && el.getAttribute("aria-hidden") === "true") return true;
        el = el.parentElement;
      }
      return false;
    });
    const starFieldAriaHidden = await page.locator("[class*=starField]").getAttribute("aria-hidden");
    const scanlinesAriaHidden = await page.locator("[class*=scanlines]").getAttribute("aria-hidden");
    const snapshot = await page.accessibility.snapshot();
    function countCanvasNodes(node, count = { n: 0 }) {
      if (!node) return count.n;
      if (node.role === "canvas" || (node.name && node.name.toLowerCase().includes("canvas"))) count.n++;
      (node.children ?? []).forEach((c) => countCanvasNodes(c, count));
      return count.n;
    }
    const canvasAccessibleNodes = countCanvasNodes(snapshot);
    await context.close();
    log("accessibilityTree", { canvasAriaHidden, starFieldAriaHidden, scanlinesAriaHidden, canvasAccessibleNodes });
  }

  // 8. Keyboard-only operability with canvas disabled
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (type === "webgl2" || type === "webgl") return null;
        return orig.call(this, type, ...args);
      };
    });
    await page.goto(`${BASE_URL}/share?no3d=1`, { waitUntil: "networkidle" });
    // Tab to the sun link then a holding link, activate via keyboard
    await page.keyboard.press("Tab");
    let found = false;
    for (let i = 0; i < 30; i++) {
      const active = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        attr: document.activeElement?.getAttribute("data-holding"),
      }));
      if (active.attr) { found = true; break; }
      await page.keyboard.press("Tab");
    }
    if (found) {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
    }
    const urlAfterKeyboardActivation = page.url();
    await context.close();
    log("keyboardOnly", { foundHoldingViaTab: found, urlAfterKeyboardActivation });
  }

  // 9. Parallax computed-style check (desktop, fine pointer, motion not reduced)
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/share?no3d=1`, { waitUntil: "networkidle" }); // no3d forces CSS path; check CSS parallax vars
    await page.mouse.move(200, 200);
    await page.waitForTimeout(100);
    const varsA = await page.evaluate(() => {
      const w = document.querySelector("main");
      return w ? { x: w.style.getPropertyValue("--orrery-pointer-x"), y: w.style.getPropertyValue("--orrery-pointer-y") } : null;
    });
    await page.mouse.move(1200, 700);
    await page.waitForTimeout(100);
    const varsB = await page.evaluate(() => {
      const w = document.querySelector("main");
      return w ? { x: w.style.getPropertyValue("--orrery-pointer-x"), y: w.style.getPropertyValue("--orrery-pointer-y") } : null;
    });
    await context.close();
    log("parallax", { varsA, varsB });
  }

  // 10. R3F chunk requested only at qualifying viewport (desktop, motion ok) - not at narrow width
  {
    const chunkNames = new Set();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.on("response", (res) => {
      if (/\.js$/.test(new URL(res.url()).pathname)) chunkNames.add(res.url());
    });
    await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    const desktopCanvasCount = await page.locator("canvas").count();
    await context.close();

    const narrowChunkNames = new Set();
    const context2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page2 = await context2.newPage();
    page2.on("response", (res) => {
      if (/\.js$/.test(new URL(res.url()).pathname)) narrowChunkNames.add(res.url());
    });
    await page2.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(1500);
    await context2.close();

    const onlyOnDesktop = [...chunkNames].filter((u) => !narrowChunkNames.has(u));
    log("r3fChunkGating", { desktopCanvasCount, desktopChunkCount: chunkNames.size, narrowChunkCount: narrowChunkNames.size, onlyOnDesktopCount: onlyOnDesktop.length });
  }

  // 11. Console/page-error sweep across states
  {
    const states = [
      { name: "desktop", opts: { viewport: { width: 1440, height: 900 } }, url: "/share" },
      { name: "no3d", opts: { viewport: { width: 1440, height: 900 } }, url: "/share?no3d=1" },
      { name: "mobile390", opts: { viewport: { width: 390, height: 844 } }, url: "/share" },
      { name: "reducedMotion", opts: { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }, url: "/share" },
    ];
    const errors = {};
    for (const state of states) {
      const context = await browser.newContext(state.opts);
      const page = await context.newPage();
      const errs = [];
      page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
      page.on("pageerror", (e) => errs.push(String(e)));
      await page.goto(`${BASE_URL}${state.url}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2500);
      errors[state.name] = errs;
      await context.close();
    }
    log("consoleErrors", errors);
  }

  await browser.close();
  writeFileSync("docs/phase10-spike-section-7/raw/turn-d-functional-check.json", JSON.stringify(results, null, 2));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
