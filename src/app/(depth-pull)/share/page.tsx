import type { Metadata } from "next";
import {
  UniverseRoute,
  type UniverseSearchParams,
} from "@/components/observatory/orrery/UniverseRoute";

/**
 * DEPLOY_READINESS §3 requires any route carrying `force-dynamic` to state
 * what it needs per-request freshness FOR. The honest answer for this route:
 * **nothing.** It serves daily snapshots. This directive is the thoughtless
 * default the rule was written against, and it is the route that took 18.2 s
 * to first byte and cost the resume link.
 *
 * It is kept, deliberately, because it is now redundant rather than harmful.
 * `UniverseRoute` awaits `cookies()`, which opts a route into dynamic
 * rendering on its own, so removing this line would not change how the page
 * renders — and if that assumption about Next's static-generation bailout
 * were ever wrong, the failure mode is a build-time snapshot served to every
 * visitor forever, which is far worse than a redundant directive.
 *
 * What actually fixed FB-36 was neither: `getDashboardData` is wrapped in
 * `unstable_cache` (see src/lib/dashboard-data.ts), so the ~24 Finnhub calls
 * are shared across instances and visitors instead of blocking every render.
 * The in-memory cache that preceded it lived on one serverless instance and
 * never helped a first-time visitor — the only visitor a resume link has.
 *
 * Do not delete this line on the strength of the paragraph above alone.
 * Delete it after D1–D5 have been measured on the deployed URL both ways.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stock Market Universe — Share View",
  description: "Explore a public, read-only portfolio solar system.",
  robots: { index: false, follow: false },
};

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<UniverseSearchParams>;
}) {
  return UniverseRoute({ basePath: "/share", searchParams });
}
