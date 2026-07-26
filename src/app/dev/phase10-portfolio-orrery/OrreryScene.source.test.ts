import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(
  path.resolve(__dirname, "../../../components/observatory/orrery/OrreryScene.tsx"),
  "utf8",
);

describe("Portfolio Orrery direct-Three architecture", () => {
  it("keeps the canvas duplicated-accessibility layer aria-hidden and bounded", () => {
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain("sceneHoldings.map");
    expect(source).toContain("renderer.setPixelRatio(1)");
    expect(source).not.toMatch(/@react-three\/fiber|import \* as THREE/);
    expect(source).not.toMatch(/postprocessing|physics|textureLoader|useLoader/i);
  });

  it("draws each orbit from the same radius the corresponding planet travels", () => {
    expect(source).toContain("const orbitRadius = orbitRadiusForIndex(index)");
    expect(source).toContain("path.scale.setScalar(orbitRadius)");
    expect(source).toContain("planet.position.set(orbitRadius, 0, 0)");
  });

  it("stabilizes selected and hovered planets while direction and speed drive motion", () => {
    expect(source).toContain("if (stabilized)");
    expect(source).toContain('planet.direction === "clockwise" ? -1 : 1');
    expect(source).toContain("planet.angularSpeed * delta");
    expect(source).toContain("planet.holding.ticker === selected");
    expect(source).toContain("planet.holding.ticker === hovered");
  });

  it("uses one raycast path for mesh hover, holding selection, and sun activation", () => {
    expect(source).toContain("raycaster.intersectObjects");
    expect(source).toContain("onHoverRef.current(ticker)");
    expect(source).toContain("onSelectRef.current(target)");
    expect(source).toContain("onSelectPortfolioRef.current()");
  });

  it("builds the required star, rim, glow, and procedural-material system", () => {
    expect(source).toContain("createStarField");
    expect(source).toContain("float rim");
    expect(source).toContain("float pattern");
    expect(source).toContain("AdditiveBlending");
    expect(source).toContain("glowOuter");
  });

  it("disposes every shared GPU resource on teardown", () => {
    expect(source).toContain("starField.geometry.dispose()");
    expect(source).toContain("orbitGeometry.dispose()");
    expect(source).toContain("planetGeometry.dispose()");
    expect(source).toContain("renderer.dispose()");
  });
});
