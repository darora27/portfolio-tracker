import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MissionControl } from "./MissionControl";

describe("MissionControl", () => {
  const shellProps = {
    holdings: [],
    health: 0,
    teletype: "SOL-DEVAN · DAY —",
  };

  it("exposes the seven identity-aware Mission Control bays", () => {
    const html = renderToStaticMarkup(
      <MissionControl
        activePanel="scope"
        mode="private"
        content={<p>Owner history content</p>}
        closeHref="/share"
        basePath="/share"
        {...shellProps}
      />,
    );
    for (const panel of ["plot", "manifest", "scope", "hazard", "signals", "comms", "log"]) {
      expect(html).toContain(`station=${panel}`);
    }
    expect(html).toContain("Owner history content");
    expect(html).toContain("OWNER LINK");
    expect(html).toContain('data-mode="private"');
    expect(html).toContain('aria-current="page"');
  });

  it("keeps station navigation on the route that opened the universe", () => {
    const html = renderToStaticMarkup(
      <MissionControl
        activePanel="plot"
        mode="private"
        content={<p>Owner dashboard</p>}
        closeHref="/"
        basePath="/"
        {...shellProps}
      />,
    );
    expect(html).toContain('href="/?focus=portfolio');
    expect(html).not.toContain('href="/share?');
  });
});
