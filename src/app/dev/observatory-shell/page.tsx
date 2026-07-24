import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { ObservatoryShell } from "@/components/observatory/ObservatoryShell";
import { resolveObservatoryChapter } from "@/lib/observatory/chapters";

export const metadata: Metadata = {
  title: "Observatory shell preview",
  robots: { index: false, follow: false },
};

/**
 * §1 production-shell preview: exercises ObservatoryShell in both public
 * and private mode before §2/§3 wire real chapter content into /share and
 * /. No portfolio data — freshness and chapter content are clearly labeled
 * placeholders, matching the shell's own "contains no data by itself"
 * privacy contract. Owner-gated like every other new Phase 10 dev route.
 */
export default async function ObservatoryShellPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string; mode?: string; no3d?: string }>;
}) {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Observatory shell preview</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view.</p>
        <LoginForm />
      </div>
    );
  }

  const params = await searchParams;
  const active = resolveObservatoryChapter(params.chapter);
  const mode = params.mode === "private" ? "private" : "public";
  const forceNo3d = params.no3d === "1";
  const basePath = "/dev/observatory-shell";
  // This preview route's own query-driven mode/no3d switches are not
  // production behavior — the shell only knows to preserve whatever the
  // caller tells it to. This page tells it to keep both.
  const preservedQuery: Record<string, string> = {};
  if (params.mode) preservedQuery.mode = params.mode;
  if (params.no3d) preservedQuery.no3d = params.no3d;

  return (
    <ObservatoryShell
      mode={mode}
      basePath={basePath}
      activeChapterId={active.id}
      preservedQuery={preservedQuery}
      title="Portfolio Observatory"
      freshness={{ label: "Freshness —", value: "not yet connected (§4 wires live data)" }}
      forceNo3d={forceNo3d}
      ownerSlot={
        mode === "private" ? (
          <p>Owner utility placeholder — total value and actions land here in §4, never on /share.</p>
        ) : undefined
      }
      chapterContent={{
        pulse: <p>Same-period portfolio-vs-VOO story ships in §2.</p>,
        forces: <p>Contribution and driver evidence ships in §3.</p>,
        structure: <p>Concentration and correlation evidence ships in §3.</p>,
        timeline: <p>Aligned performance/composition/event timeline ships in §3.</p>,
        lab: <p>Methodology, freshness, and limitations detail ships in §3.</p>,
      }}
    />
  );
}
