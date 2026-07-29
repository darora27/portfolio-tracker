import { chromium } from "playwright";
import { emit } from "../../lib/emit.mjs";

const CRITERION = "scene-diagnostic";
const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";

// This script is deliberately passive: its job is to report what state the
// scene is in, including a broken one, so it does not gate on a readiness
// signal the way the other scripts do. It uses domcontentloaded (not
// networkidle, which never settles on this route — see AGENTS.md's Live
// Verification section) plus a fixed settle window, then reports whatever
// it observes.
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const messages = [];
  page.on("pageerror", (error) => {
    messages.push({ type: "pageerror", message: error.message, stack: error.stack });
  });
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      messages.push({ type: message.type(), message: message.text() });
    }
  });
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "stock-market-universe-orientation-seen",
      "true",
    );
  });
  const response = await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2_000);
  const scene = await page.evaluate(() => {
    const mount = document.querySelector("[class*='sceneMount']");
    return {
      status: document.readyState,
      canvasCount: document.querySelectorAll("canvas").length,
      sceneLabelCount: document.querySelectorAll("[data-scene-ticker]").length,
      sceneTickers: [
        ...document.querySelectorAll("[data-scene-ticker]"),
      ].map((label) => label.dataset.sceneTicker),
      mountAttributes: mount
        ? Object.fromEntries(
            [...mount.attributes]
              .filter(({ name }) => name.startsWith("data-"))
              .map(({ name, value }) => [name, value]),
          )
        : null,
    };
  });
  const measured = {
    httpStatus: response?.status() ?? null,
    scene,
    messages,
  };
  console.log(JSON.stringify(measured));
  const pass = measured.httpStatus === 200 && messages.length === 0 && scene.sceneLabelCount === 8;
  emit(CRITERION, pass, measured);
} catch (error) {
  emit(CRITERION, false, null, error.message);
} finally {
  if (browser) await browser.close();
}
