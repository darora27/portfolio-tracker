import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("docs/phase10-baseline/section-9");
const desktop = path.join(root, "after");
const mobile = path.join(root, "mobile");
await mkdir(desktop, { recursive: true });
await mkdir(mobile, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";

const surfaces = [
  ["overview", ""],
  ["approach-planet-detail", "?holding=ASML&camera=approach"],
  ["mission-plot", "?focus=portfolio&camera=command&station=plot"],
  ["mission-manifest", "?focus=portfolio&camera=command&station=manifest"],
  ["mission-scope", "?focus=portfolio&camera=command&station=scope"],
  ["mission-hazard", "?focus=portfolio&camera=command&station=hazard"],
  ["mission-signals", "?focus=portfolio&camera=command&station=signals"],
  ["mission-comms", "?focus=portfolio&camera=command&station=comms"],
  ["mission-log", "?focus=portfolio&camera=command&station=log"],
  ["sector-map", "?camera=sector"],
];

for (const [name, query] of surfaces) {
  await page.goto(`${base}${query}`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(desktop, `${name}-1440x900.png`),
    fullPage: false,
  });
}

await page.goto(base, { waitUntil: "networkidle" });
await page.locator("[data-portfolio-sun]").focus();
await page.screenshot({
  path: path.join(desktop, "sun-docking-focus-1440x900.png"),
});
const moon = page.locator("[data-moon]").first();
if (await moon.count()) {
  await moon.focus();
  await page.screenshot({
    path: path.join(desktop, "moon-focus-1440x900.png"),
  });
}
await page.getByRole("link", { name: /SATELLITE \/ HAZARD/ }).focus();
await page.screenshot({
  path: path.join(desktop, "satellite-focus-1440x900.png"),
});

for (const width of [390, 320]) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  const audit = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll("canvas").length,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    minimumTarget: Math.min(
      ...[...document.querySelectorAll("a,button")].map((target) => {
        const rect = target.getBoundingClientRect();
        return Math.min(rect.width, rect.height);
      }),
    ),
  }));
  console.log(JSON.stringify({ viewport: `${width}x844`, ...audit }));
  await page.screenshot({
    path: path.join(mobile, `fallback-${width}x844.png`),
    fullPage: true,
  });
}

await browser.close();
