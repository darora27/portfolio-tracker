import { chromium } from "playwright";
import crypto from "node:crypto";

const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
const BASE_URL = "http://localhost:3100";
function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

async function check(label, path, opts = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([{ name: "owner_session", value: sessionToken(OWNER_PASSWORD), domain: "localhost", path: "/" }]);
  const page = await context.newPage();
  if (opts.reducedMotion) await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
  await page.goto(BASE_URL + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const canvasCount = await page.evaluate(() => document.querySelectorAll("canvas").length);
  console.log(label, "canvasCount=", canvasCount, "errors=", errors.length, errors.slice(0,3));
  await context.close();
}

await check("no3d=1", "/dev/phase10-portfolio-orrery?no3d=1");
await check("reduced-motion", "/dev/phase10-portfolio-orrery", { reducedMotion: true });
await check("normal", "/dev/phase10-portfolio-orrery");
await browser.close();
