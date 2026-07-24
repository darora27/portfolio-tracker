import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookies,
  getDashboardData,
  getPublicTimelineData,
  isValidSession,
} = vi.hoisted(() => ({
  cookies: vi.fn(),
  getDashboardData: vi.fn(),
  getPublicTimelineData: vi.fn(),
  isValidSession: vi.fn(),
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
vi.mock("@/lib/observatory/timeline-data", () => ({ getPublicTimelineData }));

const dashboardFixture = {
  historyDays: 30,
  twrPct: -0.029,
  xirrPct: 0.1234,
  pricesAsOf: "2026-07-23",
  dailyChangeAsOf: "2026-07-23",
  dailyChangePct: -0.042,
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

async function renderHome(chapter?: string, explain?: string) {
  const { default: Home } = await import("./page");
  const element = await Home({
    searchParams: Promise.resolve({
      ...(chapter ? { chapter } : {}),
      ...(explain ? { explain } : {}),
    }),
  });
  return renderToStaticMarkup(element);
}

beforeEach(() => {
  process.env.OWNER_PASSWORD = "test-owner-password";
  cookies.mockResolvedValue({
    get: vi.fn(() => ({ value: "test-session" })),
  });
  isValidSession.mockReturnValue(true);
  getDashboardData.mockResolvedValue(dashboardFixture);
  getPublicTimelineData.mockResolvedValue(timelineFixture);
});

describe("private / owner briefing", () => {
  it("keeps the unauthenticated sign-in branch and avoids private data work", async () => {
    isValidSession.mockReturnValue(false);

    const html = await renderHome();

    expect(html).toContain('href="/share"');
    expect(html).toContain("View public share page");
    expect(html).toContain("<h1");
    expect(html).toContain("Portfolio Tracker");
    expect(html).toContain("Sign in to view the private dashboard.");
    expect(html).toContain('type="password"');
    expect(html).not.toContain("Portfolio Observatory");
    expect(html).not.toContain("$123,456.78");
    expect(getDashboardData).not.toHaveBeenCalled();
    expect(getPublicTimelineData).not.toHaveBeenCalled();
  });

  it("renders the briefing before subordinate owner utilities", async () => {
    const html = await renderHome();

    expect(html).toContain("01 — Pulse");
    expect(html).toContain("Owner briefing");
    expect(html).toContain("Down 4.2% today.");
    expect(html).toContain("IBM drove most of today&#x27;s move, -4.2%.");
    expect(html).toContain("What deserves attention");
    expect(html).toContain("Notice: ");
    expect(html).toContain('href="/stock/IBM"');
    expect(html).toContain('href="/?chapter=forces"');
    expect(html).toContain("Total value");
    expect(html).toContain("$123,456.78");
    expect(html).toContain("Total cost");
    expect(html).toContain("$100,000.00");
    expect(html).toContain("Simple return");
    expect(html).toContain("+23.5%");
    expect(html.indexOf("Owner briefing")).toBeLessThan(html.indexOf("$123,456.78"));
    expect((html.match(/<h1/g) ?? [])).toHaveLength(1);
  });

  it("renders all four reused Observatory chapters from the same data shapes", async () => {
    const forces = await renderHome("forces");
    expect(forces).toContain("02 — Forces");
    expect(forces).toContain("MSFT contributed the most to total return");

    const structure = await renderHome("structure");
    expect(structure).toContain("The top two holdings make up 73.0%");
    expect(structure).toContain("IBM and MSFT are the most correlated holdings");

    const timeline = await renderHome("timeline");
    expect(timeline).toContain("Annotated divergence ribbon");
    expect(timeline).toContain("Capital added");
    expect(timeline).toContain("Bought IBM");

    const lab = await renderHome("lab");
    expect(lab).toContain("time-weighted return (TWR)");
    expect(lab).toContain("Explain TWR");
    expect(lab).toContain("Explain XIRR");
  });

  it("wires validated direct explanation links only into their home chapter", async () => {
    const xirr = await renderHome("lab", "xirr");
    expect(xirr).toContain("XIRR (annualized return)");
    expect(xirr).toContain("+12.34%");
    expect((xirr.match(/aria-expanded="true"/g) ?? [])).toHaveLength(1);

    const hhi = await renderHome("structure", "hhi");
    expect(hhi).toContain("Herfindahl-Hirschman Index");
    expect((hhi.match(/aria-expanded="true"/g) ?? [])).toHaveLength(1);

    expect(await renderHome("structure", "xirr")).not.toContain(
      'aria-expanded="true"',
    );
    expect(await renderHome("lab", "unknown")).not.toContain(
      'aria-expanded="true"',
    );
  });

  it("renders the exact no-attention fallback", async () => {
    getDashboardData.mockResolvedValue({
      ...dashboardFixture,
      pricesAsOf: "2026-07-23",
      hhi: 1200,
      movers: [],
      upcomingEarnings: [],
    });

    const html = await renderHome();

    expect(html).toContain("Nothing needs your attention right now.");
    expect(html).not.toContain("drove most of today");
  });
});
