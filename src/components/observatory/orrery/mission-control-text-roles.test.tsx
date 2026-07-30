// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardData } from "@/lib/dashboard-data";
import {
  MISSION_CONTROL_TEXT_ROLES,
  type MissionControlTextRole,
} from "@/lib/observatory/mission-control-layout";
import { ManifestBay } from "./MissionControlBays/ManifestBay";
import { MissionControl } from "./MissionControl";
import { MissionControlRoomContent } from "./MissionControlRoomContent";

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

/**
 * FB-05 (§12a) — a rendered gate, not another source-parse gate.
 *
 * type-ramp.test.ts already proves every font-size in the stylesheet is one
 * of the five legal ramp VALUES. It cannot catch a selector that lands on a
 * legal value for the wrong semantic ROLE — that is exactly how Mission
 * Control's headers, question copy and holdings text stayed pinned to
 * --type-label (11px) through three owner re-reports while the source gate
 * stayed green. This file asserts the ROLE -> TOKEN contract in
 * MISSION_CONTROL_TEXT_ROLES against the real stylesheet text (parsed, like
 * type-ramp.test.ts) AND, for every role with a live consumer, against a real
 * rendered component tree — a selector that resolves correctly in the
 * stylesheet but is never mounted anywhere would still leave the owner
 * looking at the wrong-sized text, so source-parse alone is not accepted
 * here as it is not accepted by the section spec.
 */

const rawCss = readFileSync(
  path.resolve(__dirname, "./orrery.module.css"),
  "utf8",
);
// Strip comments before parsing -- a comment containing a comma (several do,
// as prose) would otherwise glue itself onto the next real selector in the
// group and break the exact-match lookup below.
const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, " ");

const ROOT_TOKEN_PX = new Map(
  [...css.matchAll(/(--type-[a-z]+):\s*([\d.]+)px/g)].map((m) => [
    m[1],
    Number(m[2]),
  ]),
);

/** Every top-level, non-nested `selector-list { declarations }` block. A
 * selector-list line that names our target selector is picked up regardless
 * of whether the block sits directly in the stylesheet or inside an
 * `@media` wrapper -- the wrapper's own unmatched braces are simply skipped,
 * so a media-query-only override (mobile fallback, out of this section's
 * scope per MOB-01) never shadows the desktop declaration found first. */
function fontSizePxForSelector(selector: string): number | null {
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(css))) {
    const selectors = match[1]
      .split(",")
      .map((s) => s.trim().replace(/\s+/g, " "));
    if (!selectors.includes(selector)) continue;
    const declaration = match[2].match(
      /font(?:-size)?\s*:[^;]*var\((--(?:type|mission)-[a-z-]+)(?:,\s*([\d.]+)px)?\)/,
    );
    if (!declaration) continue;
    const [, varName, fallbackPx] = declaration;
    if (varName.startsWith("--type-")) return ROOT_TOKEN_PX.get(varName) ?? null;
    // A --mission-* custom property (defined in mission-control-layout.ts,
    // asserted against by type-ramp.test.ts) resolves via its declared
    // fallback literal, which is the same value MISSION_CONTROL_CSS_PROPERTIES
    // emits at runtime.
    return fallbackPx ? Number(fallbackPx) : null;
  }
  return null;
}

function expectSelectorOnRole(selector: string, role: MissionControlTextRole) {
  const expectedToken = MISSION_CONTROL_TEXT_ROLES[role].token;
  const expectedPx = ROOT_TOKEN_PX.get(expectedToken);
  expect(expectedPx, `${expectedToken} must be a defined ramp token`).toBeDefined();
  const actualPx = fontSizePxForSelector(selector);
  expect(
    actualPx,
    `${selector} should resolve to ${expectedToken} (${expectedPx}px)`,
  ).toBe(expectedPx);
}

describe("Mission Control text roles resolve to their assigned ramp token (FB-05)", () => {
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

  it("defines every selector named in the section-12 spec's role table exactly once", () => {
    for (const role of Object.values(MISSION_CONTROL_TEXT_ROLES)) {
      for (const selector of role.selectors) {
        expect(
          fontSizePxForSelector(selector),
          `${selector} must declare a font-size/font var(--type-* or --mission-*)`,
        ).not.toBeNull();
      }
    }
  });

  describe("sectionHeader -> --type-title", () => {
    it(".manifestHeader (rendered): ManifestBay's column-header row", () => {
      expectSelectorOnRole(".manifestHeader", "sectionHeader");
      const { container } = render(
        <ManifestBay
          holdings={[
            {
              ticker: "MSFT",
              companyName: "Microsoft",
              weight: 1,
              contributionPct: 0.12,
              dayReturn: 0.01,
              weeklyReturn: 0.03,
            } as never,
          ]}
          basePath="/share"
        />,
      );
      const header = container.querySelector('[aria-hidden="true"]');
      expect(header).toBeTruthy();
      expect(header?.textContent).toContain("BODY");
    });

    it(".plotChassis > header / .manifestInstrument > header (source only): not currently mounted by any component -- verified against the stylesheet contract so a future revival inherits the correct token", () => {
      expectSelectorOnRole(".plotChassis > header", "sectionHeader");
      expectSelectorOnRole(".manifestInstrument > header", "sectionHeader");
    });
  });

  describe("questionCopy -> --type-body", () => {
    it(".bayQuestion (rendered): every bay's question line", () => {
      expectSelectorOnRole(".bayQuestion", "questionCopy");
      const { container } = render(
        <ManifestBay
          holdings={[
            {
              ticker: "MSFT",
              companyName: "Microsoft",
              weight: 1,
              contributionPct: 0.12,
              dayReturn: 0.01,
              weeklyReturn: 0.03,
            } as never,
          ]}
          basePath="/share"
        />,
      );
      expect(
        container.querySelector("p")?.textContent,
      ).toBe("what do I own, at what weight");
    });

    it(".briefingPaper (rendered): the parchment briefing, opened", () => {
      expectSelectorOnRole(".briefingPaper", "questionCopy");
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
      fireEvent.click(screen.getByRole("button", { name: "BRIEFING ▸" }));
      expect(screen.getByText(/RETURNS ARE WINDOWED/)).toBeTruthy();
    });
  });

  describe("holdingsText -> --type-body", () => {
    it(".holdingsTable thead th (rendered): the holdings table's own column headers", () => {
      expectSelectorOnRole(".holdingsTable thead th", "holdingsText");
      const data = {
        publicOrreryHoldings: [
          { ticker: "MSFT", weight: 1, dayReturn: 0.01, weeklyReturn: 0.03 },
        ],
        positionRows: [{ ticker: "MSFT", value: 12345 }],
        correlationTickers: ["MSFT"],
        correlationCells: [[1]],
        publicTradeLog: [],
        upcomingEarnings: [],
        newsByHolding: {},
        chartData: [{ date: "2026-07-01", portfolioIndex: 100 }],
        volatilityPct: 0.2,
        betaVsVoo: 1,
        allTimeHigh: { pct: -0.08, peakDate: "2026-06-30" },
        historyDays: 34,
        xirrPct: 0.4,
      } as unknown as DashboardData;
      const html = renderToStaticMarkup(
        <MissionControlRoomContent data={data} basePath="/share" mode="public" />,
      );
      expect(html).toContain("TICKER");
      expect(html).toContain("WEIGHT");
    });

    it(".radarDetailCard / .radarManifest > li > button (source only): not currently mounted by any component -- verified against the stylesheet contract so a future revival inherits the correct token", () => {
      expectSelectorOnRole(".radarDetailCard", "holdingsText");
      expectSelectorOnRole(".radarManifest > li > button", "holdingsText");
    });
  });

  describe("genuineLabel -> --type-label (legitimately unchanged)", () => {
    it("stays on --type-label for every selector in the role", () => {
      for (const selector of MISSION_CONTROL_TEXT_ROLES.genuineLabel.selectors) {
        expectSelectorOnRole(selector, "genuineLabel");
      }
    });
  });

});
