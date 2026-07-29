// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LIVE_QUOTE_REFRESH_INTERVAL_MS } from "@/lib/observatory/data-refresh";
import { SystemPlot } from "./SystemPlot";

const holdings = [
  {
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
  },
] as const;

const radarHoldings = [
  "MSFT", "ASML", "GOOG", "IBM", "COST", "INTC", "NBIS", "CBRS",
].map((ticker, index) => ({
  ...holdings[0],
  ticker,
  companyName: ticker,
  weight: (8 - index) / 36,
})) as typeof holdings[number][];

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

describe("SystemPlot", () => {
  it("keeps the canvas hidden and exposes equivalent keyboard targets", async () => {
    const onSelectTicker = vi.fn();
    const onOpenTicker = vi.fn();
    const { container } = render(
      <SystemPlot
        holdings={holdings}
        activeTicker={null}
        health={0.2}
        onSelectTicker={onSelectTicker}
        onOpenTicker={onOpenTicker}
      />,
    );

    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(
      container
        .querySelector("[data-refresh-interval-ms]")
        ?.getAttribute("data-refresh-interval-ms"),
    ).toBe(String(LIVE_QUOTE_REFRESH_INTERVAL_MS));
    const ring = screen.getByRole("button", { name: /MSFT radar ring/ });
    fireEvent.click(ring);
    expect(onSelectTicker).toHaveBeenCalledWith("MSFT");
    fireEvent.keyDown(ring, { key: "Enter" });
    expect(onOpenTicker).toHaveBeenCalledWith("MSFT");
    await waitFor(() => {
      expect(screen.getByText("SWEEP HELD · 60S REFRESH")).toBeTruthy();
    });
  });

  it("keeps the mobile text-equivalent target list canvas-free", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const { container } = render(
      <SystemPlot
        holdings={holdings}
        activeTicker={null}
        health={0}
        onSelectTicker={vi.fn()}
        onOpenTicker={vi.fn()}
        signalPair="MSFT-IBM"
      />,
    );
    expect(container.querySelectorAll("canvas")).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: /MSFT radar ring/ }),
    ).toBeTruthy();
    expect(screen.getByText("MSFT-IBM PAIR LINE")).toBeTruthy();
  });

  it("renders exactly one ellipse and one blip per holding", () => {
    const { container } = render(
      <SystemPlot
        holdings={radarHoldings}
        activeTicker={null}
        health={0}
        onSelectTicker={vi.fn()}
        onOpenTicker={vi.fn()}
      />,
    );
    expect(container.querySelectorAll("[data-radar-ellipse=true]")).toHaveLength(8);
    expect(screen.getAllByRole("button", { name: /radar blip/ })).toHaveLength(8);
  });

  it("marks the radar paused when its runtime observer reports it off-screen", async () => {
    let notify: IntersectionObserverCallback = () => undefined;
    const disconnect = vi.fn();
    class MockIntersectionObserver {
      root = null;
      rootMargin = "0px";
      thresholds = [0.01];
      constructor(callback: IntersectionObserverCallback) {
        notify = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const { container } = render(
      <SystemPlot
        holdings={holdings}
        activeTicker={null}
        health={0}
        onSelectTicker={vi.fn()}
        onOpenTicker={vi.fn()}
      />,
    );
    notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    await waitFor(() => expect(
      container.querySelector("[data-animation-state=paused]"),
    ).toBeTruthy());
  });
});
