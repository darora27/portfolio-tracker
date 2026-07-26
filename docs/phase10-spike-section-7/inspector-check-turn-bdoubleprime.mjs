import { chromium } from "playwright";
import crypto from "node:crypto";

const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
const BASE_URL = "http://localhost:3100";
function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addCookies([{ name: "owner_session", value: sessionToken(OWNER_PASSWORD), domain: "localhost", path: "/" }]);
const page = await context.newPage();

await page.goto(BASE_URL + "/dev/phase10-portfolio-orrery?holding=ASML", { waitUntil: "networkidle" });
const html1 = await page.content();
console.log("holding=ASML dollar matches:", (html1.match(/\$[0-9,]+\.[0-9]{2}/g) || []).length);
console.log("inspector visible:", await page.evaluate(() => document.body.textContent.includes("HOLDING TELEMETRY")));

await page.goto(BASE_URL + "/dev/phase10-portfolio-orrery?focus=portfolio", { waitUntil: "networkidle" });
const html2 = await page.content();
console.log("focus=portfolio dollar matches:", (html2.match(/\$[0-9,]+\.[0-9]{2}/g) || []).length);

await page.goBack({ waitUntil: "networkidle" });
console.log("after goBack, url=", page.url());
await page.goForward({ waitUntil: "networkidle" });
console.log("after goForward, url=", page.url());

await context.close();
await browser.close();
