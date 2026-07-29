import { describe, expect, it } from "vitest";
import {
  DRAFT_TOTAL_UNITS,
  adjustDraftWeight,
  decodeDraftUnits,
  draftUnitsFromWeights,
  encodeDraftUnits,
  setDraftWeightProRata,
  setDraftWeightSiphon,
} from "./draft-ledger";

function seeded(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1_664_525 + 1_013_904_223) >>> 0;
    return value / 0x1_0000_0000;
  };
}

describe("integer half-unit draft ledger", () => {
  it("uses stable largest-remainder rounding for the real book", () => {
    const units = draftUnitsFromWeights([
      0.264, 0.208, 0.121, 0.082, 0.076, 0.072, 0.048, 0.035,
    ]);
    expect(units).toHaveLength(8);
    expect(units.reduce((sum, unit) => sum + unit, 0)).toBe(DRAFT_TOTAL_UNITS);
    expect(units).toEqual([58, 46, 27, 18, 17, 16, 10, 8]);
  });

  it("preserves the untouched mix pro-rata and isolates a siphon to two holdings", () => {
    const book = [54, 40, 28, 20, 20, 16, 12, 10];
    const breathed = setDraftWeightProRata(book, 0, 70);
    expect(breathed.reduce((sum, unit) => sum + unit, 0)).toBe(200);
    expect(breathed[0]).toBe(70);
    expect(breathed[1] / breathed[2]).toBeCloseTo(book[1] / book[2], 1);

    const siphoned = setDraftWeightSiphon(book, 0, 44, 1);
    expect(siphoned).toEqual([44, 50, 28, 20, 20, 16, 12, 10]);
  });

  it("allows either siphon counterparty to receive the pair's full ledger", () => {
    const base = [100, 20, 20, 20, 10, 10, 10, 10];
    expect(setDraftWeightSiphon(base, 0, 0, 1)).toEqual([
      0, 120, 20, 20, 10, 10, 10, 10,
    ]);
    expect(setDraftWeightSiphon(base, 0, 120, 1)).toEqual([
      120, 0, 20, 20, 10, 10, 10, 10,
    ]);
  });

  it("never leaves 200 units across randomized grow, shrink, siphon, type, key, and zero operations", () => {
    const random = seeded(0x5e11);
    let units = draftUnitsFromWeights([26, 20, 14, 10, 10, 8, 6, 6]);
    for (let operation = 0; operation < 5_000; operation += 1) {
      const index = Math.floor(random() * units.length);
      const kind = Math.floor(random() * 6);
      if (kind === 0) {
        units = adjustDraftWeight(units, index, 1);
      } else if (kind === 1) {
        units = adjustDraftWeight(units, index, -1);
      } else if (kind === 2) {
        let counterparty = Math.floor(random() * units.length);
        if (counterparty === index) counterparty = (counterparty + 1) % units.length;
        units = adjustDraftWeight(
          units,
          index,
          random() > 0.5 ? 10 : -10,
          counterparty,
        );
      } else if (kind === 3) {
        units = setDraftWeightProRata(units, index, Math.floor(random() * 201));
      } else if (kind === 4) {
        units = adjustDraftWeight(units, index, random() > 0.5 ? 10 : -10);
      } else {
        units = setDraftWeightProRata(units, index, 0);
      }
      expect(units).toHaveLength(8);
      expect(units.every((unit) => Number.isInteger(unit) && unit >= 0)).toBe(true);
      expect(units.reduce((sum, unit) => sum + unit, 0)).toBe(200);
    }
  });

  it("round-trips one compact URL value and rejects invalid books", () => {
    const units = [54, 40, 28, 20, 20, 16, 12, 10];
    expect(decodeDraftUnits(encodeDraftUnits(units))).toEqual(units);
    expect(decodeDraftUnits("54.40.28.20.20.16.12.11")).toBeNull();
    expect(decodeDraftUnits("54.40.28")).toBeNull();
  });
});
