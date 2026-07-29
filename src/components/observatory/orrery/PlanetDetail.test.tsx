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
    expect(screen.getAllByText("SINCE BUY")).toHaveLength(2);
    expect(screen.getByText("WEIGHT")).toBeTruthy();
    expect(screen.getByText("21.0%")).toBeTruthy();
    expect(container.textContent).not.toContain("VOO UNAVAILABLE");
    expect(container.textContent).not.toContain("NO TRANSMISSIONS");
    expect(container.textContent).not.toContain("SYSTEMS MANUAL");
    expect(screen.queryByRole("heading", { name: "NEWS" })).toBeNull();
    expect(screen.getByRole("link", { name: "FULL ANALYSIS ▸" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "◂ BACK TO SYSTEM" })).toBeTruthy();
  });

  it("changes both chart title and path when a range detent changes", () => {
    const { container } = render(
      <PlanetDetail holding={holding} news={[]} basePath="/share" forceNo3d={false} />,
    );
    const instrument = container.querySelector<HTMLElement>("[data-chart-signature]");
    const before = instrument?.dataset.chartSignature;
    expect(screen.getByText(/30 DAYS/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "7D" }));
    expect(screen.getByText(/7 DAYS/)).toBeTruthy();
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
