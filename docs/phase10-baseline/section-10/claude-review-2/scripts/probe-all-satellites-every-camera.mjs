// Claude Lead review round 2, §10.
// BHV-02 requires belt bodies, moons, satellites and the sun to be activatable
// by pointer AND keyboard from every camera state. DEF-09 requires every moon
// and satellite to have a working destination reachable by pointer.
//
// The scene exports only HAZARD's projected position, and all three satellites
// share one orbit radius (scene-model.ts `satelliteOrbit`) at different phases,
// so this probe learns the projected orbit ellipse from HAZARD over time and
// then sweeps pointer positions along it, repeatedly, recording every acquired
// target. A satellite that can be acquired is then clicked to confirm its
// destination.
import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const CAMERA_STATES = [
  { id: "overview", url: "" },
  { id: "command", url: "?focus=portfolio&camera=command&station=hazard" },
  { id: "approach", url: "?holding=ASML&camera=approach" },
  { id: "sector", url: "?camera=sector" },
];

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
});

const report = [];

for (const state of CAMERA_STATES) {
  await page.goto(`${base}${state.url}`, { waitUntil: "networkidle" });
  const canvas = page.locator("canvas");
  const canvasCount = await canvas.count();
  if (canvasCount === 0) {
    report.push({ camera: state.id, canvas: false, note: "no canvas in this state" });
    continue;
  }
  await canvas.first().waitFor({ state: "visible" });
  await page.waitForTimeout(2_000);
  const mount = page.locator("[class*='sceneMount']");
  const box = await canvas.first().boundingBox();

  // 1. Learn the projected satellite orbit from HAZARD.
  const samples = [];
  for (let i = 0; i < 40; i += 1) {
    samples.push(
      await mount.evaluate((e) => ({
        sx: Number(e.dataset.evidenceSunX),
        sy: Number(e.dataset.evidenceSunY),
        hx: Number(e.dataset.evidenceSatelliteX),
        hy: Number(e.dataset.evidenceSatelliteY),
      })),
    );
    await page.waitForTimeout(120);
  }
  const usable = samples.filter(
    (s) => Number.isFinite(s.hx) && Number.isFinite(s.sx),
  );
  if (usable.length === 0) {
    report.push({ camera: state.id, canvas: true, note: "no satellite evidence exported" });
    continue;
  }
  const sunX = usable[usable.length - 1].sx;
  const sunY = usable[usable.length - 1].sy;
  const semiMajor = Math.max(...usable.map((s) => Math.abs(s.hx - sunX)));
  const semiMinor = Math.max(...usable.map((s) => Math.abs(s.hy - sunY)));

  // 2. Sweep the ellipse repeatedly and record every acquired target.
  const hits = {};
  const satellitePoints = {};
  for (let pass = 0; pass < 4; pass += 1) {
    for (let deg = 0; deg < 360; deg += 3) {
      const rad = (deg * Math.PI) / 180;
      const x = sunX + Math.cos(rad) * semiMajor;
      const y = sunY + Math.sin(rad) * Math.max(semiMinor, 4);
      if (x < 2 || y < 2 || x > box.width - 2 || y > box.height - 2) continue;
      await page.mouse.move(box.x + x, box.y + y);
      const got = await mount.evaluate((e) => e.dataset.orreryTarget ?? "(none)");
      hits[got] = (hits[got] || 0) + 1;
      if (got.startsWith("satellite:") && !satellitePoints[got]) {
        satellitePoints[got] = { x, y };
      }
    }
  }

  // 3. Click each acquired satellite and record the destination.
  const destinations = {};
  for (const [target, point] of Object.entries(satellitePoints)) {
    await page.goto(`${base}${state.url}`, { waitUntil: "networkidle" });
    await canvas.first().waitFor({ state: "visible" });
    await page.waitForTimeout(1_500);
    // Re-acquire before clicking: the satellite has moved since the sweep.
    let acquired = false;
    for (let i = 0; i < 400 && !acquired; i += 1) {
      const deg = (i * 3) % 360;
      const rad = (deg * Math.PI) / 180;
      const x = sunX + Math.cos(rad) * semiMajor;
      const y = sunY + Math.sin(rad) * Math.max(semiMinor, 4);
      if (x < 2 || y < 2 || x > box.width - 2 || y > box.height - 2) continue;
      await page.mouse.move(box.x + x, box.y + y);
      const got = await mount.evaluate((e) => e.dataset.orreryTarget ?? "");
      if (got === target) {
        await page.mouse.click(box.x + x, box.y + y);
        acquired = true;
      }
    }
    await page.waitForTimeout(800);
    destinations[target] = acquired ? page.url() : "NOT RE-ACQUIRED";
  }

  report.push({
    camera: state.id,
    canvas: true,
    sun: { x: Number(sunX.toFixed(1)), y: Number(sunY.toFixed(1)) },
    orbitPx: {
      semiMajor: Number(semiMajor.toFixed(1)),
      semiMinor: Number(semiMinor.toFixed(1)),
    },
    distinctTargets: Object.keys(hits).sort(),
    satellitesAcquired: Object.keys(satellitePoints).sort(),
    hitCounts: hits,
    destinations,
  });
}

console.log(JSON.stringify({ base, report }, null, 1));
await browser.close();
