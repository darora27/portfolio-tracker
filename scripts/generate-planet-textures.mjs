#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { zstdCompressSync } from "node:zlib";
import sharp from "sharp";
import {
  DataTexture,
  NoColorSpace,
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

// Preserve the authored equirectangular plates at native resolution. These
// dimensions are a perceptual-quality contract, not a byte-budget tuning knob.
const WIDTH = 512;
const HEIGHT = 256;
const OUTPUT = path.resolve("public/textures/planets");
const SOURCE = path.resolve("assets/planet-textures/source");
const WORLDS = {
  ASML: [[24, 18, 56], [146, 91, 232], [110, 223, 244]],
  GOOG: [[10, 42, 72], [58, 148, 255], [246, 198, 64]],
  COST: [[52, 24, 18], [205, 55, 45], [245, 225, 169]],
  MSFT: [[8, 40, 62], [36, 137, 191], [98, 223, 213]],
  INTC: [[28, 35, 45], [173, 83, 39], [94, 178, 215]],
  IBM: [[10, 28, 64], [50, 95, 188], [179, 221, 255]],
  NBIS: [[34, 16, 50], [176, 46, 208], [255, 130, 53]],
  CBRS: [[22, 33, 26], [47, 142, 87], [181, 255, 108]],
};

function hashTicker(ticker) {
  let hash = 2166136261;
  for (const char of ticker) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sample(ticker, x, y) {
  const seed = hashTicker(ticker);
  const u = x / WIDTH;
  const v = y / HEIGHT;
  const latitude = Math.sin((v - 0.5) * Math.PI);
  const longitude = Math.cos(u * Math.PI * 2 + (seed % 17));
  const continents =
    Math.sin(u * Math.PI * (8 + (seed % 5)) + Math.sin(v * 11) * 1.8) +
    Math.cos(v * Math.PI * (7 + (seed % 3)) + Math.sin(u * 17) * 1.4);
  const grid =
    Math.max(0, 1 - Math.min(
      Math.abs(((u * (14 + (seed % 7))) % 1) - 0.5),
      Math.abs(((v * (8 + (seed % 5))) % 1) - 0.5),
    ) * 18);
  const relief = Math.max(0, Math.min(1, 0.5 + continents * 0.2 + latitude * 0.08));
  const emissive = Math.max(0, Math.min(1, grid * 0.7 + Math.max(0, longitude) * 0.18));
  return { relief, emissive };
}

function proceduralTextureBytes(ticker, kind) {
  const bytes = new Uint8Array(WIDTH * HEIGHT * 4);
  const [deep, mid, glow] = WORLDS[ticker];
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const offset = (y * WIDTH + x) * 4;
      const center = sample(ticker, x, y);
      if (kind === "normal") {
        const right = sample(ticker, (x + 1) % WIDTH, y).relief;
        const down = sample(ticker, x, Math.min(HEIGHT - 1, y + 1)).relief;
        bytes[offset] = Math.round(128 + (center.relief - right) * 110);
        bytes[offset + 1] = Math.round(128 + (center.relief - down) * 110);
        bytes[offset + 2] = 238;
      } else {
        const source = kind === "emissive"
          ? glow.map((channel) => channel * center.emissive)
          : deep.map(
              (channel, index) =>
                channel * (1 - center.relief) +
                mid[index] * center.relief +
                glow[index] * center.emissive * 0.28,
            );
        bytes[offset] = Math.round(Math.max(0, Math.min(255, source[0])));
        bytes[offset + 1] = Math.round(Math.max(0, Math.min(255, source[1])));
        bytes[offset + 2] = Math.round(Math.max(0, Math.min(255, source[2])));
      }
      bytes[offset + 3] = 255;
    }
  }
  return bytes;
}

async function sourceTextureBytes(ticker, kind) {
  let base;
  try {
    base = await sharp(await readFile(path.join(SOURCE, `${ticker.toLowerCase()}.png`)))
      .resize(WIDTH, HEIGHT, { fit: "fill", kernel: "lanczos3" })
      .ensureAlpha()
      .raw()
      .toBuffer();
  } catch {
    return proceduralTextureBytes(ticker, kind);
  }
  if (kind === "base") return new Uint8Array(base);

  const bytes = new Uint8Array(base.length);
  const luminanceAt = (x, y) => {
    const clampedX = (x + WIDTH) % WIDTH;
    const clampedY = Math.max(0, Math.min(HEIGHT - 1, y));
    const offset = (clampedY * WIDTH + clampedX) * 4;
    return (
      base[offset] * 0.2126 +
      base[offset + 1] * 0.7152 +
      base[offset + 2] * 0.0722
    ) / 255;
  };
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const offset = (y * WIDTH + x) * 4;
      if (kind === "emissive") {
        const strength = Math.max(0, (luminanceAt(x, y) - 0.46) / 0.54);
        bytes[offset] = Math.round(base[offset] * strength);
        bytes[offset + 1] = Math.round(base[offset + 1] * strength);
        bytes[offset + 2] = Math.round(base[offset + 2] * strength);
      } else {
        const dx = luminanceAt(x - 1, y) - luminanceAt(x + 1, y);
        const dy = luminanceAt(x, y - 1) - luminanceAt(x, y + 1);
        bytes[offset] = Math.round(128 + dx * 88);
        bytes[offset + 1] = Math.round(128 + dy * 88);
        bytes[offset + 2] = 238;
      }
      bytes[offset + 3] = 255;
    }
  }
  return bytes;
}

await mkdir(OUTPUT, { recursive: true });
const exporter = new KTX2Exporter();
for (const ticker of Object.keys(WORLDS)) {
  for (const kind of ["base", "emissive", "normal"]) {
    const texture = new DataTexture(
      await sourceTextureBytes(ticker, kind),
      WIDTH,
      HEIGHT,
      RGBAFormat,
      UnsignedByteType,
    );
    texture.colorSpace = kind === "normal" ? NoColorSpace : SRGBColorSpace;
    texture.needsUpdate = true;
    const uncompressed = await exporter.parse(texture);
    const container = readKtx(uncompressed);
    container.supercompressionScheme = KHR_SUPERCOMPRESSION_ZSTD;
    for (const level of container.levels) {
      level.uncompressedByteLength = level.levelData.byteLength;
      level.levelData = zstdCompressSync(level.levelData);
    }
    await writeFile(
      path.join(OUTPUT, `${ticker.toLowerCase()}-${kind}.ktx2`),
      writeKtx(container),
    );
    texture.dispose();
  }
}

console.log(`Generated ${Object.keys(WORLDS).length * 3} KTX2 maps in ${OUTPUT}`);
