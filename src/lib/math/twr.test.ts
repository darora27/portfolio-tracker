import { describe, expect, it } from "vitest";
import { twr } from "./twr";

describe("twr", () => {
  it("chains daily returns: (1.10)(1.03125) - 1 = 0.134375", () => {
    expect(twr([0.1, 0.03125])).toBeCloseTo(0.134375, 10);
  });

  it("is 0 for an empty return series", () => {
    expect(twr([])).toBe(0);
  });

  it("compounds a loss followed by a gain correctly: (0.9)(1.2) - 1 = 0.08", () => {
    expect(twr([-0.1, 0.2])).toBeCloseTo(0.08, 10);
  });
});
