import type { Metadata } from "next";
import {
  UniverseRoute,
  type UniverseSearchParams,
} from "@/components/observatory/orrery/UniverseRoute";

/**
 * DEPLOY_READINESS §3: why this route is dynamic.
 *
 * Unlike `/share`, this one has a real reason — it is the owner view, gated
 * on an auth cookie read inside `UniverseRoute`. A cached or prerendered
 * response here would risk serving one visitor's gate decision to another,
 * and that is a privacy boundary rather than a performance preference.
 *
 * The data underneath is still shared-cached via `unstable_cache`; per-request
 * rendering does not mean per-request Finnhub calls. See the longer note on
 * the /share route, which is the one FB-36 was actually about.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<UniverseSearchParams>;
}) {
  return UniverseRoute({ basePath: "/", searchParams, ownerGate: true });
}
