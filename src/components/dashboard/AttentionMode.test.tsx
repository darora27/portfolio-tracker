// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { dashboardTestFixture } from "./dashboard-test-fixture";
import { AttentionMode } from "./AttentionMode";

afterEach(cleanup);

describe("AttentionMode", () => {
  it("renders the prioritized first three items with text severity and a more-items link", () => {
    render(
      <AttentionMode
        data={{
          ...dashboardTestFixture,
          pricesAsOf: null,
          upcomingEarnings: [
            { ticker: "MSFT", date: "2026-07-26", hour: "", epsEstimate: null },
            { ticker: "IBM", date: "2026-07-27", hour: "", epsEstimate: null },
          ],
        }}
        today="2026-07-24"
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "What deserves attention?" })).toBeTruthy();
    expect(screen.getByText("Down 4.2% today.")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText(/Critical:/)).toBeTruthy();
    expect(screen.getAllByText(/Notice:/)).toHaveLength(2);
    expect(screen.getByRole("link", { name: /^\+2 more/ }).getAttribute("href"))
      .toBe("/dashboard?mode=analytics#risk");
  });

  it("shows no more-items link at exactly three and the exact clear state at zero", () => {
    const { rerender } = render(
      <AttentionMode
        data={{ ...dashboardTestFixture, pricesAsOf: null }}
        today="2026-07-24"
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByRole("link", { name: /^\+/ })).toBeNull();
    rerender(
      <AttentionMode
        data={{
          ...dashboardTestFixture,
          pricesAsOf: "2026-07-23",
          hhi: 1_200,
          movers: [],
          upcomingEarnings: [],
        }}
        today="2026-07-24"
      />,
    );
    expect(screen.getByText("Nothing needs your attention right now.")).toBeTruthy();
  });
});
