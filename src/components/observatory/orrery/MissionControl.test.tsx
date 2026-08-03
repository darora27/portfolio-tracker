import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MissionControl } from "./MissionControl";

describe("MissionControl", () => {
  const shellProps = {
    holdings: [],
    health: 0,
  };

  it("exposes the plain-language descent anchors and sticky-strip readouts", () => {
    const html = renderToStaticMarkup(
      <MissionControl
        activePanel="scope"
        mode="private"
        content={<p>Readable room content</p>}
        closeHref="/"
        basePath="/"
        dayReadout="▼ 0.7%"
        weekReadout="▲ 1.2%"
        twrReadout="▲ 4.2%"
        marketReadout="▼ 0.4%"
        offHighReadout="▼ 2.1%"
        {...shellProps}
      />,
    );
    /* R7-W7. This asserted an anchor per section — the tab strip. He asked
     * for it gone three times, most recently in capitals, and his reason was
     * exact: "all of those tabs are LOCATED ON THE SAME PAGE." They were
     * navigation in appearance and a table of contents in fact.
     *
     * So the assertion inverts: no same-page anchors in the strip at all.
     * What replaces them is what he asked for — "maybe one showing history
     * and one showing research" — as real page loads. */
    for (const anchor of [
      "orbits", "holdings", "returns", "mix", "risk", "trades", "earnings",
      "correlation", "news",
    ]) {
      expect(html).not.toContain(`href=\"#${anchor}\"`);
    }
    expect(html).toContain('href="/history"');
    expect(html).toContain('href="/research"');
    expect(html).toContain("Readable room content");
    expect(html).toContain("SINCE START TWR");
    expect(html).toContain("VS VOO · SAME PERIOD");
    expect(html).toContain('data-mode=\"private\"');
    expect(html).not.toContain("PLOT 00");
    expect(html).not.toContain("MANIFEST 01");
  });

  it("renders no DRAFT latch or markup on the public branch", () => {
    const html = renderToStaticMarkup(
      <MissionControl
        activePanel="plot"
        mode="public"
        content={<p>Public room</p>}
        closeHref="/share"
        basePath="/share"
        {...shellProps}
      />,
    );
    expect(html).toContain('href=\"/share\"');
    expect(html).not.toContain("DRAFT");
    expect(html).not.toContain("draftRig");
  });
});
