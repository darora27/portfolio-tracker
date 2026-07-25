import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(path.resolve(__dirname, "R3fScene.tsx"), "utf8");

describe("§7 R3F scene architecture", () => {
  it("marks the canvas aria-hidden and renders exactly the five imported chapters", () => {
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain("OBSERVATORY_CHAPTERS.map");
    expect(source).not.toMatch(/postprocessing|physics|textureLoader/i);
  });

  it("synchronizes mesh hover and activation through the callbacks supplied by the semantic layer", () => {
    expect(source).toContain("onPointerOver");
    expect(source).toContain("onPointerOut");
    expect(source).toContain("onHoverChapter(chapter.id)");
    expect(source).toContain("onHoverChapter(null)");
    expect(source).toContain("onNavigateChapter(chapter.id)");
  });
});
