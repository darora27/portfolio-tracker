import { chromium } from "playwright";
import { emit } from "../../lib/emit.mjs";

const CRITERION = "keyboard-interaction-audit";
const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";

function recordMessages(page, scope, messages) {
  page.on("pageerror", (error) => {
    messages.push({ scope, type: "pageerror", message: error.message });
  });
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      messages.push({ scope, type: message.type(), message: message.text() });
    }
  });
}

async function suppressFirstVisit(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "stock-market-universe-orientation-seen",
      "true",
    );
  });
}

// Readiness contract (pinned in docs/phase10-workflow/specs/section-11.md
// §11): ready once the canvas is visible — interaction targets (planets,
// moons, satellites) are attached synchronously with the canvas mount, so
// no scene-ticker wait is required here, only a short settle window for
// the first animation frame.
async function resetOverview(page, base) {
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(250);
}

async function waitForFallbackReady(page) {
  await page.locator('nav[aria-label="Portfolio bodies"]').waitFor({ state: "visible" });
}

let browser;
try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const messages = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  recordMessages(page, "motion-allowed", messages);
  await suppressFirstVisit(page);
  await resetOverview(page, base);

  const expectedTabOrder = await page.evaluate(() => {
    const planets = [...document.querySelectorAll("[data-holding]")].map(
      (element) => `planet:${element.dataset.holding}`,
    );
    const moons = [...document.querySelectorAll("[data-moon]")].map(
      (element) => `moon:${element.dataset.moon}`,
    );
    return [
      "sun",
      ...planets,
      ...moons,
      "satellite:DRIFT",
      "satellite:HAZARD",
      "satellite:SUPPLY",
      "sector",
      "belt",
      "chrome:systems-manual",
    ];
  });

  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  const tabWalk = [];
  for (let index = 0; index < expectedTabOrder.length; index += 1) {
    await page.keyboard.press("Tab");
    tabWalk.push(
      await page.evaluate(() => {
        const element = document.activeElement;
        if (!(element instanceof HTMLElement)) {
          return { id: "none", focusVisible: false, outline: "none", target: null };
        }
        const text = element.textContent?.replace(/\s+/g, " ").trim() ?? "";
        let id = "unknown";
        if ("portfolioSun" in element.dataset) id = "sun";
        else if (element.dataset.holding) id = `planet:${element.dataset.holding}`;
        else if (element.dataset.moon) id = `moon:${element.dataset.moon}`;
        else if (text.startsWith("SATELLITE / ")) {
          id = `satellite:${text.split(/\s|·/)[2]}`;
        } else if (element.dataset.sectorSystem) id = "sector";
        else if (text.startsWith("ASTEROID BELT")) id = "belt";
        else if (element.getAttribute("aria-label") === "Open systems manual") {
          id = "chrome:systems-manual";
        }
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          id,
          focusVisible: element.matches(":focus-visible"),
          outline: `${style.outlineWidth} ${style.outlineStyle}`,
          target: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        };
      }),
    );
  }

  const actualTabOrder = tabWalk.map(({ id }) => id);
  if (JSON.stringify(actualTabOrder) !== JSON.stringify(expectedTabOrder)) {
    throw new Error(
      `Unexpected tab order.\nExpected ${JSON.stringify(expectedTabOrder)}\nActual ${JSON.stringify(actualTabOrder)}`,
    );
  }
  if (
    tabWalk.some(
      ({ focusVisible, outline, target }) =>
        !focusVisible ||
        outline.startsWith("0px") ||
        !target ||
        target.width < 44 ||
        target.height < 44,
    )
  ) {
    throw new Error(`Focus visibility or target-size failure: ${JSON.stringify(tabWalk)}`);
  }

  await resetOverview(page, base);
  await page.locator("[data-moon]").first().focus();
  await page.keyboard.press("Enter");
  await page.waitForURL((url) =>
    url.searchParams.has("holding") &&
    url.searchParams.get("detail") === "transmissions"
  );
  const moonDestination = page.url();

  await resetOverview(page, base);
  await page.getByRole("link", { name: /^SATELLITE \/ HAZARD/ }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL((url) => url.searchParams.get("station") === "hazard");
  const satelliteDestination = page.url();

  await resetOverview(page, base);
  await page.locator("[data-sector-system]").focus();
  await page.keyboard.press("Enter");
  await page.waitForURL((url) => url.searchParams.get("camera") === "sector");
  const sectorDestination = page.url();
  await page.goBack();
  await page.waitForURL((url) => !url.searchParams.has("camera"));
  const backDestination = page.url();
  await page.goForward();
  await page.waitForURL((url) => url.searchParams.get("camera") === "sector");
  const forwardDestination = page.url();
  if (
    new URL(backDestination).searchParams.has("camera") ||
    new URL(forwardDestination).searchParams.get("camera") !== "sector"
  ) {
    throw new Error(
      `Sector browser back/forward restoration failed: ${JSON.stringify({
        sectorDestination,
        backDestination,
        forwardDestination,
      })}`,
    );
  }

  await resetOverview(page, base);
  await page.getByRole("button", { name: /^ASTEROID BELT/ }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("heading", { name: "Asteroid belt" }).waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("heading", { name: "Asteroid belt" }).waitFor({
    state: "detached",
  });
  const beltEscape = page.url();

  await resetOverview(page, base);
  await page.locator("[data-portfolio-sun]").focus();
  await page.keyboard.press("Enter");
  await page.getByRole("dialog", { name: "Mission Control" }).waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog", { name: "Mission Control" }).waitFor({
    state: "detached",
  });
  await page.waitForFunction(() =>
    document.activeElement?.hasAttribute("data-portfolio-sun"),
  );
  const missionEscape = {
    url: page.url(),
    focusReturnedToSun: await page.locator("[data-portfolio-sun]").evaluate(
      (element) => document.activeElement === element,
    ),
  };

  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  recordMessages(reducedPage, "reduced-motion", messages);
  await suppressFirstVisit(reducedPage);
  const reducedResponse = await reducedPage.goto(base, { waitUntil: "domcontentloaded" });
  await waitForFallbackReady(reducedPage);
  const reducedMotion = await reducedPage.evaluate(() => {
    const semantic = document.querySelector(
      'nav[aria-label="Portfolio bodies"]',
    );
    const text = semantic?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const runningAnimations = [...document.querySelectorAll("main *")]
      .map((element) => {
        const style = getComputedStyle(element);
        return {
          selector:
            element.getAttribute("aria-label") ||
            element.getAttribute("class") ||
            element.tagName,
          animationName: style.animationName,
          animationDuration: style.animationDuration,
        };
      })
      .filter(
        ({ animationName, animationDuration }) =>
          animationName !== "none" && animationDuration !== "0s",
      );
    return {
      prefersReducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      canvasCount: document.querySelectorAll("canvas").length,
      semanticMapVisible:
        semantic instanceof HTMLElement &&
        semantic.getBoundingClientRect().width > 44 &&
        semantic.getBoundingClientRect().height > 44,
      preservesMoonEncoding: text.includes("MOON /"),
      preservesSatelliteEncoding: text.includes("SATELLITE /"),
      preservesNebulaEncoding: text.includes("NEBULA "),
      preservesCometEncoding:
        text.includes("COMET ") || text.includes("NO TRADE COMET TODAY"),
      runningAnimations,
    };
  });
  await reducedContext.close();

  if (
    reducedResponse?.status() !== 200 ||
    !reducedMotion.prefersReducedMotion ||
    reducedMotion.canvasCount !== 0 ||
    !reducedMotion.semanticMapVisible ||
    !reducedMotion.preservesMoonEncoding ||
    !reducedMotion.preservesSatelliteEncoding ||
    !reducedMotion.preservesNebulaEncoding ||
    !reducedMotion.preservesCometEncoding ||
    reducedMotion.runningAnimations.length > 0
  ) {
    throw new Error(`Reduced-motion audit failed: ${JSON.stringify(reducedMotion)}`);
  }
  if (messages.length > 0) {
    throw new Error(`Browser console was not clean: ${JSON.stringify(messages)}`);
  }

  console.log(JSON.stringify({ expectedTabOrder, tabWalk }));
  const destinations = {
    enterDestinations: {
      moon: moonDestination,
      satellite: satelliteDestination,
      sector: sectorDestination,
    },
    history: {
      back: backDestination,
      forward: forwardDestination,
    },
    escape: {
      belt: beltEscape,
      missionControl: missionEscape,
    },
  };
  console.log(JSON.stringify(destinations));
  console.log(JSON.stringify({ reducedMotion, messages }));

  const measured = { expectedTabOrder, tabWalk, ...destinations, reducedMotion, messages };
  emit(CRITERION, true, measured);
} catch (error) {
  emit(CRITERION, false, null, error.message);
} finally {
  if (browser) await browser.close();
}
