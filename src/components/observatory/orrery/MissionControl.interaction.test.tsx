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
  it("draws one accessible radar ellipse per holding", () => {
    const { container } = render(
      <MissionControl
        activePanel="plot"
        mode="public"
        content={<div>PUBLIC ROOM</div>}
        closeHref="/share"
        basePath="/share"
        holdings={[holding]}
        health={0.2}
      />,
    );
    expect(screen.getByRole("dialog", { name: "Mission Control" })).toBeTruthy();
    expect(container.querySelectorAll('[data-radar-ellipse="true"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-radar-ticker="MSFT"]')).toHaveLength(2);
  });

  it("opens and folds the parchment briefing on demand", () => {
    render(
      <MissionControl
        activePanel="log"
        mode="public"
        content={<div>TRADES ROOM</div>}
        closeHref="/share"
        basePath="/share"
        holdings={[]}
        health={0}
      />,
    );
    const briefing = screen.getByRole("button", { name: "BRIEFING ▸" });
    fireEvent.click(briefing);
    expect(screen.getByText(/RETURNS ARE WINDOWED/)).toBeTruthy();
    expect(briefing.getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps room chrome constant when portfolio health changes", () => {
    const props = {
      activePanel: "plot" as const,
      mode: "public" as const,
      content: <div>PUBLIC ROOM</div>,
      closeHref: "/share",
      basePath: "/share",
      holdings: [holding],
    };
    const { container, rerender } = render(<MissionControl {...props} health={0.8} />);
    const before = {
      dialog: container.querySelector("[role=dialog]")?.getAttribute("class"),
      orbits: container.querySelector("#orbits")?.getAttribute("class"),
    };
    rerender(<MissionControl {...props} health={-0.8} />);
    expect({
      dialog: container.querySelector("[role=dialog]")?.getAttribute("class"),
      orbits: container.querySelector("#orbits")?.getAttribute("class"),
    }).toEqual(before);
  });
});
