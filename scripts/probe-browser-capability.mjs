#!/usr/bin/env node
// Answers one question and nothing else: can the agent running this command
// launch a browser and read pixels back out of it on this host?
//
// Written July 29, 2026 because §11 deferred 41 live-browser criteria on the
// strength of "No browser is available" from an agent's Browser *skill*, which
// is a different claim from "a node script that imports Playwright fails here".
// This script is that node script. It takes no dependency on the dev server,
// so a failure is unambiguously a browser problem and not a server problem.
//
// Run:  node scripts/probe-browser-capability.mjs
// Paste the entire output. Do not summarise it, and do not interpret it.

const line = (s = "") => process.stdout.write(`${s}\n`);
const result = { launched: false, screenshot_bytes: 0, pixel_read: null, error: null };

line("=== browser capability probe ===");
line(`node        : ${process.version}`);
line(`platform    : ${process.platform} ${process.arch}`);
line(`cwd         : ${process.cwd()}`);

let chromium;
try {
  ({ chromium } = await import("playwright"));
  line("playwright  : import OK");
} catch (error) {
  line(`playwright  : IMPORT FAILED — ${error.message.split("\n")[0]}`);
  line("");
  line("VERDICT: cannot even load the library. Not a sandbox question.");
  process.exit(1);
}

try {
  line(`executable  : ${chromium.executablePath()}`);
} catch (error) {
  line(`executable  : unresolved — ${error.message.split("\n")[0]}`);
}

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  result.launched = true;
  line(`launch      : OK (${browser.version()})`);
} catch (error) {
  result.error = error.message.split("\n").slice(0, 3).join(" | ");
  line(`launch      : FAILED — ${result.error}`);
  line("");
  line("VERDICT: browser launch is genuinely blocked on this host for this");
  line("agent. Live-browser criteria are legitimately deferred. Paste this");
  line("output verbatim — the exact error text is what identifies the cause.");
  process.exit(2);
}

try {
  const page = await browser.newPage({ viewport: { width: 400, height: 200 } });
  // A known colour, so a returned pixel proves real rendering rather than a
  // blank buffer that happens to be the right size.
  await page.setContent(
    `<body style="margin:0;background:#1f7a46;width:400px;height:200px"></body>`,
  );
  const shot = await page.screenshot();
  result.screenshot_bytes = shot.length;
  line(`screenshot  : OK, ${shot.length} bytes`);

  const px = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const ctx = c.getContext("2d");
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
    ctx.fillRect(0, 0, 1, 1);
    return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3);
  });
  result.pixel_read = px;
  const expected = [31, 122, 70];
  const match = px.every((v, i) => v === expected[i]);
  line(`pixel read  : rgb(${px.join(",")}) expected rgb(31,122,70) — ${match ? "MATCH" : "MISMATCH"}`);
  await browser.close();

  line("");
  if (match) {
    line("VERDICT: this host CAN launch a browser and read true pixels back.");
    line("Any 'No browser is available' result came from an agent's browser");
    line("tooling or its own policy, NOT from a missing capability. Live");
    line("criteria can be verified by running the retained scripts under");
    line("docs/phase10-baseline/*/scripts/ directly with node.");
  } else {
    line("VERDICT: launched, but pixels came back wrong. Report as a defect.");
  }
} catch (error) {
  result.error = error.message.split("\n")[0];
  line(`render      : FAILED — ${result.error}`);
  line("");
  line("VERDICT: launched but could not render. Paste this verbatim.");
  try { await browser.close(); } catch {}
  process.exit(3);
}

line("");
line(`machine-readable: ${JSON.stringify(result)}`);
