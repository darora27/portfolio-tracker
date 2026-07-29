#!/usr/bin/env node
/**
 * Phase 10 capture harness — the camera the agents do not have.
 *
 * Owner-adopted July 29, 2026 (UNIVERSE_AUDIT.md §4.2). Agent sandboxes on
 * this Mac cannot launch Chromium; a plain terminal can. So the owner runs the
 * camera, the harness walks a declared shot list, and every visual criterion
 * afterwards points at a real pixel instead of a deferral.
 *
 *   Terminal 1:  npm run dev
 *   Terminal 2:  npm run phase10:capture -- --section 11
 *
 * Writes PNGs to docs/phase10-baseline/section-<N>/captures/ and a captioned
 * contact-sheet.md beside them. Never touches .env, never writes app state,
 * never commits. Exits non-zero if any shot fails, so a partial sheet cannot
 * be mistaken for a complete one.
 *
 * Options:
 *   --section <N>   which shot list to run            (required)
 *   --base <url>    dev server origin                 (default http://localhost:3000)
 *   --path <route>  route to capture                  (default /share, public)
 *   --only <id>     run a single shot by id
 *   --headed        watch it work
 */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : (argv[i + 1] ?? true);
};
const flag = (name) => argv.includes(`--${name}`);

const SECTION = String(arg("section", "")).replace(/^§/, "");
const BASE = String(arg("base", "http://localhost:3000")).replace(/\/$/, "");
// `/` is owner-gated; a fresh capture browser has no session and lands on the
// sign-in page. `/share` is the same universe implementation, public, and
// carries no dollar amounts — which also keeps captures secret-free, as the
// visual-truth standard requires. Override with --path when authenticated.
const ROUTE = String(arg("path", "/share"));
const ONLY = arg("only", null);
const VIEWPORT = { width: 1440, height: 900 };

if (!SECTION) {
  console.error("Usage: npm run phase10:capture -- --section 11");
  process.exit(2);
}

const OUT_DIR = path.resolve(`docs/phase10-baseline/section-${SECTION}/captures`);
const SHEET = path.resolve(`docs/phase10-baseline/section-${SECTION}/contact-sheet.md`);
const RAW_GEOMETRY = path.resolve(
  `docs/phase10-baseline/section-${SECTION}/raw-panel-geometry.json`,
);

/* ------------------------------------------------------------------ *
 * Readiness — the pinned measurement contract (spec §11.1).
 * networkidle never settles here: the routes poll quotes and run a
 * continuous animation loop. Wait on the signal the render loop emits.
 * ------------------------------------------------------------------ */
const SCENE_READY = async (page) => {
  try {
    await page.locator("canvas").waitFor({ state: "visible", timeout: 20_000 });
  } catch (error) {
    // Diagnose rather than time out anonymously. The most common cause is a
    // headless browser with no WebGL, in which case the app correctly serves
    // its no-3D fallback — which has no canvas at all. That is a harness
    // problem, not an app defect, and the message must say so.
    const diag = await page.evaluate(() => ({
      webgl: (() => {
        try {
          const c = document.createElement("canvas");
          return !!(c.getContext("webgl2") || c.getContext("webgl"));
        } catch {
          return false;
        }
      })(),
      fallback: !!document.querySelector('nav[aria-label="Portfolio bodies"]'),
      text: document.body.innerText.slice(0, 120).replace(/\s+/g, " "),
    }));
    if (!diag.webgl) {
      throw new Error(
        `no WebGL in this browser, so the app served its no-3D fallback — ` +
          `re-run with a GPU-capable browser (the harness now passes SwiftShader flags; ` +
          `if you still see this, try --headed)`,
      );
    }
    throw new Error(
      `WebGL is available but no canvas mounted within 20s` +
        `${diag.fallback ? " (fallback nav present)" : ""} — page said: "${diag.text}"`,
    );
  }
  await page.waitForFunction(
    () => document.querySelectorAll("[data-scene-ticker]").length >= 8,
    null,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(1_500); // let the ramp/position values settle
};

const clickTicker = async (page, ticker) => {
  const box = await page.evaluate((t) => {
    const el = document.querySelector(`[data-scene-ticker="${t}"]`);
    if (!el) return null;
    return { x: +el.dataset.planetCenterX, y: +el.dataset.planetCenterY };
  }, ticker);
  if (!box) throw new Error(`no planet on screen for ${ticker}`);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(2_500); // approach camera flight
};

const setPanelWidth = async (page, widthPx) => {
  await page
    .locator('aside[aria-live="polite"]')
    .first()
    .evaluate((element, width) => {
      element.style.setProperty("--panel-width", `${width}px`);
    }, widthPx);
  await page.waitForTimeout(250);
};

const holdEvidenceRotation = async (page, degrees) => {
  await page.locator('[class*="sceneMount"]').evaluate((element, value) => {
    element.dataset.evidenceRotationDegrees = String(value);
  }, degrees);
  await page.waitForTimeout(600);
};

const measureApproachGeometry = async (page, ticker, panelWidthPx) =>
  page.evaluate(
    ({ ticker: selectedTicker, panelWidth }) => {
      const planet = document.querySelector(
        `[data-scene-ticker="${selectedTicker}"]`,
      );
      const panel = document.querySelector('aside[aria-live="polite"]');
      if (!planet || !panel) return null;
      const panelRect = panel.getBoundingClientRect();
      const centerX = Number(planet.dataset.planetCenterX);
      const centerY = Number(planet.dataset.planetCenterY);
      const radius = Number(planet.dataset.planetRadiusPx);
      return {
        ticker: selectedTicker,
        requestedPanelWidthPx: panelWidth,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        disc: {
          centerX,
          centerY,
          centerFractionX: centerX / window.innerWidth,
          radius,
          right: centerX + radius,
        },
        panel: {
          left: panelRect.left,
          right: panelRect.right,
          width: panelRect.width,
        },
        gapPx: panelRect.left - (centerX + radius),
        unoccluded: centerX + radius <= panelRect.left,
        renderExposure: Number(planet.dataset.renderExposure),
      };
    },
    { ticker, panelWidth: panelWidthPx },
  );

/* ------------------------------------------------------------------ *
 * Shot lists. At most twelve per section (UNIVERSE_AUDIT.md §4.3).
 * Every caption names the criteria and ledger rows the frame evidences,
 * because a criterion that cannot say which frame proves it should not
 * have been written.
 * ------------------------------------------------------------------ */
const SHOTS = {
  11: [
    {
      id: "overview",
      caption: "OVERVIEW at 1440×900 — trail arc length (FB-03), planet spacing (FB-01), overall composition",
      url: ROUTE,
      ready: SCENE_READY,
    },
    {
      id: "panel-width-460",
      caption: "ASML selected with a 460px left-growing rail — measured left-third planet anchor and disc/panel gap (F2 / FB-07, FB-17)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        await setPanelWidth(page, 460);
      },
      measure: (page) => measureApproachGeometry(page, "ASML", 460),
    },
    {
      id: "panel-width-520",
      caption: "ASML selected with a 520px left-growing rail — owner width choice, same measured left-third planet anchor (F2 / FB-07, FB-17)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        await setPanelWidth(page, 520);
      },
      measure: (page) => measureApproachGeometry(page, "ASML", 520),
    },
    {
      id: "panel-width-580",
      caption: "ASML selected with a 580px left-growing rail — owner width choice, same measured left-third planet anchor (F2 / FB-07, FB-17)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        await setPanelWidth(page, 580);
      },
      measure: (page) => measureApproachGeometry(page, "ASML", 580),
    },
    {
      id: "asml-panel-type",
      caption: "ASML panel, full height at the default 460px — five-token type ramp legibility (F1 / FB-05) and simple information density (FB-17)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        await setPanelWidth(page, 460);
      },
      clip: "panel",
    },
    {
      id: "asml-mark-phase-0",
      caption: "ASML approach at authored mark phase 0° — camera/exposure-only visibility check (F3 / FB-04, VIS-02, DEF-02)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        await holdEvidenceRotation(page, 0);
      },
      clip: "planet",
    },
    {
      id: "asml-mark-phase-120",
      caption: "ASML approach at authored mark phase 120° — second of the three authored longitudes (F3 / FB-04, VIS-02, DEF-02)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        await holdEvidenceRotation(page, 120);
      },
      clip: "planet",
    },
    {
      id: "asml-mark-phase-240",
      caption: "ASML approach at authored mark phase 240° — third authored longitude, no texture regeneration (F3 / FB-04, VIS-02, DEF-02)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        await holdEvidenceRotation(page, 240);
      },
      clip: "planet",
    },
    {
      id: "range-30d",
      caption: "ReturnInstrument, 30D detent — compare its figure and path with SINCE BUY (F4 / BHV-15)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        // The Windows summary now also contains literal "30D" text (F6).
        // Target the chart control by role so a summary label can never make
        // this interaction capture look reachable when the detent is absent.
        await page.getByRole("button", { name: "30D" }).click({ timeout: 5_000 });
        await page.waitForTimeout(900);
      },
      clip: "panel",
    },
    {
      id: "range-since-buy",
      caption: "ReturnInstrument, SINCE BUY detent — distinct window and shape; dead MAX is absent when no older history exists (F4 / BHV-15)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        await page.getByText("SINCE BUY", { exact: false }).first().click({ timeout: 5_000 });
        await page.waitForTimeout(900);
      },
      clip: "panel",
    },
    {
      id: "news-links",
      caption: "NEWS headlines — each must be a real anchor to the article (FB-10)",
      url: ROUTE,
      ready: SCENE_READY,
      act: async (page) => {
        await clickTicker(page, "ASML");
        await page.waitForTimeout(600);
      },
      clip: "panel",
    },
  ],
};

const OWNER_ROUTE = ROUTE === "/" || ROUTE.startsWith("/?");
const skipped = (SHOTS[SECTION] ?? []).filter(
  (s) => s.ownerRouteOnly && !OWNER_ROUTE && (!ONLY || s.id === ONLY),
);
const shots = (SHOTS[SECTION] ?? [])
  .filter((s) => !ONLY || s.id === ONLY)
  .filter((s) => !s.ownerRouteOnly || OWNER_ROUTE);
if (shots.length === 0) {
  console.error(
    `No shot list for section ${SECTION}${ONLY ? ` matching --only ${ONLY}` : ""}.` +
      ` Known: ${Object.keys(SHOTS).join(", ")}`,
  );
  process.exit(2);
}

/* ------------------------------------------------------------------ */

const preflight = async () => {
  try {
    const res = await fetch(BASE, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    console.error(
      `\nCannot reach ${BASE} — ${error.message}\n\n` +
        `Start the app in another terminal first:\n    npm run dev\n\n` +
        `then re-run this command.\n`,
    );
    process.exit(3);
  }
};

const clipFor = async (page, kind) => {
  if (!kind) return undefined;
  if (kind === "panel") {
    const box = await page
      .locator('[class*="inspector"], [class*="panel"], aside')
      .first()
      .boundingBox()
      .catch(() => null);
    return box ?? undefined;
  }
  if (kind === "planet") {
    const box = await page.evaluate(() => {
      const selected = document.querySelector("[data-selected-holding]")
        ?.dataset.selectedHolding;
      const target = selected
        ? document.querySelector(`[data-scene-ticker="${selected}"]`)
        : null;
      const el = target
        ? {
            x: +target.dataset.planetCenterX,
            y: +target.dataset.planetCenterY,
            r: +target.dataset.planetRadiusPx,
          }
        : null;
      if (!el || !isFinite(el.r)) return null;
      const pad = Math.max(el.r * 1.15, 160);
      const left = Math.max(0, el.x - pad);
      const top = Math.max(0, el.y - pad);
      const right = Math.min(window.innerWidth, el.x + pad);
      const bottom = Math.min(window.innerHeight, el.y + pad);
      return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      };
    });
    return box ?? undefined;
  }
  return undefined;
};

await preflight();
await mkdir(OUT_DIR, { recursive: true });

let browser;
try {
  browser = await chromium.launch({
    headless: !flag("headed"),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // Headless Chromium has no GPU, so WebGL is unavailable and this app
      // correctly falls back to its no-3D view — which has no canvas and
      // nothing to photograph. SwiftShader gives headless a software GL
      // implementation so the real scene renders.
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
    ],
  });
} catch (error) {
  const message = error.message ?? String(error);
  const missingBinary =
    /Executable doesn't exist|please run|npx playwright install/i.test(message);
  console.error(`\nChromium could not start.\n`);
  if (missingBinary) {
    console.error(
      `The playwright library is installed but its browser binary is not —\n` +
        `they are separate downloads. Install it once:\n\n` +
        `    npx playwright install chromium\n\n` +
        `then re-run this command. Roughly 150MB, one time.\n`,
    );
  } else {
    console.error(`  ${message.split("\n")[0]}\n`);
    console.error(
      `If that mentions a sandbox, you are running inside an agent sandbox —\n` +
        `run this from a normal Terminal window instead.\n`,
    );
  }
  process.exit(4);
}
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  reducedMotion: "no-preference",
});
// Skip the first-visit orientation so every capture is of the thing itself.
await context.addInitScript(() => {
  try {
    window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  } catch {}
});

const results = [];
for (const shot of shots) {
  const page = await context.newPage();
  const file = `${shot.id}.png`;
  process.stdout.write(`  ${shot.id} … `);
  try {
    await page.goto(`${BASE}${shot.url}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    if (shot.ready) await shot.ready(page);
    if (shot.act) await shot.act(page);
    const measurement = shot.measure ? await shot.measure(page) : null;
    const clip = await clipFor(page, shot.clip);
    await page.screenshot({ path: path.join(OUT_DIR, file), clip });
    results.push({ ...shot, file, ok: true, measurement });
    process.stdout.write("ok\n");
  } catch (error) {
    const message = error.message.split("\n")[0];
    // A failed shot still photographs whatever IS on screen. A blank sheet
    // tells you nothing; a picture of the wrong thing tells you what went
    // wrong. Named -failed so it can never be mistaken for evidence.
    let salvage = null;
    try {
      salvage = `${shot.id}-failed.png`;
      await page.screenshot({ path: path.join(OUT_DIR, salvage) });
    } catch {
      salvage = null;
    }
    results.push({ ...shot, file: null, salvage, ok: false, error: message });
    process.stdout.write(`FAILED — ${message}\n`);
  } finally {
    await page.close();
  }
}
await browser.close();

const geometryMeasurements = results
  .filter((result) => result.ok && result.measurement)
  .map((result) => ({
    shot: result.id,
    ...result.measurement,
  }));
if (geometryMeasurements.length > 0) {
  await writeFile(
    RAW_GEOMETRY,
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        route: `${BASE}${ROUTE}`,
        measurements: geometryMeasurements,
      },
      null,
      2,
    )}\n`,
  );
}

const failed = results.filter((r) => !r.ok);
const stamp = new Date().toISOString().slice(0, 10);
const sheet = [
  `# §${SECTION} contact sheet`,
  ``,
  `Captured ${stamp} · ${VIEWPORT.width}×${VIEWPORT.height} @2x · \`${BASE}${ROUTE}\``,
  ROUTE === "/share"
    ? `Public route — owner-only fields (dollar amounts) are absent by design.`
    : `Owner route — this sheet may contain private figures; check before sharing.`,
  `Harness: \`npm run phase10:capture -- --section ${SECTION}\``,
  ``,
  `Owner reviews this sheet and his responses are transcribed into`,
  `\`OWNER_FEEDBACK_LEDGER.md\` as CONFIRMED or regressed rows. A row closes on`,
  `his sentence or a committed capture — never on a criteria-ledger pass.`,
  ``,
  `---`,
  ``,
  ...results.flatMap((r) =>
    r.ok
      ? [`### ${r.id}`, ``, r.caption, ``, `![${r.id}](captures/${r.file})`, ``]
      : [
          `### ${r.id} — NOT CAPTURED`,
          ``,
          r.caption,
          ``,
          `> Failed: ${r.error}`,
          ``,
          ...(r.salvage
            ? [
                `What was on screen instead (not evidence, diagnosis only):`,
                ``,
                `![${r.id} failed](captures/${r.salvage})`,
                ``,
              ]
            : []),
        ],
  ),
  `---`,
  ``,
  ...(skipped.length
    ? [
        `**Not attempted on this route (${ROUTE}):** ` +
          skipped.map((s) => `\`${s.id}\``).join(", ") +
          ` — owner-only surface. Re-run with \`--path /\` while signed in to`,
        `capture these. They are not deferred; they are out of this route's scope.`,
        ``,
      ]
    : []),
  `${results.filter((r) => r.ok).length}/${results.length} captured.`,
  failed.length
    ? `**${failed.length} failed — this sheet is incomplete and cannot support acceptance.**`
    : `Complete.`,
  ``,
].join("\n");

await writeFile(SHEET, sheet);

console.log(`\n  sheet   ${path.relative(process.cwd(), SHEET)}`);
console.log(`  frames  ${path.relative(process.cwd(), OUT_DIR)}`);
if (geometryMeasurements.length > 0) {
  console.log(`  geometry ${path.relative(process.cwd(), RAW_GEOMETRY)}`);
}
console.log(
  `\nmachine-readable: ${JSON.stringify({
    section: SECTION,
    captured: results.filter((r) => r.ok).length,
    total: results.length,
    failed: failed.map((f) => f.id),
  })}`,
);

process.exit(failed.length === 0 ? 0 : 1);
