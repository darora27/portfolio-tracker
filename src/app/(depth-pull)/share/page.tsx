import type { Metadata } from "next";
import {
  UniverseRoute,
  type UniverseSearchParams,
} from "@/components/observatory/orrery/UniverseRoute";

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
