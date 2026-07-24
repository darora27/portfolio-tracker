import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// Regression test for the §1 refiner finding: the freshness label
// (.freshnessLabel, using --obs-ink-faint) measured 3.82:1 against the
// shell background at 12.8px/400 — below the WCAG 4.5:1 normal-text
// minimum. This computes the actual contrast ratio from the token values in
// source so a future color edit can't silently regress below 4.5:1 again.
const css = readFileSync(path.resolve(__dirname, "observatory.module.css"), "utf8");

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const linear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
}

function readToken(name: string): string {
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`token ${name} not found in observatory.module.css`);
  return match[1];
}

describe("observatory.module.css — freshness label contrast", () => {
  it("--obs-ink-faint (.freshnessLabel foreground) meets 4.5:1 against --obs-bg", () => {
    const fg = readToken("--obs-ink-faint");
    const bg = readToken("--obs-bg");
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
