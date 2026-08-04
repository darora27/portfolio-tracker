// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { DashboardData } from "@/lib/dashboard-data";
import { MissionControlRoomContent } from "./MissionControlRoomContent";
import styles from "./orrery.module.css";

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
 * R7, Aug 3 — MIX. "Pie chart needs to be much much bigger. and add some
 * creativity and flare", and before that: "Mix needs to be a much larger
 * donut that has lines pointing to each section."
 *
 * The donut is the row that matters. The leader lines shipped; the hole did
 * not, and the chart stayed a solid pie through three rounds of review
 * without anyone noticing that half the sentence had been implemented. A
 * wedge path starting at `M300 215` — the centre — is a pie. A wedge path
 * that never names the centre is a donut. That is a cheap thing to assert,
 * and it is asserted here because the alternative is trusting someone to
 * read the picture correctly, and the picture was read wrong three times.
 *
 * The fixture is deliberately the one MissionControlRoomContent.test.tsx
 * already renders without crashing, with only `donutSlices` overridden. A
 * thinner fixture would have been easier to read and would have risked
 * failing on an empty `benchmarkComparisons` rather than on the thing under
 * test — a test that fails for the wrong reason is a test you learn to
 * ignore.
 */

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

const slices = [
  { ticker: "IBM", weight: 0.5, value: 5_000 },
  { ticker: "MSFT", weight: 0.3, value: 3_000 },
  { ticker: "ASML", weight: 0.2, value: 2_000 },
];

const data = {
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
  donutSlices: slices,
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
  dailyReturnBars: [{ date: "2026-07-23", return: -0.011 }],
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
  upcomingEarnings: [{ ticker: "IBM", date: "2026-08-03", hour: "amc", epsEstimate: 3.2 }],
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

function mix(): string {
  return renderToStaticMarkup(
    <MissionControlRoomContent data={data} basePath="/share" mode="public" />,
  );
}

/** Every wedge path on the allocation chart — outer radius 150 identifies it. */
function wedgePaths(html: string): string[] {
  return [...html.matchAll(/d="(M[\d.]+ [\d.]+ L[^"]*A170 170[^"]*)"/g)].map(
    (match) => match[1],
  );
}

describe("MIX — the allocation chart is a donut, and it is an instrument", () => {
  it("draws annular wedges: no path returns to the centre", () => {
    const paths = wedgePaths(mix());
    expect(paths).toHaveLength(slices.length);

    for (const d of paths) {
      // The old pie emitted `M300 215` — literally the centre, no decimals,
      // because the template interpolated CX/CY raw. That is the signature
      // this guards against.
      expect(d, `wedge starts at the centre, so this is a pie: ${d}`)
        .not.toMatch(/^M300 215\b/);
      expect(d, `no inner arc, so this is not a donut: ${d}`).toContain("A95 95");
    }
  });

  it("keeps the hole doing work: position count and the largest weight", () => {
    const html = mix();
    expect(html).toContain("POSITIONS");
    expect(html).toContain("TOP IBM 50.0%");
    // Scoped to the hub's own class so a stray "3" elsewhere cannot pass this.
    expect(html).toMatch(
      new RegExp(`class="[^"]*${styles.pieHubValue}[^"]*"[^>]*>${slices.length}<`),
    );
  });

  it("carries no dial, no bezel and no caption", () => {
    /* "dont ened any outer ring one mark = 5 % of book stuff or these weird
     * lines." Asserted as absence so the chrome cannot drift back in. */
    const html = mix();
    expect(html).not.toContain("OUTER RING");
    expect(html).not.toContain("ONE MARK");
    expect(html).not.toContain("pieTick");
    expect(html).not.toContain("pieBezel");
    expect(html).not.toContain("pieCaption");
  });

  it("draws each leader as one elbow, not a dogleg round a dial", () => {
    const html = mix();
    const leaders = [
      ...html.matchAll(new RegExp(`class="[^"]*${styles.pieLeader}[^"]*"\\s+points="([^"]+)"`, "g")),
    ];
    expect(leaders).toHaveLength(slices.length);
    for (const [, points] of leaders) {
      expect(points.trim().split(/\s+/)).toHaveLength(3);
    }
  });

  it("still describes the whole allocation to a screen reader", () => {
    expect(mix()).toContain("Portfolio allocation by stock");
  });
});

/**
 * "these weird lines", Aug 3 — the real defect behind that sentence.
 *
 * Five labels at the top left were printed on top of each other, and the
 * leader lines fanning into an illegible pile is what made the whole
 * treatment look broken. The cause was the stacking rule:
 * `max(ideal, 24 + index * ROW)` gives each label its own fixed floor, which
 * only separates labels that are already roughly evenly spread. Several thin
 * wedges bunched near twelve o'clock share almost the same ideal y and each
 * clears its own low floor independently, so they land a few units apart and
 * overprint. A running maximum — at least ROW below the label ACTUALLY placed
 * before it — is the fix.
 *
 * Three slices cannot reproduce this. The fixture below is his real book:
 * thirteen holdings with a tail of five under 5%, which is the shape that
 * breaks it. Measured against the previous algorithm, the tightest gap here
 * was 11 units between labels roughly 14 units tall.
 */
describe("MIX — thirteen holdings, and no two labels on top of each other", () => {
  const ROW = 26;

  const realBook = [
    ["ASML", 0.257], ["GOOG", 0.213], ["COST", 0.107], ["MSFT", 0.094],
    ["INTC", 0.076], ["IBM", 0.069], ["NBIS", 0.042], ["CBRS", 0.042],
    ["CRM", 0.036], ["ORCL", 0.028], ["SPCX", 0.022], ["MRVL", 0.007],
    ["NVDA", 0.007],
  ].map(([ticker, weight]) => ({
    ticker: ticker as string,
    weight: weight as number,
    value: (weight as number) * 100_000,
  }));

  function crowdedMix(): string {
    return renderToStaticMarkup(
      <MissionControlRoomContent
        data={{ ...data, donutSlices: realBook } as unknown as DashboardData}
        basePath="/share"
        mode="public"
      />,
    );
  }

  /** Ticker labels as {x, y}, which is enough to group them by side. */
  function labels(html: string): { x: number; y: number }[] {
    return [
      ...html.matchAll(
        new RegExp(
          `<text x="([\\d.]+)" y="([\\d.]+)"[^>]*class="[^"]*${styles.pieLabelTicker}[^"]*"`,
          "g",
        ),
      ),
    ].map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
  }

  it("labels all thirteen", () => {
    const found = labels(crowdedMix());
    expect(found).toHaveLength(realBook.length);
  });

  it("never places two labels on the same side closer than one row apart", () => {
    const found = labels(crowdedMix());
    for (const side of [...new Set(found.map((label) => label.x))]) {
      const column = found
        .filter((label) => label.x === side)
        .map((label) => label.y)
        .sort((a, b) => a - b);
      for (let i = 1; i < column.length; i += 1) {
        const gap = column[i] - column[i - 1];
        expect(
          gap,
          `labels at x=${side} are ${gap.toFixed(1)} apart, closer than the ${ROW} row`,
        ).toBeGreaterThanOrEqual(ROW - 0.5);
      }
    }
  });

  it("keeps every label inside the frame", () => {
    for (const { y } of labels(crowdedMix())) {
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(430);
    }
  });
});

/**
 * A source gate, in the style of the type-ramp and palette firewalls, because
 * this defect is invisible to every other kind of test we have.
 *
 * "its so small" was reported three times. The first two fixes raised
 * `max-width` on `.compositionPie` — a cap the element could never reach,
 * because `margin: 0 auto` on a GRID ITEM overrides `justify-self: stretch`:
 * the auto margins eat the free space and the item is sized to fit-content.
 * Its only child is an SVG with a viewBox and no width attribute, so
 * fit-content fell back to the CSS default replaced-element width of 300px.
 * The chart was 300px wide before and after being "made bigger", twice.
 *
 * jsdom does no layout, so a rendering test cannot see this — it would report
 * every width as 0 and pass regardless. Playwright would catch it and we do
 * not run Playwright here. Reading the declaration is what is left, and it is
 * enough to stop the specific regression: put an auto inline margin back on
 * this element and it silently shrink-wraps again.
 */
describe("MIX — the chart fills its grid track (three reports of 'too small')", () => {
  const css = readFileSync(
    path.resolve(__dirname, "./orrery.module.css"),
    "utf8",
  );

  /** The declaration block for a selector, comments already stripped. */
  function block(selector: string): string {
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const match = stripped.match(
      new RegExp(`(?:^|\\})\\s*${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`),
    );
    expect(match, `no rule found for ${selector}`).toBeTruthy();
    return match![1];
  }

  it("gives .compositionPie a definite width instead of shrink-wrapping", () => {
    const rule = block(".compositionPie");
    expect(rule).toMatch(/width:\s*100%/);
  });

  it("never centres .compositionPie with auto inline margins", () => {
    const rule = block(".compositionPie");
    // `margin: 0 auto`, `margin-inline: auto`, `margin-left: auto` — any of
    // them reintroduces fit-content sizing inside the grid.
    expect(rule).not.toMatch(/margin(-inline|-left|-right)?:[^;]*\bauto\b/);
  });

  it("keeps the svg a block that fills the box it was given", () => {
    const rule = block(".compositionPie svg");
    expect(rule).toMatch(/width:\s*100%/);
    expect(rule).toMatch(/height:\s*auto/);
  });
});
