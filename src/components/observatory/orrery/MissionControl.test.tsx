import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MissionControl } from "./MissionControl";

describe("MissionControl", () => {
  it("exposes the four identity-aware Mission Control stations", () => {
    const html = renderToStaticMarkup(
      <MissionControl
        activePanel="history"
        mode="private"
        content={<p>Owner history content</p>}
        closeHref="/share"
      />,
    );
    for (const panel of ["dashboard", "history", "trades", "research"]) {
      expect(html).toContain(`station=${panel}`);
    }
    expect(html).toContain("Owner history content");
    expect(html).toContain("owner authenticated");
    expect(html).toContain('data-mode="private"');
    expect(html).toContain('aria-current="page"');
  });
});
