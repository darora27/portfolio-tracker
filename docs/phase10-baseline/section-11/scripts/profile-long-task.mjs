// Phase 10 §11 remediation diagnostic for F5 / BLD-04.
// Mirrors the retained 1440x900, CPU-2x measurement contract while adding a
// CDP sampling profile so the current candidate's long task is attributed
// for remediation verification. This script does not grade or alter the
// <50ms gate.
import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

await page.addInitScript(() => {
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  window.__phase10LongTasks = [];
  new PerformanceObserver((list) => {
    window.__phase10LongTasks.push(
      ...list.getEntries().map(({ duration, startTime }) => ({
        duration,
        startTime,
      })),
    );
  }).observe({ type: "longtask", buffered: true });
});

const client = await context.newCDPSession(page);
await client.send("Emulation.setCPUThrottlingRate", { rate: 2 });
await client.send("Profiler.enable");
await client.send("Profiler.setSamplingInterval", { interval: 200 });
await client.send("Profiler.start");

await page.goto(base, { waitUntil: "domcontentloaded" });
await page.locator("canvas").waitFor({ state: "visible" });
await page.waitForFunction(
  () => document.querySelectorAll("[data-scene-ticker]").length === 8,
);
await page.waitForTimeout(5000);

const { profile } = await client.send("Profiler.stop");
const longTasks = await page.evaluate(() => window.__phase10LongTasks);
const nodesById = new Map(profile.nodes.map((node) => [node.id, node]));
const sampleTimesUs = [];
let sampleTimeUs = profile.startTime;
for (const delta of profile.timeDeltas) {
  sampleTimeUs += delta;
  sampleTimesUs.push(sampleTimeUs);
}

const profileDurationMs = (profile.endTime - profile.startTime) / 1000;
const millisecondsPerSample = profile.samples.length
  ? profileDurationMs / profile.samples.length
  : 0;
const describe = (id) => {
  const frame = nodesById.get(id)?.callFrame;
  if (!frame) return "(unknown)";
  const file = frame.url ? frame.url.split("/").at(-1) : "native";
  return `${frame.functionName || "(anonymous)"} @ ${file}:${frame.lineNumber}`;
};

const windows = longTasks.map((task) => ({
  ...task,
  from: task.startTime,
  to: task.startTime + task.duration,
}));
const selfTimeByWindow = windows.map(() => new Map());
for (let index = 0; index < profile.samples.length; index += 1) {
  const pageTimeMs = (sampleTimesUs[index] - profile.startTime) / 1000;
  for (let windowIndex = 0; windowIndex < windows.length; windowIndex += 1) {
    const window = windows[windowIndex];
    if (pageTimeMs < window.from || pageTimeMs > window.to) continue;
    const id = profile.samples[index];
    const times = selfTimeByWindow[windowIndex];
    times.set(id, (times.get(id) ?? 0) + millisecondsPerSample);
  }
}

const result = {
  candidate: "current production candidate",
  measurement: {
    viewport: "1440x900",
    cpuThrottle: 2,
    waitUntil: "domcontentloaded",
    postReadinessWindowMs: 5000,
  },
  longTasks,
  longTaskAttribution: windows.map((window, index) => ({
    window,
    topSelfTime: [...selfTimeByWindow[index]]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([id, selfMs]) => ({
        frame: describe(id),
        selfMs: Number(selfMs.toFixed(1)),
      })),
  })),
};

console.log(JSON.stringify(result, null, 2));
await browser.close();
