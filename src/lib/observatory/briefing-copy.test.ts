import { describe, expect, it } from "vitest";
import {
  BRIEFING_EARNINGS_WINDOW_DAYS,
  BRIEFING_NOTABLE_MOVE_THRESHOLD,
  briefingWhyCopy,
  buildAttentionItems,
} from "./briefing-copy";

const quietInput = {
  pricesStale: false,
  hhi: 1200,
  topMover: null,
  upcomingEarnings: [],
  today: "2026-07-24",
};

describe("briefingWhyCopy", () => {
  it("names the existing top mover without re-sorting", () => {
    expect(
      briefingWhyCopy([
        { ticker: "IBM", dayPct: -0.042 },
        { ticker: "MSFT", dayPct: 0.051 },
      ]),
    ).toBe("IBM drove most of today's move, -4.2%.");
  });

  it("returns null when there are no movers", () => {
    expect(briefingWhyCopy([])).toBeNull();
  });
});

describe("buildAttentionItems", () => {
  it("returns an empty list when no condition needs attention", () => {
    expect(buildAttentionItems(quietInput)).toEqual([]);
  });

  it("adds the stale-price condition by itself", () => {
    expect(buildAttentionItems({ ...quietInput, pricesStale: true })).toEqual([
      {
        id: "stale-prices",
        text: "Prices are stale — showing the last known values.",
        href: "/dashboard",
        severity: "critical",
      },
    ]);
  });

  it("adds the critical concentration condition by itself", () => {
    expect(buildAttentionItems({ ...quietInput, hhi: 2501 })).toEqual([
      {
        id: "concentration",
        text: "Very concentrated — a few stocks drive most of the movement.",
        href: "/dashboard",
        severity: "notice",
      },
    ]);
  });

  it("adds a notable mover at the inclusive magnitude threshold", () => {
    expect(
      buildAttentionItems({
        ...quietInput,
        topMover: { ticker: "IBM", dayPct: -BRIEFING_NOTABLE_MOVE_THRESHOLD },
      }),
    ).toEqual([
      {
        id: "notable-move",
        text: "IBM moved -3.0% today.",
        href: "/stock/IBM",
        severity: "notice",
      },
    ]);
  });

  it("adds a near-term earnings event by itself", () => {
    expect(
      buildAttentionItems({
        ...quietInput,
        upcomingEarnings: [{ ticker: "MSFT", date: "2026-07-27" }],
      }),
    ).toEqual([
      {
        id: "earnings-MSFT",
        text: "MSFT reports earnings Jul 27, 2026.",
        href: "/stock/MSFT",
        severity: "notice",
      },
    ]);
  });

  it("keeps the exact fixed priority order when all conditions are true", () => {
    expect(
      buildAttentionItems({
        pricesStale: true,
        hhi: 3000,
        topMover: { ticker: "IBM", dayPct: 0.041 },
        upcomingEarnings: [{ ticker: "MSFT", date: "2026-07-25" }],
        today: "2026-07-24",
      }).map((item) => item.id),
    ).toEqual(["stale-prices", "concentration", "notable-move", "earnings-MSFT"]);
  });

  it("sorts qualifying earnings soonest first and caps them at three", () => {
    const items = buildAttentionItems({
      ...quietInput,
      upcomingEarnings: [
        { ticker: "FOURTH", date: "2026-07-29" },
        { ticker: "SECOND", date: "2026-07-26" },
        { ticker: "FIRST", date: "2026-07-25" },
        { ticker: "THIRD", date: "2026-07-28" },
      ],
    });

    expect(items.map((item) => item.id)).toEqual([
      "earnings-FIRST",
      "earnings-SECOND",
      "earnings-THIRD",
    ]);
  });

  it("includes the earnings-window boundary and excludes one day past it", () => {
    const items = buildAttentionItems({
      ...quietInput,
      upcomingEarnings: [
        { ticker: "BOUNDARY", date: "2026-07-31" },
        { ticker: "PAST", date: "2026-08-01" },
      ],
    });

    expect(BRIEFING_EARNINGS_WINDOW_DAYS).toBe(7);
    expect(items.map((item) => item.id)).toEqual(["earnings-BOUNDARY"]);
  });
});
