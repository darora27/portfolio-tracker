import { chromium } from "playwright";
import crypto from "node:crypto";

const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
const BASE_URL = "http://localhost:3100";
function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const routes = [
  ["/dev/phase10-portfolio-orrery", {width:1440,height:900}],
  ["/dev/phase10-portfolio-orrery?forceReducedMotion=1", {width:1440,height:900}],
  ["/dev/phase10-portfolio-orrery", {width:390,height:844}],
  ["/dev/phase10-portfolio-orrery", {width:320,height:844}],
  ["/dev/phase10-spike-r3f-world", {width:1440,height:900}],
];
for (const [path, viewport] of routes) {
  const context = await browser.newContext({ viewport });
  await context.addCookies([{ name: "owner_session", value: sessionToken(OWNER_PASSWORD), domain: "localhost", path: "/" }]);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
  await page.goto(BASE_URL + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  console.log(path, JSON.stringify(viewport), "errors:", errors.length, errors.slice(0,3));
  await context.close();
}
await browser.close();
