import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MissionControl } from "./MissionControl";

describe("MissionControl", () => {
  it("keeps all accepted chapter destinations and the active content", () => {
    const html = renderToStaticMarkup(
      <MissionControl
        activeChapterId="structure"
        content={<p>Accepted chapter content</p>}
        closeHref="/share"
      />,
    );
    for (const chapter of ["pulse", "forces", "structure", "timeline", "lab"]) {
      expect(html).toContain(`chapter=${chapter}`);
    }
    expect(html).toContain("Accepted chapter content");
    expect(html).toContain('aria-current="page"');
  });
});
