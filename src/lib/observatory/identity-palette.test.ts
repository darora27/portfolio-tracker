import { describe, expect, it } from "vitest";
import {
  IDENTITY,
  dimmed,
  identityColor,
  identityColorsForAudit,
  reservationBreaches,
} from "./identity-palette";
import { hueChroma } from "./universe-palette";

/**
 * R7-W2. The binding constraint: identity colour must never enter the hues
 * reserved for gain and loss. If it does, a red planet stops meaning "down"
 * and the whole encoding argument collapses.
 */

const HELD = [
  "ASML", "GOOG", "COST", "MSFT", "INTC", "IBM", "CBRS",
  "NBIS", "CRM", "ORCL", "SPCX", "KYMR", "MEI",
];

function circularDistance(left: number, right: number): number {
  const difference = Math.abs(left - right) % 360;
  return Math.min(difference, 360 - difference);
}

describe("the Fraunhofer reservation", () => {
  it("holds for every assigned identity colour", () => {
    expect(reservationBreaches(identityColorsForAudit())).toEqual([]);
  });

  it("holds for generated colours too", () => {
    // The generated path is the one that can drift unnoticed, because no
    // human looks at it before it ships. 500 synthetic tickers covering a
    // wide spread of hash values.
    const synthetic = Array.from({ length: 500 }, (_, index) =>
      `T${index.toString(36).toUpperCase()}X`,
    );
    expect(reservationBreaches(identityColorsForAudit(synthetic))).toEqual([]);
  });

  it("holds for real-looking tickers that are not current holdings", () => {
    const future = ["NVDA", "AAPL", "TSLA", "AMZN", "META", "AMD", "PLTR", "SPY", "QQQ", "DIA"];
    expect(reservationBreaches(identityColorsForAudit(future))).toEqual([]);
  });
});

describe("the thirteen holdings", () => {
  it("all have an assigned colour", () => {
    for (const ticker of HELD) {
      expect(IDENTITY[ticker], `${ticker} has no identity colour`).toMatch(
        /^#[0-9A-F]{6}$/,
      );
    }
    expect(Object.keys(IDENTITY)).toHaveLength(13);
  });

  it("are distinguishable from each other, not merely distinct values", () => {
    // Thirteen series only help if no two read as the same colour in a 4px
    // line. Hue separation is the check that matters at that size.
    const hues = HELD.map((ticker) => {
      const { hue } = hueChroma(IDENTITY[ticker]);
      expect(hue).not.toBeNull();
      return hue as number;
    });
    for (let i = 0; i < hues.length; i += 1) {
      for (let j = i + 1; j < hues.length; j += 1) {
        expect(
          circularDistance(hues[i], hues[j]),
          `${HELD[i]} and ${HELD[j]} are too close in hue`,
        ).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it("are all legible against the backdrop", () => {
    const relative = (hex: string) => {
      const channels = [0, 2, 4].map((index) => {
        const value = parseInt(hex.slice(1).slice(index, index + 2), 16) / 255;
        return value <= 0.03928
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const backdrop = relative("#0B0F0E");
    for (const ticker of HELD) {
      const ratio = (relative(IDENTITY[ticker]) + 0.05) / (backdrop + 0.05);
      expect(ratio, `${ticker} is too dark against the backdrop`).toBeGreaterThan(3);
    }
  });
});

describe("identityColor", () => {
  it("is case-insensitive for held tickers", () => {
    expect(identityColor("asml")).toBe(IDENTITY.ASML);
    expect(identityColor("ASML")).toBe(IDENTITY.ASML);
  });

  it("is deterministic across calls for an unknown ticker", () => {
    expect(identityColor("NVDA")).toBe(identityColor("NVDA"));
  });

  it("gives different unknown tickers different colours", () => {
    const colours = new Set(
      ["NVDA", "AAPL", "TSLA", "AMZN", "META"].map(identityColor),
    );
    expect(colours.size).toBeGreaterThan(1);
  });
});

describe("dimmed", () => {
  it("returns the identity colour at 55% by default", () => {
    expect(dimmed("ASML")).toBe("rgb(247 221 49 / 55%)");
  });

  it("accepts an explicit alpha", () => {
    expect(dimmed("ASML", 0.2)).toBe("rgb(247 221 49 / 20%)");
  });

  it("works for generated colours as well as assigned ones", () => {
    expect(dimmed("NVDA")).toMatch(/^rgb\(\d+ \d+ \d+ \/ 55%\)$/);
  });
});
