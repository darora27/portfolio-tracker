// Claude Lead review round 3, §10. Live DOM probe for F4 / VIS-12:
//   1. each active bay renders its question exactly once
//   2. the CONTRIBUTION bar does not overlap its numeral
import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
});

const questions = {
  plot: "where is everything, and how was the week",
  manifest: "what do i own, at what weight",
  scope: "am i beating the market",
  hazard: "how much can this hurt",
  signals: "what moves together",
  comms: "what's being said",
  log: "what did i do",
};

const report = { questionCounts: {}, contribution: [] };
for (const [station, question] of Object.entries(questions)) {
  await page.goto(`${base}?focus=portfolio&camera=command&station=${station}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  report.questionCounts[station] = await page.evaluate((needle) => {
    let count = 0;
    for (const node of document.querySelectorAll("body *")) {
      if (node.children.length === 0 &&
          (node.textContent ?? "").trim().toLowerCase() === needle) count += 1;
    }
    return count;
  }, question);
}

await page.goto(`${base}?focus=portfolio&camera=command&station=manifest`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
report.contribution = await page.evaluate(() => {
  const rows = [];
  for (const cell of document.querySelectorAll("[class*='bilateralBar']")) {
    const value = cell.querySelector("b");
    const bar = cell.querySelector("i");
    if (!value) continue;
    const v = value.getBoundingClientRect();
    const b = bar ? bar.getBoundingClientRect() : null;
    const overlap = b
      ? Math.max(0, Math.min(v.right, b.right) - Math.max(v.left, b.left))
      : 0;
    rows.push({
      text: (value.textContent ?? "").trim(),
      valueRect: { left: Math.round(v.left), right: Math.round(v.right), width: Math.round(v.width) },
      barRect: b ? { left: Math.round(b.left), right: Math.round(b.right), width: Math.round(b.width) } : null,
      horizontalOverlapPx: Math.round(overlap),
    });
  }
  return rows;
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
