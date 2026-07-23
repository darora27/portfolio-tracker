import { describe, expect, it } from "vitest";
import { parseInsiderTransactionsResponse, netInsiderCount } from "./finnhub-insider";

// Shape matches a real (public) Finnhub /stock/insider-transactions response.
const REAL_SHAPE_SAMPLE = {
  data: [
    {
      name: "Jolla Alice L.",
      share: 76153,
      change: 5004,
      filingDate: "2026-06-16",
      transactionDate: "2026-06-15",
      transactionCode: "A",
      transactionPrice: 0,
      id: "0000789019-26-000135",
      symbol: "MSFT",
      source: "sec",
      isDerivative: false,
      currency: "",
    },
    {
      name: "Coleman Amy",
      share: 45445,
      change: -36,
      filingDate: "2026-06-15",
      transactionDate: "2026-06-15",
      transactionCode: "F",
      transactionPrice: 390.74,
      id: "0000789019-26-000133",
      symbol: "MSFT",
      source: "sec",
      isDerivative: false,
      currency: "",
    },
  ],
};

describe("parseInsiderTransactionsResponse", () => {
  it("derives buy/sell direction from the sign of `change` and shares from its magnitude", () => {
    expect(parseInsiderTransactionsResponse(REAL_SHAPE_SAMPLE, "2026-01-01")).toEqual([
      { filerName: "Jolla Alice L.", shares: 5004, direction: "buy", date: "2026-06-15" },
      { filerName: "Coleman Amy", shares: 36, direction: "sell", date: "2026-06-15" },
    ]);
  });

  it("filters out transactions before sinceDate", () => {
    const json = {
      data: [
        { name: "A", change: 10, transactionDate: "2026-01-01" },
        { name: "B", change: 10, transactionDate: "2026-06-01" },
      ],
    };
    expect(parseInsiderTransactionsResponse(json, "2026-04-01")).toEqual([
      { filerName: "B", shares: 10, direction: "buy", date: "2026-06-01" },
    ]);
  });

  it("skips entries with zero, missing, or non-numeric change", () => {
    const json = {
      data: [
        { name: "A", change: 0, transactionDate: "2026-06-01" },
        { name: "B", transactionDate: "2026-06-01" },
        { name: "C", change: "10", transactionDate: "2026-06-01" },
      ],
    };
    expect(parseInsiderTransactionsResponse(json, "2026-01-01")).toEqual([]);
  });

  it("returns an empty array for an empty or malformed data field (e.g. ASML, a foreign private issuer with no SEC Form 4 filings)", () => {
    expect(parseInsiderTransactionsResponse({ data: [] }, "2026-01-01")).toEqual([]);
    expect(parseInsiderTransactionsResponse({}, "2026-01-01")).toEqual([]);
    expect(parseInsiderTransactionsResponse(null, "2026-01-01")).toEqual([]);
  });

  it("sorts newest first", () => {
    const json = {
      data: [
        { name: "Old", change: 1, transactionDate: "2026-01-01" },
        { name: "New", change: 1, transactionDate: "2026-06-01" },
      ],
    };
    const result = parseInsiderTransactionsResponse(json, "2026-01-01");
    expect(result.map((t) => t.filerName)).toEqual(["New", "Old"]);
  });
});

describe("netInsiderCount", () => {
  it("is (#buys - #sells)", () => {
    const txns = parseInsiderTransactionsResponse(REAL_SHAPE_SAMPLE, "2026-01-01");
    expect(netInsiderCount(txns)).toBe(0); // one buy, one sell
  });

  it("is 0 for an empty list", () => {
    expect(netInsiderCount([])).toBe(0);
  });
});
