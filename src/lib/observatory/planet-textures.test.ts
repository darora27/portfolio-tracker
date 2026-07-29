import {
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { read as readKtx } from "three/addons/libs/ktx-parse.module.js";
import { describe, expect, it } from "vitest";
import { PLANET_IDENTITIES } from "./planet-identity";

type TextureManifest = {
  totalBytes: number;
  tier: {
    base: string;
    emissive: string;
    normal: string;
  };
  tickers: Record<
    string,
    {
      ticker: string;
      shippedWidth: number;
      shippedHeight: number;
      derivedWidth: number;
      derivedHeight: number;
      bytes: { base: number; emissive: number; normal: number };
      markCapitals: {
        count: number;
        longitudeDegrees: number[];
        latitudeDegrees: number;
        widthFraction: number;
        edgeTreatment: string;
        chirality: string;
      };
      dominantHex: string;
      luminanceStdDev: number;
      seamMaxDeltaE: number;
    }
  >;
};

const textureDirectory = path.resolve("public/textures/planets");
const manifest = JSON.parse(
  readFileSync(path.join(textureDirectory, "texture-manifest.json"), "utf8"),
) as TextureManifest;

function srgbChannel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function rgbToLab(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = srgbChannel((value >> 16) & 255);
  const green = srgbChannel((value >> 8) & 255);
  const blue = srgbChannel(value & 255);
  const x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047;
  const y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  const z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883;
  const f = (channel: number) =>
    channel > 0.008856
      ? Math.cbrt(channel)
      : 7.787 * channel + 16 / 116;
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function deltaE(aHex: string, bHex: string): number {
  const a = rgbToLab(aHex);
  const b = rgbToLab(bHex);
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
      (a[1] - b[1]) ** 2 +
      (a[2] - b[2]) ** 2,
  );
}

function directoryBytes(directory: string): number {
  return readdirSync(directory, { withFileTypes: true }).reduce(
    (total, entry) => {
      const target = path.join(directory, entry.name);
      return (
        total +
        (entry.isDirectory()
          ? directoryBytes(target)
          : statSync(target).size)
      );
    },
    0,
  );
}

describe("authored planet texture manifest", () => {
  it("keeps all eight worlds recognizable at the committed 32-pixel proxy", async () => {
    for (const identity of PLANET_IDENTITIES) {
      const entry = manifest.tickers[identity.ticker];
      expect(entry).toBeDefined();
      expect(
        deltaE(entry.dominantHex, identity.brandHex),
        `${identity.ticker} dominant texture hue`,
      ).toBeLessThanOrEqual(
        12,
      );
      expect(entry.luminanceStdDev).toBeGreaterThanOrEqual(0.1);
      expect(entry.seamMaxDeltaE).toBeLessThanOrEqual(6);
      expect(entry.markCapitals).toMatchObject({
        count: 3,
        longitudeDegrees: [-120, 0, 120],
        latitudeDegrees: 0,
        widthFraction: 0.24,
        edgeTreatment: "blur-threshold erosion",
        chirality: "source-forward before seam repair for DataTexture UV",
      });

      const thumbnail = sharp(
        path.join(
          textureDirectory,
          "thumbs",
          `${identity.ticker.toLowerCase()}-base-32.png`,
        ),
      );
      expect(await thumbnail.metadata()).toMatchObject({
        width: 32,
        height: 16,
      });
    }
  });

  it("matches the recorded tier to every real KTX2 container", () => {
    for (const identity of PLANET_IDENTITIES) {
      const entry = manifest.tickers[identity.ticker];
      expect(`${entry.shippedWidth}x${entry.shippedHeight}`).toBe(
        manifest.tier.base,
      );
      expect(`${entry.derivedWidth}x${entry.derivedHeight}`).toBe(
        manifest.tier.emissive,
      );
      for (const kind of ["base", "emissive", "normal"] as const) {
        const target = path.join(
          textureDirectory,
          `${identity.ticker.toLowerCase()}-${kind}.ktx2`,
        );
        expect(statSync(target).size).toBe(entry.bytes[kind]);
        const container = readKtx(new Uint8Array(readFileSync(target)));
        const expectedWidth =
          kind === "base" ? entry.shippedWidth : entry.derivedWidth;
        const expectedHeight =
          kind === "base" ? entry.shippedHeight : entry.derivedHeight;
        expect(container.pixelWidth).toBe(expectedWidth);
        expect(container.pixelHeight).toBe(expectedHeight);
      }
    }
  });

  it("records the exact on-disk directory total below the binding budget", () => {
    expect(directoryBytes(textureDirectory)).toBe(manifest.totalBytes);
    expect(manifest.totalBytes).toBeLessThanOrEqual(30_000_000);
  });
});
