import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const directory = path.resolve(__dirname);
const publicSource = readFileSync(
  path.join(directory, "PublicMissionControlContent.tsx"),
  "utf8",
);
const ownerSource = readFileSync(
  path.join(directory, "OwnerMissionControlContent.tsx"),
  "utf8",
);
const routeSource = readFileSync(
  path.join(directory, "UniverseRoute.tsx"),
  "utf8",
);

describe("Mission Control viewer-identity isolation", () => {
  it("keeps owner-only route components out of the public content module", () => {
    for (const ownerOnlyImport of [
      "AddTradeForm",
      "TradeLogTable",
      "ShareSettingsToggle",
      "LiveHeadlineStats",
      "DailyReturnsChart",
      "StockNews",
      "InsiderFilings",
    ]) {
      expect(publicSource).not.toContain(ownerOnlyImport);
      expect(ownerSource).toContain(ownerOnlyImport);
    }
    expect(publicSource).not.toContain("formatCurrency");
  });

  it("loads the owner content module only inside the authenticated branch", () => {
    const authStart = routeSource.indexOf(
      "if (portfolioSelected && authenticated)",
    );
    const authBranch = routeSource.slice(
      authStart,
      routeSource.indexOf("\n  return (", authStart),
    );
    expect(authBranch).toContain('await import(');
    expect(authBranch).toContain("OwnerMissionControlContent");
    expect(routeSource).toContain("PublicMissionControlContent");
    expect(routeSource).not.toMatch(
      /^import .*OwnerMissionControlContent/m,
    );
  });
});
