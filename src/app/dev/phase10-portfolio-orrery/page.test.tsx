import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { dashboardTestFixture } from "@/components/dashboard/dashboard-test-fixture";

const { cookies, getDashboardData, isValidSession } = vi.hoisted(() => ({
  cookies: vi.fn(),
  getDashboardData: vi.fn(),
  isValidSession: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies }));
vi.mock("@/lib/dashboard-data", () => ({ getDashboardData }));
vi.mock("@/components/auth/LoginForm", () => ({
  LoginForm: () => <form aria-label="login" />,
}));
vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, isValidSession };
});
vi.mock("./OrreryWorld", () => ({
  OrreryWorld: (props: unknown) => <pre>{JSON.stringify(props)}</pre>,
}));

import PortfolioOrreryPage from "./page";

beforeEach(() => {
  process.env.OWNER_PASSWORD = "test-password";
  cookies.mockResolvedValue({ get: () => ({ value: "session" }) });
  isValidSession.mockReturnValue(true);
  getDashboardData.mockResolvedValue(dashboardTestFixture);
});

describe("Portfolio Orrery owner gate and public-safe projection", () => {
  it("gates before loading portfolio data", async () => {
    isValidSession.mockReturnValue(false);
    const html = renderToStaticMarkup(
      await PortfolioOrreryPage({ searchParams: Promise.resolve({}) }),
    );
    expect(html).toContain("Sign in to view");
    expect(getDashboardData).not.toHaveBeenCalled();
  });

  it("passes only the public-safe holding projection to the client world", async () => {
    const html = renderToStaticMarkup(
      await PortfolioOrreryPage({
        searchParams: Promise.resolve({ holding: "IBM", no3d: "1" }),
      }),
    );
    expect(html).toContain("holdings");
    expect(html).toContain("selectedTicker");
    expect(html).not.toContain("totalValue");
    expect(html).not.toContain("shares");
    expect(html).not.toMatch(/\$[0-9]/);
  });
});
