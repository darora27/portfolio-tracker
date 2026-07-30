import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  UNIVERSE_CONTRASTS,
  UNIVERSE_CSS_BLOCK,
  UNIVERSE_CSS_PROPERTIES,
  UNIVERSE_CSS_VARIABLES,
  UNIVERSE_PALETTE,
  UNIVERSE_RAMP_LUTS,
  circularHueDistance,
  contrastRatio,
  firewallViolations,
  hueChroma,
  rampForReturn,
  rampGain,
  rampLoss,
  relativeLuminance,
  type FirewallToken,
} from "./universe-palette";
import { PLANET_IDENTITIES } from "./planet-identity";

function tokenRows(
  tier: string,
  values: Record<string, string>,
): FirewallToken[] {
  return Object.entries(values).map(([name, hex]) => ({ tier, name, hex }));
}

describe("the Fraunhofer universe palette", () => {
  it("keeps the five ramps as deterministic 64-entry transit tables", () => {
    for (const [name, table] of Object.entries(UNIVERSE_RAMP_LUTS)) {
      expect(table, `${name} sample count`).toHaveLength(64);
      expect(new Set(table).size, `${name} is not a flat ramp`).toBeGreaterThan(
        8,
      );
    }
  });

  it("keeps decorative and instrument light outside both stolen bands", () => {
    const decorative = [
      ...tokenRows("cabinet", UNIVERSE_PALETTE.cabinet),
      ...tokenRows("glass", UNIVERSE_PALETTE.glass),
      ...tokenRows(
        "ambient",
        Object.fromEntries(
          Object.entries(UNIVERSE_PALETTE.ambient).map(([name, token]) => [
            name,
            token.color,
          ]),
        ),
      ),
      ...(["aurora", "ember", "ice"] as const).flatMap((name) =>
        UNIVERSE_RAMP_LUTS[name].map((hex, index) => ({
          tier: `ramp.${name}`,
          name: String(index),
          hex,
        })),
      ),
    ];
    expect(firewallViolations(decorative)).toEqual([]);

    // Matter and paper are declared exemptions, but run through the checker so
    // their current result stays recorded rather than assumed.
    expect(
      firewallViolations([
        ...tokenRows("matter", UNIVERSE_PALETTE.matter),
        ...tokenRows("paper", UNIVERSE_PALETTE.paper),
      ]),
    ).toEqual([]);
  });

  it("locks every signal sample to its semantic hue with monotonic luminance", () => {
    const checks = [
      { name: "gain", table: UNIVERSE_RAMP_LUTS.gain, anchor: 143, order: 1 },
      { name: "loss", table: UNIVERSE_RAMP_LUTS.loss, anchor: 3, order: -1 },
    ] as const;
    for (const { name, table, anchor, order } of checks) {
      for (const [index, hex] of table.entries()) {
        const { hue, chroma } = hueChroma(hex);
        expect(chroma, `${name}[${index}] chroma`).toBeGreaterThan(0.3);
        expect(hue, `${name}[${index}] hue`).not.toBeNull();
        expect(
          circularHueDistance(hue!, anchor),
          `${name}[${index}] hue lock`,
        ).toBeLessThanOrEqual(10);
        if (index > 0) {
          const delta =
            relativeLuminance(hex) - relativeLuminance(table[index - 1]);
          expect(delta * order, `${name}[${index}] luminance order`).toBeGreaterThanOrEqual(
            -0.00001,
          );
        }
      }
    }
    expect(
      contrastRatio(UNIVERSE_RAMP_LUTS.gain[0], UNIVERSE_PALETTE.cabinet.void),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(
        UNIVERSE_RAMP_LUTS.loss.at(-1)!,
        UNIVERSE_PALETTE.cabinet.void,
      ),
    ).toBeGreaterThanOrEqual(3);
  });

  it("maps real weekly magnitude with exact frozen midpoints and safe clamps", () => {
    const midpointMagnitude = 0.002 + (0.12 - 0.002) * 0.5;
    expect(rampGain(0.5)).toBe(UNIVERSE_PALETTE.signal.gain);
    expect(rampLoss(0.5)).toBe(UNIVERSE_PALETTE.signal.loss);
    expect(rampForReturn(midpointMagnitude)).toBe(
      UNIVERSE_PALETTE.signal.gain,
    );
    expect(rampForReturn(-midpointMagnitude)).toBe(
      UNIVERSE_PALETTE.signal.loss,
    );
    expect(rampForReturn(null)).toBe(UNIVERSE_PALETTE.signal.flat);
    expect(rampForReturn(0)).toBe(UNIVERSE_PALETTE.signal.flat);
    expect(rampForReturn(0.002)).toBe(UNIVERSE_PALETTE.signal.flat);
    expect(rampForReturn(1)).toBe(rampGain(1));
    expect(rampForReturn(-1)).toBe(rampLoss(1));
  });

  it("caps ambient washes and names aurora as the single 0.40 exception", () => {
    for (const [name, token] of Object.entries(UNIVERSE_PALETTE.ambient)) {
      expect(token.alpha, `${name} alpha <= declared cap`).toBeLessThanOrEqual(
        token.alphaCap,
      );
      if (name === "aurora") {
        expect(token.alphaCap, "aurora is the declared alpha exception").toBe(
          0.4,
        );
      } else {
        expect(token.alphaCap, `${name} is an ambient wash`).toBeLessThanOrEqual(
          0.18,
        );
      }
      expect(token.hueExempt).toBe(true);
    }
  });

  it("computes every declared text contrast from source tokens", () => {
    for (const pair of UNIVERSE_CONTRASTS) {
      expect(
        contrastRatio(pair.foreground, pair.background),
        pair.id,
      ).toBeGreaterThanOrEqual(pair.minimum);
    }
    expect(
      contrastRatio(UNIVERSE_PALETTE.paper.ink, UNIVERSE_PALETTE.paper.sheet),
    ).toBeCloseTo(13.02, 1);
    for (const identity of PLANET_IDENTITIES) {
      expect(
        contrastRatio(
          identity.labelHex,
          UNIVERSE_PALETTE.cabinet.dishGlass,
        ),
        `${identity.ticker} rim on dish glass`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("emits one serializable CSS custom-property contract", () => {
    expect(Object.keys(UNIVERSE_CSS_VARIABLES)).toHaveLength(
      Object.keys(UNIVERSE_CSS_PROPERTIES).length,
    );
    expect(new Set(Object.values(UNIVERSE_CSS_VARIABLES)).size).toBe(
      Object.keys(UNIVERSE_CSS_VARIABLES).length,
    );
    for (const [name, value] of Object.entries(UNIVERSE_CSS_PROPERTIES)) {
      expect(UNIVERSE_CSS_BLOCK).toContain(`${name}:${value}`);
    }
  });

  it("structurally forbids palette-token hex copies in scene and bay sources", () => {
    const root = path.resolve(__dirname, "../..");
    const bayDirectory = path.join(
      root,
      "components/observatory/orrery/MissionControlBays",
    );
    const files = [
      path.join(__dirname, "scene-model.ts"),
      path.join(root, "components/observatory/orrery/OrreryScene.tsx"),
      path.join(root, "components/observatory/orrery/orrery.module.css"),
      ...readdirSync(bayDirectory)
        .filter((file) => file.endsWith(".tsx"))
        .map((file) => path.join(bayDirectory, file)),
    ];
    const paletteValues = new Set(
      Object.values(UNIVERSE_CSS_PROPERTIES).map((value) =>
        value.toLowerCase(),
      ),
    );
    const collisions = files.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return [...source.matchAll(/#[0-9a-fA-F]{6}\b/g)]
        .filter((match) => paletteValues.has(match[0].toLowerCase()))
        .map((match) => `${path.relative(process.cwd(), file)}:${match.index}:${match[0]}`);
    });
    // This is the declared FWL-05 source-structure guard. It does not claim
    // anything about rendered behavior; DOM, scene-model, and live-pixel tests
    // cover that separately.
    expect(collisions).toEqual([]);
  });
});
