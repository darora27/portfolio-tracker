// Claude Lead review round 2, §10 — BHV-02 / DEF-09 pointer half.
// All three satellites share one orbit (scene-model.ts `satelliteOrbit`) with
// different phases and angular speeds, so a pointer swept repeatedly around the
// projected orbit ellipse crosses each of them. On the first sighting of a
// satellite this clicks WITHOUT moving the pointer and records the destination,
// then reloads and keeps sweeping for the remaining satellites.
import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const WANTED = ["satellite:DRIFT", "satellite:HAZARD", "satellite:SUPPLY"];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
});

const seen = new Set();
const destinations = {};
const sightings = {};

async function settle() {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("canvas").first().waitFor({ state: "visible" });
  await page.waitForTimeout(1_800);
  const mount = page.locator("[class*='sceneMount']");
  const box = await page.locator("canvas").first().boundingBox();
  const geometry = [];
  for (let i = 0; i < 24; i += 1) {
    geometry.push(
      await mount.evaluate((e) => ({
        sx: Number(e.dataset.evidenceSunX),
        sy: Number(e.dataset.evidenceSunY),
        hx: Number(e.dataset.evidenceSatelliteX),
        hy: Number(e.dataset.evidenceSatelliteY),
      })),
    );
    await page.waitForTimeout(90);
  }
  const last = geometry[geometry.length - 1];
  const semiMajor = Math.max(...geometry.map((g) => Math.abs(g.hx - last.sx)));
  const semiMinor = Math.max(...geometry.map((g) => Math.abs(g.hy - last.sy)));
  return { mount, box, sunX: last.sx, sunY: last.sy, semiMajor, semiMinor };
}

for (let attempt = 0; attempt < 4 && seen.size < WANTED.length; attempt += 1) {
  const { mount, box, sunX, sunY, semiMajor, semiMinor } = await settle();
  let clicked = false;
  for (let pass = 0; pass < 14 && !clicked; pass += 1) {
    for (let deg = 0; deg < 360 && !clicked; deg += 2) {
      const rad = (deg * Math.PI) / 180;
      const x = sunX + Math.cos(rad) * semiMajor;
      const y = sunY + Math.sin(rad) * Math.max(semiMinor, 3);
      if (x < 2 || y < 2 || x > box.width - 2 || y > box.height - 2) continue;
      await page.mouse.move(box.x + x, box.y + y);
      const got = await mount.evaluate((e) => e.dataset.orreryTarget ?? "");
      if (!got.startsWith("satellite:")) continue;
      sightings[got] = (sightings[got] || 0) + 1;
      if (seen.has(got)) continue;
      // Click without moving the pointer.
      await page.mouse.down();
      await page.mouse.up();
      await page.waitForTimeout(900);
      destinations[got] = page.url();
      seen.add(got);
      clicked = true;
    }
  }
  if (!clicked) break;
}

console.log(
  JSON.stringify(
    {
      base,
      camera: "overview",
      satellitesAcquiredByPointer: [...seen].sort(),
      missing: WANTED.filter((w) => !seen.has(w)),
      sightings,
      destinations,
    },
    null,
    1,
  ),
);
await browser.close();
