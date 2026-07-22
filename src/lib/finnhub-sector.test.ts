import { describe, expect, it } from "vitest";
import { parseProfileResponse } from "./finnhub-sector";

describe("parseProfileResponse", () => {
  it("extracts finnhubIndustry when present", () => {
    expect(parseProfileResponse({ finnhubIndustry: "Semiconductors", ticker: "ASML.AS" })).toEqual({
      sector: "Semiconductors",
    });
  });

  it("returns null when finnhubIndustry is missing", () => {
    expect(parseProfileResponse({ ticker: "XYZ" })).toBeNull();
  });

  it("returns null when finnhubIndustry is an empty string", () => {
    expect(parseProfileResponse({ finnhubIndustry: "" })).toBeNull();
  });

  it("returns null for non-object input", () => {
    expect(parseProfileResponse(null)).toBeNull();
    expect(parseProfileResponse(undefined)).toBeNull();
    expect(parseProfileResponse("not json")).toBeNull();
  });
});
