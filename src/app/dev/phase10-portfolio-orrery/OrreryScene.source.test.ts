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
    expect(source).not.toMatch(/@react-three\/drei|postprocessing|physics|useLoader/i);
    expect(source).toContain("KTX2Loader");
    expect(source).toContain("/textures/planets/${ticker}-base.ktx2");
    expect(source).toContain("tickerSeed(holding.ticker)");
  });

  it("draws each orbit from the same radius the corresponding planet travels", () => {
    expect(source).toContain("const orbitRadius = orbitRadiusForRank(rank)");
    expect(source).toContain("new RingGeometry(orbitRadius - 0.012");
    expect(source).toContain("planet.position.set(orbitRadius, 0, 0)");
  });

  it("keeps overview rings and trails legible and clears rings near approached planets", () => {
    expect(source).toMatch(/opacity: 0\.34,\s+fog: false,/);
    expect(source).toMatch(/opacity: 0\.96,\s+fog: false,/);
    expect(source).toContain("planet.path.visible = state !== \"approach\"");
    expect(source).toContain("0.14 * (1 - t0)");
  });

  it("places identity-tinted ticker tags below planets instead of over their textures", () => {
    expect(source).toContain("--planet-label-color");
    expect(source).toContain("addScaledVector(camera.up, -planet.mesh.scale.x * 1.45)");
  });

  it("keeps planets orbiting while pointer selection travels by rocket", () => {
    expect(source).not.toContain("if (stabilized)");
    expect(source).toContain('planet.direction === "clockwise" ? -1 : 1');
    expect(source).toContain("planet.angularSpeed *");
    expect(source).toContain("planet.holding.ticker === selected");
    expect(source).toContain("planet.holding.ticker === hovered");
    expect(source).toContain("planet.mesh.rotation.y += planet.axialSpin * delta");
    expect(source).toContain("ROCKET_FLIGHT_MS");
    expect(source).toContain("launchRocket(target)");
    expect(source).toContain("if (reducedMotion)");
  });

  it("uses one raycast path for mesh hover, holding selection, and sun activation", () => {
    expect(source).toContain("raycaster.intersectObjects");
    expect(source).toContain("callbacksRef.current.onHover(ticker)");
    expect(source).toContain("callbacksRef.current.onSelect(ticker)");
    expect(source).toContain("callbacksRef.current.onSelectPortfolio()");
    expect(source).toContain("magneticTarget");
    expect(source).toContain('cameraStateRef.current !== "overview"');
    expect(source).toContain("callbacksRef.current.onExitOverview()");
    expect(source).toContain('return "belt"');
    expect(source).toContain("label.addEventListener(\"click\", () => callbacksRef.current.onSelectBelt())");
  });

  it("uses instrumentation-only docking feedback for sun hover", () => {
    expect(source).toContain("const dockingRing = new Group()");
    expect(source).toContain('dockingRing.visible = localTarget === "portfolio"');
    expect(source).toContain("dockingRing.rotation.z");
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
    expect(source).toContain("orbitGeometries");
    expect(source).toContain("geometry.dispose()");
    expect(source).toContain("planetGeometry.dispose()");
    expect(source).toContain("renderer.dispose()");
  });
});
