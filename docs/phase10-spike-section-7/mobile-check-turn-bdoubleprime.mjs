import { chromium } from "playwright";
import crypto from "node:crypto";

const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
const BASE_URL = "http://localhost:3100";
function sessionToken(password) {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
for (const width of [390, 320]) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });
  await context.addCookies([{ name: "owner_session", value: sessionToken(OWNER_PASSWORD), domain: "localhost", path: "/" }]);
  const page = await context.newPage();
  await page.goto(BASE_URL + "/dev/phase10-portfolio-orrery", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => {
    const canvasCount = document.querySelectorAll("canvas").length;
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    const links = [...document.querySelectorAll("a,button")];
    const small = links.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.width > 0 && (r.height < 44 || r.width < 44);
    }).map((el) => ({ text: el.textContent?.trim().slice(0,30), w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }));
    return { canvasCount, overflow, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, smallTargetsCount: small.length, small: small.slice(0,5) };
  });
  console.log(width, JSON.stringify(result));
  await context.close();
}
await browser.close();
