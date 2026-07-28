import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookies,
  from,
  getDashboardData,
  getHistoryData,
  getResearchData,
  isValidSession,
} = vi.hoisted(() => ({
  cookies: vi.fn(),
  from: vi.fn(),
  getDashboardData: vi.fn(),
  getHistoryData: vi.fn(),
  getResearchData: vi.fn(),
  isValidSession: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies }));
vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE_NAME: "portfolio_session",
  isValidSession,
}));
vi.mock("@/lib/dashboard-data", () => ({ getDashboardData }));
vi.mock("@/lib/history-data", () => ({ getHistoryData }));
vi.mock("@/lib/research-data", () => ({ getResearchData }));
vi.mock("@/lib/supabase/client", () => ({ supabase: { from } }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const publicFixture = {
  historyDays: 30,
  twrPct: -0.029,
  twr7d: -0.024,
  xirrPct: 0.1234,
  simpleReturnPct: 0.9876,
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
      dayPct: -0.014,
      prevClose: 444.44,
      weight: 0.42,
      shares: 100,
    },
    {
      ticker: "MSFT",
      contribution: 0.011,
      weight: 0.31,
      value: 100,
      price: 10,
      day: 1,
      dayPct: 0.009,
      prevClose: 9,
      shares: 10,
    },
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
  winRatePct: 52.5,
  benchmarkComparisons: [
    {
      ticker: "VOO",
      available: true,
      twrPct: 0.017,
      excessReturnPct: -0.046,
    },
  ],
  publicOrreryHoldings: [
    {
      ticker: "IBM",
      companyName: "IBM",
      weight: 0.42,
      weeklyReturn: -0.021,
      portfolioRelativeReturn: -0.016,
      volatilityPct: 0.18,
      betaVsVoo: 0.74,
      dayReturn: -0.014,
    },
    {
      ticker: "MSFT",
      companyName: "Microsoft",
      weight: 0.31,
      weeklyReturn: 0.012,
      portfolioRelativeReturn: 0.017,
      volatilityPct: 0.21,
      betaVsVoo: 1.04,
      dayReturn: 0.009,
    },
  ],
  orreryBelt: { planetTickers: ["IBM", "MSFT"], beltTickers: [] },
  dailyChangePct: -0.0113,
  volatilityPct: 0.37,
  totalValue: 999999.99,
  totalCost: 111111.11,
  realizedGain: 8888.88,
  unrealizedGain: 7777.77,
  latestNews: [{ headline: "PRIVATE_RESEARCH_MARKER" }],
  upcomingEarnings: [],
  newsByHolding: {
    IBM: [{
      headline: "PUBLIC_IBM_TRANSMISSION",
      source: "Wire",
      url: "https://example.com/public",
      datetime: 1_785_200_000,
      ticker: "IBM",
    }],
  },
  publicTradeLog: [{
    date: "2026-07-14",
    action: "buy",
    ticker: "MSFT",
    impactPct: 0.021,
    realizedSign: 0,
  }],
  simulations: [{ result: "PRIVATE_SIMULATION_MARKER" }],
  trades: [{ reason: "PRIVATE_TRADE_REASON" }],
  netFlowsToday: 0,
  prevSnapshotValue: 900000,
};

async function renderShare(selection: {
  focus?: string;
  holding?: string;
  no3d?: string;
  station?: string;
} = {}) {
  const { default: SharePage } = await import("./page");
  const element = await SharePage({
    searchParams: Promise.resolve(selection),
  });
  return renderToStaticMarkup(element);
}

beforeEach(() => {
  process.env.OWNER_PASSWORD = "test-owner-password";
  getDashboardData.mockResolvedValue(publicFixture);
  getResearchData.mockResolvedValue({
    redditConfigured: false,
    marketNews: [{
      headline: "OWNER_RESEARCH_HEADLINE",
      source: "Owner source",
      url: "https://example.com/owner",
      datetime: 1_722_038_400,
    }],
    rows: [],
  });
  cookies.mockResolvedValue({
    get: () => ({ value: "test-session" }),
  });
  isValidSession.mockReturnValue(false);
});

describe("/share Stock Market Universe rendered output", () => {
  it("opens with the universe alone and keeps analysis inside Mission Control", async () => {
    const html = await renderShare();

    expect(html).toContain("Stock Market Universe");
    expect(html).toContain("SUN / PORTFOLIO");
    expect(html).toContain("SYSTEMS MANUAL");
    expect(html).toContain("ASTEROID BELT");
    expect(html).not.toContain("Portfolio command summary");
    expect(html).not.toContain("Market-relative observation");
    expect(html).not.toContain('id="portfolio-observatory"');
    expect(html).not.toMatch(/\$\d[\d,]*\.\d{2}\b/);
  });

  it("restores holding selection and the forced fallback", async () => {
    const html = await renderShare({ holding: "IBM", no3d: "1" });
    expect(html).toContain("IBM · IBM");
    expect(html).toContain("TELEMETRY");
    expect(html).toContain("PUBLIC_IBM_TRANSMISSION");
    expect(html).toContain('data-force-no-3d="true"');
  });

  it.each(["plot", "manifest", "scope", "hazard", "signals", "comms", "log"])(
    "renders the public-safe %s station without owner canaries",
    async (station) => {
      const html = await renderShare({ focus: "portfolio", station });

      expect(html).toContain("Mission Control");
      expect(html).toContain('data-mode="public"');
      expect(html).toContain(`station=${station}`);
      expect(html).not.toMatch(/\$\d[\d,]*\.\d{2}\b/);
      expect(html).not.toContain("PRIVATE_RESEARCH_MARKER");
      expect(html).not.toContain("PRIVATE_SIMULATION_MARKER");
      expect(html).not.toContain("PRIVATE_TRADE_REASON");
      expect(html).not.toContain("OWNER_RESEARCH_HEADLINE");
      expect(html).not.toContain("999999.99");
      expect(html).not.toContain("111111.11");
      expect(html).not.toContain("8888.88");
      expect(html).not.toContain("222.22");
      expect(html).not.toContain("333.33");
      expect(html).not.toContain("444.44");
    },
  );

  it("shows only percentage, weight, and derived telemetry in public stations", async () => {
    const plot = await renderShare({ focus: "portfolio", station: "plot" });
    expect(plot).toContain("PLOT FEED");
    expect(plot).toContain("MANIFEST");

    const log = await renderShare({ focus: "portfolio", station: "log" });
    expect(log).toContain("LOG");
    expect(log).toContain("+2.1% OF BOOK");
    expect(log).not.toContain("PRIVATE_TRADE_REASON");

    const hazard = await renderShare({ focus: "portfolio", station: "hazard" });
    expect(hazard).toContain("HAZARD");
    expect(hazard).toContain("+37.0%");
    expect(hazard).not.toContain("Owner source");
  });

  it("keeps public-only research when the visiting browser is authenticated", async () => {
    isValidSession.mockReturnValue(true);
    const html = await renderShare({ focus: "portfolio", station: "comms" });

    expect(html).toContain('data-mode="public"');
    expect(html).toContain("Public universe / read-only");
    expect(html).toContain("COMMS");
    expect(html).not.toContain("OWNER LINK");
    expect(html).not.toContain("Owner research station");
    expect(html).not.toContain("OWNER_RESEARCH_HEADLINE");
    expect(html).not.toMatch(/\$\d[\d,]*\.\d{2}\b/);
    expect(getResearchData).not.toHaveBeenCalled();
  });
});
