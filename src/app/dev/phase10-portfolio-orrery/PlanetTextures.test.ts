import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { read as readKtx } from "three/addons/libs/ktx-parse.module.js";

const TICKERS = ["asml", "goog", "cost", "msft", "intc", "ibm", "nbis", "cbrs"];
const manifest = JSON.parse(
  readFileSync(
    path.resolve("public/textures/planets/texture-manifest.json"),
    "utf8",
  ),
) as {
  tier: { base: string; emissive: string; normal: string };
};

function dimensions(tier: string): [number, number] {
  return tier.split("x").map(Number) as [number, number];
}

describe("planet texture perceptual-quality contract", () => {
  it("ships every KTX2 map at the measured manifest tier", () => {
    for (const ticker of TICKERS) {
      for (const map of ["base", "emissive", "normal"] as const) {
        const texture = readKtx(
          readFileSync(
            path.resolve(
              process.cwd(),
              `public/textures/planets/${ticker}-${map}.ktx2`,
            ),
          ),
        );
        expect(
          [texture.pixelWidth, texture.pixelHeight],
          `${ticker}-${map}`,
        ).toEqual(dimensions(manifest.tier[map]));
      }
    }
  });

  it("archives every authored source plate at 2048x1024", async () => {
    for (const ticker of TICKERS) {
      expect(
        await sharp(
          path.resolve(`assets/planet-textures/source/${ticker}.png`),
        ).metadata(),
      ).toMatchObject({ width: 2048, height: 1024 });
    }
  });
});
