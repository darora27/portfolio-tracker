import { describe, expect, it } from "vitest";
import { isMarketHoliday, isTradingDay, isWeekend, marketHolidays } from "./market-calendar";

describe("marketHolidays", () => {
  it("computes the 2026 NYSE holiday calendar, cross-checked independently", () => {
    // Each date verified against the day-of-week / nth-weekday / Anonymous
    // Gregorian Easter algorithm independently in a scratch script before
    // being hardcoded here (not derived from the function under test).
    expect(marketHolidays(2026)).toEqual([
      "2026-01-01", // New Year's Day (Thursday, no shift)
      "2026-01-19", // MLK Day (3rd Monday of Jan)
      "2026-02-16", // Presidents Day (3rd Monday of Feb)
      "2026-04-03", // Good Friday (Easter Sunday is 2026-04-05)
      "2026-05-25", // Memorial Day (last Monday of May)
      "2026-06-19", // Juneteenth (Friday, no shift)
      "2026-07-03", // Independence Day observed (July 4 falls on a Saturday)
      "2026-09-07", // Labor Day (1st Monday of Sep)
      "2026-11-26", // Thanksgiving (4th Thursday of Nov)
      "2026-12-25", // Christmas (Friday, no shift)
    ]);
  });

  it("shifts a Sunday holiday to the following Monday (Juneteenth 2027)", () => {
    // 2027-06-19 is a Saturday... use a known Sunday case instead: July 4,
    // 2027 falls on a Sunday, so it's observed Monday July 5.
    expect(marketHolidays(2027)).toContain("2027-07-05");
    expect(marketHolidays(2027)).not.toContain("2027-07-04");
  });
});

describe("isWeekend", () => {
  it("is true for Saturday and Sunday, false for weekdays", () => {
    expect(isWeekend("2026-07-18")).toBe(true); // Saturday
    expect(isWeekend("2026-07-19")).toBe(true); // Sunday
    expect(isWeekend("2026-07-20")).toBe(false); // Monday
  });
});

describe("isMarketHoliday", () => {
  it("is true on the holiday and false the day before/after", () => {
    expect(isMarketHoliday("2026-11-26")).toBe(true); // Thanksgiving
    expect(isMarketHoliday("2026-11-25")).toBe(false);
    expect(isMarketHoliday("2026-11-27")).toBe(false); // day after (market reopens)
  });
});

describe("isTradingDay", () => {
  it("is false on weekends and market holidays, true otherwise", () => {
    expect(isTradingDay("2026-07-18")).toBe(false); // Saturday
    expect(isTradingDay("2026-07-03")).toBe(false); // Independence Day observed
    expect(isTradingDay("2026-07-22")).toBe(true); // an ordinary Wednesday
    expect(isTradingDay("2026-12-25")).toBe(false); // Christmas
    expect(isTradingDay("2026-12-24")).toBe(true); // Christmas Eve, market open
  });
});
