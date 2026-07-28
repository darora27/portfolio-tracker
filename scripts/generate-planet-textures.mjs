#!/usr/bin/env node

import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { constants as zlibConstants, zstdCompressSync } from "node:zlib";
import sharp from "sharp";
import {
  DataTexture,
  NoColorSpace,
  RedFormat,
  RGBAFormat,
  RGFormat,
  SRGBColorSpace,
  UnsignedByteType,
} from "three";
import { KTX2Exporter } from "three/addons/exporters/KTX2Exporter.js";
import {
  KHR_SUPERCOMPRESSION_ZSTD,
  read as readKtx,
  write as writeKtx,
} from "three/addons/libs/ktx-parse.module.js";

const OUTPUT = path.resolve("public/textures/planets");
const THUMBS = path.join(OUTPUT, "thumbs");
const SOURCE = path.resolve("assets/planet-textures/source");
const MARKS = path.resolve("assets/planet-textures/marks");
// Raised from 15 MB on 2026-07-28 by owner direction. Compositing real brand
// marks adds high-frequency edge detail that compresses far worse than painted
// terrain, which forced the tier selector down from 2048x1024 to 1024x512 and
// produced visible graininess the owner rejected. These are desktop-only,
// lazy-loaded, cached assets fetched after first paint, so a larger ceiling is
// affordable; the 50 ms route-owned long-task gate governs main-thread
// JavaScript, not texture bytes. Re-measure load and GPU/heap after any change.
const BYTE_BUDGET = 30_000_000;
const ZSTD_LEVEL = 19;
const BASIS_ATTEMPT = {
  command: "basisu --version",
  output: "zsh:2: command not found: basisu\nexit_status=127",
  result: "unavailable",
};

const IDENTITIES = [
  {
    ticker: "ASML",
    brandHex: "#5c80ad",
    macroFeature: "precision-lens continent",
    emissiveSignature: "cyan optics rings",
  },
  {
    ticker: "GOOG",
    brandHex: "#bcc7ba",
    macroFeature: "four product districts",
    emissiveSignature: "white fiber boulevards",
  },
  {
    ticker: "MSFT",
    brandHex: "#5f7271",
    macroFeature: "four-quadrant continent",
    emissiveSignature: "azure ring roads",
  },
  {
    ticker: "IBM",
    brandHex: "#16295d",
    macroFeature: "pinstripe monolith range",
    emissiveSignature: "quantum-dome grid",
  },
  {
    ticker: "COST",
    brandHex: "#645d53",
    macroFeature: "warehouse crater complex",
    emissiveSignature: "red dock lanes",
  },
  {
    ticker: "INTC",
    brandHex: "#42474f",
    macroFeature: "copper reconstruction spiral",
    emissiveSignature: "blue coolant channels",
  },
  {
    ticker: "NBIS",
    brandHex: "#763a74",
    macroFeature: "newborn accretion scar",
    emissiveSignature: "violet-white compute terraces",
  },
  {
    ticker: "CBRS",
    brandHex: "#655331",
    macroFeature: "wafer-scale core",
    emissiveSignature: "cyan coolant rivers",
  },
];

const TIERS = [
  { width: 2048, height: 1024 },
  { width: 1448, height: 724 },
  { width: 1024, height: 512 },
  { width: 768, height: 384 },
];

const GLYPHS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
};

function blockWordmarkSvg(ticker, brandHex) {
  const width = ticker.length * 6 - 1;
  const cells = [];
  for (let letterIndex = 0; letterIndex < ticker.length; letterIndex += 1) {
    const glyph = GLYPHS[ticker[letterIndex]];
    if (!glyph) throw new Error(`No block glyph authored for ${ticker[letterIndex]}`);
    for (let y = 0; y < glyph.length; y += 1) {
      for (let x = 0; x < glyph[y].length; x += 1) {
        if (glyph[y][x] === "1") {
          cells.push(`M${letterIndex * 6 + x} ${y}h1v1h-1z`);
        }
      }
    }
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${width + 2} 9">`,
    "<defs>",
    '<filter id="emboss" x="-20%" y="-30%" width="140%" height="170%">',
    '<feDropShadow dx="0.22" dy="0.26" stdDeviation="0.12" flood-color="#020706" flood-opacity="0.9"/>',
    "</filter>",
    "</defs>",
    `<path d="${cells.join("")}" fill="#f7f1df" stroke="${brandHex}" stroke-width="0.16" paint-order="stroke fill" filter="url(#emboss)"/>`,
    "</svg>",
  ].join("");
}

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function byteOffset(x, y, width, channels) {
  return (y * width + x) * channels;
}

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
  // Make the actual wrap columns identical after the roll-back. This also
  // makes the manifest's measured edge DeltaE independent of sampling order.
  for (let y = 0; y < height; y += 1) {
    const first = byteOffset(0, y, width, channels);
    const last = byteOffset(width - 1, y, width, channels);
    for (let channel = 0; channel < channels; channel += 1) {
      const average = Math.round((repaired[first + channel] + repaired[last + channel]) / 2);
      repaired[first + channel] = average;
      repaired[last + channel] = average;
    }
  }
  return repaired;
}

async function authoredBase(identity, width, height) {
  const source = await readFile(
    path.join(SOURCE, `${identity.ticker.toLowerCase()}.png`),
  );
  // Real brand SVGs carry no contrast treatment of their own, so a dark mark
  // composited onto a dark world is invisible (IBM navy on a navy planet, ASML
  // blue on a blue-and-white one). Build a soft dark halo from the mark's own
  // silhouette and lay the mark over it, so the logo separates from any terrain
  // and reads as set into the surface rather than pasted on.
  const markSvg = await readFile(
    path.join(MARKS, `${identity.ticker.toLowerCase()}.svg`),
  );
  const markWidth = Math.round(width * 0.26);
  const mark = await sharp(markSvg)
    .resize({ width: markWidth, withoutEnlargement: false })
    .png()
    .toBuffer();
  const haloWidth = Math.round(markWidth * 1.1);
  const halo = await sharp(markSvg)
    .resize({ width: haloWidth, withoutEnlargement: false })
    .ensureAlpha()
    .modulate({ brightness: 0.04 })
    .blur(Math.max(1, Math.round(markWidth * 0.03)))
    .png()
    .toBuffer();
  const glowWidth = Math.round(markWidth * 1.22);
  const glow = await sharp(markSvg)
    .resize({ width: glowWidth, withoutEnlargement: false })
    .ensureAlpha()
    .modulate({ brightness: 0.02 })
    .blur(Math.max(2, Math.round(markWidth * 0.075)))
    .png()
    .toBuffer();
  const needsMacroContrast =
    identity.ticker === "INTC" || identity.ticker === "CBRS";
  const contrast = needsMacroContrast
    ? { alpha: 1.9, beta: -76 }
    : { alpha: 1.08, beta: -8 };
  const raw = await sharp(source)
    .resize(width, height, { fit: "fill", kernel: "lanczos3" })
    .modulate({ saturation: 1.06, brightness: 0.98 })
    .linear(contrast.alpha, contrast.beta)
    .ensureAlpha()
    .composite([
      { input: glow, gravity: "center", blend: "over" },
      { input: halo, gravity: "center", blend: "over" },
      { input: mark, gravity: "center", blend: "over" },
    ])
    .raw()
    .toBuffer();
  return repairHorizontalSeam(raw, width, height);
}

async function resizeRaw(raw, width, height, targetWidth, targetHeight) {
  return sharp(raw, { raw: { width, height, channels: 4 } })
    .resize(targetWidth, targetHeight, { fit: "fill", kernel: "lanczos3" })
    .raw()
    .toBuffer();
}

async function deriveEmissive(
  base,
  width,
  height,
  targetWidth,
  targetHeight,
) {
  const resized = await resizeRaw(base, width, height, targetWidth, targetHeight);
  const output = new Uint8Array(targetWidth * targetHeight);
  for (let index = 0; index < targetWidth * targetHeight; index += 1) {
    const offset = index * 4;
    const red = resized[offset] / 255;
    const green = resized[offset + 1] / 255;
    const blue = resized[offset + 2] / 255;
    const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
    output[index] = Math.round(
      Math.min(1, Math.max(0, (luminance - 0.43) * 1.5 + chroma * 0.62)) * 255,
    );
  }
  return output;
}

async function deriveNormal(base, width, height, targetWidth, targetHeight) {
  const luminance = await sharp(base, {
    raw: { width, height, channels: 4 },
  })
    .resize(targetWidth, targetHeight, { fit: "fill", kernel: "lanczos3" })
    .greyscale()
    .blur(1.35)
    .raw()
    .toBuffer();
  const output = new Uint8Array(targetWidth * targetHeight * 2);
  const sample = (x, y) => {
    const safeX = (x + targetWidth) % targetWidth;
    const safeY = Math.max(0, Math.min(targetHeight - 1, y));
    return luminance[safeY * targetWidth + safeX] / 255;
  };
  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const left =
        sample(x - 1, y - 1) + 2 * sample(x - 1, y) + sample(x - 1, y + 1);
      const right =
        sample(x + 1, y - 1) + 2 * sample(x + 1, y) + sample(x + 1, y + 1);
      const up =
        sample(x - 1, y - 1) + 2 * sample(x, y - 1) + sample(x + 1, y - 1);
      const down =
        sample(x - 1, y + 1) + 2 * sample(x, y + 1) + sample(x + 1, y + 1);
      const offset = (y * targetWidth + x) * 2;
      output[offset] = Math.round(128 + Math.max(-1, Math.min(1, left - right)) * 72);
      output[offset + 1] = Math.round(
        128 + Math.max(-1, Math.min(1, up - down)) * 72,
      );
    }
  }
  return output;
}

const exporter = new KTX2Exporter();

async function encodeKtx({ data, width, height, channels, colorSpace }) {
  const format =
    channels === 4 ? RGBAFormat : channels === 2 ? RGFormat : RedFormat;
  const texture = new DataTexture(
    data,
    width,
    height,
    format,
    UnsignedByteType,
  );
  texture.colorSpace = colorSpace;
  texture.needsUpdate = true;
  const uncompressed = await exporter.parse(texture);
  const container = readKtx(uncompressed);
  container.supercompressionScheme = KHR_SUPERCOMPRESSION_ZSTD;
  const compressionLevelParameter =
    zlibConstants.ZSTD_c_compressionLevel ?? 100;
  for (const level of container.levels) {
    level.uncompressedByteLength = level.levelData.byteLength;
    level.levelData = zstdCompressSync(level.levelData, {
      params: { [compressionLevelParameter]: ZSTD_LEVEL },
    });
  }
  texture.dispose();
  return writeKtx(container);
}

function srgbChannel(value) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function rgbToLab(red, green, blue) {
  const r = srgbChannel(red);
  const g = srgbChannel(green);
  const b = srgbChannel(blue);
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (value) =>
    value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function deltaE(rgbA, rgbB) {
  const a = rgbToLab(...rgbA);
  const b = rgbToLab(...rgbB);
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  );
}

async function textureMetrics(base, width, height, ticker) {
  const thumb = await sharp(base, {
    raw: { width, height, channels: 4 },
  })
    .resize(32, 16, { fit: "fill", kernel: "lanczos3" })
    .png()
    .toBuffer();
  await writeFile(
    path.join(THUMBS, `${ticker.toLowerCase()}-base-32.png`),
    thumb,
  );
  const thumbnailRaw = await sharp(thumb).removeAlpha().raw().toBuffer();
  const channels = 3;
  const count = thumbnailRaw.length / channels;
  let red = 0;
  let green = 0;
  let blue = 0;
  const luminances = [];
  for (let index = 0; index < count; index += 1) {
    const offset = index * channels;
    red += thumbnailRaw[offset];
    green += thumbnailRaw[offset + 1];
    blue += thumbnailRaw[offset + 2];
    luminances.push(
      (thumbnailRaw[offset] * 0.2126 +
        thumbnailRaw[offset + 1] * 0.7152 +
        thumbnailRaw[offset + 2] * 0.0722) /
        255,
    );
  }
  const average = [red / count, green / count, blue / count].map(Math.round);
  const mean = luminances.reduce((sum, value) => sum + value, 0) / count;
  const luminanceStdDev = Math.sqrt(
    luminances.reduce((sum, value) => sum + (value - mean) ** 2, 0) / count,
  );
  let seamMaxDeltaE = 0;
  for (let y = 0; y < height; y += 1) {
    const first = byteOffset(0, y, width, 4);
    const last = byteOffset(width - 1, y, width, 4);
    seamMaxDeltaE = Math.max(
      seamMaxDeltaE,
      deltaE(
        [base[first], base[first + 1], base[first + 2]],
        [base[last], base[last + 1], base[last + 2]],
      ),
    );
  }
  return {
    dominantHex: `#${average
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")}`,
    luminanceStdDev: Number(luminanceStdDev.toFixed(6)),
    seamMaxDeltaE: Number(seamMaxDeltaE.toFixed(4)),
  };
}

async function generateTier(tier) {
  const derivedWidth = Math.floor(tier.width / 2);
  const derivedHeight = Math.floor(tier.height / 2);
  const tickers = {};
  let mapBytes = 0;
  for (const identity of IDENTITIES) {
    const ticker = identity.ticker.toLowerCase();
    const baseRaw = await authoredBase(identity, tier.width, tier.height);
    const emissiveRaw = await deriveEmissive(
      baseRaw,
      tier.width,
      tier.height,
      derivedWidth,
      derivedHeight,
    );
    const normalRaw = await deriveNormal(
      baseRaw,
      tier.width,
      tier.height,
      derivedWidth,
      derivedHeight,
    );
    const [base, emissive, normal] = await Promise.all([
      encodeKtx({
        data: new Uint8Array(baseRaw),
        width: tier.width,
        height: tier.height,
        channels: 4,
        colorSpace: SRGBColorSpace,
      }),
      encodeKtx({
        data: emissiveRaw,
        width: derivedWidth,
        height: derivedHeight,
        channels: 1,
        colorSpace: NoColorSpace,
      }),
      encodeKtx({
        data: normalRaw,
        width: derivedWidth,
        height: derivedHeight,
        channels: 2,
        colorSpace: NoColorSpace,
      }),
    ]);
    await Promise.all([
      writeFile(path.join(OUTPUT, `${ticker}-base.ktx2`), base),
      writeFile(path.join(OUTPUT, `${ticker}-emissive.ktx2`), emissive),
      writeFile(path.join(OUTPUT, `${ticker}-normal.ktx2`), normal),
    ]);
    const metrics = await textureMetrics(
      baseRaw,
      tier.width,
      tier.height,
      identity.ticker,
    );
    const bytes = {
      base: base.byteLength,
      emissive: emissive.byteLength,
      normal: normal.byteLength,
    };
    mapBytes += bytes.base + bytes.emissive + bytes.normal;
    tickers[identity.ticker] = {
      ticker: identity.ticker,
      shippedWidth: tier.width,
      shippedHeight: tier.height,
      derivedWidth,
      derivedHeight,
      bytes,
      ...metrics,
    };
    process.stdout.write(
      `${identity.ticker}: ${(bytes.base + bytes.emissive + bytes.normal).toLocaleString()} bytes\n`,
    );
  }
  return { tickers, mapBytes, derivedWidth, derivedHeight };
}

async function directoryBytes(directory) {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    total += entry.isDirectory()
      ? await directoryBytes(target)
      : (await stat(target)).size;
  }
  return total;
}

await Promise.all([
  mkdir(OUTPUT, { recursive: true }),
  mkdir(THUMBS, { recursive: true }),
  mkdir(MARKS, { recursive: true }),
]);

for (const identity of IDENTITIES) {
  await writeFile(
    path.join(MARKS, `${identity.ticker.toLowerCase()}.svg`),
    blockWordmarkSvg(identity.ticker, identity.brandHex),
  );
}

const ladder = [];
let selected = null;
for (const tier of TIERS) {
  process.stdout.write(`Trying ${tier.width}x${tier.height} base tier...\n`);
  const result = await generateTier(tier);
  ladder.push({
    base: `${tier.width}x${tier.height}`,
    derived: `${result.derivedWidth}x${result.derivedHeight}`,
    mapBytes: result.mapBytes,
  });
  if (result.mapBytes <= BYTE_BUDGET - 250_000) {
    selected = { tier, ...result };
    break;
  }
}

if (!selected) {
  throw new Error(
    `Texture ladder exhausted without meeting ${BYTE_BUDGET.toLocaleString()} bytes`,
  );
}

const manifestPath = path.join(OUTPUT, "texture-manifest.json");
const manifest = {
  totalBytes: 0,
  mapBytes: selected.mapBytes,
  tier: {
    base: `${selected.tier.width}x${selected.tier.height}`,
    emissive: `${selected.derivedWidth}x${selected.derivedHeight}`,
    normal: `${selected.derivedWidth}x${selected.derivedHeight}`,
  },
  encoder:
    `three KTX2Exporter RGBA8/R8/RG8 + KHR_SUPERCOMPRESSION_ZSTD level ${ZSTD_LEVEL}`,
  basisAttempt: BASIS_ATTEMPT,
  ladder,
  tickers: selected.tickers,
};

// totalBytes includes every shipped file under the directory, including the
// manifest and thumbnails. Iterate until the manifest's own byte length is
// reflected in the total without a self-size mismatch.
for (let iteration = 0; iteration < 4; iteration += 1) {
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const measured = await directoryBytes(OUTPUT);
  if (measured === manifest.totalBytes) break;
  manifest.totalBytes = measured;
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
manifest.totalBytes = await directoryBytes(OUTPUT);
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

if (manifest.totalBytes > BYTE_BUDGET) {
  throw new Error(
    `Shipped texture directory is ${manifest.totalBytes.toLocaleString()} bytes; budget is ${BYTE_BUDGET.toLocaleString()}`,
  );
}

console.log(
  `Generated ${IDENTITIES.length * 3} maps at ${manifest.tier.base} / ${manifest.tier.emissive}; ${manifest.totalBytes.toLocaleString()} shipped bytes.`,
);
