/**
 * FB-37, Aug 3 2026 — who actually gets the 26 MB of planet textures.
 *
 * `scripts/generate-planet-textures.mjs` licenses a 30 MB budget on the
 * grounds that the maps are "desktop-only, lazy-loaded, cached assets fetched
 * after first paint". Lazy and post-first-paint were true. **Desktop-only was
 * not** — there was no device gate anywhere: `forceNo3d` comes from a query
 * parameter, and the one `matchMedia("(min-width: 1024px)")` in OrreryWorld
 * guards pointer parallax. A phone on cellular downloaded all 26 MB, on a
 * project whose requirements say family will open this on phones.
 *
 * This makes the comment true. It is deliberately the cheapest possible fix:
 * no art is touched, no texture is re-encoded, no generator is re-run — the
 * bytes are simply not requested where they were never meant to go. Planets
 * fall back to their deterministic shader art, which is the same path already
 * taken for a ticker with no authored texture, so it is well travelled rather
 * than newly invented.
 */

/** Matches the width OrreryWorld already uses to decide a pointer is a mouse. */
export const PLANET_TEXTURE_MIN_WIDTH = 1024;

export type TextureEnvironment = {
  /**
   * Result of `matchMedia("(min-width: 1024px)")`, or null where matchMedia
   * is unavailable.
   */
  wideViewport: boolean | null;
  /**
   * `navigator.connection.saveData`, or null where the Network Information
   * API is absent (Safari and Firefox, at time of writing).
   */
  saveData: boolean | null;
};

/**
 * Fails OPEN. When the environment cannot be read, textures load — that is
 * today's behaviour, and a detection gap should not silently downgrade the
 * scene for someone who would have had it. Only a positive signal withholds
 * them.
 */
export function shouldLoadPlanetTextures(environment: TextureEnvironment): boolean {
  // Explicit user intent outranks screen size: Data Saver on a wide window is
  // still someone asking not to be sent 26 MB.
  if (environment.saveData === true) return false;
  if (environment.wideViewport === false) return false;
  return true;
}

/** Reads the policy inputs from the browser, with every API treated as optional. */
export function readTextureEnvironment(): TextureEnvironment {
  const wideViewport =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(`(min-width: ${PLANET_TEXTURE_MIN_WIDTH}px)`).matches
      : null;

  const connection =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      : undefined;

  return {
    wideViewport,
    saveData: typeof connection?.saveData === "boolean" ? connection.saveData : null,
  };
}
