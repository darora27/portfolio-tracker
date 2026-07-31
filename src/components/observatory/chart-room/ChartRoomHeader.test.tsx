// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChartRoomHeader } from "./ChartRoomHeader";

afterEach(cleanup);

describe("ChartRoomHeader (BHV-01)", () => {
  it("renders every chip from real computed values", () => {
    render(
      <ChartRoomHeader
        ticker="IBM"
        companyName="International Business Machines"
        dayPct={-0.007}
        weight={0.076}
        weeklyReturn={0.012}
        monthlyReturn={-0.024}
        sinceBuyPct={0.18}
        earningsInDays={12}
        sessionCount={64}
      />,
    );
    expect(screen.getByText("IBM · INTERNATIONAL BUSINESS MACHINES")).toBeTruthy();
    expect(screen.getByText("▼ 0.7%")).toBeTruthy();
    expect(screen.getByText("7.6%")).toBeTruthy();
    expect(screen.getByText("▲ 1.2%")).toBeTruthy();
    expect(screen.getByText("▼ 2.4%")).toBeTruthy();
    expect(screen.getByText("▲ 18.0% (SIMPLE)")).toBeTruthy();
    expect(screen.getByText("T−12D")).toBeTruthy();
    expect(screen.getByText("64 SESSIONS")).toBeTruthy();
  });

  it("omits, never zeros or fabricates, a chip whose source field is null", () => {
    render(
      <ChartRoomHeader
        ticker="COST"
        companyName={null}
        dayPct={null}
        weight={0.02}
        weeklyReturn={null}
        monthlyReturn={null}
        sinceBuyPct={null}
        earningsInDays={null}
        sessionCount={3}
      />,
    );
    expect(screen.queryByText(/^WEEK/)).toBeNull();
    expect(screen.queryByText(/^30D/)).toBeNull();
    expect(screen.queryByText(/SINCE BUY/)).toBeNull();
    expect(screen.queryByText(/EARNINGS/)).toBeNull();
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.getByText("COST")).toBeTruthy();
    expect(screen.getByText("3 SESSIONS")).toBeTruthy();
  });
});

describe("ChartRoomHeader text roles (VIS-08 rendered half)", () => {
  it("mounts a kicker element and an idplate ticker+company element the source-parse test's selectors target", () => {
    const { container } = render(
      <ChartRoomHeader
        ticker="IBM"
        companyName="International Business Machines"
        dayPct={-0.007}
        weight={0.076}
        weeklyReturn={0.012}
        monthlyReturn={-0.024}
        sinceBuyPct={0.18}
        earningsInDays={12}
        sessionCount={64}
      />,
    );
    const kicker = container.querySelector('[class*="kicker"]');
    expect(kicker?.textContent).toBe("CHART ROOM");
    const idplate = container.querySelector('[class*="idplate"] b');
    expect(idplate?.textContent).toBe("IBM · INTERNATIONAL BUSINESS MACHINES");
  });
});
