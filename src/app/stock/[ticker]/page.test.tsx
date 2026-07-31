import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookies, getStockDetailData, isValidSession } = vi.hoisted(() => ({
  cookies: vi.fn(),
  getStockDetailData: vi.fn(),
  isValidSession: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE_NAME: "portfolio_session",
  isValidSession,
}));
vi.mock("@/lib/stock-data", () => ({ getStockDetailData }));
vi.mock("@/components/layout/NavBar", () => ({ NavBar: () => <nav>Private navigation</nav> }));

async function renderStockPage(ticker = "ibm") {
  const { default: StockDetailPage } = await import("./page");
  return renderToStaticMarkup(
    await StockDetailPage({ params: Promise.resolve({ ticker }) }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OWNER_PASSWORD = "test-owner-password";
  cookies.mockResolvedValue({ get: vi.fn(() => ({ value: "test-session" })) });
});

/**
 * PRV-01: /stock/[ticker] must stay exactly as owner-gated after the §14
 * Chart Room rewrite as it was before it -- this route's session gate,
 * robots directive, and "figures only render once authenticated" behavior
 * are regression surface, not new privacy design (spec §2).
 */
describe("private /stock/[ticker] owner gate (PRV-01)", () => {
  it("shows only the login form and never fetches position data when unauthenticated", async () => {
    isValidSession.mockReturnValue(false);
    const html = await renderStockPage();
    expect(html).toContain("Sign in to view this position");
    expect(html).toContain('type="password"');
    expect(html).toContain('href="/share"');
    expect(html).not.toContain("CHART ROOM");
    expect(getStockDetailData).not.toHaveBeenCalled();
  });

  it("never leaks a figure into the unauthenticated markup even when OWNER_PASSWORD is unset", async () => {
    delete process.env.OWNER_PASSWORD;
    isValidSession.mockReturnValue(true);
    const html = await renderStockPage();
    expect(html).toContain("Sign in to view this position");
    expect(getStockDetailData).not.toHaveBeenCalled();
  });

  it("declares robots:{index:false,follow:false} regardless of ticker", async () => {
    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({ params: Promise.resolve({ ticker: "ibm" }) });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
