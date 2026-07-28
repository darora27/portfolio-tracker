import { chromium } from "playwright";

const BASE_URL = process.env.PHASE10_BASE_URL ?? "http://localhost:3100";

async function main() {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

  // Parallax on the real (non-forced) desktop path, entrance dismissed
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
  await page.mouse.click(700, 450); // dismiss entrance overlay if present
  await page.waitForTimeout(2500); // let OrrerySceneLoader's 2-rAF gate settle
  await page.mouse.move(200, 200);
  await page.waitForTimeout(150);
  const varsA = await page.evaluate(() => {
    const w = document.querySelector("main");
    return w ? { x: w.style.getPropertyValue("--orrery-pointer-x"), y: w.style.getPropertyValue("--orrery-pointer-y") } : null;
  });
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(150);
  const varsB = await page.evaluate(() => {
    const w = document.querySelector("main");
    return w ? { x: w.style.getPropertyValue("--orrery-pointer-x"), y: w.style.getPropertyValue("--orrery-pointer-y") } : null;
  });
  const canvasLayerTransformA = await page.evaluate(() => {
    const el = document.querySelector('[class*="canvasLayer"]');
    return el ? getComputedStyle(el).transform : null;
  });
  await page.mouse.move(200, 200);
  await page.waitForTimeout(150);
  const canvasLayerTransformB = await page.evaluate(() => {
    const el = document.querySelector('[class*="canvasLayer"]');
    return el ? getComputedStyle(el).transform : null;
  });
  const starFieldTransformB = await page.evaluate(() => {
    const el = document.querySelector('[class*="starField"]');
    return el ? getComputedStyle(el).transform : null;
  });
  console.log("[parallaxRecheck]", JSON.stringify({ varsA, varsB, canvasLayerTransformA, canvasLayerTransformB, starFieldTransformB }));
  await context.close();

  // Confirm which chunks only load at desktop width and inspect their content
  const chunkNames = new Set();
  const c1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p1 = await c1.newPage();
  p1.on("response", (res) => { if (/\.js$/.test(new URL(res.url()).pathname)) chunkNames.add(res.url()); });
  await p1.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
  await p1.mouse.click(700, 450);
  await p1.waitForTimeout(2500);
  await c1.close();

  const narrowChunkNames = new Set();
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await c2.newPage();
  p2.on("response", (res) => { if (/\.js$/.test(new URL(res.url()).pathname)) narrowChunkNames.add(res.url()); });
  await p2.goto(`${BASE_URL}/share`, { waitUntil: "networkidle" });
  await p2.waitForTimeout(1500);
  await c2.close();

  const onlyOnDesktop = [...chunkNames].filter((u) => !narrowChunkNames.has(u));
  console.log("[chunkUrls]", JSON.stringify(onlyOnDesktop));

  await browser.close();
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
