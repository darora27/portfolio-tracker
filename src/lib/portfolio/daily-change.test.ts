import { describe, expect, it } from "vitest";
import { resolveDailyChange } from "./holdings";
import {
  isMarketSessionOpen,
  newYorkParts,
  weekdayLabel,
} from "@/lib/market-calendar";

/**
 * W1 — the daily carry selector (R7-W1).
 *
 * The defect this closes: every one of thirteen holdings rendered
 * `TODAY ◆ 0.0%`. Outside a trading session the "live" price and the most
 * recent close are the same number, so measuring one against the other
 * produces a real zero for the whole book at once — which CLAUDE.md
 * forbids showing as though it were a real figure.
 *
 * Fixtures are hand-computed and written as literals. A fixture that
 * restates the implementation's arithmetic proves nothing.
 */

// Thu 2026-07-30 14:00 ET (18:00 UTC, EDT = UTC-4) — inside the session.
const DURING_SESSION = new Date("2026-07-30T18:00:00Z");
// Thu 2026-07-30 20:00 ET (Fri 00:00 UTC) — after the 16:00 close.
const AFTER_CLOSE = new Date("2026-07-31T00:00:00Z");
// Sat 2026-08-01 14:00 ET — weekend.
const WEEKEND = new Date("2026-08-01T18:00:00Z");
// Fri 2026-07-03, Independence Day observed — a holiday, mid-session clock.
const HOLIDAY = new Date("2026-07-03T18:00:00Z");

const CLOSES = [
  { date: "2026-07-28", price: 100 },
  { date: "2026-07-29", price: 200 }, // the "close before last"
  { date: "2026-07-30", price: 220 }, // the last completed close
];

describe("market session boundaries", () => {
  it("is open mid-session on a trading day", () => {
    expect(isMarketSessionOpen(DURING_SESSION)).toBe(true);
  });

  it("is closed after 16:00 even on a trading day", () => {
    expect(isMarketSessionOpen(AFTER_CLOSE)).toBe(false);
  });

  it("is closed at weekends and on holidays", () => {
    expect(isMarketSessionOpen(WEEKEND)).toBe(false);
    expect(isMarketSessionOpen(HOLIDAY)).toBe(false);
  });

  it("resolves New York wall-clock across the DST boundary", () => {
    // Both are 12:00 UTC. In January New York is UTC-5, in July UTC-4.
    expect(newYorkParts(new Date("2026-01-15T12:00:00Z")).hour).toBe(7);
    expect(newYorkParts(new Date("2026-07-15T12:00:00Z")).hour).toBe(8);
  });

  it("does not treat 09:29 as open or 16:00 as still open", () => {
    // 09:29 ET = 13:29 UTC in July; 16:00 ET = 20:00 UTC.
    expect(isMarketSessionOpen(new Date("2026-07-30T13:29:00Z"))).toBe(false);
    expect(isMarketSessionOpen(new Date("2026-07-30T13:30:00Z"))).toBe(true);
    expect(isMarketSessionOpen(new Date("2026-07-30T20:00:00Z"))).toBe(false);
  });

  it("labels weekdays from an ISO date", () => {
    expect(weekdayLabel("2026-07-30")).toBe("THU");
    expect(weekdayLabel("2026-08-01")).toBe("SAT");
  });
});

describe("resolveDailyChange — (a) open session, live change", () => {
  it("measures the live quote against the last completed close", () => {
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: 242,
      // Only closes strictly before today count as the reference.
      closes: CLOSES.slice(0, 2), // last completed close = 2026-07-29 @ 200
      now: DURING_SESSION,
      firstTradeDate: "2026-01-02",
      firstTradePrice: 90,
    });
    // 242/200 - 1 = 0.21 exactly; 10 * (242 - 200) = 420.
    expect(result.pct).toBeCloseTo(0.21, 10);
    expect(result.dollars).toBe(420);
    expect(result.label).toBe("TODAY");
    expect(result.direction).toBe("up");
    expect(result.carried).toBe(false);
  });

  it("measures from the purchase price for a position bought today", () => {
    const result = resolveDailyChange({
      shares: 4,
      quotePrice: 110,
      closes: CLOSES.slice(0, 2),
      now: DURING_SESSION,
      firstTradeDate: "2026-07-30",
      firstTradePrice: 100,
    });
    // Day P&L starts at purchase, not at a close for shares not yet owned.
    expect(result.pct).toBeCloseTo(0.1, 10);
    expect(result.dollars).toBe(40);
  });
});

describe("resolveDailyChange — (b) closed market, carries the last real day", () => {
  it("carries the last completed close against the one before it", () => {
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: 220, // same as the latest close, as it is out of session
      closes: CLOSES,
      now: AFTER_CLOSE,
    });
    // 220/200 - 1 = 0.10 exactly; 10 * (220 - 200) = 200.
    expect(result.pct).toBeCloseTo(0.1, 10);
    expect(result.dollars).toBe(200);
    expect(result.label).toBe("THU CLOSE");
    expect(result.direction).toBe("up");
    expect(result.carried).toBe(true);
  });

  it("carries across a weekend rather than reporting a flat Saturday", () => {
    const result = resolveDailyChange({
      shares: 1,
      quotePrice: 220,
      closes: CLOSES,
      now: WEEKEND,
    });
    expect(result.label).toBe("THU CLOSE");
    expect(result.pct).toBeCloseTo(0.1, 10);
    expect(result.carried).toBe(true);
  });

  it("REGRESSION: does not report 0.0% when the quote equals the last close", () => {
    // The exact shape of the reported defect: thirteen holdings at 0.0%
    // because live price and latest close are the same number.
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: 220,
      closes: CLOSES,
      now: AFTER_CLOSE,
    });
    expect(result.pct).not.toBe(0);
    expect(result.direction).not.toBe("flat");
  });

  it("falls back to the carry when the session is open but no quote arrived", () => {
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: null,
      closes: CLOSES,
      now: DURING_SESSION,
    });
    expect(result.carried).toBe(true);
    expect(result.label).toBe("THU CLOSE");
    expect(result.pct).toBeCloseTo(0.1, 10);
  });
});

describe("resolveDailyChange — (c) a genuinely flat day", () => {
  it("reports flat when the move is under 5 basis points", () => {
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: 200,
      closes: [
        { date: "2026-07-29", price: 200 },
        { date: "2026-07-30", price: 200.02 }, // +0.01%, inside the epsilon
      ],
      now: AFTER_CLOSE,
    });
    expect(result.direction).toBe("flat");
    expect(result.pct).not.toBeNull();
  });

  it("still reports a direction just outside the epsilon", () => {
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: 200,
      closes: [
        { date: "2026-07-29", price: 200 },
        { date: "2026-07-30", price: 200.2 }, // +0.1%, outside the epsilon
      ],
      now: AFTER_CLOSE,
    });
    expect(result.direction).toBe("up");
  });

  it("reports a fall as down", () => {
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: 200,
      closes: [
        { date: "2026-07-29", price: 200 },
        { date: "2026-07-30", price: 199.8 }, // -0.1%
      ],
      now: AFTER_CLOSE,
    });
    expect(result.direction).toBe("down");
    expect(result.dollars).toBeCloseTo(-2, 10);
  });
});

describe("resolveDailyChange — (d) missing data is null, never zero", () => {
  it("returns nulls when there is no history at all", () => {
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: null,
      closes: [],
      now: AFTER_CLOSE,
    });
    expect(result.pct).toBeNull();
    expect(result.dollars).toBeNull();
    expect(result.direction).toBeNull();
  });

  it("returns nulls with only one close — nothing to measure against", () => {
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: null,
      closes: [{ date: "2026-07-30", price: 220 }],
      now: AFTER_CLOSE,
    });
    expect(result.pct).toBeNull();
    expect(result.dollars).toBeNull();
    expect(result.direction).toBeNull();
    // The label still tells the reader which day it would have been.
    expect(result.label).toBe("THU CLOSE");
  });

  it("treats a non-positive reference price as unusable rather than dividing", () => {
    const result = resolveDailyChange({
      shares: 10,
      quotePrice: null,
      closes: [
        { date: "2026-07-29", price: 0 },
        { date: "2026-07-30", price: 220 },
      ],
      now: AFTER_CLOSE,
    });
    expect(result.pct).toBeNull();
    expect(result.dollars).toBeNull();
  });
});

describe("the arrow rule — a zero can never render as a rise", () => {
  it("no input produces direction 'up' with a zero or null pct", () => {
    const cases = [
      { shares: 1, quotePrice: null, closes: [], now: AFTER_CLOSE },
      {
        shares: 1,
        quotePrice: 220,
        closes: [
          { date: "2026-07-29", price: 220 },
          { date: "2026-07-30", price: 220 },
        ],
        now: AFTER_CLOSE,
      },
      {
        shares: 1,
        quotePrice: 220,
        closes: [{ date: "2026-07-30", price: 220 }],
        now: DURING_SESSION,
      },
    ];
    for (const input of cases) {
      const { pct, direction } = resolveDailyChange(input);
      if (pct === null || pct === 0) {
        expect(direction === null || direction === "flat").toBe(true);
      }
    }
  });
});
