import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDashboardData, getPublicTimelineData } = vi.hoisted(() => ({
  getDashboardData: vi.fn(),
  getPublicTimelineData: vi.fn(),
}));

vi.mock("@/lib/dashboard-data", () => ({
  getDashboardData,
}));

vi.mock("@/lib/observatory/timeline-data", () => ({
  getPublicTimelineData,
}));

const publicFixture = {
  historyDays: 30,
  twrPct: -0.029,
  xirrPct: 0.1234,
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
      weight: 0.42,
    },
    { ticker: "MSFT", contribution: 0.011, weight: 0.31 },
  ],
  movers: [{ ticker: "IBM", day: 12345.67, dayPct: -0.021 }],
  top2ConcentrationPct: 0.73,
  hhi: 2100,
  sectorWeights: [{ label: "Technology", weight: 0.61 }],
  aiExposureWeights: [{ label: "High", weight: 0.44 }],
  correlationTickers: ["IBM", "MSFT"],
  correlationCells: [[1, 0.72], [0.72, 1]],
  allTimeHigh: { pct: -0.046, peakDate: "2026-07-01" },
  bestDay: { date: "2026-07-05", r: 0.023 },
  worstDay: { date: "2026-07-18", r: -0.031 },
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

const timelineFixture = {
  flowMarkers: [{ date: "2026-07-02", direction: "in" as const }],
  tradeMarkers: [{ date: "2026-07-03", ticker: "IBM", action: "buy" as const }],
  compositionHistory: {
    tickers: ["IBM", "MSFT"],
    hasOther: false,
    points: [{ date: "2026-07-03", IBM: 60, MSFT: 40 }],
  },
};

async function renderShare(
  chapter?: string,
  explain?: string,
) {
  const { default: SharePage } = await import("./page");
  const element = await SharePage({
    searchParams: Promise.resolve({
      ...(chapter ? { chapter } : {}),
      ...(explain ? { explain } : {}),
    }),
  });
  return renderToStaticMarkup(element);
}

beforeEach(() => {
  getDashboardData.mockResolvedValue(publicFixture);
  getPublicTimelineData.mockResolvedValue(timelineFixture);
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

  it("renders Forces from real contribution and mover data", async () => {
    const html = await renderShare("forces");

    expect(html).toContain("02 — Forces");
    expect(html).toContain("Every holding&#x27;s share of the portfolio&#x27;s total return, ranked.");
    expect(html).toContain("MSFT contributed the most to total return");
    expect(html).toContain("IBM moved the most today");
    expect(html).toContain('href="/share?chapter=structure"');
    expect(html).not.toContain("Market-relative observation");
  });

  it.each(["pulse", "forces", "structure", "timeline", "lab"])(
    "keeps strict currency and owner-only poison fields out of the %s chapter",
    async (chapter) => {
      const html = await renderShare(chapter);

      expect(html).not.toMatch(/\$\d[\d,]*\.\d{2}\b/);
      expect(html).not.toContain("PRIVATE_RESEARCH_MARKER");
      expect(html).not.toContain("PRIVATE_SIMULATION_MARKER");
      expect(html).not.toContain("PRIVATE_TRADE_REASON");
      expect(html).not.toContain("999999.99");
      expect(html).not.toContain("ownerSlot");
    },
  );

  it("renders Structure, Timeline, and Lab as complete standalone chapters", async () => {
    const structure = await renderShare("structure");
    expect(structure).toContain("The top two holdings make up 73.0%");
    expect(structure).toContain("IBM and MSFT are the most correlated holdings");
    expect(structure).toContain("View the correlation matrix");

    const timeline = await renderShare("timeline");
    expect(timeline).toContain("Annotated divergence ribbon");
    expect(timeline).toContain("Capital added");
    expect(timeline).toContain("Bought IBM");
    expect(timeline).toContain("View composition over time");

    const lab = await renderShare("lab");
    expect(lab).toContain("time-weighted return (TWR)");
    expect(lab).toContain("Explain TWR");
    expect(lab).toContain("Explain XIRR");
    expect(lab).toContain('href="/share/full"');
  });

  it("pre-opens only a valid explanation in its home chapter and passes XIRR through", async () => {
    const twr = await renderShare("lab", "twr");
    expect(twr).toContain("Time-weighted return");
    expect((twr.match(/aria-expanded="true"/g) ?? [])).toHaveLength(1);

    const xirr = await renderShare("lab", "xirr");
    expect(xirr).toContain("XIRR (annualized return)");
    expect(xirr).toContain("+12.34%");

    const hhi = await renderShare("structure", "hhi");
    expect(hhi).toContain("Herfindahl-Hirschman Index");
    expect((hhi.match(/aria-expanded="true"/g) ?? [])).toHaveLength(1);

    expect(await renderShare("structure", "twr")).not.toContain(
      'aria-expanded="true"',
    );
    expect(await renderShare("lab", "alpha")).not.toContain(
      'aria-expanded="true"',
    );
  });

  it("keeps every new chapter useful with sparse public history", async () => {
    getDashboardData.mockResolvedValue({
      ...publicFixture,
      historyDays: 1,
      chartData: [],
      positionRows: [],
      movers: [],
      sectorWeights: [],
      aiExposureWeights: [],
      correlationTickers: [],
      correlationCells: [],
      allTimeHigh: null,
      bestDay: null,
      worstDay: null,
    });
    getPublicTimelineData.mockResolvedValue({
      flowMarkers: [],
      tradeMarkers: [],
      compositionHistory: { tickers: [], hasOther: false, points: [] },
    });

    for (const chapter of ["forces", "structure", "timeline", "lab"]) {
      const html = await renderShare(chapter);
      expect(html).not.toContain("NaN");
      expect(html).not.toContain("This chapter&#x27;s content ships");
      expect(html).toMatch(/href="\/share(?:\/full|\?chapter=)/);
    }
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
