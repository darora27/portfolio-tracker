import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

for (let run = 1; run <= 6; run += 1) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__phase10LongTasks = [];
    new PerformanceObserver((list) => {
      window.__phase10LongTasks.push(
        ...list.getEntries().map(({ duration, startTime }) => ({ duration, startTime })),
      );
    }).observe({ type: "longtask", buffered: true });
  });

  const client = await context.newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 2 });

  const events = [];
  client.on("Tracing.dataCollected", (payload) => {
    events.push(...payload.value);
  });

  await client.send("Tracing.start", {
    categories: [
      "disabled-by-default-v8.gc",
      "v8",
      "devtools.timeline",
      "disabled-by-default-devtools.timeline",
      "blink.user_timing",
      "toplevel",
      "loading",
      "disabled-by-default-v8.compile",
      "disabled-by-default-v8.cpu_profiler",
      "blink",
    ].join(","),
    options: "sampling-frequency=10000",
  });

  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelectorAll("[data-scene-ticker]").length === 8);
  await page.waitForTimeout(5000);

  const tracingDone = new Promise((resolve) => client.once("Tracing.tracingComplete", resolve));
  await client.send("Tracing.end");
  await tracingDone;

  const longTasks = await page.evaluate(() => window.__phase10LongTasks);
  const maximumMs = longTasks.reduce((m, e) => Math.max(m, e.duration), 0);

  if (maximumMs >= 50) {
    console.log(`run ${run}: BREACH`, JSON.stringify(longTasks));
    const traceStart = events.reduce(
      (min, e) => (e.ts && e.ts < min ? e.ts : min),
      Infinity,
    );
    for (const task of longTasks) {
      const fromUs = traceStart + task.startTime * 1000;
      const toUs = traceStart + (task.startTime + task.duration) * 1000;
      const windowEvents = events
        .filter((e) => e.ts >= fromUs - 1000 && e.ts <= toUs + 1000 && e.name !== "RunTask")
        .map((e) => ({ name: e.name, ph: e.ph, dur: e.dur, cat: e.cat, args: e.args }));
      console.log(`--- task ${task.duration}ms@${task.startTime} (${windowEvents.length} non-RunTask events) ---`);
      console.log(JSON.stringify(windowEvents, null, 1).slice(0, 6000));
    }
  } else {
    console.log(`run ${run}: clean`);
  }
  await context.close();
}
await browser.close();
