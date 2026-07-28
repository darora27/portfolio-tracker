// Claude Lead review round 2, §10.
// Live DOM/geometry measurements for the criteria F6's required change named
// (DEF-10, VIS-08, VIS-09, BHV-10) plus the reachable visual/behavioural
// matrix: BHV-01, BHV-04, VIS-03, ACC-07, MOB-03.
import { chromium } from "playwright";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const BAYS = ["plot", "manifest", "scope", "hazard", "signals", "comms", "log"];

const browser = await chromium.launch({ headless: true });
const out = {};

async function open(url, opts = {}) {
  const page = await browser.newPage({
    viewport: opts.viewport ?? { width: 1440, height: 900 },
    reducedMotion: opts.reducedMotion,
  });
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "stock-market-universe-orientation-seen",
      "true",
    );
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1_200);
  return page;
}

// ---- BHV-10 / BHV-04: bay questions, once each, with a destination ----
out.bayQuestions = [];
for (const bay of BAYS) {
  const page = await open(
    `${base}?focus=portfolio&camera=command&station=${bay}`,
  );
  const info = await page.evaluate(() => {
    const norm = (s) =>
      s.replace(/\s+/g, " ").trim().toLowerCase().replace(/[’']/g, "'");
    const questions = [...document.querySelectorAll("*")]
      .filter((el) => /bayQuestion/.test(el.className || ""))
      .map((el) => norm(el.textContent || ""))
      .filter(Boolean);
    const counts = {};
    for (const q of questions) counts[q] = (counts[q] || 0) + 1;
    const links = [...document.querySelectorAll("a[href], button")].length;
    return {
      questions,
      duplicated: Object.entries(counts)
        .filter(([, n]) => n > 1)
        .map(([q, n]) => ({ question: q, times: n })),
      interactiveControlCount: links,
    };
  });
  out.bayQuestions.push({ bay, ...info });
  await page.close();
}

// ---- VIS-08: bay geometry + type scale ----
{
  const page = await open(`${base}?focus=portfolio&camera=command&station=plot`);
  out.visted08 = await page.evaluate(() => {
    const pick = (frag) =>
      [...document.querySelectorAll("*")].find((el) =>
        new RegExp(frag).test(el.className || ""),
      );
    const rect = (el) =>
      el
        ? (({ x, y, width, height }) => ({
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(width),
            height: Math.round(height),
          }))(el.getBoundingClientRect())
        : null;
    const plot = pick("plotChassis");
    const rail = pick("missionRail");
    const dayNumber = pick("dayNumber|missionHeadline|headlineNumber");
    const fs = (el) => (el ? getComputedStyle(el).fontSize : null);
    const biggest = [...document.querySelectorAll("body *")]
      .map((el) => ({
        text: (el.textContent || "").trim().slice(0, 24),
        size: parseFloat(getComputedStyle(el).fontSize),
        tag: el.tagName,
      }))
      .filter((e) => e.text && e.size >= 40)
      .sort((a, b) => b.size - a.size)
      .slice(0, 4);
    return {
      viewportWidth: window.innerWidth,
      plot: rect(plot),
      plotFractionOfViewport: plot
        ? Number((plot.getBoundingClientRect().width / window.innerWidth).toFixed(3))
        : null,
      rail: rect(rail),
      dayNumberFontSize: fs(dayNumber),
      largestTypeOnScreen: biggest,
    };
  });
  await page.close();
}

// ---- VIS-09: LOG parchment material + chip contrast ----
{
  const page = await open(`${base}?focus=portfolio&camera=command&station=log`);
  out.vis09 = await page.evaluate(() => {
    const toLin = (c) =>
      c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    const lum = (rgb) => {
      const [r, g, b] = rgb;
      return 0.2126 * toLin(r / 255) + 0.7152 * toLin(g / 255) + 0.0722 * toLin(b / 255);
    };
    const parse = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
    const ratio = (a, b) => {
      const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
      return Number(((l1 + 0.05) / (l2 + 0.05)).toFixed(2));
    };
    const content = [...document.querySelectorAll("[data-material]")].map(
      (el) => ({
        material: el.dataset.material,
        background: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color,
      }),
    );
    const chip = [...document.querySelectorAll("h3")].find((el) =>
      /^LOG$/i.test((el.textContent || "").trim()),
    );
    const rows = [...document.querySelectorAll("*")].find((el) =>
      /logRows/.test(el.className || ""),
    );
    return {
      materials: content,
      logChip: chip
        ? {
            text: chip.textContent.trim(),
            color: getComputedStyle(chip).color,
            background: getComputedStyle(chip).backgroundColor,
            contrast: ratio(
              parse(getComputedStyle(chip).color),
              parse(getComputedStyle(chip).backgroundColor),
            ),
          }
        : null,
      logRows: rows
        ? {
            scrollHeight: rows.scrollHeight,
            clientHeight: rows.clientHeight,
            scrollable: rows.scrollHeight > rows.clientHeight,
            overflowY: getComputedStyle(rows).overflowY,
          }
        : null,
    };
  });
  await page.close();
}

// ---- DEF-10: planet-detail panel geometry, type sizes, overflow ----
{
  const page = await open(`${base}?holding=ASML&camera=approach`);
  await page.waitForTimeout(1_500);
  out.def10 = await page.evaluate(() => {
    const panel = [...document.querySelectorAll("*")].find((el) =>
      /inspector/.test(el.className || ""),
    );
    const r = panel.getBoundingClientRect();
    const idNumber = [...panel.querySelectorAll("*")]
      .map((el) => ({
        text: (el.textContent || "").trim(),
        size: parseFloat(getComputedStyle(el).fontSize),
      }))
      .filter((e) => /%$/.test(e.text) && e.text.length < 10)
      .sort((a, b) => b.size - a.size)[0];
    const words = (panel.textContent || "").trim().split(/\s+/).length;
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      panel: {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
        fractionOfViewportWidth: Number((r.width / window.innerWidth).toFixed(3)),
        bottomWithinViewport: r.bottom <= window.innerHeight + 1,
        topWithinViewport: r.top >= -1,
      },
      scroll: {
        scrollHeight: panel.scrollHeight,
        clientHeight: panel.clientHeight,
        scrollable: panel.scrollHeight > panel.clientHeight,
        overflowY: getComputedStyle(panel).overflowY,
      },
      idPlateNumber: idNumber,
      bodyFontSize: getComputedStyle(panel).fontSize,
      wordCount: words,
    };
  });
  await page.close();
}

// ---- BHV-01 / VIS-03: overview labels + sun is largest ----
{
  const page = await open(base);
  await page.waitForTimeout(2_000);
  out.overview = await page.evaluate(() => {
    const labels = [...document.querySelectorAll("[data-scene-ticker]")].map(
      (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          ticker: el.dataset.sceneTicker,
          radiusPx: Number(el.dataset.planetRadiusPx),
          visible: r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !el.hidden,
          fontSize: cs.fontSize,
          x: Math.round(r.x),
          y: Math.round(r.y),
          insideViewport:
            r.x >= 0 && r.y >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight,
        };
      },
    );
    // pairwise label overlap
    const boxes = [...document.querySelectorAll("[data-scene-ticker]")].map(
      (el) => ({ t: el.dataset.sceneTicker, r: el.getBoundingClientRect() }),
    );
    const overlaps = [];
    for (let i = 0; i < boxes.length; i += 1)
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i].r;
        const b = boxes[j].r;
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom)
          overlaps.push([boxes[i].t, boxes[j].t]);
      }
    const mount = document.querySelector("[class*='sceneMount']");
    return {
      labelCount: labels.length,
      labels,
      labelOverlaps: overlaps,
      largestPlanetRadiusPx: Math.max(...labels.map((l) => l.radiusPx)),
      sun: mount
        ? { x: Number(mount.dataset.evidenceSunX), y: Number(mount.dataset.evidenceSunY) }
        : null,
    };
  });
  await page.close();
}

// ---- ACC-07: reduced-motion timestamp replaces the sweep ----
{
  const page = await open(`${base}?focus=portfolio&camera=command&station=plot`, {
    reducedMotion: "reduce",
  });
  out.acc07 = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      canvasCount: document.querySelectorAll("canvas").length,
      hasTimestampStamp: /\b(20\d\d-\d\d-\d\d|\d\d:\d\d)\b/.test(text),
      timestampMatches: (text.match(/\b(20\d\d-\d\d-\d\d|\d\d:\d\d)\b/g) || []).slice(0, 6),
      runningAnimations: document.getAnimations
        ? document.getAnimations().filter((a) => a.playState === "running").length
        : null,
    };
  });
  await page.close();
}

// ---- MOB-03: 390px fallback reading order ----
{
  const page = await open(base, { viewport: { width: 390, height: 844 } });
  out.mob03 = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll("canvas").length,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    controlCount: [...document.querySelectorAll("a[href],button")].length,
    firstTwentyReadingOrder: [...document.querySelectorAll("a[href],button")]
      .slice(0, 20)
      .map((el) => (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 44)),
  }));
  await page.close();
}

console.log(JSON.stringify(out, null, 1));
await browser.close();
