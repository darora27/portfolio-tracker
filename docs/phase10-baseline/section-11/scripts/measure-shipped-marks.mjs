import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { read as readKtx } from "three/addons/libs/ktx-parse.module.js";
import { ZSTDDecoder } from "three/addons/libs/zstddec.module.js";

const ROOT = process.cwd();
const TEXTURES = path.resolve(ROOT, "public/textures/planets");
const SOURCES = path.resolve(ROOT, "assets/planet-textures/source");
const MARKS = path.resolve(ROOT, "assets/planet-textures/marks");
const OUTPUT_JSON = path.resolve(
  ROOT,
  "docs/phase10-baseline/section-11/raw-shipped-mark-measurement.json",
);
const OUTPUT_IMAGE = path.resolve(
  ROOT,
  "docs/phase10-baseline/section-11/captures/all-eight-texture-marks.png",
);

const IDENTITIES = [
  { ticker: "ASML", brandHex: "#5c80ad" },
  { ticker: "GOOG", brandHex: "#bcc7ba" },
  {
    ticker: "MSFT",
    brandHex: "#5f7271",
    markUvCorrection: "horizontal-flip",
  },
  {
    ticker: "IBM",
    brandHex: "#16295d",
    relightHex: "#8fa3d6",
    contrast: { alpha: 1.18, beta: 6 },
  },
  {
    ticker: "COST",
    brandHex: "#645d53",
    relightHex: "#8a8274",
    contrast: { alpha: 1.22, beta: 4 },
  },
  {
    ticker: "INTC",
    brandHex: "#42474f",
    relightHex: "#5a6270",
    contrast: { alpha: 2.05, beta: -82 },
  },
  {
    ticker: "NBIS",
    brandHex: "#763a74",
    relightHex: "#a05a9e",
    contrast: { alpha: 1.18, beta: 5 },
  },
  {
    ticker: "CBRS",
    brandHex: "#655331",
    relightHex: "#9c7d3f",
    contrast: { alpha: 2.15, beta: -88 },
    markUvCorrection: "horizontal-flip",
  },
];

const byteOffset = (x, y, width, channels) =>
  (y * width + x) * channels;

function rollHorizontal(input, width, height, channels, shift) {
  const output = Buffer.allocUnsafe(input.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = (x + shift + width) % width;
      const sourceOffset = byteOffset(sourceX, y, width, channels);
      const targetOffset = byteOffset(x, y, width, channels);
      for (let channel = 0; channel < channels; channel += 1) {
        output[targetOffset + channel] = input[sourceOffset + channel];
      }
    }
  }
  return output;
}

function repairHorizontalSeam(input, width, height, channels = 4) {
  const half = Math.floor(width / 2);
  const band = Math.max(8, Math.round(width * 0.012));
  const rolled = rollHorizontal(input, width, height, channels, half);
  for (let y = 0; y < height; y += 1) {
    const leftOffset = byteOffset(half - band, y, width, channels);
    const rightOffset = byteOffset(half + band, y, width, channels);
    for (let x = half - band; x <= half + band; x += 1) {
      const mix = (x - (half - band)) / (band * 2);
      const offset = byteOffset(x, y, width, channels);
      for (let channel = 0; channel < channels; channel += 1) {
        rolled[offset + channel] = Math.round(
          rolled[leftOffset + channel] * (1 - mix) +
            rolled[rightOffset + channel] * mix,
        );
      }
    }
  }
  const repaired = rollHorizontal(rolled, width, height, channels, width - half);
  for (let y = 0; y < height; y += 1) {
    const first = byteOffset(0, y, width, channels);
    const last = byteOffset(width - 1, y, width, channels);
    for (let channel = 0; channel < channels; channel += 1) {
      const average = Math.round(
        (repaired[first + channel] + repaired[last + channel]) / 2,
      );
      repaired[first + channel] = average;
      repaired[last + channel] = average;
    }
  }
  return repaired;
}

async function terrain(identity, width, height) {
  const source = await readFile(
    path.join(SOURCES, `${identity.ticker.toLowerCase()}.png`),
  );
  const contrast = identity.contrast ?? { alpha: 1.08, beta: -8 };
  return sharp(source)
    .resize(width, height, { fit: "fill", kernel: "lanczos3" })
    .modulate({ saturation: 1.06, brightness: 0.98 })
    .linear(contrast.alpha, contrast.beta)
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function markMask(identity, markWidth, shouldFlip) {
  const source = await readFile(
    path.join(MARKS, `${identity.ticker.toLowerCase()}.svg`),
  );
  let pipeline = sharp(source).resize({
    width: markWidth,
    withoutEnlargement: false,
  });
  if (shouldFlip) pipeline = pipeline.flop();
  const png = await pipeline
    .ensureAlpha()
    .extractChannel("alpha")
    .blur(Math.max(0.5, markWidth * 0.006))
    .threshold(184)
    .png()
    .toBuffer();
  const metadata = await sharp(png).metadata();
  if (!metadata.height) throw new Error(`${identity.ticker}: mark height missing`);
  return {
    png,
    raw: await sharp(png).raw().toBuffer(),
    height: metadata.height,
  };
}

async function expectedBase(identity, width, height, shouldFlip) {
  const rawTerrain = await terrain(identity, width, height);
  const markWidth = Math.round(width * 0.24);
  const mark = await markMask(identity, markWidth, shouldFlip);
  const markTop = Math.round(height / 2 - mark.height / 2);
  const composites = [];
  for (const center of [1 / 6, 1 / 2, 5 / 6]) {
    const left = Math.round(width * center - markWidth / 2);
    const tintedTerrain = await sharp(rawTerrain, {
      raw: { width, height, channels: 4 },
    })
      .extract({ left, top: markTop, width: markWidth, height: mark.height })
      .removeAlpha()
      .tint(identity.relightHex ?? identity.brandHex)
      .linear(1.35, 34)
      .raw()
      .toBuffer();
    const marked = await sharp(tintedTerrain, {
      raw: { width: markWidth, height: mark.height, channels: 3 },
    })
      .joinChannel(mark.raw, {
        raw: { width: markWidth, height: mark.height, channels: 1 },
      })
      .png()
      .toBuffer();
    composites.push({ input: marked, left, top: markTop, blend: "over" });
  }
  const composited = await sharp(rawTerrain, {
    raw: { width, height, channels: 4 },
  })
    .composite(composites)
    .raw()
    .toBuffer();
  return {
    data: repairHorizontalSeam(composited, width, height),
    markWidth,
    markHeight: mark.height,
    markTop,
    markMaskCoverage:
      mark.raw.reduce((count, value) => count + (value > 0 ? 1 : 0), 0) /
      mark.raw.length,
  };
}

async function decodeBase(ticker, decoder) {
  const bytes = await readFile(
    path.join(TEXTURES, `${ticker.toLowerCase()}-base.ktx2`),
  );
  const container = readKtx(new Uint8Array(bytes));
  const level = container.levels[0];
  const decoded = decoder.decode(
    level.levelData,
    level.uncompressedByteLength,
  );
  return {
    data: Buffer.from(decoded),
    width: container.pixelWidth,
    height: container.pixelHeight,
  };
}

function compare(actual, expected) {
  let mismatchedBytes = 0;
  let absoluteError = 0;
  for (let index = 0; index < actual.length; index += 1) {
    const difference = Math.abs(actual[index] - expected[index]);
    if (difference > 0) mismatchedBytes += 1;
    absoluteError += difference;
  }
  return {
    mismatchedBytes,
    meanAbsoluteError: absoluteError / actual.length,
  };
}

function changedPixels(marked, unmarked) {
  let count = 0;
  for (let index = 0; index < marked.length; index += 4) {
    if (
      marked[index] !== unmarked[index] ||
      marked[index + 1] !== unmarked[index + 1] ||
      marked[index + 2] !== unmarked[index + 2]
    ) {
      count += 1;
    }
  }
  return count;
}

const decoder = new ZSTDDecoder();
await decoder.init();
const measurements = [];
const tiles = [];

for (const identity of IDENTITIES) {
  const actual = await decodeBase(identity.ticker, decoder);
  const normalFlip = identity.markUvCorrection === "horizontal-flip";
  const normal = await expectedBase(
    identity,
    actual.width,
    actual.height,
    normalFlip,
  );
  const mirrored = await expectedBase(
    identity,
    actual.width,
    actual.height,
    !normalFlip,
  );
  const unmarked = repairHorizontalSeam(
    await terrain(identity, actual.width, actual.height),
    actual.width,
    actual.height,
  );
  const normalComparison = compare(actual.data, normal.data);
  const mirroredComparison = compare(actual.data, mirrored.data);
  const affectedPixels = changedPixels(actual.data, unmarked);
  const pass =
    normalComparison.mismatchedBytes === 0 &&
    mirroredComparison.mismatchedBytes > 0 &&
    affectedPixels > 0;
  const failureReason =
    normalComparison.mismatchedBytes > 0
      ? "shipped bytes do not match the authored normal mask"
      : affectedPixels === 0
        ? "mark compositor changes no shipped pixels"
        : mirroredComparison.mismatchedBytes === 0
          ? normal.markMaskCoverage > 0.98
            ? "supplied SVG alpha is an opaque rectangle; no mark shape reaches the texture"
            : "normal and mirrored mark masks are indistinguishable"
          : null;
  measurements.push({
    ticker: identity.ticker,
    width: actual.width,
    height: actual.height,
    markWidth: normal.markWidth,
    markHeight: normal.markHeight,
    markMaskCoverage: Number(normal.markMaskCoverage.toFixed(6)),
    affectedPixels,
    normalComparison,
    mirroredComparison,
    chirality: normalFlip ? "preflopped" : "source-forward",
    failureReason,
    pass,
  });

  const left = Math.round(actual.width / 2 - normal.markWidth / 2);
  const patch = await sharp(actual.data, {
    raw: { width: actual.width, height: actual.height, channels: 4 },
  })
    .extract({
      left,
      top: normal.markTop,
      width: normal.markWidth,
      height: normal.markHeight,
    })
    .resize(176, 96, { fit: "contain", background: "#020706" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="176" height="120" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="176" height="120" fill="#020706"/>` +
      `<text x="8" y="16" fill="#fff0cf" font-family="monospace" font-size="13">${identity.ticker}</text>` +
      `</svg>`,
  );
  tiles.push(
    await sharp(label)
      .composite([{ input: patch, left: 0, top: 24 }])
      .png()
      .toBuffer(),
  );
}

await mkdir(path.dirname(OUTPUT_IMAGE), { recursive: true });
await sharp({
  create: {
    width: tiles.length * 176,
    height: 120,
    channels: 4,
    background: "#020706",
  },
})
  .composite(
    tiles.map((input, index) => ({
      input,
      left: index * 176,
      top: 0,
    })),
  )
  .png()
  .toFile(OUTPUT_IMAGE);

const result = {
  criterion: "VIS-02 / DEF-02 pre-render texture check",
  textureFilesChanged: false,
  outputImage: path.relative(ROOT, OUTPUT_IMAGE),
  measurements,
  blocker: measurements
    .filter(({ pass }) => !pass)
    .map(({ ticker, failureReason }) => ({ ticker, failureReason })),
  pass: measurements.every(({ pass }) => pass),
};
await writeFile(OUTPUT_JSON, `${JSON.stringify(result, null, 2)}\n`);
console.log(`machine-readable: ${JSON.stringify(result)}`);
process.exit(result.pass ? 0 : 1);
