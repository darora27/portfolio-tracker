// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboardTestFixture } from "./dashboard-test-fixture";
import { WhyMode } from "./WhyMode";

vi.mock("./ContributionChart", () => ({
  ContributionChart: ({ entries }: { entries: unknown[] }) => (
    <div data-testid="contribution-chart" data-entries={entries.length} />
  ),
}));

afterEach(cleanup);

describe("WhyMode", () => {
  it("renders the reused driver, three facts, contribution entries, and continuation", () => {
    render(<WhyMode data={dashboardTestFixture} />);
    expect(screen.getByRole("heading", { level: 2, name: "Why?" })).toBeTruthy();
    expect(screen.getByText(/The largest drag came from IBM/)).toBeTruthy();
    expect(screen.getAllByRole("term")).toHaveLength(3);
    expect(screen.getByText("MSFT +10.0%")).toBeTruthy();
    expect(screen.getByText("IBM -10.0%")).toBeTruthy();
    expect(screen.getByText("No new capital added today.")).toBeTruthy();
    expect(screen.getByTestId("contribution-chart").getAttribute("data-entries")).toBe("2");
    expect(screen.getByRole("link", { name: "Open Holdings analytics →" }).getAttribute("href"))
      .toBe("/dashboard?mode=analytics#holdings");
  });

  it("omits the driver paragraph when the established helper returns null", () => {
    render(<WhyMode data={{ ...dashboardTestFixture, historyDays: 5 }} />);
    expect(screen.queryByText(/largest drag|shortfall|single holding/)).toBeNull();
  });
});
