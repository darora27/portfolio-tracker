import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getDashboardData = vi.fn();

vi.mock("@/lib/dashboard-data", () => ({
  getDashboardData,
}));

const publicFixture = {
  historyDays: 30,
  twrPct: -0.029,
  pricesAsOf: "2026-07-23",
  dailyChangeAsOf: "2026-07-23",
  chartData: [
    { date: "2026-06-24", portfolioIndex: 100, vooIndex: 100 },
    { date: "2026-07-23", portfolioIndex: 97.1, vooIndex: 101.7 },
  ],
  positionRows: [
    {
      ticker: "IBM",
      contribution: -0.027,
      value: 999999.99,
      gain: 888888.88,
      costBasis: 111111.11,
      price: 222.22,
      day: 333.33,
      prevClose: 444.44,
    },
    { ticker: "MSFT", contribution: 0.011 },
  ],
  benchmarkComparisons: [
    {
      ticker: "VOO",
      available: true,
      twrPct: 0.017,
      excessReturnPct: -0.046,
    },
  ],
  totalValue: 999999.99,
  realizedGain: 8888.88,
  unrealizedGain: 7777.77,
  latestNews: [{ headline: "PRIVATE_RESEARCH_MARKER" }],
  simulations: [{ result: "PRIVATE_SIMULATION_MARKER" }],
  trades: [{ reason: "PRIVATE_TRADE_REASON" }],
};

async function renderShare(chapter?: string) {
  const { default: SharePage } = await import("./page");
  const element = await SharePage({
    searchParams: Promise.resolve(chapter ? { chapter } : {}),
  });
  return renderToStaticMarkup(element);
}

beforeEach(() => {
  getDashboardData.mockResolvedValue(publicFixture);
});

describe("/share Pulse rendered output", () => {
  it("defaults to Pulse with real comparison copy, one chart, freshness, read-only state, and a Forces link", async () => {
    const html = await renderShare();

    expect(html).toContain("01 — Pulse");
    expect(html).toContain("a 4.6-point gap behind the market");
    expect(html).toContain("The largest drag came from IBM. MSFT offset part of it.");
    expect(html).toContain("Prices as of");
    expect(html).toContain("Jul 23, 2026");
    expect(html).toContain("Read-only");
    expect(html).toContain('href="/share?chapter=forces"');
    expect((html.match(/<svg/g) ?? [])).toHaveLength(1);
    expect(html).toContain("View trajectory data");
  });

  it("renders only the shell placeholder for an unfinished chapter", async () => {
    const html = await renderShare("forces");

    expect(html).toContain("02 — Forces");
    expect(html).toContain("This chapter&#x27;s content ships in a later Phase 10 section.");
    expect(html).not.toContain("Market-relative observation");
  });

  it("keeps strict currency and owner-only poison fields out of public HTML", async () => {
    const html = await renderShare();

    expect(html).not.toMatch(/\$\d[\d,]*\.\d{2}\b/);
    expect(html).not.toContain("PRIVATE_RESEARCH_MARKER");
    expect(html).not.toContain("PRIVATE_SIMULATION_MARKER");
    expect(html).not.toContain("PRIVATE_TRADE_REASON");
    expect(html).not.toContain("999999.99");
    expect(html).not.toContain("ownerSlot");
  });

  it("renders the exact useful fallback without driver copy when history is insufficient", async () => {
    getDashboardData.mockResolvedValue({
      ...publicFixture,
      historyDays: 8,
      benchmarkComparisons: [
        {
          ticker: "VOO",
          available: false,
          twrPct: null,
          excessReturnPct: null,
        },
      ],
    });

    const html = await renderShare();
    expect(html).toContain(
      "Building the market-relative picture — a full comparison needs more trading history.",
    );
    expect(html).not.toContain("largest drag");
    expect(html).not.toContain("NaN");
  });
});
