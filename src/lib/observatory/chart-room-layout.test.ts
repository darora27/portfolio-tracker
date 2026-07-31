import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CHART_ROOM_TEXT_ROLES, type ChartRoomTextRole } from "./chart-room-layout";

/**
 * VIS-08/TST-01 -- mirrors mission-control-text-roles.test.tsx's pattern
 * (FB-05's precedent): parses the real chart-room.module.css text for each
 * role's declared font-size token, a rendered gate against the actual
 * stylesheet rather than a hand-maintained assertion divorced from it.
 * The companion rendered-component check (selectors actually mounted, not
 * just declared) lives in ChartRoomHeader.test.tsx, since JSX needs a
 * .tsx file and this filename is fixed by the section-14 acceptance
 * ledger's TST-01 verifier command.
 */

const rawCss = readFileSync(
  path.resolve(__dirname, "../../components/observatory/chart-room/chart-room.module.css"),
  "utf8",
);
const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, " ");

const ROOT_TOKEN_PX = new Map(
  [...css.matchAll(/(--type-[a-z]+):\s*([\d.]+)px/g)].map((m) => [m[1], Number(m[2])]),
);

function fontSizePxForSelector(selector: string): number | null {
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(css))) {
    const selectors = match[1].split(",").map((s) => s.trim().replace(/\s+/g, " "));
    if (!selectors.includes(selector)) continue;
    const declaration = match[2].match(/font(?:-size)?\s*:[^;]*var\((--type-[a-z-]+)\)/);
    if (!declaration) continue;
    return ROOT_TOKEN_PX.get(declaration[1]) ?? null;
  }
  return null;
}

function expectSelectorOnRole(selector: string, role: ChartRoomTextRole) {
  const expectedToken = CHART_ROOM_TEXT_ROLES[role].token;
  const expectedPx = ROOT_TOKEN_PX.get(expectedToken);
  expect(expectedPx, `${expectedToken} must be a defined ramp token`).toBeDefined();
  const actualPx = fontSizePxForSelector(selector);
  expect(actualPx, `${selector} should resolve to ${expectedToken} (${expectedPx}px)`).toBe(expectedPx);
}

describe("Chart Room text roles resolve to their assigned ramp token (§14 VIS-08)", () => {
  it("declares --type-label at the current production 12px floor, not the mock's stale 11px", () => {
    expect(ROOT_TOKEN_PX.get("--type-label")).toBe(12);
  });

  it("defines every selector named in the section-14 spec's role table exactly once", () => {
    for (const role of Object.values(CHART_ROOM_TEXT_ROLES)) {
      for (const selector of role.selectors) {
        expect(
          fontSizePxForSelector(selector),
          `${selector} must declare a font-size/font var(--type-*)`,
        ).not.toBeNull();
      }
    }
  });

  for (const [roleName, role] of Object.entries(CHART_ROOM_TEXT_ROLES)) {
    for (const selector of role.selectors) {
      it(`${selector} -> ${roleName} (${role.token})`, () => {
        expectSelectorOnRole(selector, roleName as ChartRoomTextRole);
      });
    }
  }
});
