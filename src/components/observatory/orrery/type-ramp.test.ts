import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MISSION_CONTROL_CSS_PROPERTIES,
  MISSION_CONTROL_LAYOUT,
} from "@/lib/observatory/mission-control-layout";

/**
 * Round 6 §5 / FB-05 — the five-token type ramp, enforced.
 *
 * "The small fonts need to be a good bit larger so that you can even see
 * what they have to say at all" has now been reported in three separate
 * reviews. Element-by-element fixes regrew the swarm every time (44
 * distinct sizes at the §11 review). This gate shrinks the set of LEGAL
 * sizes instead: every font-size in the universe stylesheet must resolve
 * to one of exactly five ramp values. A new hand-picked size is a build
 * failure, not a review finding.
 *
 * This is a source gate on the stylesheet (like the palette firewall), not
 * rendered coverage — the rendered check is the capture review's job.
 */

const RAMP_PX = new Set([56, 24, 15, 13, 12]);
const RAMP_TOKENS = [
  "--type-hero",
  "--type-readout",
  "--type-title",
  "--type-body",
  "--type-label",
] as const;

const css = readFileSync(
  path.resolve(__dirname, "./orrery.module.css"),
  "utf8",
);

function toPx(value: number, unit: string): number {
  return unit === "rem" ? value * 16 : value;
}

describe("universe type ramp (FB-05)", () => {
  it("defines exactly the five ramp tokens, at the ramp values", () => {
    const defined = new Map(
      [...css.matchAll(/(--type-[a-z]+):\s*([\d.]+)px/g)].map((m) => [
        m[1],
        Number(m[2]),
      ]),
    );
    expect([...defined.keys()].sort()).toEqual([...RAMP_TOKENS].sort());
    expect(new Set(defined.values())).toEqual(RAMP_PX);
  });

  it("allows no literal font size outside the ramp", () => {
    const offenders: string[] = [];
    const declarations = css.matchAll(/font(?:-size)?\s*:[^;{}]*;/g);
    for (const declaration of declarations) {
      const text = declaration[0];
      for (const size of text.matchAll(/([\d.]+)(px|rem)/g)) {
        const px = toPx(Number(size[1]), size[2]);
        // line-heights inside `font:` shorthand are unitless; only px/rem
        // reach here. Every one must be a ramp value (var() fallbacks
        // included — a fallback that disagrees with its token is a lie).
        if (!RAMP_PX.has(px)) offenders.push(text.trim());
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps every font-size on a ramp token or ramp value", () => {
    const sized = [...css.matchAll(/font-size\s*:\s*([^;]+);/g)]
      .map((m) => m[1].trim())
      .filter((v) => !v.startsWith("var(--type-") && !v.startsWith("var(--mission-"));
    const nonRamp = sized.filter((v) => {
      const m = v.match(/^([\d.]+)(px|rem)$/);
      return !(m && RAMP_PX.has(toPx(Number(m[1]), m[2])));
    });
    expect(nonRamp).toEqual([]);
  });

  it("keeps the Mission Control layout contract on the ramp", () => {
    expect(MISSION_CONTROL_LAYOUT.dayNumberPx).toBe(56);
    expect(MISSION_CONTROL_LAYOUT.bodyTextPx).toBe(15);
    expect(MISSION_CONTROL_LAYOUT.bayLabelPx).toBe(12);
    expect(MISSION_CONTROL_CSS_PROPERTIES).toMatchObject({
      "--mission-day-size": "56px",
      "--mission-body-size": "15px",
      "--mission-label-size": "12px",
    });
  });
});
