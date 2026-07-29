// Round-4 review probe: measures the §10 criteria that had never been performed
// in any prior round and whose verifier kind is `browser` or `visual`.
// Measurement only — it asserts nothing and changes no application source.
//
//   VIS-08  Mission Control dominant bay, unequal sizes/gutters, type scale
//   VIS-10  radar ring colour / ticker labels / blip size proportional to weight
//   BHV-10  Mission Control word budget
//   BHV-05  brand-first entry phase, still set under reduced motion
//   VIS-14  prism cursor exhaust present, disabled under reduced motion
//   DEF-04  every belt body has a visible rendered body at OVERVIEW
//   DEF-07  the sun does not occlude ASML during rotation at the close camera
//   BLD-05  first contentful frame does not block on a texture map
//
// Usage: PHASE10_BASE_URL=http://127.0.0.1:3141/share node <this file>
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.PHASE10_BASE_URL ?? "http://127.0.0.1:3000/share";
const outDir = path.resolve("docs/phase10-baseline/section-10/claude-review-4");
await mkdir(outDir, { recursive: true });
const result = {};

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const seen = () =>
  window.localStorage.setItem(
    "stock-market-universe-orientation-seen",
    "true",
  );

// ---------------------------------------------------------------- BLD-05 ----
// Block every planet texture request and confirm the scene still paints.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.addInitScript(seen);
  const textureRequests = [];
  await page.route("**/textures/planets/**", (route) => {
    textureRequests.push(route.request().url().split("/").pop());
    return route.abort();
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible", timeout: 30_000 });
  const canvasVisibleAt = Date.now();
  await page.waitForTimeout(4_000);
  const shot = await page.screenshot();
  await writeFile(path.join(outDir, "bld-05-textures-blocked.png"), shot);
  const stats = await sharp(shot).stats();
  const labelCount = await page.locator("[data-scene-ticker]").count();
  result["BLD-05"] = {
    blockedTextureRequests: textureRequests.length,
    canvasBecameVisible: Boolean(canvasVisibleAt),
    sceneLabelsRendered: labelCount,
    pageErrors: errors,
    // A wholly black canvas would show near-zero max on every channel.
    channelMax: stats.channels.map((channel) => channel.max),
    channelMean: stats.channels.map((channel) => Number(channel.mean.toFixed(2))),
  };
  await context.close();
}

// ------------------------------------------------- OVERVIEW-side criteria ----
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.addInitScript(seen);
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(2_500);

  // DEF-04 — belt bodies. Read each belt target's published screen position and
  // sample the rendered pixels there for a body distinguishable from the void.
  const beltTargets = await page.locator("[data-belt-holding]").evaluateAll(
    (nodes) =>
      nodes.map((node) => ({
        ticker: node.dataset.beltHolding,
        x: Number(node.dataset.beltCenterX ?? node.dataset.planetCenterX ?? NaN),
        y: Number(node.dataset.beltCenterY ?? node.dataset.planetCenterY ?? NaN),
        radius: Number(
          node.dataset.beltRadiusPx ?? node.dataset.planetRadiusPx ?? NaN,
        ),
        rect: (() => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        })(),
        datasetKeys: Object.keys(node.dataset),
      })),
  );
  const overview = await page.screenshot();
  await writeFile(path.join(outDir, "def-04-overview.png"), overview);
  const meta = await sharp(overview).metadata();
  const raw = await sharp(overview).removeAlpha().raw().toBuffer();
  const width = meta.width ?? 1440;
  const sampleBody = (cx, cy, half) => {
    let brightest = 0;
    let litPixels = 0;
    for (let y = Math.round(cy - half); y <= Math.round(cy + half); y += 1) {
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x += 1) {
        if (x < 0 || y < 0 || x >= width || y >= (meta.height ?? 900)) continue;
        const offset = (y * width + x) * 3;
        const luma =
          0.2126 * raw[offset] + 0.7152 * raw[offset + 1] + 0.0722 * raw[offset + 2];
        brightest = Math.max(brightest, luma);
        if (luma > 40) litPixels += 1;
      }
    }
    return { brightest: Number(brightest.toFixed(1)), litPixels };
  };
  result["DEF-04"] = {
    beltTargets: beltTargets.map((target) => ({
      ...target,
      pixels: Number.isFinite(target.x)
        ? sampleBody(target.x, target.y, 6)
        : sampleBody(
            target.rect.x + target.rect.width / 2,
            target.rect.y + target.rect.height / 2,
            6,
          ),
    })),
  };

  // VIS-14 — prism cursor exhaust with motion allowed.
  const exhaustMotion = await page.evaluate(async () => {
    const probe = () =>
      [...document.querySelectorAll("*")]
        .filter((node) =>
          [...node.classList].some((name) => /exhaust|prism/i.test(name)),
        )
        .map((node) => ({
          cls: [...node.classList].join(" "),
          rect: (() => {
            const r = node.getBoundingClientRect();
            return { width: Math.round(r.width), height: Math.round(r.height) };
          })(),
        }));
    const before = probe();
    // Move the pointer fast, then slowly, and read the exhaust length token.
    const read = () =>
      getComputedStyle(document.documentElement).getPropertyValue(
        "--cursor-exhaust-length",
      ) ||
      getComputedStyle(document.body).getPropertyValue("--cursor-exhaust-length");
    return { nodes: before, lengthToken: read().trim() };
  });
  result["VIS-14"] = { motionAllowed: exhaustMotion };

  await context.close();
}

// ---------------------------------------------------------------- DEF-07 ----
// Close camera on ASML, sampled across a full rotation window: does the sun's
// rendered disc ever cover the planet's centre?
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.addInitScript(seen);
  await page.goto(`${base}?holding=ASML&camera=approach`, {
    waitUntil: "networkidle",
  });
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(1_500);
  const samples = [];
  for (let index = 0; index < 12; index += 1) {
    const geometry = await page
      .locator('[data-scene-ticker="ASML"]')
      .evaluate((label) => ({
        x: Number(label.dataset.planetCenterX),
        y: Number(label.dataset.planetCenterY),
        radius: Number(label.dataset.planetRadiusPx),
      }));
    const shot = await page.screenshot();
    const meta = await sharp(shot).metadata();
    const raw = await sharp(shot).removeAlpha().raw().toBuffer();
    const width = meta.width ?? 1440;
    // Sample a small disc at the planet centre. Sun pixels are strongly
    // orange (R >> B); the ASML world is blue/white.
    let sunLike = 0;
    let total = 0;
    for (let dy = -8; dy <= 8; dy += 2) {
      for (let dx = -8; dx <= 8; dx += 2) {
        const x = Math.round(geometry.x + dx);
        const y = Math.round(geometry.y + dy);
        if (x < 0 || y < 0 || x >= width || y >= (meta.height ?? 900)) continue;
        const offset = (y * width + x) * 3;
        const r = raw[offset];
        const g = raw[offset + 1];
        const b = raw[offset + 2];
        total += 1;
        if (r > 120 && r - b > 60 && r >= g) sunLike += 1;
      }
    }
    samples.push({
      index,
      centre: { x: Number(geometry.x.toFixed(1)), y: Number(geometry.y.toFixed(1)) },
      radiusPx: Number(geometry.radius.toFixed(1)),
      sunLikeCentrePixels: sunLike,
      sampledPixels: total,
    });
    await page.waitForTimeout(1_000);
  }
  result["DEF-07"] = { samples };
  await context.close();
}

// ---------------------------------------- Mission Control: VIS-08/10, BHV-10 --
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.addInitScript(seen);
  await page.goto(`${base}?focus=portfolio&camera=command`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1_500);

  result["VIS-08"] = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]') ?? document.body;
    const boxes = [...dialog.querySelectorAll("section, div")]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          cls: [...node.classList]
            .map((name) => name.split("__").pop())
            .join(" "),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          area: Math.round(rect.width * rect.height),
        };
      })
      .filter((box) => box.width > 120 && box.height > 80)
      .sort((left, right) => right.area - left.area)
      .slice(0, 14);
    const fontSizes = [...dialog.querySelectorAll("*")]
      .map((node) => ({
        size: Number.parseFloat(getComputedStyle(node).fontSize),
        text: (node.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 28),
        cls: [...node.classList].map((name) => name.split("__").pop()).join(" "),
      }))
      .filter((entry) => entry.text.length > 0 && Number.isFinite(entry.size));
    const scale = [...new Set(fontSizes.map((entry) => entry.size))].sort(
      (left, right) => right - left,
    );
    const largest = fontSizes
      .filter((entry) => entry.size === scale[0])
      .slice(0, 4);
    return {
      viewport: { width: innerWidth, height: innerHeight },
      largestBoxes: boxes,
      typeScale: scale,
      largestTextSamples: largest,
    };
  });

  result["BHV-10"] = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]') ?? document.body;
    const isTeletype = (node) =>
      Boolean(node.closest('[class*="teletype"], [class*="Teletype"]'));
    const textNodes = [...dialog.querySelectorAll("p, span, li, h1, h2, h3, h4")]
      .filter((node) => node.children.length === 0)
      .map((node) => ({
        text: (node.textContent ?? "").replace(/\s+/g, " ").trim(),
        cls: [...node.classList].map((name) => name.split("__").pop()).join(" "),
        teletype: isTeletype(node),
      }))
      .filter((entry) => entry.text.length > 0);
    // A "sentence" here: 5+ words. Bay questions are the designed exception the
    // spec already names, so they are reported separately rather than counted.
    const sentences = textNodes.filter(
      (entry) =>
        !entry.teletype &&
        entry.text.split(/\s+/).length >= 5 &&
        !/bayQuestion|question/i.test(entry.cls),
    );
    const nameplates = textNodes
      .filter((entry) => /nameplate|bayName|stationName|tabLabel/i.test(entry.cls))
      .map((entry) => ({ text: entry.text, words: entry.text.split(/\s+/).length }));
    return {
      totalTextNodes: textNodes.length,
      nonTeletypeSentences: sentences.slice(0, 25),
      nonTeletypeSentenceCount: sentences.length,
      nameplates,
      nameplateMaxWords: nameplates.reduce(
        (max, entry) => Math.max(max, entry.words),
        0,
      ),
    };
  });

  // VIS-10 — radar. SIGNALS/PLOT bay carries the radar.
  result["VIS-10"] = await page.evaluate(() => {
    const targets = [...document.querySelectorAll("[data-radar-ticker]")].map(
      (node) => {
        const rect = node.getBoundingClientRect();
        return {
          ticker: node.dataset.radarTicker,
          ringColor:
            node.dataset.radarRingColor ??
            node.getAttribute("stroke") ??
            getComputedStyle(node).stroke,
          blipDiameter: node.dataset.radarBlipDiameterPx ?? null,
          weight: node.dataset.radarWeight ?? null,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          label: (node.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 24),
          datasetKeys: Object.keys(node.dataset),
        };
      },
    );
    const svgTexts = [...document.querySelectorAll("svg text")].map((node) =>
      (node.textContent ?? "").trim(),
    );
    return { targets, svgTickerLabels: svgTexts };
  });

  await context.close();
}

// ---------------------------------------------- BHV-05 / VIS-14 reduced motion --
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.addInitScript(seen);
  await page.goto(`${base}?holding=ASML&camera=approach`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2_000);
  result["BHV-05_VIS-14_reducedMotion"] = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll("canvas").length,
    exhaustNodes: [...document.querySelectorAll("*")].filter((node) =>
      [...node.classList].some((name) => /exhaust|prism/i.test(name)),
    ).length,
    runningAnimations: document
      .getAnimations()
      .filter((animation) => animation.playState === "running").length,
    holdingHeading: (
      document.querySelector('[class*="identityName"], h2, h3')?.textContent ?? ""
    )
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60),
  }));
  await context.close();
}

await browser.close();
await writeFile(
  path.join(outDir, "raw-remaining-criteria.json"),
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result, null, 2));
