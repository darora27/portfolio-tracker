/**
 * DEPLOY GATE — paste into the DevTools console ON THE DEPLOYED URL.
 *
 * DEPLOY_READINESS.md §2 lists eight checks and says no deploy is linked or
 * put on a resume until they pass on the real Vercel URL. This is that file,
 * made runnable, because a checklist nobody can execute in ten seconds is a
 * checklist that gets skipped — which is exactly how an 18-second page went
 * out the first time.
 *
 * HOW TO USE
 *   1. Open the deployed /share URL in a normal window.
 *   2. Open DevTools, paste this whole file into the Console, press Enter.
 *   3. Read the table. Any FAIL means do not send the link.
 *
 * D4 (cold instance) and D5 (repeat visit) are the pair that matters and
 * neither can be automated from inside one page load — the script tells you
 * which one you just measured and what to do for the other.
 *
 * D8 (privacy) is deliberately NOT here. It is enforced by the public-payload
 * tests, and a console script checking for dollar signs would be a weaker
 * check pretending to be the same one.
 */
(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  if (!nav) {
    console.error("No navigation timing available — reload the page first.");
    return;
  }

  const rows = [];
  const check = (id, label, value, threshold, unit = "ms") => {
    const pass = value <= threshold;
    rows.push({
      "#": id,
      Check: label,
      Measured: unit === "MB" ? `${value.toFixed(2)} MB` : `${Math.round(value)} ms`,
      Threshold: unit === "MB" ? `< ${threshold} MB` : `< ${threshold} ms`,
      Result: pass ? "PASS" : "FAIL",
    });
    return pass;
  };

  // D1-D3: the three that decide whether a stranger sees anything.
  check("D1", "Time to first byte", nav.responseStart, 1500);
  check("D2", "HTML fully streamed", nav.responseEnd, 2500);
  check("D3", "DOMContentLoaded", nav.domContentLoadedEventEnd, 3000);

  // D6: bytes over the wire. Counted to DOMContentLoaded rather than to "the
  // scene is legible", which nothing can detect automatically — so this is a
  // LOWER bound on the real figure, and is labelled as such rather than
  // quietly reported as the whole number.
  const transferred = performance
    .getEntriesByType("resource")
    .filter((entry) => entry.startTime <= nav.domContentLoadedEventEnd)
    .reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
  check("D6", "Transfer to DCL (lower bound)", (transferred + (nav.transferSize || 0)) / 1048576, 3, "MB");

  console.table(rows);

  const failed = rows.filter((row) => row.Result === "FAIL");
  if (failed.length) {
    console.error(
      `%c${failed.length} check(s) FAILED — do not link this deploy.`,
      "color:#ff8880;font-weight:bold",
    );
  } else {
    console.log(
      "%cD1-D3 and D6 pass on this load.",
      "color:#24b565;font-weight:bold",
    );
  }

  // Which of the D4/D5 pair this load actually was. A warm in-memory cache
  // making the second render fast is not a fix; it lives on one serverless
  // instance and never helps a first-time visitor.
  console.log(
    "%cStill to do by hand:",
    "font-weight:bold",
    [
      "D4 COLD: wait 15+ min idle (or deploy fresh), then load once and re-run this.",
      "D5 REPEAT: reload now and re-run. Both must pass, not just this one.",
      "D7 THROTTLED: DevTools > Network > Fast 3G, hard reload, re-run. Family open this on phones.",
      "D8 PRIVACY: npm test covers it — /share must contain zero dollar amounts.",
    ].join("\n  "),
  );

  // Handy for FB-37: confirms the 26 MB of planet maps was withheld on narrow
  // viewports rather than merely intended to be.
  const world = document.querySelector("[data-planet-textures]");
  if (world) {
    console.log(
      `Planet textures: ${world.dataset.planetTextures} (viewport ${window.innerWidth}px)`,
    );
  }

  const ktx = performance
    .getEntriesByType("resource")
    .filter((entry) => entry.name.endsWith(".ktx2"));
  console.log(
    `KTX2 requests issued: ${ktx.length} (${(
      ktx.reduce((sum, entry) => sum + (entry.transferSize || 0), 0) / 1048576
    ).toFixed(2)} MB)`,
  );
})();
