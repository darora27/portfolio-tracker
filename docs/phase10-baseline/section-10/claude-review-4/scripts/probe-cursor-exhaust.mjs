// Round-4 review probe for VIS-14: does the prism cursor exhaust take its
// length from pointer speed, and is it fully disabled under reduced motion?
// Measurement only.
//
// Usage: PHASE10_BASE_URL=http://127.0.0.1:3141/share node <this file>
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const outDir = path.resolve("docs/phase10-baseline/section-10/claude-review-4");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const seen = () =>
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");

const readExhaust = () =>
  [...document.querySelectorAll("*")]
    .filter((node) =>
      [...node.classList].some((name) => /exhaust|prism|rocket/i.test(name)),
    )
    .map((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        cls: [...node.classList].map((name) => name.split("__").pop()).join(" "),
        width: Number(rect.width.toFixed(2)),
        height: Number(rect.height.toFixed(2)),
        transform: style.transform,
        opacity: style.opacity,
      };
    });

const result = {};

// Motion allowed: sample the exhaust after slow travel and after fast travel.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(seen);
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(2_000);

  // Slow: many small steps.
  await page.mouse.move(300, 500);
  for (let step = 0; step < 20; step += 1) {
    await page.mouse.move(300 + step * 2, 500);
    await page.waitForTimeout(40);
  }
  const slow = await page.evaluate(readExhaust);

  await page.waitForTimeout(600);

  // Fast: one long jump, sampled immediately.
  await page.mouse.move(200, 300);
  await page.mouse.move(1200, 800);
  const fast = await page.evaluate(readExhaust);

  result.motionAllowed = { slow, fast };
  await page.close();
}

// Reduced motion.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.addInitScript(seen);
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(2_000);
  await page.mouse.move(200, 300);
  await page.mouse.move(1200, 800);
  result.reducedMotion = {
    canvasCount: await page.locator("canvas").count(),
    exhaust: await page.evaluate(readExhaust),
    runningAnimations: await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running").length,
    ),
  };
  await context.close();
}

await browser.close();
await writeFile(
  path.join(outDir, "raw-cursor-exhaust.json"),
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result, null, 2));
