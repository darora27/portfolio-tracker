// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  OrreryWorld,
  orreryHoldingHref,
} from "@/components/observatory/orrery/OrreryWorld";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("next/dynamic", () => ({
  default: () => () => <canvas aria-hidden="true" data-testid="orrery-canvas" />,
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
  },
  {
    ticker: "IBM",
    companyName: "IBM",
    weight: 0.08,
    weeklyReturn: -0.014,
    portfolioRelativeReturn: -0.02,
    volatilityPct: 0.18,
    betaVsVoo: 0.74,
  },
  {
    ticker: "ORCL",
    companyName: "Oracle",
    weight: 0.04,
    weeklyReturn: null,
    portfolioRelativeReturn: null,
    volatilityPct: null,
    betaVsVoo: null,
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
  holdings,
  selectedTicker: null,
  portfolioSelected: false,
  portfolioSummary: { returnPct: -0.028, marketRelativePct: -0.046, topTwoWeight: 0.56 },
};

beforeEach(() => {
  push.mockReset();
  stubMedia();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (() => ({ getExtension: vi.fn() })) as unknown as typeof HTMLCanvasElement.prototype.getContext,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Portfolio Orrery remediation route", () => {
  it("server-renders a semantic control and textual encoding for every holding", () => {
    const html = renderToStaticMarkup(<OrreryWorld {...baseProps} />);
    for (const holding of holdings) {
      expect(html).toContain(`holding=${holding.ticker}`);
      expect(html).toContain(holding.companyName);
    }
    expect(html).toContain("clockwise");
    expect(html).toContain("counterclockwise");
    expect(html).toContain("Neutral");
    expect(html).not.toMatch(/\$[0-9]/);
  });

  it("uses URL-addressable holding selection and preserves the forced fallback", () => {
    expect(orreryHoldingHref("MSFT", true)).toBe(
      "/dev/phase10-portfolio-orrery?holding=MSFT&no3d=1",
    );
    render(<OrreryWorld {...baseProps} forceNo3d />);
    expect(screen.getByRole("link", { name: /Microsoft/ }).getAttribute("href")).toContain(
      "holding=MSFT&no3d=1",
    );
  });

  it("renders the complete six-field semantic inspector and deeper link", () => {
    render(<OrreryWorld {...baseProps} selectedTicker="MSFT" />);
    const heading = screen.getByRole("heading", { level: 2, name: /MSFT Microsoft/ });
    expect(heading).toBeTruthy();
    expect(document.activeElement).toBe(heading);
    for (const label of [
      "Portfolio weight",
      "Trailing week",
      "Vs. portfolio",
      "Annualized volatility",
      "Beta vs. VOO",
      "Orbit state",
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getByRole("link", { name: "Open deeper stock information" }).getAttribute("href"))
      .toBe("/stock/MSFT");
  });

  it("moves focus into the portfolio summary opened from the semantic sun", () => {
    render(<OrreryWorld {...baseProps} portfolioSelected />);
    const heading = screen.getByRole("heading", { level: 2, name: "Portfolio summary" });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText("Composition")).toBeTruthy();
    expect(screen.getByText("Market-relative")).toBeTruthy();
  });

  it("keeps the static semantic map when reduced motion disables the scene", () => {
    stubMedia(true, true);
    render(<OrreryWorld {...baseProps} />);
    expect(screen.getAllByRole("link").length).toBe(holdings.length + 1);
    expect(screen.queryByTestId("orrery-canvas")).toBeNull();
  });

  it("disables speculative prefetch on every Orrery link for the mobile fallback", () => {
    const source = readFileSync(
      path.resolve(__dirname, "../../../components/observatory/orrery/OrreryWorld.tsx"),
      "utf8",
    );
    const links = source.match(/<Link\b[\s\S]*?>/g) ?? [];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toContain("prefetch={false}");
    }
  });

  it("provides 44px-class semantic controls without duplicate canvas focus stops", () => {
    render(<OrreryWorld {...baseProps} />);
    expect(screen.getAllByRole("link")).toHaveLength(holdings.length + 1);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
