// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboardTestFixture } from "./dashboard-test-fixture";
import { HowAmIDoingMode } from "./HowAmIDoingMode";

vi.mock("./ValueChart", () => ({
  ValueChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="value-chart" data-points={data.length} />
  ),
}));

afterEach(cleanup);

describe("HowAmIDoingMode", () => {
  it("renders one lead, exactly three facts, unchanged chart data, and its continuation", () => {
    render(<HowAmIDoingMode data={dashboardTestFixture} />);
    expect(screen.getByRole("heading", { level: 2, name: "How am I doing?" })).toBeTruthy();
    expect(screen.getByText(/the portfolio is Down 2.9% while VOO is Up 1.7%/)).toBeTruthy();
    expect(screen.getAllByRole("term")).toHaveLength(3);
    expect(screen.getByText("-2.90%")).toBeTruthy();
    expect(screen.getByText("-4.60% vs. VOO")).toBeTruthy();
    expect(screen.getByText("-8.1%")).toBeTruthy();
    expect(screen.getByTestId("value-chart").getAttribute("data-points")).toBe("2");
    expect(screen.getByRole("link", { name: "Open Performance analytics →" }).getAttribute("href"))
      .toBe("/dashboard?mode=analytics#performance");
  });

  it("uses the established benchmark-unavailable short-history copy", () => {
    render(
      <HowAmIDoingMode
        data={{ ...dashboardTestFixture, historyDays: 5, benchmarkComparisons: [] }}
      />,
    );
    expect(screen.getByText(/Building the market-relative picture/)).toBeTruthy();
    expect(screen.getByText("VOO comparison unavailable")).toBeTruthy();
  });
});
