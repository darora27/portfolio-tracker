// Claude Lead review round 3, §10 — diagnostic for F1 / TST-03.
// Dumps the raw 9x9 neighbourhood the section verifier searches around each
// holding's data-trail-sample point, plus the model colour, so the implementer
// can see what is actually on screen rather than only the best-match deltaE.
import { chromium } from "playwright";
import sharp from "sharp";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const outDir = path.resolve("docs/phase10-baseline/section-10/claude-review-3/trail-crops");
await mkdir(outDir, { recursive: true });

const gainStops = ["#1f7a46", "#63ef98", "#a9ffcf"];
const lossStops = ["#ff9d97", "#ff665f", "#b3241d"];
const rgb = (h) => { const v = parseInt(h.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
const hex = (c) => `#${c.map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;
function ramp(stops, amount) {
  if (amount === 0.5) return stops[1];
  const scaled = Math.min(1, Math.max(0, amount)) * 63;
  const position = Math.round(scaled) / 63;
  const segment = Math.min(stops.length - 2, Math.floor(position * 2));
  const local = position * 2 - segment;
  const l = rgb(stops[segment]); const r = rgb(stops[segment + 1]);
  return hex(l.map((c, i) => c + (r[i] - c) * local));
}
const expectedFor = (w) => w === null || Math.abs(w) <= 0.002 ? "#e3b65c"
  : ramp(w > 0 ? gainStops : lossStops, (Math.min(0.12, Math.max(0.002, Math.abs(w))) - 0.002) / 0.118);

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); });
await page.goto(base, { waitUntil: "networkidle" });
await page.locator("canvas").waitFor({ state: "visible" });
await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker][data-trail-sample-x]").length === 8);
await page.waitForTimeout(1200);

const descriptors = await page.locator("[data-scene-ticker]").evaluateAll((ls) => ls.map((l) => ({
  ticker: l.dataset.sceneTicker,
  weekly: l.dataset.weeklyReturn === "null" ? null : Number(l.dataset.weeklyReturn),
  x: Number(l.dataset.trailSampleX), y: Number(l.dataset.trailSampleY),
})));
const shot = path.join(outDir, "overview.png");
await page.screenshot({ path: shot });
const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });

const report = [];
for (const d of descriptors) {
  const rows = [];
  for (let dy = -4; dy <= 4; dy += 1) {
    const row = [];
    for (let dx = -4; dx <= 4; dx += 1) {
      const sx = Math.max(0, Math.min(info.width - 1, Math.round(d.x + dx)));
      const sy = Math.max(0, Math.min(info.height - 1, Math.round(d.y + dy)));
      const o = (sy * info.width + sx) * 3;
      row.push(hex([data[o], data[o + 1], data[o + 2]]));
    }
    rows.push(row.join(" "));
  }
  const centre = (() => {
    const sx = Math.round(d.x), sy = Math.round(d.y);
    const o = (sy * info.width + sx) * 3;
    return hex([data[o], data[o + 1], data[o + 2]]);
  })();
  report.push({ ticker: d.ticker, weekly: d.weekly, samplePoint: { x: d.x, y: d.y }, expected: expectedFor(d.weekly), centrePixel: centre, neighbourhood: rows });
  await sharp(shot)
    .extract({
      left: Math.max(0, Math.round(d.x) - 60), top: Math.max(0, Math.round(d.y) - 60),
      width: 120, height: 120,
    })
    .resize(360, 360, { kernel: "nearest" })
    .png()
    .toFile(path.join(outDir, `${d.ticker.toLowerCase()}-trail-sample.png`));
}
console.log(JSON.stringify(report, null, 1));
await browser.close();
