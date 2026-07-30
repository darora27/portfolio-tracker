// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { OrreryWorld } from "./OrreryWorld";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";

/**
 * FB-09 (§12a), ACC-01 — the regrouped semantic terminal (BODIES /
 * INSTRUMENTS / BELT / ENCODING) preserves every encoding present before
 * regrouping (disclosure, not deletion), and the exit receipt never steals
 * or traps keyboard focus. Kept a plain .ts file (no JSX) per this
 * criterion's verifier path -- React elements are built with createElement.
 */

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("next/dynamic", () => ({
  default: () => () => createElement("canvas", { "aria-hidden": "true", "data-testid": "orrery-canvas" }),
}));

const holdings: PublicOrreryHolding[] = [
  {
    ticker: "MSFT",
    companyName: "Microsoft",
    weight: 0.32,
    weeklyReturn: 0.024,
    portfolioRelativeReturn: 0.018,
    volatilityPct: 0.21,
    betaVsVoo: 1.04,
    dayReturn: 0.012,
    newsCount: 2,
  },
  {
    ticker: "IBM",
    companyName: "IBM",
    weight: 0.08,
    weeklyReturn: -0.014,
    portfolioRelativeReturn: -0.02,
    volatilityPct: 0.18,
    betaVsVoo: 0.74,
    dayReturn: -0.008,
    newsCount: 0,
  },
];

const beltHoldings: PublicOrreryHolding[] = [
  {
    ticker: "CBRS",
    companyName: "Cerebras",
    weight: 0.02,
    weeklyReturn: 0.01,
    portfolioRelativeReturn: 0.01,
    volatilityPct: 0.3,
    betaVsVoo: 1.2,
    dayReturn: 0.001,
  },
];

function stubMedia(desktop = true, reducedMotion = false) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("min-width")
        ? desktop
        : query.includes("pointer: fine")
          ? true
          : reducedMotion,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

const baseProps = {
  holdings: [...holdings, ...beltHoldings],
  orreryBelt: {
    planetTickers: holdings.map(({ ticker }) => ticker),
    beltTickers: beltHoldings.map(({ ticker }) => ticker),
  },
  selectedTicker: null,
  portfolioSelected: false,
  portfolioSummary: { returnPct: -0.028, marketRelativePct: -0.046, topTwoWeight: 0.56 },
};

beforeEach(() => {
  push.mockReset();
  stubMedia();
  window.localStorage.setItem("stock-market-universe-orientation-seen", "true");
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (() => ({ getExtension: vi.fn() })) as unknown as typeof HTMLCanvasElement.prototype.getContext,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("regrouped semantic terminal preserves every encoding (ACC-01)", () => {
  it("keeps the sun, every holding, its news, the belt, and the visual encoding line in the DOM", () => {
    const { container } = render(createElement(OrreryWorld, baseProps));
    expect(screen.getByText(/SUN \/ PORTFOLIO/)).toBeTruthy();
    for (const holding of holdings) {
      expect(screen.getByText(new RegExp(`HOLDINGS / ${holding.ticker}`))).toBeTruthy();
    }
    expect(screen.getByText(/NEWS \/ MSFT/)).toBeTruthy();
    expect(screen.queryByText(/NEWS \/ IBM/)).toBeNull(); // IBM has newsCount 0 -- unchanged filter, not a regression
    for (const holding of beltHoldings) {
      expect(screen.getByText(new RegExp(`BELT BODY / ${holding.ticker}`))).toBeTruthy();
    }
    expect(screen.getByText(/RETURNS \/ VS VOO/)).toBeTruthy();
    expect(screen.getByText(/RISK \/ VOL/)).toBeTruthy();
    expect(screen.getByText(/EARNINGS \//)).toBeTruthy();
    expect(screen.getByText(/ASTEROID BELT/)).toBeTruthy();
    expect(screen.getByText(/NEBULA (?:EMBER|GOLD)/)).toBeTruthy();
    expect(container.querySelectorAll("summary").length).toBeGreaterThanOrEqual(5);
    expect(screen.getByText("BODIES")).toBeTruthy();
    expect(screen.getByText("INSTRUMENTS")).toBeTruthy();
    expect(screen.getByText("BELT")).toBeTruthy();
    expect(screen.getByText("ENCODING")).toBeTruthy();
  });

  it("keeps at most one top-level group open at a time", () => {
    const { container } = render(createElement(OrreryWorld, baseProps));
    const topLevelGroups = container.querySelectorAll(
      '[aria-label="Portfolio bodies"] > div > details',
    );
    expect(topLevelGroups.length).toBe(4);
    const openCount = Array.from(topLevelGroups).filter(
      (details) => (details as HTMLDetailsElement).open,
    ).length;
    expect(openCount).toBeLessThanOrEqual(1);
  });

  it("the exit receipt appears on a programmatic return and never traps or steals focus", () => {
    const { rerender } = render(
      createElement(OrreryWorld, {
        ...baseProps,
        basePath: "/share",
        portfolioSelected: true,
        cameraState: "command",
        missionControlContent: createElement("p", null, "Public portfolio analysis"),
      }),
    );
    rerender(
      createElement(OrreryWorld, {
        ...baseProps,
        basePath: "/share",
        portfolioSelected: false,
        cameraState: "overview",
      }),
    );
    // Focus restoration still lands on the sun link, exactly as before this
    // section -- the receipt is additive, not a focus destination itself.
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: /SUN \/ PORTFOLIO/ }),
    );
    expect(screen.getByText(/LEFT MISSION CONTROL/)).toBeTruthy();
    const receipt = screen.getByText(/LEFT MISSION CONTROL/).closest('[role="status"]');
    expect(receipt).not.toBeNull();
    expect(receipt!.hasAttribute("tabindex")).toBe(false);
    expect(receipt!.querySelectorAll("a, button, input, [tabindex]").length).toBe(0);
  });
});
