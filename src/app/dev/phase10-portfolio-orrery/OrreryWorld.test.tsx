// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    dayReturn: 0.012,
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
  },
  {
    ticker: "ORCL",
    companyName: "Oracle",
    weight: 0.04,
    weeklyReturn: null,
    portfolioRelativeReturn: null,
    volatilityPct: null,
    betaVsVoo: null,
    dayReturn: null,
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
  window.localStorage.setItem(
    "stock-market-universe-orientation-seen",
    "true",
  );
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
    expect(html).toContain("neutral");
    expect(html).not.toMatch(/\$[0-9]/);
  });

  it("uses URL-addressable holding selection and preserves the forced fallback", () => {
    expect(orreryHoldingHref("MSFT", true)).toBe(
      "/dev/phase10-portfolio-orrery?holding=MSFT&camera=approach&no3d=1",
    );
    render(<OrreryWorld {...baseProps} forceNo3d />);
    expect(screen.getByRole("link", { name: /Microsoft/ }).getAttribute("href")).toContain(
      "holding=MSFT&camera=approach&no3d=1",
    );
  });

  it("renders the labelled holding rail and plain action buttons", () => {
    render(<OrreryWorld {...baseProps} selectedTicker="MSFT" />);
    const heading = screen.getByRole("heading", { level: 2, name: /MSFT · Microsoft/ });
    expect(heading).toBeTruthy();
    expect(document.activeElement).toBe(heading);
    for (const label of [
      "WEIGHT",
      "WEEK",
      "VOL",
      "BETA",
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.queryByText("VOO UNAVAILABLE")).toBeNull();
    // §15 §2.3 (BHV-08/PRV-01, door #3): public mode keeps the exact
    // pre-existing Mission Control destination -- retired only in private
    // mode. baseProps carries no missionMode, so OrreryWorld's own default
    // ("public") applies here.
    expect(screen.getByRole("link", { name: "FULL ANALYSIS ▸" }).getAttribute("href"))
      .toContain("station=manifest");
  });

  it("§15 §2.3: FULL ANALYSIS opens the Chart Room (/stock/<ticker>) in private mode only", () => {
    const { rerender } = render(
      <OrreryWorld {...baseProps} selectedTicker="MSFT" missionMode="private" />,
    );
    expect(screen.getByRole("link", { name: "FULL ANALYSIS ▸" }).getAttribute("href"))
      .toBe("/stock/MSFT");
    rerender(<OrreryWorld {...baseProps} selectedTicker="MSFT" missionMode="public" />);
    expect(screen.getByRole("link", { name: "FULL ANALYSIS ▸" }).getAttribute("href"))
      .toContain("station=manifest");
    expect(screen.getByRole("link", { name: "FULL ANALYSIS ▸" }).getAttribute("href"))
      .not.toContain("/stock/");
  });

  it("returns from approach in one gesture and keeps an explicit overview link", () => {
    render(
      <OrreryWorld
        {...baseProps}
        basePath="/"
        selectedTicker="MSFT"
        cameraState="approach"
      />,
    );
    expect(
      screen.getByRole("link", { name: "◂ BACK TO SYSTEM" }).getAttribute("href"),
    ).toBe("/");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(push).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("returns from command in one gesture and keeps an explicit universe link", () => {
    const { rerender } = render(
      <OrreryWorld
        {...baseProps}
        basePath="/share"
        portfolioSelected
        cameraState="command"
        missionControlContent={<p>Public portfolio analysis</p>}
      />,
    );
    expect(
      screen.getByRole("link", { name: "◂ UNIVERSE" }).getAttribute("href"),
    ).toBe("/share");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(push).toHaveBeenCalledWith("/share", { scroll: false });
    rerender(
      <OrreryWorld
        {...baseProps}
        basePath="/share"
        portfolioSelected={false}
        cameraState="overview"
      />,
    );
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: /SUN \/ PORTFOLIO/ }),
    );
  });

  it("moves focus into Mission Control opened from the semantic sun", () => {
    render(
      <OrreryWorld
        {...baseProps}
        portfolioSelected
        missionControlContent={<p>Public portfolio analysis</p>}
      />,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Mission Control" });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText("Public portfolio analysis")).toBeTruthy();
  });

  it("keeps the static semantic map when reduced motion disables the scene", () => {
    stubMedia(true, true);
    render(<OrreryWorld {...baseProps} />);
    expect(screen.getAllByRole("link").length).toBe(holdings.length + 6);
    expect(screen.queryByTestId("orrery-canvas")).toBeNull();
  });

  it("renders zero canvas elements below the 1024px gate", () => {
    stubMedia(false, false);
    render(<OrreryWorld {...baseProps} />);
    expect(document.querySelectorAll("canvas")).toHaveLength(0);
    expect(screen.getByRole("navigation", { name: "Portfolio bodies" })).toBeTruthy();
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
    expect(screen.getAllByRole("link")).toHaveLength(holdings.length + 6);
    expect(screen.getByRole("button", { name: "Open systems manual" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /ASTEROID BELT/ })).toBeTruthy();
  });

  it("FB-17 (§12a): applies a capture-only ?panelWidth override to --panel-width, defaulting to none", async () => {
    const { container, rerender } = render(<OrreryWorld {...baseProps} />);
    await Promise.resolve();
    expect(container.querySelector("main")?.style.getPropertyValue("--panel-width")).toBe("");

    window.history.pushState({}, "", "/?panelWidth=660");
    rerender(<OrreryWorld {...baseProps} key="with-override" />);
    await waitFor(() =>
      expect(
        container.querySelector("main")?.style.getPropertyValue("--panel-width"),
      ).toBe("660px"),
    );
  });

  it("anchors the manual above the bottom-right inspector controls", () => {
    const css = readFileSync(
      path.resolve(
        __dirname,
        "../../../components/observatory/orrery/orrery.module.css",
      ),
      "utf8",
    );
    const manualRule = css.match(/\.manualButton\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(manualRule).toContain("top: 6.5rem");
    expect(manualRule).not.toContain("bottom:");
    expect(css).toMatch(/\.inspector\s*\{[^}]*bottom:\s*1\.5rem/);
  });
});
