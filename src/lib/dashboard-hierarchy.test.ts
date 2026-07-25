import { describe, expect, it } from "vitest";
import {
  DASHBOARD_VIEWS,
  dashboardViewHref,
  resolveDashboardView,
} from "./dashboard-hierarchy";

describe("dashboard hierarchy", () => {
  it.each(["how", "why", "attention", "analytics"] as const)(
    "resolves the %s view",
    (id) => {
      expect(resolveDashboardView(id)).toEqual(
        DASHBOARD_VIEWS.find((view) => view.id === id),
      );
    },
  );

  it("defaults invalid and missing values, and uses the first repeated value", () => {
    expect(resolveDashboardView("unknown").id).toBe("how");
    expect(resolveDashboardView(undefined).id).toBe("how");
    expect(resolveDashboardView(["why", "analytics"]).id).toBe("why");
  });

  it("builds view hrefs and preserves caller-owned query state", () => {
    expect(dashboardViewHref("how")).toBe("/dashboard?mode=how");
    expect(dashboardViewHref("analytics", { explain: "beta" })).toBe(
      "/dashboard?explain=beta&mode=analytics",
    );
  });
});
