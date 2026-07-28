// Claude Lead review round 2, §10 — DEF-09, HAZARD specifically.
// HAZARD is the one satellite whose projected position the scene exports, so it
// can be aimed at exactly rather than swept for. Five independent sessions.
import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const browser = await chromium.launch({ headless: true });
const results = [];

for (let session = 0; session < 5; session += 1) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "stock-market-universe-orientation-seen",
      "true",
    );
  });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("canvas").first().waitFor({ state: "visible" });
  await page.waitForTimeout(1_800);
  const mount = page.locator("[class*='sceneMount']");
  const box = await page.locator("canvas").first().boundingBox();

  let acquired = false;
  let url = null;
  for (let i = 0; i < 80 && !acquired; i += 1) {
    const p = await mount.evaluate((e) => ({
      x: Number(e.dataset.evidenceSatelliteX),
      y: Number(e.dataset.evidenceSatelliteY),
      t: e.dataset.evidenceSatelliteTarget,
    }));
    await page.mouse.move(box.x + p.x, box.y + p.y);
    const got = await mount.evaluate((e) => e.dataset.orreryTarget ?? "");
    if (got === p.t) {
      await page.mouse.down();
      await page.mouse.up();
      await page.waitForTimeout(900);
      url = page.url();
      acquired = true;
    }
  }
  results.push({
    session,
    acquired,
    url,
    station: url ? new URL(url).searchParams.get("station") : null,
    stationCorrect: url ? new URL(url).searchParams.get("station") === "hazard" : false,
  });
  await page.close();
}

console.log(
  JSON.stringify(
    {
      base,
      satellite: "HAZARD",
      acquiredSessions: results.filter((r) => r.acquired).length,
      correctStationSessions: results.filter((r) => r.stationCorrect).length,
      results,
    },
    null,
    1,
  ),
);
await browser.close();
