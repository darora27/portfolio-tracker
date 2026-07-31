// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DistributionBench } from "./DistributionBench";
import { VsMarketBench } from "./VsMarketBench";
import { DepthBench } from "./DepthBench";
import { MovesWithBench } from "./MovesWithBench";
import { ContributionBench } from "./ContributionBench";
import { CompanyBench } from "./CompanyBench";

afterEach(cleanup);

const dailyReturns = [
  { date: "2026-07-01", r: 0.01 },
  { date: "2026-07-02", r: -0.02 },
  { date: "2026-07-03", r: 0.015 },
  { date: "2026-07-06", r: -0.005 },
  { date: "2026-07-07", r: 0.02 },
  { date: "2026-07-08", r: -0.01 },
];

describe("DISTRIBUTION bench (BHV-05)", () => {
  it("renders a real sigma/vol stamp from real data", () => {
    render(<DistributionBench dailyReturns={dailyReturns} volatilityPct={0.32} />);
    expect(screen.getByText(/SINCE BUY · N=6 SESSIONS/)).toBeTruthy();
    expect(screen.getByText(/VOL ANN 32%/)).toBeTruthy();
  });

  it("renders its designed empty state, never a fabricated number, for thin history", () => {
    render(<DistributionBench dailyReturns={[]} volatilityPct={null} />);
    expect(screen.getByText(/Not enough history/)).toBeTruthy();
  });
});

describe("VS MARKET bench (BHV-05)", () => {
  it("renders the real beta slope and correlation stamp", () => {
    render(
      <VsMarketBench
        dailyReturns={dailyReturns}
        vooDailyReturns={dailyReturns.map((d) => ({ date: d.date, r: d.r / 2 }))}
        betaVsVoo={1.42}
        correlationWithVoo={0.61}
      />,
    );
    expect(screen.getByText(/SLOPE = BETA 1.42/)).toBeTruthy();
    expect(screen.getByText(/FIT r 0.61/)).toBeTruthy();
  });

  it("renders its designed empty state when there isn't enough shared history", () => {
    render(<VsMarketBench dailyReturns={dailyReturns} vooDailyReturns={[]} betaVsVoo={null} correlationWithVoo={null} />);
    expect(screen.getByText(/Not enough shared trading history/)).toBeTruthy();
  });
});

describe("DEPTH bench (BHV-05)", () => {
  it("renders a real off-high figure computed via drawdown()", () => {
    render(<DepthBench dailyReturns={dailyReturns} />);
    expect(screen.getByText(/OFF HIGH/)).toBeTruthy();
  });

  it("renders its designed empty state for a ticker with no since-buy history", () => {
    render(<DepthBench dailyReturns={[]} />);
    expect(screen.getByText(/Not enough history/)).toBeTruthy();
  });
});

describe("MOVES WITH bench (BHV-05)", () => {
  it("names the real top-|r| pair, comparing by absolute value", () => {
    render(
      <MovesWithBench
        ticker="IBM"
        correlationRow={[
          { ticker: "MSFT", value: 0.81 },
          { ticker: "GOOG", value: -0.9 },
        ]}
      />,
    );
    expect(screen.getByText(/IBM AND GOOG/)).toBeTruthy();
  });

  it("renders its designed empty state when no correlation data exists", () => {
    render(<MovesWithBench ticker="IBM" correlationRow={[{ ticker: "MSFT", value: null }]} />);
    expect(screen.getByText(/Not enough shared history/)).toBeTruthy();
  });
});

describe("CONTRIBUTION & POSITION bench (BHV-05)", () => {
  it("ranks holdings by real contribution, highlights this ticker, omits null tiles", () => {
    render(
      <ContributionBench
        ticker="IBM"
        contributionRanking={[
          { ticker: "GOOG", contribution: 0.042 },
          { ticker: "IBM", contribution: 0.031 },
          { ticker: "COST", contribution: -0.006 },
        ]}
        value={4182}
        costBasis={2965}
        day={null}
        gain={1217}
      />,
    );
    expect(screen.getByText(/RANK 2 OF 3/)).toBeTruthy();
    expect(screen.getByText("$4,182.00")).toBeTruthy();
    expect(screen.queryByText(/DAY \$/)).toBeNull();
  });
});

describe("THE COMPANY bench (BHV-05)", () => {
  it("renders real fundamentals and news, correct empty sub-states when missing", () => {
    render(
      <CompanyBench
        metric={{ peTTM: 28.4, marketCapMillions: 264000, dividendYieldPct: 2.61, week52Low: 142.6, week52High: 239.3 }}
        price={196.4}
        recommendation={null}
        news={[]}
      />,
    );
    expect(screen.getByText("28.4")).toBeTruthy();
    expect(screen.getByText("No analyst coverage this month.")).toBeTruthy();
    expect(screen.getByText("No recent news.")).toBeTruthy();
  });
});
