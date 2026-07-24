import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  StructureChapter,
  type StructureChapterProps,
} from "./StructureChapter";

const props: StructureChapterProps = {
  basePath: "/share",
  pricesAsOf: "2026-07-23",
  dailyChangeAsOf: "2026-07-23",
  hhi: 3000,
  top2ConcentrationPct: 0.73,
  positions: [
    { ticker: "IBM", weight: 0.42 },
    { ticker: "MSFT", weight: 0.31 },
  ],
  sectorWeights: [{ label: "Technology", weight: 0.61 }],
  aiExposureWeights: [{ label: "High", weight: 0.44 }],
  correlationTickers: ["IBM", "MSFT"],
  correlationCells: [
    [1, 0.72],
    [0.72, 1],
  ],
};

describe("StructureChapter metric explanation", () => {
  it("renders HHI collapsed directly after the concentration lead", () => {
    const html = renderToStaticMarkup(<StructureChapter {...props} />);
    expect(html).toContain("Explain HHI");
    expect(html).toContain("3000");
    expect(html).toContain('aria-expanded="false"');
    expect(html.indexOf("The top two holdings")).toBeLessThan(
      html.indexOf("Explain HHI"),
    );
    expect(html.indexOf("Explain HHI")).toBeLessThan(
      html.indexOf("Portfolio weight by holding"),
    );
  });

  it("opens only HHI and preserves route query state in its permalink", () => {
    const html = renderToStaticMarkup(
      <StructureChapter
        {...props}
        preservedQuery={{ source: "review" }}
        explainOpenId="hhi"
      />,
    );
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("Herfindahl-Hirschman Index");
    expect(html).toContain(
      'href="/share?source=review&amp;explain=hhi&amp;chapter=structure"',
    );
  });

  it("stays collapsed for an absent or mismatched id", () => {
    const absent = renderToStaticMarkup(<StructureChapter {...props} />);
    const mismatched = renderToStaticMarkup(
      <StructureChapter {...props} explainOpenId="twr" />,
    );
    expect(absent).not.toContain('aria-expanded="true"');
    expect(mismatched).not.toContain('aria-expanded="true"');
  });
});
