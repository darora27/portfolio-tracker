// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DashboardData } from "@/lib/dashboard-data";
import { MissionControlRoomContent } from "./MissionControlRoomContent";
import styles from "./orrery.module.css";

/**
 * §15: HOLDINGS/RETURNS/MIX/RISK/ACTIVITY content rework, plus door #1
 * (HOLDINGS row -> the Chart Room in private mode only). BHV-02 through
 * BHV-08 and PRV-01.
 */

vi.mock("./LazyMissionSection", () => ({
  LazyMissionSection: ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => <section id={id}><h3>{title}</h3>{children}</section>,
}));

const positionRows = [
  {
    ticker: "IBM", shares: 10, costBasis: 18_000, price: 180, priceAsOf: "2026-07-23",
    value: 1_800, gain: -200, gainPct: -0.1, weight: 0.6, contribution: -0.011,
    day: -20, dayPct: -0.011, isNewToday: false, sparkline: [190, 185, 180], prevClose: 182,
    dayLabel: "TODAY", dayDirection: "down" as const, dayCarried: false,
  },
  {
    ticker: "MSFT", shares: 5, costBasis: 2_000, price: 440, priceAsOf: "2026-07-23",
    value: 1_200, gain: 200, gainPct: 0.1, weight: 0.4, contribution: 0.1,
    day: 30, dayPct: 0.026, isNewToday: false, sparkline: [420, 430, 440], prevClose: 428.5,
    dayLabel: "TODAY", dayDirection: "up" as const, dayCarried: false,
  },
];

const baseData = {
  positionRows,
  publicOrreryHoldings: [
    { ticker: "IBM", weight: 0.6, dayReturn: -0.011, weeklyReturn: -0.02 },
    { ticker: "MSFT", weight: 0.4, dayReturn: 0.026, weeklyReturn: 0.031 },
  ],
  movers: [
    { ticker: "IBM", day: -20, dayPct: -0.011 },
    { ticker: "MSFT", day: 30, dayPct: 0.026 },
  ],
  top2ConcentrationPct: 1,
  hhi: 5_200,
  realizedGain: 100,
  unrealizedGain: 0,
  donutSlices: [
    { ticker: "IBM", weight: 0.6, value: 1_800 },
    { ticker: "MSFT", weight: 0.4, value: 1_200 },
  ],
  sectorWeights: [{ label: "Technology", weight: 1 }],
  aiExposureWeights: [{ label: "High", weight: 0.4 }, { label: "Low", weight: 0.6 }],
  benchmarkComparisons: [
    { ticker: "VOO", available: true, beta: 1.1, twrPct: 0.02, excessReturnPct: -0.01, chartIndex: [100, 99] },
    { ticker: "VTI", available: true, beta: 1.05, twrPct: 0.018, excessReturnPct: -0.008, chartIndex: [100, 99.2] },
    { ticker: "XLK", available: false, beta: null, twrPct: null, excessReturnPct: null, chartIndex: [] },
  ],
  holdingsPerformance: {
    tickers: ["IBM", "MSFT"],
    hasOther: false,
    points: [
      { date: "2026-07-01", IBM: 0, MSFT: 0 },
      { date: "2026-07-23", IBM: -8, MSFT: 12 },
    ],
  },
  holdingRisks: [
    { ticker: "IBM", volatilityPct: 0.18, betaVsVoo: 0.8 },
    { ticker: "MSFT", volatilityPct: 0.24, betaVsVoo: 1.2 },
  ],
  drawdownSeries: [
    { date: "2026-07-01", drawdown: 0 },
    { date: "2026-07-23", drawdown: -0.08 },
  ],
  dailyReturnBars: [
    { date: "2026-07-23", return: -0.011 },
  ],
  compositionHistory: {
    tickers: ["IBM", "MSFT"],
    hasOther: false,
    points: [
      { date: "2026-07-01", IBM: 65, MSFT: 35 },
      { date: "2026-07-23", IBM: 60, MSFT: 40 },
    ],
  },
  publicTradeLog: [
    { date: "2026-07-14", action: "buy", ticker: "MSFT", impactPct: 0.021, realizedSign: 0 },
  ],
  upcomingEarnings: [
    { ticker: "IBM", date: "2026-08-03", hour: "amc", epsEstimate: 3.2 },
  ],
  newsByHolding: {},
  chartData: [
    { date: "2026-07-01", portfolioIndex: 100, vooIndex: 100, vtiIndex: 100, xlkIndex: 100 },
    { date: "2026-07-23", portfolioIndex: 99, vooIndex: 99.5, vtiIndex: 99.4, xlkIndex: 98 },
  ],
  volatilityPct: 0.2,
  maxDrawdown: -0.08,
  betaVsVoo: 1,
  allTimeHigh: { pct: -0.08, peakDate: "2026-06-30" },
  historyDays: 120,
  xirrPct: 0.4,
  dailyChangeAsOf: "2026-07-23",
  pricesAsOf: "2026-07-23",
} as unknown as DashboardData;

afterEach(cleanup);

describe("MissionControlRoomContent — HOLDINGS (BHV-02, door #1: BHV-08/PRV-01)", () => {
  it("renders every real holding (not capped to eight), with real per-row figures, a movers line, and a TOP-2/HHI line", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={baseData} basePath="/share" mode="public" />,
    );
    expect(html).toContain("IBM");
    expect(html).toContain("MSFT");
    expect(html).toContain("BEST TODAY");
    expect(html).toContain("WORST");
    expect(html).toContain("TOP-2");
    expect(html).toContain("100.0%");
    expect(html).not.toContain("VALUE");
  });

  it("private mode adds the VALUE column and real dollar figures", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={baseData} basePath="/" mode="private" />,
    );
    expect(html).toContain("VALUE");
    expect(html).toContain("$1,800");
    expect(html).toContain("$1,200");
  });

  it("BHV-08: private mode routes the HOLDINGS row to the Chart Room", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={baseData} basePath="/" mode="private" />,
    );
    expect(html).toContain('href="/stock/IBM"');
    expect(html).toContain('href="/stock/MSFT"');
  });

  it("PRV-01: public mode never links a HOLDINGS row to /stock/[ticker]", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={baseData} basePath="/share" mode="public" />,
    );
    expect(html).not.toContain("/stock/");
    expect(html).toContain('href="/share?holding=IBM&amp;camera=approach"');
  });
});

describe("MissionControlRoomContent — RETURNS (BHV-03)", () => {
  /* R7-W3(a). These two tests previously asserted a benchmark RADIO — pick
   * one of VOO/VTI/XLK — and a column of per-stock sparklines. Devan's July 31
   * feedback named both as the thing the older dashboard did better: he wants
   * the benchmarks on screen together and the stocks compared against each
   * other on one pair of axes. The behaviour changed, so the assertions
   * changed with it. They are rewritten, not removed: the questions they ask
   * (are all three benchmarks reachable, is STOCK VS STOCK backed by real
   * holdingsPerformance data) are still the right questions. */

  it("shows the book against all three benchmarks at once, each independently toggleable", () => {
    const { container } = render(
      <MissionControlRoomContent data={baseData} basePath="/share" mode="public" />,
    );
    const voo = screen.getByRole("button", { name: "VOO" });
    const vti = screen.getByRole("button", { name: "VTI" });
    const xlk = screen.getByRole("button", { name: "XLK" });

    // All on by default — the comparison is the point of the section.
    for (const chip of [voo, vti, xlk]) {
      expect(chip.getAttribute("aria-pressed")).toBe("true");
    }
    expect(
      screen.getByRole("button", { name: "BOOK" }).getAttribute("aria-pressed"),
    ).toBe("true");

    // Independent, not mutually exclusive: hiding VTI leaves VOO alone.
    fireEvent.click(vti);
    expect(vti.getAttribute("aria-pressed")).toBe("false");
    expect(voo.getAttribute("aria-pressed")).toBe("true");
    expect(xlk.getAttribute("aria-pressed")).toBe("true");

    // One drawn line per visible series, and one fewer once VTI is off.
    const paths = container.querySelectorAll(`.${styles.returnPlot} path`);
    expect(paths.length).toBe(3);

    expect(screen.getByText(/VS VOO · SAME PERIOD/)).toBeTruthy();
    expect(screen.getByText(/VS VTI · SAME PERIOD/)).toBeTruthy();
    expect(screen.getByText(/VS XLK · SAME PERIOD/)).toBeTruthy();
  });

  it("plots holdings against each other in STOCK VS STOCK, from real holdingsPerformance data", () => {
    const { container } = render(
      <MissionControlRoomContent data={baseData} basePath="/share" mode="public" />,
    );
    expect(screen.queryByRole("button", { name: "IBM" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "STOCK VS STOCK" }));

    const ibmToggle = screen.getByRole("button", { name: "IBM" });
    expect(ibmToggle.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "MSFT" })).toBeTruthy();

    // Two holdings, two lines on one pair of axes — which is what comparing
    // them to each other requires, and what a column of sparklines cannot do.
    expect(
      container.querySelectorAll(`.${styles.returnPlot} path`).length,
    ).toBe(2);

    fireEvent.click(ibmToggle);
    expect(ibmToggle.getAttribute("aria-pressed")).toBe("false");
    expect(
      container.querySelectorAll(`.${styles.returnPlot} path`).length,
    ).toBe(1);
  });

  it("switches a series off without changing any other series' colour", () => {
    // Colour follows the entity, never its rank — so hiding one line must not
    // repaint the rest. This is the rendered counterpart of the palette test.
    const { container } = render(
      <MissionControlRoomContent data={baseData} basePath="/share" mode="public" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "STOCK VS STOCK" }));
    const strokeOf = (ticker: string) =>
      container
        .querySelector(`[data-series="${ticker}"]`)
        ?.getAttribute("style") ?? "";
    const msftBefore = strokeOf("MSFT");
    fireEvent.click(screen.getByRole("button", { name: "IBM" }));
    expect(strokeOf("MSFT")).toBe(msftBefore);
  });
});

describe("MissionControlRoomContent — MIX (BHV-04)", () => {
  it("renders composition-by-percentage and sector/AI classification from real data", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={baseData} basePath="/share" mode="public" />,
    );
    expect(html).toContain("MIX");
    expect(html).toContain("TECHNOLOGY");
    expect(html).toContain("HIGH");
    expect(html).toContain("LOW");
  });

  it("renders a designed-empty state, not a fabricated shape, when a sub-part's source is thin", () => {
    const thin = { ...baseData, sectorWeights: [], aiExposureWeights: [] } as unknown as DashboardData;
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={thin} basePath="/share" mode="public" />,
    );
    expect(html).toContain("NO SECTOR DATA");
    expect(html).toContain("NO CLASSIFICATION DATA");
  });
});

describe("MissionControlRoomContent — RISK (BHV-05)", () => {
  it("retains the three gauges and adds real drawdown/daily-return history plus a BY HOLDING disclosure", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={baseData} basePath="/share" mode="public" />,
    );
    expect(html).toContain("VOL · SINCE START");
    expect(html).toContain("BETA · SAME PERIOD VOO");
    expect(html).toContain("OFF HIGH");
    expect(html).toContain("DRAWDOWN · SINCE START");
    expect(html).toContain("DAILY RETURNS · SINCE START");
    expect(html).toContain("BY HOLDING ▸");
  });

  it("BY HOLDING discloses the real per-holding risk list on open", () => {
    render(<MissionControlRoomContent data={baseData} basePath="/share" mode="public" />);
    const details = screen.getByText("BY HOLDING ▸").closest("details");
    expect(details?.open).toBeFalsy();
    expect(screen.getByText("VOL 18.0%")).toBeTruthy();
    expect(screen.getByText("VOL 24.0%")).toBeTruthy();
    fireEvent.click(screen.getByText("BY HOLDING ▸"));
    expect(details?.open).toBe(true);
  });

  it("attaches a real, keyboard-operable MetricDisclosure to VOL/BETA/DRAWDOWN", () => {
    render(<MissionControlRoomContent data={baseData} basePath="/share" mode="public" />);
    const triggers = screen.getAllByRole("button", { name: /ⓘ/ });
    expect(triggers.length).toBeGreaterThanOrEqual(3);
    fireEvent.click(triggers[0]);
    expect(triggers[0].getAttribute("aria-expanded")).toBe("true");
    const region = screen.getAllByRole("region")[0];
    expect(region).toBeTruthy();
    fireEvent.keyDown(region, { key: "Escape" });
    expect(triggers[0].getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(triggers[0]);
  });

  it("closing a MetricDisclosure with Escape does not bubble to a page-level Escape handler (Mission Control's own exit-the-room listener)", () => {
    const windowEscape = vi.fn();
    window.addEventListener("keydown", windowEscape);
    render(<MissionControlRoomContent data={baseData} basePath="/share" mode="public" />);
    const trigger = screen.getAllByRole("button", { name: /ⓘ/ })[0];
    fireEvent.click(trigger);
    const region = screen.getAllByRole("region")[0];
    fireEvent.keyDown(region, { key: "Escape" });
    expect(windowEscape).not.toHaveBeenCalled();
    window.removeEventListener("keydown", windowEscape);
  });
});

describe("MissionControlRoomContent — ACTIVITY (BHV-06)", () => {
  it("renames TRADES to ACTIVITY and BOOK IMPACT to EFFECT ON PORTFOLIO", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={baseData} basePath="/" mode="private" />,
    );
    expect(html).toContain("ACTIVITY");
    expect(html).not.toContain("TRADES</h3>");
    expect(html).toContain("EFFECT ON PORTFOLIO");
    expect(html).not.toContain("BOOK IMPACT");
    expect(html).toContain("OPEN TRADE DESK");
  });
});

describe("MissionControlRoomContent — cuts (BHV-07)", () => {
  it("never renders a CORRELATION or standalone EARNINGS section", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={baseData} basePath="/share" mode="public" />,
    );
    expect(html).not.toContain("CORRELATION");
    expect(html).not.toContain('id="earnings"');
    expect(html).not.toContain('id="correlation"');
    expect(html).not.toContain('id="news"');
  });
});
