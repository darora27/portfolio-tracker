// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MissionControl } from "./MissionControl";

const holding = {
  ticker: "MSFT",
  companyName: "Microsoft",
  weight: 0.6,
  contributionPct: 0.12,
  dayReturn: 0.01,
  weeklyReturn: 0.03,
  portfolioRelativeReturn: 0.01,
  volatilityPct: 0.2,
  betaVsVoo: 1,
  chart: [
    { date: "2026-07-01", index: 100 },
    { date: "2026-07-02", index: 104 },
  ],
} as const;

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MissionControl interactions", () => {
  it("expands the MANIFEST text equivalent with public-safe detail", () => {
    const { container } = render(
      <MissionControl
        activePanel="plot"
        mode="public"
        content={<div>PUBLIC PANEL</div>}
        closeHref="/share"
        basePath="/share"
        holdings={[holding]}
        health={0.2}
        teletype="SOL-DEVAN · DAY +1.0%"
        dayReadout="+1.0%"
        newsByHolding={{
          MSFT: [
            {
              ticker: "MSFT",
              headline: "Public transmission headline",
              source: "Fixture",
              url: "https://example.com/public",
              datetime: 1_785_000_000,
            },
          ],
        }}
      />,
    );
    expect(screen.getByRole("dialog", { name: "Mission Control" })).toBeTruthy();
    const manifestRow = container.querySelector<HTMLButtonElement>(
      'button[data-manifest-ticker="MSFT"]',
    );
    expect(manifestRow).toBeTruthy();
    fireEvent.click(manifestRow!);
    expect(screen.getByText("+3.0%")).toBeTruthy();
    expect(screen.getAllByText("60.0%")).toHaveLength(2);
    expect(
      screen
        .getByRole("link", { name: "Public transmission headline" })
        .getAttribute("href"),
    ).toBe("https://example.com/public");
    expect(container.textContent).not.toMatch(/\$\d/);
  });

  it("opens and folds the parchment briefing on demand", () => {
    render(
      <MissionControl
        activePanel="log"
        mode="public"
        content={<div>LOG PANEL</div>}
        closeHref="/share"
        basePath="/share"
        holdings={[]}
        health={0}
        teletype="SOL-DEVAN · DAY —"
      />,
    );
    const briefing = screen.getByRole("button", { name: "BRIEFING ▸" });
    fireEvent.click(briefing);
    expect(screen.getByText("PUBLIC RATIOS · SAME-PERIOD INDEXES · HELD NEWS")).toBeTruthy();
    expect(briefing.getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps cabinet chrome constant when portfolio health changes", () => {
    const { container, rerender } = render(
      <MissionControl
        activePanel="plot"
        mode="public"
        content={<div>PUBLIC PANEL</div>}
        closeHref="/share"
        basePath="/share"
        holdings={[holding]}
        health={0.8}
        teletype="SOL-DEVAN · DAY +1.0%"
      />,
    );
    const before = {
      dialog: container.querySelector("[role=dialog]")?.getAttribute("class"),
      plot: container.querySelector("[aria-label='System plot']")?.getAttribute("class"),
      rail: container.querySelector("[aria-label='Mission instruments']")?.getAttribute("class"),
    };

    rerender(
      <MissionControl
        activePanel="plot"
        mode="public"
        content={<div>PUBLIC PANEL</div>}
        closeHref="/share"
        basePath="/share"
        holdings={[holding]}
        health={-0.8}
        teletype="SOL-DEVAN · DAY -1.0%"
      />,
    );

    expect({
      dialog: container.querySelector("[role=dialog]")?.getAttribute("class"),
      plot: container.querySelector("[aria-label='System plot']")?.getAttribute("class"),
      rail: container.querySelector("[aria-label='Mission instruments']")?.getAttribute("class"),
    }).toEqual(before);
  });
});
