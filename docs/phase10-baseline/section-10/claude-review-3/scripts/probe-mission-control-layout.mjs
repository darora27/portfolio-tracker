// Claude Lead review round 3, §10 — live layout measurement for VIS-08 (one
// dominant bay, no two bays the same size, unequal gutters, 64/15/11 type
// scale) and BHV-10 (word budget).
import { chromium } from "playwright";
const base = process.env.PHASE10_BASE_URL;
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); });
await page.goto(`${base}?focus=portfolio&camera=command&station=plot`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const report = await page.evaluate(() => {
  const overlay = document.querySelector("[role='dialog']");
  const overlayRect = overlay ? overlay.getBoundingClientRect() : null;
  const bays = [];
  for (const node of document.querySelectorAll("section, footer > a, [class*='railStations'] > a")) {
    const r = node.getBoundingClientRect();
    if (r.width < 40 || r.height < 20) continue;
    const label = (node.querySelector("b, h2, h3, strong, span")?.textContent ?? "").trim().slice(0, 30);
    bays.push({ label, cls: String(node.className).split("__").pop(), w: Math.round(r.width), h: Math.round(r.height), area: Math.round(r.width * r.height) });
  }
  const dayReadout = document.querySelector("[class*='dayReadout'], [class*='readout']");
  const sizes = new Set();
  const textNodes = [];
  for (const node of document.querySelectorAll("[role='dialog'] *")) {
    if (node.children.length) continue;
    const text = (node.textContent ?? "").trim();
    if (!text) continue;
    const fs = Number.parseFloat(getComputedStyle(node).fontSize);
    sizes.add(Math.round(fs * 10) / 10);
    textNodes.push({ text: text.slice(0, 80), fontSize: Math.round(fs * 10) / 10, words: text.split(/\s+/).length });
  }
  return {
    overlay: overlayRect ? { w: Math.round(overlayRect.width), h: Math.round(overlayRect.height) } : null,
    dayReadout: dayReadout ? { text: dayReadout.textContent?.trim().slice(0, 20), fontSize: Number.parseFloat(getComputedStyle(dayReadout).fontSize) } : null,
    bays: bays.sort((a, b) => b.area - a.area).slice(0, 14),
    fontSizes: [...sizes].sort((a, b) => b - a),
    longestTexts: textNodes.sort((a, b) => b.words - a.words).slice(0, 8),
  };
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
