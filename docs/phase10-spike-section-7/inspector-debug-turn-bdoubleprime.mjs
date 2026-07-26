import { chromium } from "playwright";
import crypto from "node:crypto";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addCookies([{ name: "owner_session", value: sessionToken(OWNER_PASSWORD), domain: "localhost", path: "/" }]);
const page = await context.newPage();
await page.goto("http://localhost:3100/dev/phase10-portfolio-orrery?holding=ASML", { waitUntil: "networkidle" });
const text = await page.evaluate(() => document.body.textContent);
console.log(text.includes("ASML Holding"), text.includes("Portfolio weight") || text.includes("PORTFOLIO WEIGHT") || text.includes("weight"));
console.log(text.slice(text.indexOf("ASML")-5, text.indexOf("ASML")+300));
await context.close();
await browser.close();
