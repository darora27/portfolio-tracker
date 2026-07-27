import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(__dirname, "dashboard-data.ts"), "utf8");

describe("dashboard-data §8 public projection", () => {
  it("projects day return without exposing dollar-bearing position fields", () => {
    expect(source).toContain("dayReturn:");
    expect(source).toContain("positionRows.find");
    expect(source).toContain("?.dayPct");
  });

  it("derives sticky prior membership from the latest prior snapshot", () => {
    expect(source).toContain("previousSnapshotRecord");
    expect(source).toContain("snapshot.date < today");
    expect(source).toContain("position.value / previousSnapshotRecord.total_value");
    expect(source).toContain("resolveBeltMembership(");
  });
});
