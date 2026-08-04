import { describe, expect, it } from "vitest";
import {
  PLANET_TEXTURE_MIN_WIDTH,
  shouldLoadPlanetTextures,
} from "./texture-policy";

/**
 * FB-37. The 26 MB was reaching phones, against a requirement that says
 * family opens this on phones, and against the generator's own claim that
 * these assets are desktop-only.
 *
 * Tested as a pure function because OrreryScene cannot be rendered in this
 * suite — it is a WebGL scene behind a dynamic ssr:false import. Putting the
 * decision in a function keeps the part that has a right answer separate from
 * the part that needs a GPU.
 */
describe("planet texture policy (FB-37)", () => {
  it("loads on a wide viewport with no Data Saver signal", () => {
    expect(
      shouldLoadPlanetTextures({ wideViewport: true, saveData: false }),
    ).toBe(true);
  });

  it("withholds 26 MB from a narrow viewport", () => {
    expect(
      shouldLoadPlanetTextures({ wideViewport: false, saveData: false }),
    ).toBe(false);
  });

  it("honours Data Saver even on a wide viewport", () => {
    // Someone who has turned Data Saver on is asking not to be sent this,
    // whatever size their window happens to be.
    expect(
      shouldLoadPlanetTextures({ wideViewport: true, saveData: true }),
    ).toBe(false);
  });

  it("fails open when the environment cannot be read", () => {
    // Safari and Firefox expose no Network Information API, and matchMedia is
    // absent in some embedded webviews. A detection gap must not silently
    // downgrade the scene for someone who would otherwise have had it.
    expect(
      shouldLoadPlanetTextures({ wideViewport: null, saveData: null }),
    ).toBe(true);
  });

  it("still withholds on a narrow viewport when Data Saver is unknown", () => {
    expect(
      shouldLoadPlanetTextures({ wideViewport: false, saveData: null }),
    ).toBe(false);
  });

  it("uses the same width OrreryWorld uses to decide a pointer is a mouse", () => {
    expect(PLANET_TEXTURE_MIN_WIDTH).toBe(1024);
  });
});
