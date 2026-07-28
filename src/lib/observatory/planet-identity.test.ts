import { describe, expect, it } from "vitest";
import {
  PLANET_IDENTITIES,
  OBSERVATORY_TEXT_CONTRASTS,
  planetIdentityForTicker,
} from "./planet-identity";

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const value = Number.parseInt(hex.slice(1), 16);
    const red = channel((value >> 16) & 255);
    const green = channel((value >> 8) & 255);
    const blue = channel(value & 255);
    return red * 0.2126 + green * 0.7152 + blue * 0.0722;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("planet identity table", () => {
  it("declares exactly the eight authored worlds and two non-colour signals", () => {
    expect(PLANET_IDENTITIES.map(({ ticker }) => ticker)).toEqual([
      "ASML",
      "GOOG",
      "MSFT",
      "IBM",
      "COST",
      "INTC",
      "NBIS",
      "CBRS",
    ]);
    for (const identity of PLANET_IDENTITIES) {
      expect(identity.macroFeature.length).toBeGreaterThan(5);
      expect(identity.emissiveSignature.length).toBeGreaterThan(5);
      expect(planetIdentityForTicker(identity.ticker)).toEqual(identity);
    }
  });

  it("keeps every label token readable on both label-chip surfaces", () => {
    for (const { labelHex } of PLANET_IDENTITIES) {
      expect(contrastRatio(labelHex, "#020706")).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(labelHex, "#241710")).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps orientation, teletype, and bay chrome source tokens above 4.5:1", () => {
    for (const pair of OBSERVATORY_TEXT_CONTRASTS) {
      expect(
        contrastRatio(pair.foreground, pair.background),
        pair.id,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("provides a deterministic public-safe fallback identity", () => {
    expect(planetIdentityForTicker("new")).toEqual(
      planetIdentityForTicker("NEW"),
    );
  });
});
