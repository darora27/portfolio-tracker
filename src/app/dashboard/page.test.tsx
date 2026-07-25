import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dashboardTestFixture } from "@/components/dashboard/dashboard-test-fixture";

const {
  cookies, getDashboardData, isValidSession, headlineProps,
  howProps, whyProps, attentionProps, analyticsProps,
} = vi.hoisted(() => ({
  cookies: vi.fn(),
  getDashboardData: vi.fn(),
  isValidSession: vi.fn(),
  headlineProps: vi.fn(),
  howProps: vi.fn(),
  whyProps: vi.fn(),
  attentionProps: vi.fn(),
  analyticsProps: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE_NAME: "portfolio_session",
  isValidSession,
}));
vi.mock("@/lib/dashboard-data", () => ({ getDashboardData }));
vi.mock("@/components/layout/NavBar", () => ({ NavBar: () => <nav>Private navigation</nav> }));
vi.mock("@/components/dashboard/LiveQuotesProvider", () => ({
  LiveQuotesProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/dashboard/LiveHeadlineStats", () => ({
  LiveHeadlineStats: (props: unknown) => {
    headlineProps(props);
    return <div>Live headline stats</div>;
  },
}));
vi.mock("@/components/dashboard/HowAmIDoingMode", () => ({
  HowAmIDoingMode: (props: unknown) => {
    howProps(props);
    return <h2>How am I doing?</h2>;
  },
}));
vi.mock("@/components/dashboard/WhyMode", () => ({
  WhyMode: (props: unknown) => {
    whyProps(props);
    return <h2>Why?</h2>;
  },
}));
vi.mock("@/components/dashboard/AttentionMode", () => ({
  AttentionMode: (props: unknown) => {
    attentionProps(props);
    return <h2>What deserves attention?</h2>;
  },
}));
vi.mock("@/components/dashboard/AllAnalyticsView", () => ({
  AllAnalyticsView: (props: unknown) => {
    analyticsProps(props);
    return <h2>All analytics</h2>;
  },
}));

async function renderDashboard(mode?: string, explain?: string) {
  const { default: Home } = await import("./page");
  return renderToStaticMarkup(await Home({
    searchParams: Promise.resolve({
      ...(mode ? { mode } : {}),
      ...(explain ? { explain } : {}),
    }),
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OWNER_PASSWORD = "test-owner-password";
  cookies.mockResolvedValue({ get: vi.fn(() => ({ value: "test-session" })) });
  isValidSession.mockReturnValue(true);
  getDashboardData.mockResolvedValue(dashboardTestFixture);
});

describe("private /dashboard hierarchy", () => {
  it("preserves the unauthenticated branch and skips private data work", async () => {
    isValidSession.mockReturnValue(false);
    const html = await renderDashboard();
    expect(html).toContain('href="/share"');
    expect(html).toContain("View public share page");
    expect(html).toContain("Portfolio Tracker");
    expect(html).toContain("Sign in to view the private dashboard.");
    expect(html).toContain('type="password"');
    expect((html.match(/<h1/g) ?? [])).toHaveLength(1);
    expect(html).not.toContain("Live headline stats");
    expect(getDashboardData).not.toHaveBeenCalled();
  });

  it.each([
    [undefined, "How am I doing?"],
    ["how", "How am I doing?"],
    ["why", "Why?"],
    ["attention", "What deserves attention?"],
    ["analytics", "All analytics"],
    ["invalid", "How am I doing?"],
  ])("renders only the resolved %s branch", async (mode, expectedHeading) => {
    const html = await renderDashboard(mode);
    expect(html).toContain(">Dashboard</h1>");
    expect((html.match(/<h1/g) ?? [])).toHaveLength(1);
    expect(html).toContain(`>${expectedHeading}</h2>`);
    expect((html.match(/<h2/g) ?? [])).toHaveLength(1);
    expect((html.match(/aria-current=\"page\"/g) ?? [])).toHaveLength(1);
  });

  it("keeps shared headline props identical and passes the exact data object", async () => {
    await renderDashboard("why");
    expect(headlineProps).toHaveBeenCalledWith({
      totalCost: dashboardTestFixture.totalCost,
      simpleReturnPct: dashboardTestFixture.simpleReturnPct,
      dailyChangeAsOf: dashboardTestFixture.dailyChangeAsOf,
      twrPct: dashboardTestFixture.twrPct,
      xirrPct: dashboardTestFixture.xirrPct,
      historyDays: dashboardTestFixture.historyDays,
      pricesAsOf: dashboardTestFixture.pricesAsOf,
      allTimeHigh: dashboardTestFixture.allTimeHigh,
      netFlowsToday: dashboardTestFixture.netFlowsToday,
      prevSnapshotValue: dashboardTestFixture.prevSnapshotValue,
    });
    expect(whyProps).toHaveBeenCalledWith({ data: dashboardTestFixture });
  });

  it("opens a validated explanation only in analytics and preserves it in links", async () => {
    const html = await renderDashboard("analytics", "beta");
    expect(analyticsProps).toHaveBeenCalledWith({
      data: dashboardTestFixture,
      explainOpenId: "beta",
    });
    expect(html).toContain('href="/dashboard?explain=beta&amp;mode=how"');
    analyticsProps.mockClear();
    await renderDashboard("how", "beta");
    expect(howProps).toHaveBeenCalledWith({ data: dashboardTestFixture });
    expect(analyticsProps).not.toHaveBeenCalled();
  });
});
