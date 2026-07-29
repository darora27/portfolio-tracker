// Round-5 review probe. Both owner-authorised bucket-A remediations changed the
// shipped artifacts but neither moved its own measurement. Before treating that
// as "the fix is wrong", this probe establishes that each fix DID land, so the
// remaining explanation has to be the measurement, not the change.
//
// F3b / DEF-02 half: the generator now applies sharp().flop() to the MSFT and
// CBRS mark alphas only. This measures (a) how much that flop changes the mark
// alpha the generator composites, and (b) how much the shipped 32x16 base
// thumbnail changed for those two worlds versus an untouched control (GOOG).
//
// F1 / TST-03 half: prints the raw red-channel cross-section perpendicular to
// the ribbon at each holding's published trail sample point, read from the
// round-5 overview capture. A world that passes shows a wide plateau at the
// model colour's red channel; NBIS shows no plateau at any width.
//
// Measurement only. No application source and no retained verifier is changed.
// Usage: node <this file>   (reads committed artifacts; needs no server)
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("docs/phase10-baseline/section-10/claude-review-5");
const PRIOR_CANDIDATE = "0ef1433";
const BASE_TIER_WIDTH = 1448;
const MARK_WIDTH_FRACTION = 0.24;

// --- Did the mark flop change what the generator composites? ---
const markAlphaDelta = {};
for (const ticker of ["msft", "cbrs", "goog"]) {
  const svg = path.resolve("assets/planet-textures/marks", `${ticker}.svg`);
  const width = Math.round(BASE_TIER_WIDTH * MARK_WIDTH_FRACTION);
  const render = async (flop) => {
    let pipeline = sharp(svg).resize({ width, withoutEnlargement: false });
    if (flop) pipeline = pipeline.flop();
    return pipeline
      .ensureAlpha()
      .extractChannel("alpha")
      .blur(Math.max(0.5, width * 0.006))
      .raw()
      .toBuffer({ resolveWithObject: true });
  };
  const forward = await render(false);
  const flopped = await render(true);
  let total = 0;
  for (let index = 0; index < forward.data.length; index += 1) {
    total += Math.abs(forward.data[index] - flopped.data[index]);
  }
  markAlphaDelta[ticker.toUpperCase()] = {
    alphaSize: `${forward.info.width}x${forward.info.height}`,
    sourceForwardVsFloppedMeanAbsDiff: Number(
      (total / forward.data.length).toFixed(3),
    ),
  };
}

// --- Did that reach the shipped texture? Compare thumbnails across the fix. ---
const thumbnailDelta = {};
for (const ticker of ["msft", "cbrs", "goog"]) {
  const shipped = `public/textures/planets/thumbs/${ticker}-base-32.png`;
  const prior = execFileSync(
    "git",
    ["show", `${PRIOR_CANDIDATE}:${shipped}`],
    { maxBuffer: 1 << 24 },
  );
  const grey = (input, flop) => {
    const pipeline = sharp(input);
    return (flop ? pipeline.flop() : pipeline)
      .removeAlpha()
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
  };
  const before = await grey(prior, false);
  const after = await grey(shipped, false);
  const afterFlopped = await grey(shipped, true);
  const meanAbs = (left, right) => {
    let total = 0;
    for (let index = 0; index < left.length; index += 1) {
      total += Math.abs(left[index] - right[index]);
    }
    return Number((total / left.length).toFixed(3));
  };
  thumbnailDelta[ticker.toUpperCase()] = {
    size: `${before.info.width}x${before.info.height}`,
    priorVsShipped: meanAbs(before.data, after.data),
    priorVsFlopOfShipped: meanAbs(before.data, afterFlopped.data),
    remediated: ticker !== "goog",
  };
}

// --- Ribbon cross-sections at each published trail sample point ---
const { readFile } = await import("node:fs/promises");
const mechanism = JSON.parse(
  await readFile(path.join(outDir, "raw-trail-mechanism.json"), "utf8"),
);
const overview = path.join(outDir, "trail-mechanism-overview.png");
const { data, info } = await sharp(overview)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const redAt = (x, y) => {
  const sx = Math.max(0, Math.min(info.width - 1, x));
  const sy = Math.max(0, Math.min(info.height - 1, y));
  return data[(sy * info.width + sx) * 3];
};
const crossSections = mechanism.rows.map((row) => {
  const [x, y] = row.screenGeometry.samplePoint;
  const sx = Math.round(x);
  const sy = Math.round(y);
  const modelRed = Number.parseInt(row.expected.slice(1, 3), 16);
  const profile = [];
  for (let offset = -24; offset <= 24; offset += 1) {
    profile.push(redAt(sx + offset, sy));
  }
  return {
    ticker: row.ticker,
    expected: row.expected,
    modelRedChannel: modelRed,
    peakRedInCrossSection: Math.max(...profile),
    pixelsWithinTwoOfModelRed: profile.filter(
      (value) => Math.abs(value - modelRed) <= 2,
    ).length,
    redProfileMinus24ToPlus24: profile,
  };
});

const output = {
  note:
    "Establishes that both owner-authorised bucket-A changes reached the shipped artifacts, and shows the ribbon cross-section that explains TST-03's remaining NBIS failure. Measurement only; no verifier or application source touched.",
  priorCandidate: PRIOR_CANDIDATE,
  f3bMarkAlphaDelta: markAlphaDelta,
  f3bShippedThumbnailDelta: thumbnailDelta,
  f1RibbonCrossSections: crossSections,
};
await writeFile(
  path.join(outDir, "raw-remediation-landed.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(JSON.stringify(output, null, 2));
