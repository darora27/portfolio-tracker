import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const messages = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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
const response = await page.goto(base, { waitUntil: "networkidle" });
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
console.log(
  JSON.stringify({
    httpStatus: response?.status() ?? null,
    scene,
    messages,
  }),
);
await browser.close();
