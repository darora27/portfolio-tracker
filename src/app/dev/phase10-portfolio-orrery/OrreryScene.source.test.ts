import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(path.resolve(__dirname, "OrreryScene.tsx"), "utf8");

describe("Portfolio Orrery R3F architecture", () => {
  it("keeps the canvas duplicated-accessibility layer aria-hidden and bounded", () => {
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain("holdings.map");
    expect(source).toContain("dpr={1}");
    expect(source).not.toMatch(/postprocessing|physics|textureLoader|useLoader/i);
  });

  it("draws each orbit from the same radius the corresponding planet travels", () => {
    expect(source).toContain("const orbitRadius = orbitRadiusForIndex(index)");
    expect(source).toContain(
      "<ringGeometry args={[orbitRadius - 0.008, orbitRadius + 0.008, 96]}",
    );
    expect(source).toContain('position={[orbitRadius, 0, 0]}');
  });

  it("stabilizes selected and hovered planets while direction and speed drive motion", () => {
    expect(source).toContain("if (stabilized)");
    expect(source).toContain('direction === "clockwise" ? -1 : 1');
    expect(source).toContain("angularSpeed * delta");
    expect(source).toContain("holding.ticker === selectedTicker");
    expect(source).toContain("holding.ticker === hoveredTicker");
  });

  it("uses the same callbacks for mesh hover, holding selection, and sun activation", () => {
    expect(source).toContain("onHover(holding.ticker)");
    expect(source).toContain("onHover(null)");
    expect(source).toContain("onSelect(holding.ticker)");
    expect(source).toContain("onSelectPortfolio()");
  });
});
