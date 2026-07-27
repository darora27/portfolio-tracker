import type { Metadata } from "next";
import {
  UniverseRoute,
  type UniverseSearchParams,
} from "@/components/observatory/orrery/UniverseRoute";

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
