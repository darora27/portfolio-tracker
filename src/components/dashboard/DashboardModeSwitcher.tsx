import Link from "next/link";
import {
  DASHBOARD_VIEWS,
  dashboardViewHref,
  type DashboardViewId,
} from "@/lib/dashboard-hierarchy";

export type DashboardModeSwitcherProps = {
  activeViewId: DashboardViewId;
  preservedQuery?: Record<string, string>;
};

export function DashboardModeSwitcher({
  activeViewId,
  preservedQuery,
}: DashboardModeSwitcherProps) {
  return (
    <nav
      aria-label="Dashboard view"
      className="flex flex-wrap items-center gap-x-2 border-y border-border py-2 text-sm"
    >
      {DASHBOARD_VIEWS.map((view) => {
        const active = view.id === activeViewId;
        const secondary = view.id === "analytics";
        return (
          <span
            key={view.id}
            className={secondary ? "ml-auto flex items-center gap-2 max-sm:ml-0" : undefined}
            data-secondary={secondary ? "true" : undefined}
          >
            {secondary ? (
              <span aria-hidden="true" className="text-border-strong">
                |
              </span>
            ) : null}
            <Link
              href={dashboardViewHref(view.id, preservedQuery)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center border-b-2 px-2 font-medium transition-colors ${
                active
                  ? "border-accent text-text-primary"
                  : "border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary"
              } ${secondary ? "font-mono text-xs uppercase tracking-wider" : ""}`}
            >
              {view.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
