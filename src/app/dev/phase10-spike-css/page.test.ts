import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// The R3F spike route (/dev/phase10-spike-r3f) was removed from the tree
// after the CSS-vs-R3F decision was recorded (see
// docs/phase10-spike-section-1/DECISION.md). The retained CSS spike used to
// link to it as a live "Compare with the R3F spike" anchor, which 404s now
// that the route is gone. This asserts the retained page never regains a
// live href to the removed route, even though it may still mention the path
// as historical text.
const source = readFileSync(path.resolve(__dirname, "page.tsx"), "utf8");

describe("phase10-spike-css page — no dead link to the removed R3F route", () => {
  it("does not render an href to /dev/phase10-spike-r3f", () => {
    expect(source).not.toMatch(/href=["'`]\/dev\/phase10-spike-r3f/);
  });

  it("still references the removed route as historical, non-interactive context", () => {
    expect(source).toMatch(/phase10-spike-r3f/);
    expect(source).toMatch(/DECISION\.md/);
  });
});
