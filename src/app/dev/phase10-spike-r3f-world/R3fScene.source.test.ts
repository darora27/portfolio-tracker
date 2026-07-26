import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(path.resolve(__dirname, "R3fScene.tsx"), "utf8");

describe("§7 direct-Three scene architecture", () => {
  it("marks the canvas aria-hidden and renders exactly the five imported chapters", () => {
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain("for (const chapter of OBSERVATORY_CHAPTERS)");
    expect(source).not.toMatch(/postprocessing|physics|textureLoader/i);
    expect(source).not.toMatch(/@react-three\/fiber/);
    expect(source).not.toContain('import * as THREE');
    expect(source).toContain("renderer.setPixelRatio(1)");
    expect(source).toContain("new IcosahedronGeometry(0.72, 0)");
  });

  it("synchronizes mesh hover and activation through the callbacks supplied by the semantic layer", () => {
    expect(source).toContain("raycaster.intersectObjects");
    expect(source).toContain("hoverCallbackRef.current(nextHovered)");
    expect(source).toContain("navigateCallbackRef.current(chapterId)");
    expect(source).toContain('addEventListener("pointermove"');
    expect(source).toContain('addEventListener("click"');
  });
});
