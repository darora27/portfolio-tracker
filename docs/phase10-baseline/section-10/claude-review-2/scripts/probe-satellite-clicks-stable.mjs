// Claude Lead review round 2, §10 — DEF-09 destination half.
// probe-satellite-clicks.mjs showed all three satellites acquire by pointer,
// but two of three clicks landed on the portfolio (`?focus=portfolio&camera=
// command` with no `station`) instead of the satellite's own station. This
// re-runs the click with the pointer held still until the same satellite target
// has been reported on three consecutive reads, so a boundary-of-pick-radius
// race in the probe can be told apart from a real routing defect. Several
// samples per satellite are collected.
import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const EXPECTED_STATION = {
  "satellite:DRIFT": "scope",
  "satellite:HAZARD": "hazard",
  "satellite:SUPPLY": "comms",
};

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
});

const results = [];

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
  return {
    mount,
    box,
    sunX: last.sx,
    sunY: last.sy,
    semiMajor: Math.max(...geometry.map((g) => Math.abs(g.hx - last.sx))),
    semiMinor: Math.max(...geometry.map((g) => Math.abs(g.hy - last.sy))),
  };
}

for (let sample = 0; sample < 9; sample += 1) {
  const { mount, box, sunX, sunY, semiMajor, semiMinor } = await settle();
  let done = false;
  for (let pass = 0; pass < 14 && !done; pass += 1) {
    for (let deg = 0; deg < 360 && !done; deg += 2) {
      const rad = (deg * Math.PI) / 180;
      const x = sunX + Math.cos(rad) * semiMajor;
      const y = sunY + Math.sin(rad) * Math.max(semiMinor, 3);
      if (x < 2 || y < 2 || x > box.width - 2 || y > box.height - 2) continue;
      await page.mouse.move(box.x + x, box.y + y);
      const first = await mount.evaluate((e) => e.dataset.orreryTarget ?? "");
      if (!first.startsWith("satellite:")) continue;
      // Hold still and confirm the target is stable, not a boundary flicker.
      const confirms = [first];
      for (let i = 0; i < 2; i += 1) {
        await page.waitForTimeout(20);
        confirms.push(await mount.evaluate((e) => e.dataset.orreryTarget ?? ""));
      }
      const stable = confirms.every((c) => c === first);
      const targetAtClick = await mount.evaluate(
        (e) => e.dataset.orreryTarget ?? "",
      );
      await page.mouse.down();
      await page.mouse.up();
      await page.waitForTimeout(900);
      const url = page.url();
      const station = new URL(url).searchParams.get("station");
      results.push({
        satellite: first,
        stableHover: stable,
        confirms,
        targetImmediatelyBeforeClick: targetAtClick,
        url,
        station,
        expectedStation: EXPECTED_STATION[first],
        stationCorrect: station === EXPECTED_STATION[first],
      });
      done = true;
    }
  }
  if (!done) break;
}

const bySatellite = {};
for (const r of results) {
  bySatellite[r.satellite] ??= { attempts: 0, stationCorrect: 0, stableHover: 0 };
  bySatellite[r.satellite].attempts += 1;
  if (r.stationCorrect) bySatellite[r.satellite].stationCorrect += 1;
  if (r.stableHover) bySatellite[r.satellite].stableHover += 1;
}

console.log(JSON.stringify({ base, bySatellite, results }, null, 1));
await browser.close();
