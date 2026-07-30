import { chromium } from "playwright";

// Diagnostic for BLD-04-1: record every sceneConstructionStage transition
// with its performance.now() timestamp, and every long task, then report
// which stage (if any) was active when each long task started.
const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

for (let run = 1; run <= 6; run += 1) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 2 });
  await page.addInitScript(() => {
    window.__longTasks = [];
    window.__stageLog = [];
    new PerformanceObserver((list) => {
      window.__longTasks.push(...list.getEntries().map((e) => ({ duration: e.duration, startTime: e.startTime })));
    }).observe({ type: "longtask", buffered: true });
    const patchWhenReady = () => {
      const mount = document.querySelector("[data-scene-construction-stage]");
      if (!mount) {
        requestAnimationFrame(patchWhenReady);
        return;
      }
      window.__stageLog.push({ stage: mount.dataset.sceneConstructionStage, t: performance.now() });
      new MutationObserver(() => {
        window.__stageLog.push({ stage: mount.dataset.sceneConstructionStage, t: performance.now() });
      }).observe(mount, { attributes: true, attributeFilter: ["data-scene-construction-stage"] });
    };
    requestAnimationFrame(patchWhenReady);
  });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length === 8);
  await page.waitForTimeout(5000);
  const longTasks = await page.evaluate(() => window.__longTasks);
  const stageLog = await page.evaluate(() => window.__stageLog);
  const maximumMs = longTasks.reduce((m, e) => Math.max(m, e.duration), 0);
  if (maximumMs >= 50) {
    console.log(`run ${run}: BREACH maximumMs=${maximumMs}`);
    console.log("longTasks", JSON.stringify(longTasks));
    console.log("stageLog", JSON.stringify(stageLog));
    for (const task of longTasks) {
      const active = stageLog.filter((s) => s.t <= task.startTime).at(-1);
      const next = stageLog.find((s) => s.t > task.startTime);
      console.log(
        `  task ${task.duration}ms@${task.startTime}: active stage at start = ${active?.stage} (set at ${active?.t}); next transition = ${next?.stage} at ${next?.t}`,
      );
    }
  } else {
    console.log(`run ${run}: clean, maximumMs=${maximumMs}`);
  }
  await context.close();
}
await browser.close();
