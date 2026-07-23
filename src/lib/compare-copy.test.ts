import { describe, expect, it } from "vitest";
import { containsBannedLanguage } from "./surface-copy";
import { SIMULATIONS_BANNER } from "./compare-copy";

describe("SIMULATIONS_BANNER", () => {
  it("matches the exact required verbatim string", () => {
    expect(SIMULATIONS_BANNER).toBe(
      "SIMULATIONS — hypothetical portfolios for comparison only. Not advice, not predictions, not recommendations.",
    );
  });

  it("passes the banned-words check — 'recommendations' is the sanctioned exception to 'recommend'", () => {
    expect(containsBannedLanguage(SIMULATIONS_BANNER)).toBe(false);
  });
});
