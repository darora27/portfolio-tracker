export type DashboardViewId = "how" | "why" | "attention" | "analytics";

export type DashboardView = {
  id: DashboardViewId;
  index: number;
  label: string;
  question: string;
};

export const DASHBOARD_VIEWS: readonly DashboardView[] = [
  {
    id: "how",
    index: 0,
    label: "How am I doing?",
    question: "How is the portfolio performing against its own history and the market?",
  },
  {
    id: "why",
    index: 1,
    label: "Why?",
    question: "What holdings, flows, and moves are driving that result?",
  },
  {
    id: "attention",
    index: 2,
    label: "What deserves attention?",
    question: "What is stale, concentrated, or newly notable right now?",
  },
  { id: "analytics", index: 3, label: "All analytics", question: "" },
] as const;

export const DEFAULT_DASHBOARD_VIEW_ID: DashboardViewId = "how";

const VIEW_IDS = DASHBOARD_VIEWS.map((view) => view.id);

function isDashboardViewId(value: string): value is DashboardViewId {
  return (VIEW_IDS as readonly string[]).includes(value);
}

export function resolveDashboardView(
  raw: string | string[] | undefined,
): DashboardView {
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (slug && isDashboardViewId(slug)) {
    return DASHBOARD_VIEWS.find((view) => view.id === slug)!;
  }
  return DASHBOARD_VIEWS[0];
}

export function dashboardViewHref(
  id: DashboardViewId,
  preservedQuery?: Record<string, string>,
): string {
  const params = new URLSearchParams(preservedQuery);
  params.set("mode", id);
  return `/dashboard?${params.toString()}`;
}
