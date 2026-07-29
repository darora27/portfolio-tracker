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
    for (const anchor of [
      "orbits", "holdings", "returns", "risk", "correlation", "news", "trades", "earnings",
    ]) {
      expect(html).toContain(`href=\"#${anchor}\"`);
    }
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
