import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("docs/phase10-baseline/section-10");
const desktop = path.join(root, "after");
const mobile = path.join(root, "mobile");
await mkdir(desktop, { recursive: true });
await mkdir(mobile, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.localStorage.setItem(
    "stock-market-universe-orientation-seen",
    "true",
  );
});
const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";

const surfaces = [
  ["overview", ""],
  ["approach-asml", "?holding=ASML&camera=approach"],
  ["planet-detail", "?holding=ASML&camera=approach"],
  ["mission-control-plot", "?focus=portfolio&camera=command&station=plot"],
  ["mission-control-manifest", "?focus=portfolio&camera=command&station=manifest"],
  ["mission-control-scope", "?focus=portfolio&camera=command&station=scope"],
  ["mission-control-hazard", "?focus=portfolio&camera=command&station=hazard"],
  ["mission-control-signals", "?focus=portfolio&camera=command&station=signals"],
  ["mission-control-comms", "?focus=portfolio&camera=command&station=comms"],
  ["mission-control-log", "?focus=portfolio&camera=command&station=log"],
  ["sector-map", "?camera=sector"],
];

for (const [name, query] of surfaces) {
  await page.goto(`${base}${query}`, { waitUntil: "networkidle" });
  if (!query || query.includes("holding=")) {
    await page.locator("canvas").waitFor({ state: "visible" });
    await page.waitForTimeout(1_200);
  }
  await page.screenshot({
    path: path.join(desktop, `${name}-1440x900.png`),
    fullPage: false,
  });
}

await page.goto(base, { waitUntil: "networkidle" });
await page.locator("canvas").waitFor({ state: "visible" });
await page.waitForTimeout(1_200);
const canvas = page.locator("canvas");
const canvasBox = await canvas.boundingBox();
if (!canvasBox) throw new Error("Canvas has no live bounding box.");
const sunPoint = await page.locator("[data-evidence-sun-x]").evaluate(
  (element) => ({
    x: Number(element.dataset.evidenceSunX),
    y: Number(element.dataset.evidenceSunY),
  }),
);
await page.mouse.move(
  canvasBox.x + sunPoint.x,
  canvasBox.y + sunPoint.y,
);
await page.waitForFunction(() =>
  document.querySelector("[data-docking='true']"),
);
await page.screenshot({
  path: path.join(desktop, "sun-docking-state-1440x900.png"),
});
const sceneMount = page.locator("[data-evidence-moon-x]");
if (await sceneMount.count()) {
  let moonHovered = false;
  for (let attempt = 0; attempt < 40 && !moonHovered; attempt += 1) {
    const moonPoint = await sceneMount.evaluate((element) => ({
      x: Number(element.dataset.evidenceMoonX),
      y: Number(element.dataset.evidenceMoonY),
      target: element.dataset.evidenceMoonTarget,
    }));
    await page.mouse.move(
      canvasBox.x + moonPoint.x,
      canvasBox.y + moonPoint.y,
    );
    moonHovered = await sceneMount.evaluate(
      (element, target) => element.dataset.orreryTarget === target,
      moonPoint.target,
    );
  }
  if (!moonHovered) console.log("MOON_ACQUIRE_FAILED");
  await page.screenshot({
    path: path.join(desktop, "moon-hover-1440x900.png"),
  });
}
let satelliteHovered = false;
for (let attempt = 0; attempt < 40 && !satelliteHovered; attempt += 1) {
  const satellitePoint = await sceneMount.evaluate((element) => ({
    x: Number(element.dataset.evidenceSatelliteX),
    y: Number(element.dataset.evidenceSatelliteY),
    target: element.dataset.evidenceSatelliteTarget,
  }));
  await page.mouse.move(
    canvasBox.x + satellitePoint.x,
    canvasBox.y + satellitePoint.y,
  );
  satelliteHovered = await sceneMount.evaluate(
    (element, target) => element.dataset.orreryTarget === target,
    satellitePoint.target,
  );
}
if (!satelliteHovered) { console.log("SATELLITE_ACQUIRE_FAILED (recorded, continuing)"); }
await page.screenshot({
  path: path.join(desktop, "satellite-hover-1440x900.png"),
});

await page.goto(`${base}?focus=portfolio&camera=command&station=plot`, {
  waitUntil: "networkidle",
});
await page.locator('[data-manifest-ticker]').first().click();
await page.locator('[data-expanded="true"] svg[aria-label$="indexed sparkline"]').waitFor();
await page.screenshot({
  path: path.join(desktop, "radar-detail-card-1440x900.png"),
});

const reducedPage = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
await reducedPage.addInitScript(() => {
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
});
await reducedPage.goto(
  `${base}?focus=portfolio&camera=command&station=plot`,
  { waitUntil: "networkidle" },
);
await reducedPage.screenshot({
  path: path.join(desktop, "reduced-motion-1440x900.png"),
});
await reducedPage.close();

for (const width of [390, 320]) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  const audit = await page.evaluate(() => {
    const targets = [...document.querySelectorAll("a,button")]
      .filter((target) => target.tabIndex >= 0)
      .map((target) => target.getBoundingClientRect())
      .filter((rect) => rect.width > 1 && rect.height > 1);
    return {
      canvasCount: document.querySelectorAll("canvas").length,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      targetCount: targets.length,
      minimumTarget: Math.min(
        ...targets.map((rect) => Math.min(rect.width, rect.height)),
      ),
    };
  });
  console.log(JSON.stringify({ viewport: `${width}x844`, ...audit }));
  await page.screenshot({
    path: path.join(mobile, `share-${width}x844.png`),
    fullPage: false,
  });
}

await browser.close();
