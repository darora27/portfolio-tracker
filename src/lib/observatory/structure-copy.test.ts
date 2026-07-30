import { describe, expect, it } from "vitest";
import {
  correlationPairSentence,
  mostCorrelatedPair,
  structureConcentrationCopy,
} from "./structure-copy";

describe("Structure copy and correlation selection", () => {
  it("uses the existing HHI language in every band", () => {
    expect(structureConcentrationCopy(1200, 0.42)).toBe(
      "Well spread out. The top two holdings make up 42.0% of the portfolio.",
    );
    expect(structureConcentrationCopy(1800, 0.55)).toBe(
      "Moderately concentrated. The top two holdings make up 55.0% of the portfolio.",
    );
    expect(structureConcentrationCopy(2800, 0.7)).toBe(
      "Very concentrated — a few stocks drive most of the movement. The top two holdings make up 70.0% of the portfolio.",
    );
  });

  it("returns null when every off-diagonal cell is null", () => {
    expect(mostCorrelatedPair(
      ["A", "B"],
      [[1, null], [null, 1]],
    )).toBeNull();
  });

  it("returns the highest unique off-diagonal pair", () => {
    expect(mostCorrelatedPair(
      ["A", "B", "C"],
      [
        [1, 0.35, 0.82],
        [0.35, 1, 0.64],
        [0.82, 0.64, 1],
      ],
    )).toEqual({ a: "A", b: "C", correlation: 0.82 });
  });

  it("FB-11: prefers a strong negative correlation over a weaker positive one (top |r|, not top r)", () => {
    expect(mostCorrelatedPair(
      ["A", "B", "C"],
      [
        [1, 0.2, -0.9],
        [0.2, 1, 0.3],
        [-0.9, 0.3, 1],
      ],
    )).toEqual({ a: "A", b: "C", correlation: -0.9 });
  });

  it("FB-11: correlationPairSentence renders nothing for no pair (insufficient shared history)", () => {
    expect(correlationPairSentence(null)).toBeNull();
  });

  it("FB-11: correlationPairSentence bands, all at or under 14 words", () => {
    const cases: Array<[number, RegExp]> = [
      [0.82, /MOVED TOGETHER/],
      [-0.9, /MOVED OPPOSITE/],
      [0.4, /SHARE SOME MOVEMENT/],
      [-0.05, /BARELY RELATED/],
    ];
    for (const [correlation, expected] of cases) {
      const sentence = correlationPairSentence({ a: "IBM", b: "MSFT", correlation });
      expect(sentence).not.toBeNull();
      expect(sentence).toMatch(expected);
      expect(sentence).toContain("IBM");
      expect(sentence).toContain("MSFT");
      expect(sentence!.trim().split(/\s+/).length).toBeLessThanOrEqual(14);
    }
  });
});
