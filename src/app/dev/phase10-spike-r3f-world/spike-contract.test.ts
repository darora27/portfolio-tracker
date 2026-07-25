import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const cssRoot = path.resolve(__dirname, "../phase10-spike-css-world");
const r3fRoot = path.resolve(__dirname);
const sources = [
  readFileSync(path.join(cssRoot, "page.tsx"), "utf8"),
  readFileSync(path.join(cssRoot, "CssWorld.tsx"), "utf8"),
  readFileSync(path.join(cssRoot, "world.module.css"), "utf8"),
  readFileSync(path.join(r3fRoot, "page.tsx"), "utf8"),
  readFileSync(path.join(r3fRoot, "R3fWorld.tsx"), "utf8"),
  readFileSync(path.join(r3fRoot, "R3fSceneLoader.tsx"), "utf8"),
  readFileSync(path.join(r3fRoot, "R3fScene.tsx"), "utf8"),
  readFileSync(path.join(r3fRoot, "r3f-world.module.css"), "utf8"),
].join("\n");

describe("§7 spike route contract", () => {
  it("owner-gates both pages with the established session check", () => {
    for (const root of [cssRoot, r3fRoot]) {
      const page = readFileSync(path.join(root, "page.tsx"), "utf8");
      expect(page).toContain("isValidSession");
      expect(page).toContain("SESSION_COOKIE_NAME");
      expect(page).toContain("<LoginForm");
    }
  });

  it("contains no portfolio data imports, network reads, audio, physics, or post-processing", () => {
    const bannedPresentationPattern = new RegExp(
      [
        "DashboardData",
        "ownerSlot",
        "fetch\\(",
        "useSWR",
        "<" + "audio",
        "Audio" + "Context",
        "auto" + "play",
      ].join("|"),
      "i",
    );
    expect(sources).not.toMatch(bannedPresentationPattern);
    expect(sources).not.toMatch(/@react-three\/postprocessing|cannon|rapier|ammo\.js/i);
  });

  it("imports the canonical chapter model instead of duplicating chapter identity", () => {
    expect(sources).toContain('from "@/lib/observatory/chapters"');
    expect(sources).not.toMatch(/const\s+CHAPTERS\s*=/);
  });

  it("retains explicit static reduced-motion and forced-failure branches", () => {
    expect(sources).toContain("@media (prefers-reduced-motion: reduce)");
    expect(sources).toContain('[data-force-no-3d="true"]');
    expect(sources).toContain("WebGL context creation failure");
  });
});
