import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { FlipCard } from "@/components/surface/FlipCard";
import { DepthPull } from "@/components/surface/DepthPull";
import { CountUpSettle } from "@/components/surface/CountUpSettle";
import { PortfolioOrrery } from "@/components/surface/PortfolioOrrery";

export const metadata: Metadata = {
  title: "Surface scratch — Portfolio Tracker",
  robots: { index: false, follow: false },
};

/**
 * §1 "done when" scratch page: renders the four Daylight surface
 * primitives (FlipCard, DepthPull, CountUpSettle, PortfolioOrrery) so
 * they can be exercised and visually audited in isolation before §3
 * wires them into the real Act 1-3 pages. Owner-gated like every other
 * new Phase 9 route by default.
 */
export default async function SurfaceScratchPage() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Surface scratch</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view.</p>
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl space-y-16 px-4 py-16 sm:px-6">
        <div>
          <Link href="/dashboard" className="text-sm text-accent-ink hover:underline">
            &larr; Dashboard
          </Link>
          <h1 className="mt-4 font-display text-3xl italic text-ink-soft">Surface scratch</h1>
          <p className="mt-2 text-sm text-ink-faint">
            §1 primitives, rendered in isolation for review — not part of the public IA.
          </p>
        </div>

        <section className="relative isolate space-y-4">
          <h2 className="font-display text-2xl italic text-ink-soft">CountUpSettle</h2>
          <div className="relative rounded-xl border border-line bg-paper-raised p-8">
            <PortfolioOrrery className="absolute inset-0" />
            <div className="relative font-mono text-6xl font-bold text-ink">
              <CountUpSettle value={25341.75} variant="currency" />
            </div>
            <div className="relative mt-2 font-mono text-2xl text-ink-soft">
              <CountUpSettle value={0.1132} variant="signedPercent" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl italic text-ink-soft">FlipCard</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FlipCard
              ariaLabel="Flip: What I own"
              seeMoreHref="/dashboard"
              front={
                <div className="text-sm text-ink-soft">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">What I own</p>
                  <p className="mt-2 text-ink">13 positions — largest: ASML</p>
                </div>
              }
              back={
                <div className="text-sm text-ink-soft">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Composition</p>
                  <p className="mt-2 text-ink">(mini composition donut placeholder)</p>
                </div>
              }
            />
            <FlipCard
              ariaLabel="Flip: How risky is it"
              seeMoreHref="/dashboard"
              front={
                <div className="text-sm text-ink-soft">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">How risky is it</p>
                  <p className="mt-2 text-ink">Moderately concentrated.</p>
                </div>
              }
              back={
                <div className="text-sm text-ink-soft">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Concentration</p>
                  <p className="mt-2 text-ink">(concentration meter placeholder)</p>
                </div>
              }
            />
            <FlipCard
              ariaLabel="Flip: Today"
              seeMoreHref="/dashboard"
              front={
                <div className="text-sm text-ink-soft">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Today</p>
                  <p className="mt-2 text-ink">Down 1.2% today — behind the market.</p>
                </div>
              }
              back={
                <div className="text-sm text-ink-soft">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Today&apos;s mover</p>
                  <p className="mt-2 text-ink">(top mover placeholder)</p>
                </div>
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl italic text-ink-soft">DepthPull</h2>
          <DepthPull
            href="/dashboard"
            className="inline-block rounded-full bg-accent px-6 py-3 text-base font-medium text-white"
          >
            Open the full dashboard
          </DepthPull>
        </section>
      </div>
    </div>
  );
}
