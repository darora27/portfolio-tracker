// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PlanetDetail } from "./PlanetDetail";

const holding = {
  ticker: "MSFT",
  companyName: "Microsoft",
  weight: 0.21,
  weeklyReturn: 0.02,
  portfolioRelativeReturn: 0.01,
  contributionPct: 0.008,
  volatilityPct: 0.22,
  betaVsVoo: 1.03,
  dayReturn: -0.012,
  nextEarningsDays: 2,
  chart: Array.from({ length: 40 }, (_, index) => ({
    date: `2026-06-${String(index + 1).padStart(2, "0")}`,
    index: 100 + Math.sin(index / 3) * 4 + index * 0.2,
  })),
};

afterEach(cleanup);

describe("PlanetDetail", () => {
  it("renders the labelled ten-second stack without error furniture", () => {
    const { container } = render(
      <PlanetDetail holding={holding} news={[]} basePath="/share" forceNo3d />,
    );
    expect(screen.getByText("TODAY")).toBeTruthy();
    expect(screen.getByText("▼ 1.2%")).toBeTruthy();
    expect(screen.getByText("WEEK")).toBeTruthy();
    /* R7-W5 replaced the LABEL/value pills with a spec sheet: label and
     * figure are separate dt/dd cells rather than one string, so the checks
     * move from "30D ▲ 1.2%" to the two halves. Same facts, and now
     * addressable individually — which is what let the figures move up a type
     * role without dragging their labels with them. */
    expect(screen.getByText("30 DAYS")).toBeTruthy();
    expect(screen.getAllByText("SINCE BUY").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("WEIGHT")).toBeTruthy();
    expect(screen.getByText("21.0%")).toBeTruthy();
    expect(container.textContent).not.toContain("VOO UNAVAILABLE");
    expect(container.textContent).not.toContain("NO TRANSMISSIONS");
    expect(container.textContent).not.toContain("SYSTEMS MANUAL");
    expect(screen.queryByRole("heading", { name: "NEWS" })).toBeNull();
    expect(screen.getByRole("link", { name: "FULL ANALYSIS ▸" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "◂ BACK TO SYSTEM" })).toBeTruthy();
  });

  it("FB-25 (§13): shows CONTRIBUTION and VS VOO when populated, omits them when null", () => {
    /* Labels spelled out in R7-W5 — "CONTRIB" and "VS VOO" were truncations
     * that saved room the spec sheet no longer needs, and he has reported
     * unreadability seven times. The question this test asks is unchanged:
     * a null must remove the row, not render a dash. */
    const { container, rerender } = render(
      <PlanetDetail holding={holding} news={[]} basePath="/share" forceNo3d />,
    );
    expect(screen.getByText("CONTRIBUTION")).toBeTruthy();
    expect(screen.getByText("VS VOO · SAME PERIOD")).toBeTruthy();
    rerender(
      <PlanetDetail
        holding={{ ...holding, contributionPct: null, portfolioRelativeReturn: null }}
        news={[]}
        basePath="/share"
        forceNo3d
      />,
    );
    expect(screen.queryByText("CONTRIBUTION")).toBeNull();
    expect(screen.queryByText("VS VOO · SAME PERIOD")).toBeNull();
    expect(container.textContent).not.toContain("VS VOO · SAME PERIOD —");
  });

  it("omits the 30D window when no return can be computed", () => {
    const { container } = render(
      <PlanetDetail
        holding={{ ...holding, chart: [] }}
        news={[]}
        basePath="/share"
        forceNo3d={false}
      />,
    );
    expect(container.querySelector('[data-window="30d"]')).toBeNull();
  });

  it("changes both chart title and path when a range detent changes", () => {
    const { container } = render(
      <PlanetDetail holding={holding} news={[]} basePath="/share" forceNo3d={false} />,
    );
    const instrument = container.querySelector<HTMLElement>("[data-chart-signature]");
    const before = instrument?.dataset.chartSignature;
    /* R7-W5 renamed the spec row "30D" to "30 DAYS", which is also the chart's
     * own title — so an unscoped query now matches two elements. Scoped to the
     * instrument, because this test is about the CHART's title tracking its
     * detent, not about the spec sheet. */
    const instrumentTitle = () => instrument?.querySelector("h3")?.textContent ?? "";
    expect(instrumentTitle()).toMatch(/30 DAYS/);
    fireEvent.click(screen.getByRole("button", { name: "7D" }));
    expect(instrumentTitle()).toMatch(/7 DAYS/);
    expect(instrument?.dataset.chartSignature).not.toBe(before);
    fireEvent.click(screen.getByRole("button", { name: "SINCE BUY" }));
    expect(screen.getByText(/^SINCE BUY ·/)).toBeTruthy();
    // §11 review F4: a holding's chart starts at purchase, so MAX could
    // never differ from SINCE BUY — the consequence-free detent no longer
    // renders (round 5's rule; distinct-window coverage lives in
    // ReturnInstrument.test.tsx).
    expect(screen.queryByRole("button", { name: "MAX" })).toBeNull();
    expect(screen.queryByRole("button", { name: /VOO/ })).toBeNull();

    const plot = container.querySelector("svg");
    expect(plot?.querySelectorAll("line")).toHaveLength(4);
    expect(plot?.querySelectorAll("circle")).toHaveLength(2);
    expect(plot?.querySelectorAll("path")).toHaveLength(1);
  });

  it("renders only linkable NEWS and omits the whole zone when none remain", () => {
    const { rerender } = render(
      <PlanetDetail
        holding={holding}
        news={[
          { ticker: "MSFT", headline: "Cloud signal", source: "Wire", url: "https://example.test/news", datetime: 1785200000 },
          { ticker: "MSFT", headline: "Dead signal", source: "Wire", url: "", datetime: 1785200001 },
        ]}
        basePath="/share"
        forceNo3d={false}
      />,
    );
    expect(screen.getByRole("link", { name: /Cloud signal/ }).getAttribute("href"))
      .toBe("https://example.test/news");
    expect(screen.queryByText("Dead signal")).toBeNull();
    rerender(
      <PlanetDetail
        holding={holding}
        news={[{ ticker: "MSFT", headline: "Dead signal", source: "Wire", url: "", datetime: 1785200001 }]}
        basePath="/share"
        forceNo3d={false}
      />,
    );
    expect(screen.queryByRole("heading", { name: "NEWS" })).toBeNull();
  });
});

describe("PlanetDetail — owner facts (R7-W5)", () => {
  const ownerFacts = {
    shares: 12,
    value: 9_876,
    costBasis: 8_000,
    dayDollars: -123,
    gainDollars: 1_876,
  };

  it("shows the owner's position when given it", () => {
    render(
      <PlanetDetail
        holding={holding}
        news={[]}
        basePath="/"
        forceNo3d
        mode="private"
        ownerFacts={ownerFacts}
      />,
    );
    expect(screen.getByText("12 SHARES")).toBeTruthy();
    expect(screen.getByText("$9,876")).toBeTruthy();
    expect(screen.getByText("$8,000")).toBeTruthy();
    expect(screen.getByText("+$1,876")).toBeTruthy();
    expect(screen.getByText("−$123")).toBeTruthy();
  });

  it("renders no dollar figure at all without owner facts", () => {
    /* The panel's public contract. Not "shows a dash where a number would be"
     * — the rows are absent, because a blanked row still tells a visitor that
     * a figure exists and is being withheld. */
    const { container } = render(
      <PlanetDetail holding={holding} news={[]} basePath="/share" forceNo3d mode="public" />,
    );
    expect(container.innerHTML).not.toMatch(/\$\d/);
    expect(screen.queryByText(/SHARES/)).toBeNull();
    expect(screen.queryByText("COST BASIS")).toBeNull();
  });

  it("ignores owner facts in public mode even if a caller passes them", () => {
    /* Defence in depth. UniverseRoute already withholds these server-side, so
     * they should never arrive here on /share — but a component that renders
     * whatever it is handed makes the whole guarantee depend on every future
     * caller getting it right. This one checks its own mode. */
    const { container } = render(
      <PlanetDetail
        holding={holding}
        news={[]}
        basePath="/share"
        forceNo3d
        mode="public"
        ownerFacts={ownerFacts}
      />,
    );
    expect(container.innerHTML).not.toContain("9,876");
    expect(container.innerHTML).not.toContain("SHARES");
  });
});
