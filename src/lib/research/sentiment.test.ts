import { describe, expect, it } from "vitest";
import { sentimentLean } from "./sentiment";

describe("sentimentLean", () => {
  it("matches the exact PHASE9.md fixtures", () => {
    expect(sentimentLean("ASML beats estimates, shares surge")).toEqual({ score: 2, lean: "positive" });
    expect(sentimentLean("IBM warns on pipeline probe")).toEqual({ score: -2, lean: "negative" });
    expect(sentimentLean("GOOG announces event date")).toEqual({ score: 0, lean: "neutral" });
  });

  it("is case-insensitive", () => {
    expect(sentimentLean("shares SURGE on record demand")).toEqual({ score: 2, lean: "positive" });
  });

  it("only matches whole words, not substrings", () => {
    // "surgery" contains "surge" but is not the word "surge".
    expect(sentimentLean("Company announces surgery robotics division")).toEqual({ score: 0, lean: "neutral" });
  });

  it("nets out mixed positive and negative words", () => {
    expect(sentimentLean("Company sets record after strong jump but warns of risk")).toEqual({
      score: 1,
      lean: "positive",
    });
  });
});
