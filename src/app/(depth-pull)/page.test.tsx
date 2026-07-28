import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookies,
  getDashboardData,
  getHistoryData,
  getResearchData,
  isValidSession,
  from,
} = vi.hoisted(() => ({
  cookies: vi.fn(),
  getDashboardData: vi.fn(),
  getHistoryData: vi.fn(),
  getResearchData: vi.fn(),
  isValidSession: vi.fn(),
  from: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE_NAME: "portfolio_session",
  isValidSession,
}));
vi.mock("@/lib/dashboard-data", () => ({ getDashboardData }));
vi.mock("@/lib/history-data", () => ({ getHistoryData }));
vi.mock("@/lib/research-data", () => ({ getResearchData }));
vi.mock("@/lib/supabase/client", () => ({ supabase: { from } }));

const dashboardFixture = {
  historyDays: 30,
  twrPct: -0.029,
  xirrPct: 0.1234,
  pricesAsOf: "2026-07-23",
  dailyChangeAsOf: "2026-07-23",
  dailyChangePct: -0.042,
  twr7d: -0.018,
  volatilityPct: 0.37,
  chartData: [
    { date: "2026-06-24", portfolioIndex: 100, vooIndex: 100 },
    { date: "2026-07-23", portfolioIndex: 97.1, vooIndex: 101.7 },
  ],
  positionRows: [
    { ticker: "IBM", contribution: -0.027, weight: 0.42 },
    { ticker: "MSFT", contribution: 0.011, weight: 0.31 },
  ],
  movers: [{ ticker: "IBM", day: -123.45, dayPct: -0.042 }],
  top2ConcentrationPct: 0.73,
  hhi: 3000,
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
  upcomingEarnings: [],
  totalValue: 123456.78,
  totalCost: 100000,
  simpleReturnPct: 0.2345678,
  publicOrreryHoldings: [
    {
      ticker: "IBM",
      companyName: "IBM",
      weight: 0.42,
      weeklyReturn: -0.021,
      portfolioRelativeReturn: -0.016,
      volatilityPct: 0.18,
      betaVsVoo: 0.74,
      dayReturn: -0.042,
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
};

async function renderHome(selection: {
  focus?: string;
  holding?: string;
  no3d?: string;
  station?: string;
} = {}) {
  const { default: Home } = await import("./page");
  const element = await Home({
    searchParams: Promise.resolve(selection),
  });
  return renderToStaticMarkup(element);
}

beforeEach(() => {
  getDashboardData.mockReset();
  getHistoryData.mockReset();
  getResearchData.mockReset();
  isValidSession.mockReset();
  process.env.OWNER_PASSWORD = "test-owner-password";
  cookies.mockResolvedValue({
    get: vi.fn(() => ({ value: "test-session" })),
  });
  isValidSession.mockReturnValue(true);
  getDashboardData.mockResolvedValue(dashboardFixture);
  getHistoryData.mockResolvedValue({});
  getResearchData.mockResolvedValue({
    redditConfigured: false,
    marketNews: [],
    rows: [],
  });
});

describe("private / owner universe", () => {
  it("keeps the unauthenticated sign-in branch and avoids private data work", async () => {
    isValidSession.mockReturnValue(false);

    const html = await renderHome();

    expect(html).toContain('href="/share"');
    expect(html).toContain("View public share page");
    expect(html).toContain("<h1");
    expect(html).toContain("Portfolio Tracker");
    expect(html).toContain("Sign in to view the private universe.");
    expect(html).toContain('type="password"');
    expect(html).not.toContain("Portfolio Observatory");
    expect(html).not.toContain("$123,456.78");
    expect(getDashboardData).not.toHaveBeenCalled();
    expect(getHistoryData).not.toHaveBeenCalled();
  });

  it("renders the shared universe at the authenticated front door", async () => {
    const html = await renderHome();

    expect(html).toContain("Stock Market Universe");
    expect(html).toContain("Private universe / owner access");
    expect(html).not.toContain("Public universe / read-only");
    expect(html).toContain('href="/?focus=portfolio&amp;camera=command"');
    expect(html).toContain('href="/?holding=IBM&amp;camera=approach"');
    expect(html).not.toContain("01 — Pulse");
    expect(html).not.toContain("Portfolio Observatory");
    expect((html.match(/<h1/g) ?? [])).toHaveLength(1);
  });

  it("uses the owner Mission Control on the gated route", async () => {
    const html = await renderHome({
      focus: "portfolio",
      station: "comms",
    });
    expect(html).toContain('data-mode="private"');
    expect(html).toContain("OWNER LINK");
    expect(html).toContain("Owner research station");
    expect(html).toContain('href="/?focus=portfolio');
  });

  it("restores a selected holding without changing the root route", async () => {
    const html = await renderHome({ holding: "IBM", no3d: "1" });
    expect(html).toContain("IBM · IBM");
    expect(html).toContain("TELEMETRY");
    expect(html).toContain('href="/?no3d=1"');
  });

  it("does not expose the owner universe to a failed session", async () => {
    isValidSession.mockReturnValue(false);
    const html = await renderHome({ focus: "portfolio" });
    expect(html).toContain('type="password"');
    expect(html).not.toContain("Mission Control");
    expect(getDashboardData).not.toHaveBeenCalled();
  });
});
