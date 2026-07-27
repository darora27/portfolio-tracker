import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { read as readKtx } from "three/addons/libs/ktx-parse.module.js";

const TICKERS = ["asml", "goog", "cost", "msft", "intc", "ibm", "nbis", "cbrs"];
const MAPS = ["base", "emissive", "normal"];
const SOURCE_WIDTH = 512;
const SOURCE_HEIGHT = 256;

describe("planet texture perceptual-quality contract", () => {
  it("ships every KTX2 map at the authored source-plate dimensions", () => {
    for (const ticker of TICKERS) {
      for (const map of MAPS) {
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
        ).toEqual([SOURCE_WIDTH, SOURCE_HEIGHT]);
      }
    }
  });

  it("keeps the generator's native dimensions explicit", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "scripts/generate-planet-textures.mjs"),
      "utf8",
    );
    expect(source).toContain(`const WIDTH = ${SOURCE_WIDTH};`);
    expect(source).toContain(`const HEIGHT = ${SOURCE_HEIGHT};`);
  });
});
