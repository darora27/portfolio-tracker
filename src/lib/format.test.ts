import { describe, expect, it } from "vitest";
import { formatMarketCap, formatMonthYear, formatRelativeOrDate } from "./format";

describe("formatMarketCap", () => {
  it("shows billions once the raw millions figure crosses 1000", () => {
    expect(formatMarketCap(608654.56)).toBe("$608.7B");
    expect(formatMarketCap(1_234_500)).toBe("$1,234.5B");
    expect(formatMarketCap(1000)).toBe("$1.0B");
  });

  it("shows millions below the 1000 threshold", () => {
    expect(formatMarketCap(450.2)).toBe("$450.2M");
    expect(formatMarketCap(999.9)).toBe("$999.9M");
  });
});

describe("formatMonthYear", () => {
  it("formats an ISO date as month + year only", () => {
    expect(formatMonthYear("2026-07-01")).toBe("Jul 2026");
  });
});

describe("formatRelativeOrDate", () => {
  const now = new Date("2026-07-22T12:00:00Z").getTime();

  it("shows minutes for under an hour", () => {
    expect(formatRelativeOrDate(now / 1000 - 5 * 60, now)).toBe("5m ago");
  });

  it("shows hours for under 24h", () => {
    expect(formatRelativeOrDate(now / 1000 - 3 * 3600, now)).toBe("3h ago");
  });

  it("falls back to a plain date at 24h or older", () => {
    expect(formatRelativeOrDate(now / 1000 - 25 * 3600, now)).toBe("Jul 21, 2026");
  });
});
