#!/usr/bin/env node
// FB-02 (§13), move 3: offline-generated nebula filament texture, following
// generate-planet-textures.mjs's precedent (asset built offline, committed
// under public/textures/, KTX2Exporter + KHR_SUPERCOMPRESSION_ZSTD, budget
// checked). This is a single small procedural filament alpha mask, not a
// branded planet composite -- there is no source photograph to author from,
// so the RGB channel ships flat white (the runtime material's own
// gold/ember tint multiplies it, same sign->hue encoding as before) and the
// alpha channel carries the filament density.

import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { constants as zlibConstants, zstdCompressSync } from "node:zlib";
import {
  DataTexture,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
} from "three";
import { KTX2Exporter } from "three/addons/exporters/KTX2Exporter.js";
import {
  KHR_SUPERCOMPRESSION_ZSTD,
  read as readKtx,
  write as writeKtx,
} from "three/addons/libs/ktx-parse.module.js";

const OUTPUT_DIR = path.resolve("public/textures/nebula");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "filament.ktx2");
const WIDTH = 512;
const HEIGHT = 256;
const ZSTD_LEVEL = 19;
// Shared with generate-planet-textures.mjs's public/textures/ ceiling --
// this asset adds tens of KB against ~23 MB already shipped, nowhere near
// the limit, but the check stays honest rather than assumed.
const BYTE_BUDGET = 30_000_000;

// Deterministic PRNG (mulberry32) so the shipped asset is reproducible byte
// for byte from source, unlike Math.random().
function mulberry32(seed) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothNoise2D(random, width, height, cellsX, cellsY) {
  const gridW = cellsX + 1;
  const gridH = cellsY + 1;
  const grid = new Float32Array(gridW * gridH);
  for (let index = 0; index < grid.length; index += 1) grid[index] = random();
  const output = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const gy = (y / height) * cellsY;
    const y0 = Math.floor(gy);
    const ty = gy - y0;
    for (let x = 0; x < width; x += 1) {
      const gx = (x / width) * cellsX;
      const x0 = Math.floor(gx);
      const tx = gx - x0;
      const topLeft = grid[y0 * gridW + x0];
      const topRight = grid[y0 * gridW + x0 + 1];
      const bottomLeft = grid[(y0 + 1) * gridW + x0];
      const bottomRight = grid[(y0 + 1) * gridW + x0 + 1];
      const top = topLeft + (topRight - topLeft) * tx;
      const bottom = bottomLeft + (bottomRight - bottomLeft) * tx;
      output[y * width + x] = top + (bottom - top) * ty;
    }
  }
  return output;
}

function filamentAlphaMask(width, height) {
  const random = mulberry32(0x4e45_425f);
  // Layered smooth noise at three frequencies, stretched horizontally, to
  // read as wispy filaments rather than an isotropic cloud.
  const low = smoothNoise2D(random, width, height, 4, 2);
  const mid = smoothNoise2D(random, width, height, 9, 3);
  const high = smoothNoise2D(random, width, height, 18, 5);
  const output = new Uint8Array(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    const combined = low[index] * 0.5 + mid[index] * 0.33 + high[index] * 0.17;
    // Sharpen into discrete filament bands rather than a flat wash.
    const sharpened = Math.pow(Math.max(0, combined - 0.28) / 0.72, 1.6);
    const alpha = Math.round(Math.min(1, sharpened) * 255);
    const offset = index * 4;
    output[offset] = 255;
    output[offset + 1] = 255;
    output[offset + 2] = 255;
    output[offset + 3] = alpha;
  }
  return output;
}

const exporter = new KTX2Exporter();

async function encodeKtx(data, width, height) {
  const texture = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  const uncompressed = await exporter.parse(texture);
  const container = readKtx(uncompressed);
  container.supercompressionScheme = KHR_SUPERCOMPRESSION_ZSTD;
  const compressionLevelParameter = zlibConstants.ZSTD_c_compressionLevel ?? 100;
  for (const level of container.levels) {
    level.uncompressedByteLength = level.levelData.byteLength;
    level.levelData = zstdCompressSync(level.levelData, {
      params: { [compressionLevelParameter]: ZSTD_LEVEL },
    });
  }
  texture.dispose();
  return writeKtx(container);
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

await mkdir(OUTPUT_DIR, { recursive: true });
const raw = filamentAlphaMask(WIDTH, HEIGHT);
const ktx2 = await encodeKtx(raw, WIDTH, HEIGHT);
await writeFile(OUTPUT_FILE, ktx2);

const publicTexturesRoot = path.resolve("public/textures");
const totalBytes = await directoryBytes(publicTexturesRoot);
if (totalBytes > BYTE_BUDGET) {
  throw new Error(
    `public/textures is ${totalBytes.toLocaleString()} bytes; budget is ${BYTE_BUDGET.toLocaleString()}`,
  );
}

console.log(
  `Generated nebula filament texture: ${ktx2.byteLength.toLocaleString()} bytes at ${OUTPUT_FILE}. public/textures total: ${totalBytes.toLocaleString()} / ${BYTE_BUDGET.toLocaleString()}.`,
);
