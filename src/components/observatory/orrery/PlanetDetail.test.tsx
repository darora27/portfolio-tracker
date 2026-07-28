// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
  chart: [
    { date: "2026-07-01", index: 100 },
    { date: "2026-07-02", index: 101 },
  ],
};

describe("PlanetDetail", () => {
  it("renders exactly five bays and enforces the since-buy benchmark rule", async () => {
    const { container } = render(
      <PlanetDetail holding={holding} news={[]} basePath="/share" forceNo3d />,
    );
    expect(container.querySelectorAll("section")).toHaveLength(5);
    expect(container.querySelector("p")).toBeNull();
    const visibleWords = (container.textContent ?? "")
      .split(/\s+/)
      .filter((word) => word && !/[\d%β▲▼◆◒⌁]/.test(word));
    expect(visibleWords.length).toBeLessThanOrEqual(60);
    expect(screen.getByText("NO TRANSMISSIONS")).toBeTruthy();
    const benchmark = screen.getByRole("button", { name: "VOO UNAVAILABLE" });
    expect((benchmark as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelectorAll("svg polyline")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "SINCE BUY · SIMPLE" }));
    expect(
      (screen.getByRole("button", { name: "VOO UNAVAILABLE" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("expands transmissions in place while retaining button focus", async () => {
    render(
      <PlanetDetail
        holding={holding}
        news={[{ ticker: "MSFT", headline: "Cloud signal", source: "Wire", url: "https://example.test/news", datetime: 1785200000 }]}
        basePath="/share"
        forceNo3d={false}
      />,
    );
    const more = screen.getByRole("button", { name: "MORE ▸" });
    more.focus();
    fireEvent.click(more);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "LESS ◂" }));
  });
});
