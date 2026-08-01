import { describe, expect, it } from "vitest";
import { earningsForNextTwoMonths } from "./earnings-window";

const EVENTS = [
  { ticker: "PAST", date: "2026-07-04" },
  { ticker: "SOON", date: "2026-07-28" },
  { ticker: "NEXT", date: "2026-08-12" },
  { ticker: "LATER", date: "2026-09-02" },
  { ticker: "MUCH", date: "2026-11-20" },
];

describe("earningsForNextTwoMonths (H2)", () => {
  it("returns the current month and the next, and nothing beyond", () => {
    const months = earningsForNextTwoMonths(EVENTS, "2026-07-20");
    expect(months.map((month) => month.key)).toEqual(["2026-07", "2026-08"]);
    expect(months[0].events.map((event) => event.ticker)).toEqual(["SOON"]);
    expect(months[1].events.map((event) => event.ticker)).toEqual(["NEXT"]);
  });

  it("drops dates already past — a forecast is not a history", () => {
    const months = earningsForNextTwoMonths(EVENTS, "2026-07-20");
    expect(months[0].events.some((event) => event.ticker === "PAST")).toBe(false);
  });

  it("rolls with the calendar, not a 60-day count", () => {
    // In August the window is August and September, so LATER appears — a
    // "next 60 days" rule would have shown it in July as well.
    const months = earningsForNextTwoMonths(EVENTS, "2026-08-01");
    expect(months.map((month) => month.key)).toEqual(["2026-08", "2026-09"]);
    expect(months[1].events.map((event) => event.ticker)).toEqual(["LATER"]);
  });

  it("crosses the year boundary", () => {
    const months = earningsForNextTwoMonths(EVENTS, "2026-12-10");
    expect(months.map((month) => month.key)).toEqual(["2026-12", "2027-01"]);
    expect(months.map((month) => month.label)).toEqual([
      "DECEMBER 2026",
      "JANUARY 2027",
    ]);
  });

  it("returns both months even when empty, so the section keeps its shape", () => {
    const months = earningsForNextTwoMonths([], "2026-07-20");
    expect(months).toHaveLength(2);
    expect(months.every((month) => month.events.length === 0)).toBe(true);
  });
});
