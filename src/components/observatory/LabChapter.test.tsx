import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LabChapter, type LabChapterProps } from "./LabChapter";

const props: LabChapterProps = {
  basePath: "/share",
  historyDays: 30,
  firstFundedDate: "2026-06-24",
  pricesAsOf: "2026-07-23",
  dailyChangeAsOf: "2026-07-23",
  twrPct: -0.029,
  xirrPct: 0.1234,
  benchmark: {
    available: true,
    twrPct: 0.017,
    excessReturnPct: -0.046,
  },
};

describe("LabChapter metric explanations", () => {
  it("renders TWR then XIRR collapsed with values derived from chapter props", () => {
    const html = renderToStaticMarkup(<LabChapter {...props} />);
    expect(html.indexOf("Explain TWR")).toBeLessThan(html.indexOf("Explain XIRR"));
    expect(html).toContain("-2.90%");
    expect(html).toContain("+12.34%");
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="region"');
  });

  it("opens only the matching metric and builds exact permalinks", () => {
    const html = renderToStaticMarkup(
      <LabChapter
        {...props}
        preservedQuery={{ source: "review" }}
        explainOpenId="xirr"
      />,
    );
    expect(html).toContain('aria-expanded="true"');
    expect((html.match(/aria-expanded="true"/g) ?? [])).toHaveLength(1);
    expect(html).toContain("XIRR (annualized return)");
    expect(html).toContain(
      'href="/share?source=review&amp;explain=xirr&amp;chapter=lab"',
    );
  });

  it("leaves both collapsed for a mismatched explanation id", () => {
    const html = renderToStaticMarkup(
      <LabChapter {...props} explainOpenId="hhi" />,
    );
    expect(html).not.toContain('aria-expanded="true"');
  });
});
