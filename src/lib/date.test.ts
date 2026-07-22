import { describe, expect, it } from "vitest";
import { addDays, daysBetween } from "./date";

describe("daysBetween", () => {
  it("counts whole days between two ISO dates", () => {
    expect(daysBetween("2026-06-24", "2026-07-22")).toBe(28);
    expect(daysBetween("2026-01-01", "2026-01-01")).toBe(0);
  });

  it("is negative when `to` precedes `from`", () => {
    expect(daysBetween("2026-07-22", "2026-06-24")).toBe(-28);
  });

  it("crosses a month boundary correctly", () => {
    expect(daysBetween("2026-01-31", "2026-02-01")).toBe(1);
  });
});

describe("addDays", () => {
  it("adds days within a month", () => {
    expect(addDays("2026-07-01", 5)).toBe("2026-07-06");
  });

  it("rolls over a month boundary", () => {
    expect(addDays("2026-07-28", 5)).toBe("2026-08-02");
  });

  it("subtracts days for a negative n", () => {
    expect(addDays("2026-08-02", -5)).toBe("2026-07-28");
  });

  it("rolls over a year boundary", () => {
    expect(addDays("2026-12-30", 5)).toBe("2027-01-04");
  });
});
