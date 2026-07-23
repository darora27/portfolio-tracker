import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

/**
 * Minimal surface-tier header: wordmark, and either the private quiet
 * links (Full dashboard + Sign out) or the share "Read-only" chip.
 *
 * LogoutButton is a deep-tier component (hardcoded --text-secondary /
 * --text-primary, meant for a dark background) reused here as-is rather
 * than forked — Phase 9 forbids restyling deep-tier components, so its
 * text color is overridden from the OUTSIDE via a descendant selector
 * instead of editing LogoutButton.tsx itself.
 */
export function SurfaceHeader({ variant }: { variant: "private" | "share" }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-2 w-2 rounded-sm bg-accent" />
          <span className="text-sm font-semibold text-ink">Portfolio Tracker</span>
        </span>

        {variant === "share" ? (
          <span className="rounded-lg border border-line bg-paper-raised px-2.5 py-1 text-xs font-medium text-ink-soft">
            Read-only
          </span>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/dashboard"
              className="inline-flex min-h-[44px] items-center font-medium text-accent-ink hover:underline"
            >
              Full dashboard
            </Link>
            <span className="[&>button]:inline-flex [&>button]:min-h-[44px] [&>button]:items-center [&>button]:text-ink-soft [&>button]:hover:text-ink">
              <LogoutButton />
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
