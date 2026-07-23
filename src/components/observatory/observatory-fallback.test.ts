import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// The Observatory shell deliberately does zero JS-driven layout switching
// for reduced-motion or the mobile/no-3D fallback — see
// docs/phase10-spike-section-1/DECISION.md. Both are pure CSS: the same
// server-rendered links re-flow via `@media (prefers-reduced-motion:
// reduce)` and via the `[data-force-no-3d="true"]` attribute (the
// evidence-capture / test hook proxy for that exact media query, since
// jsdom doesn't evaluate real @media rules). This test asserts the two
// mechanisms stay wired to the *same* set of classes, so a future edit
// can't silently make the forced-fallback hook diverge from the real
// reduced-motion/narrow-viewport behavior it stands in for.
const css = readFileSync(path.resolve(__dirname, "observatory.module.css"), "utf8");

const REDUCED_MOTION_MARKER = "@media (max-width: 767px), (prefers-reduced-motion: reduce)";
const FORCED_MARKER = '[data-force-no-3d="true"] .orbitWrap';

const reducedMotionBlock = css.slice(css.indexOf(REDUCED_MOTION_MARKER), css.indexOf(FORCED_MARKER));
const forcedBlock = css.slice(css.indexOf(FORCED_MARKER));

const FALLBACK_CLASSES = [".orbitWrap", ".orbit", ".inspector", ".bodyItem", ".body"];

describe("observatory.module.css — reduced-motion / no-3D fallback parity", () => {
  it("both blocks exist and are non-empty", () => {
    expect(reducedMotionBlock.length).toBeGreaterThan(50);
    expect(forcedBlock.length).toBeGreaterThan(50);
  });

  it.each(FALLBACK_CLASSES)("targets %s in both the reduced-motion query and the forced-no-3D hook", (className) => {
    expect(reducedMotionBlock.includes(className)).toBe(true);
    expect(forcedBlock.includes(className)).toBe(true);
  });

  it("disables the entry animation under both fallback paths", () => {
    expect(css).toMatch(/@keyframes obs-enter/);
    expect(reducedMotionBlock).toMatch(/animation:\s*none/);
    expect(forcedBlock).toMatch(/animation:\s*none/);
  });

  it("forces a static, non-3D layout (no perspective, no transform) under both fallback paths", () => {
    expect(reducedMotionBlock).toMatch(/perspective:\s*none/);
    expect(forcedBlock).toMatch(/perspective:\s*none/);
    expect(reducedMotionBlock).toMatch(/transform:\s*none\s*!important/);
    expect(forcedBlock).toMatch(/transform:\s*none\s*!important/);
  });
});
