// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RiskPanel } from "./RiskPanel";

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);

const props = {
  volatilityPct: 0.184,
  maxDrawdownPct: -0.081,
  sharpe: 0.72,
  betaVsVoo: 1.12,
  top2ConcentrationPct: 0.73,
  hhi: 3_000,
  sortinoRatio: 0.88,
  bestDay: { date: "2026-07-05", r: 0.023 },
  worstDay: { date: "2026-07-18", r: -0.031 },
  winRatePct: 0.55,
  currentStreak: { n: 2, dir: "up" as const },
  historyDays: 120,
  dailyChangeAsOf: "2026-07-23",
  pricesAsOf: "2026-07-23",
};

describe("RiskPanel", () => {
  it("derives all five disclosures while preserving every unchanged risk tile", () => {
    render(<RiskPanel {...props} />);
    for (const name of [
      "Explain Volatility", "Explain Max drawdown", "Explain Sharpe",
      "Explain Beta", "Explain Sortino",
    ]) {
      expect(screen.getByRole("button", { name })).toBeTruthy();
    }
    for (const value of ["18.4%", "-8.1%", "0.72", "1.12", "0.88"]) {
      expect(screen.getByText(value)).toBeTruthy();
    }
    expect(screen.getByText("Top-2 concentration")).toBeTruthy();
    expect(screen.getByText("+2.30%")).toBeTruthy();
    expect(screen.getByText("-3.10%")).toBeTruthy();
    expect(screen.getByText("55.0%")).toBeTruthy();
    expect(screen.getByText("2 up")).toBeTruthy();
  });

  it.each([
    ["volatility", "Explain Volatility", "Volatility (annualized)"],
    ["max-drawdown", "Explain Max drawdown", "Max drawdown"],
    ["sharpe", "Explain Sharpe", "Sharpe ratio"],
    ["beta", "Explain Beta", "Beta vs. VOO"],
    ["sortino", "Explain Sortino", "Sortino ratio"],
  ] as const)("pre-expands only the matching %s explanation", async (id, buttonName, headingName) => {
    render(<RiskPanel {...props} explainOpenId={id} />);
    expect(screen.getByRole("button", { name: buttonName }).getAttribute("aria-expanded"))
      .toBe("true");
    const otherButton = id === "beta" ? "Explain Sharpe" : "Explain Beta";
    expect(screen.getByRole("button", { name: otherButton }).getAttribute("aria-expanded"))
      .toBe("false");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("heading", { name: headingName })),
    );
  });

  it("preserves the compatibility route's legacy compact RiskPanel when explanation inputs are absent", () => {
    const legacyProps = {
      volatilityPct: props.volatilityPct,
      maxDrawdownPct: props.maxDrawdownPct,
      sharpe: props.sharpe,
      betaVsVoo: props.betaVsVoo,
      top2ConcentrationPct: props.top2ConcentrationPct,
      hhi: props.hhi,
      sortinoRatio: props.sortinoRatio,
      bestDay: props.bestDay,
      worstDay: props.worstDay,
      winRatePct: props.winRatePct,
      currentStreak: props.currentStreak,
    };
    render(<RiskPanel {...legacyProps} />);
    expect(screen.queryByRole("button", { name: /Explain/ })).toBeNull();
    expect(screen.getByText("Volatility (ann.)")).toBeTruthy();
  });
});
