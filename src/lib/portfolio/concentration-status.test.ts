import { describe, expect, it } from "vitest";
import { concentrationStatus } from "./concentration-status";

describe("concentrationStatus", () => {
  it("is good (diversified) below 1500", () => {
    expect(concentrationStatus(1499)).toEqual({ tier: "good", label: "Diversified" });
    expect(concentrationStatus(0)).toEqual({ tier: "good", label: "Diversified" });
  });

  it("is warning (moderately concentrated) from 1500 to 2500 inclusive", () => {
    expect(concentrationStatus(1500)).toEqual({ tier: "warning", label: "Moderately concentrated" });
    expect(concentrationStatus(2500)).toEqual({ tier: "warning", label: "Moderately concentrated" });
    expect(concentrationStatus(2000)).toEqual({ tier: "warning", label: "Moderately concentrated" });
  });

  it("is critical (highly concentrated) above 2500", () => {
    expect(concentrationStatus(2501)).toEqual({ tier: "critical", label: "Highly concentrated" });
    expect(concentrationStatus(10000)).toEqual({ tier: "critical", label: "Highly concentrated" });
  });
});
