// Claude Lead review round 3, §10 — attribute the route-owned long task (BLD-04).
// Same rig as measure-long-tasks.mjs (1440x900, CPU 2x, fresh context) plus a
// CDP CPU profile, so the >50 ms task can be named rather than guessed.
import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.addInitScript(() => {
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  window.__longTasks = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__longTasks.push({ duration: Math.round(entry.duration), startTime: entry.startTime });
    }
  }).observe({ entryTypes: ["longtask"] });
});
const client = await context.newCDPSession(page);
await client.send("Emulation.setCPUThrottlingRate", { rate: 2 });
await client.send("Profiler.enable");
await client.send("Profiler.setSamplingInterval", { interval: 200 });
await client.send("Profiler.start");
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const { profile } = await client.send("Profiler.stop");
const longTasks = await page.evaluate(() => window.__longTasks);

// Self time per node, then aggregate by function and by url.
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const selfTicks = new Map();
for (const id of profile.samples) selfTicks.set(id, (selfTicks.get(id) ?? 0) + 1);
const totalTicks = profile.samples.length;
const durationMs = (profile.endTime - profile.startTime) / 1000;
const msPerTick = totalTicks ? durationMs / totalTicks : 0;

// Align CDP sample timestamps with the page's performance timeline so self
// time can be restricted to the sampled long-task windows.
const sampleTimesUs = [];
{
  let t = profile.startTime;
  for (const delta of profile.timeDeltas) { t += delta; sampleTimesUs.push(t); }
}
// Profiler.start runs immediately before page.goto, so the profile origin is
// within a few ms of navigation start; treat it as the page timeline origin.
const navStartUs = profile.startTime;
const windows = longTasks.map((task) => ({ ...task, from: task.startTime, to: task.startTime + task.duration }));
const windowSelf = windows.map(() => new Map());
for (let i = 0; i < profile.samples.length; i += 1) {
  const pageMs = (sampleTimesUs[i] - navStartUs) / 1000;
  for (let w = 0; w < windows.length; w += 1) {
    if (pageMs >= windows[w].from && pageMs <= windows[w].to) {
      const id = profile.samples[i];
      windowSelf[w].set(id, (windowSelf[w].get(id) ?? 0) + 1);
    }
  }
}
const describe = (id) => {
  const node = byId.get(id);
  if (!node) return "(unknown)";
  const f = node.callFrame;
  return `${f.functionName || "(anonymous)"} @ ${f.url ? f.url.split("/").pop() : "native"}:${f.lineNumber}`;
};
const bins = new Map();
for (let i = 0; i < profile.samples.length; i += 1) {
  const pageMs = (sampleTimesUs[i] - navStartUs) / 1000;
  if (pageMs > 2000) continue;
  const bin = Math.floor(pageMs / 100) * 100;
  const key = `${bin}-${bin + 100}ms`;
  if (!bins.has(key)) bins.set(key, new Map());
  const m = bins.get(key);
  const id = profile.samples[i];
  m.set(id, (m.get(id) ?? 0) + 1);
}
const histogram = [...bins.entries()].map(([key, m]) => ({
  bin: key,
  top: [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([id, ticks]) => ({ frame: describe(id), selfMs: Number((ticks * msPerTick).toFixed(1)) })),
}));

const longTaskAttribution = windows.map((w, index) => ({
  window: w,
  top: [...windowSelf[index].entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, ticks]) => ({ frame: describe(id), selfMs: Number((ticks * msPerTick).toFixed(1)) })),
}));

const rows = [];
for (const [id, ticks] of selfTicks) {
  const node = byId.get(id);
  if (!node) continue;
  const f = node.callFrame;
  rows.push({
    fn: f.functionName || "(anonymous)",
    url: f.url ? f.url.replace(base.replace(/\/share$/, ""), "") : "(native)",
    line: f.lineNumber,
    selfMs: Number((ticks * msPerTick).toFixed(1)),
  });
}
rows.sort((a, b) => b.selfMs - a.selfMs);

const byUrl = new Map();
for (const r of rows) byUrl.set(r.url, Number(((byUrl.get(r.url) ?? 0) + r.selfMs).toFixed(1)));

console.log(JSON.stringify({
  longTasks,
  longTaskAttribution,
  histogram,
  profileWindowMs: Number(durationMs.toFixed(1)),
  topSelfTime: rows.slice(0, 30),
  selfTimeByUrl: [...byUrl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
}, null, 1));
await browser.close();
