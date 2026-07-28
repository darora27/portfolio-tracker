// Claude Lead review round 3, §10 — locate every rendered instance of each
// bay question text, regardless of class, for the active station.
import { chromium } from "playwright";
const base = process.env.PHASE10_BASE_URL;
const questions = {
  plot: "where is everything, and how was the week",
  manifest: "what do i own, at what weight",
  scope: "am i beating the market",
  hazard: "how much can this hurt",
  signals: "what moves together",
  comms: "what’s being said",
  log: "what did i do",
};
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => { window.localStorage.setItem("stock-market-universe-orientation-seen", "true"); });
const out = {};
for (const [station, question] of Object.entries(questions)) {
  await page.goto(`${base}?focus=portfolio&camera=command&station=${station}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  out[station] = await page.evaluate((needle) => {
    const rows = [];
    for (const node of document.querySelectorAll("body *")) {
      if (node.children.length) continue;
      if ((node.textContent ?? "").trim().toLowerCase() !== needle) continue;
      const r = node.getBoundingClientRect();
      const path = [];
      let p = node;
      while (p && p !== document.body) {
        path.unshift(`${p.tagName.toLowerCase()}${p.className ? "." + String(p.className).split(" ").join(".") : ""}`);
        p = p.parentElement;
      }
      rows.push({ tag: node.tagName, cls: String(node.className), x: Math.round(r.left), y: Math.round(r.top), path: path.slice(-3).join(" > ") });
    }
    return { count: rows.length, rows };
  }, question);
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
