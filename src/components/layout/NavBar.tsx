import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

const linkClass = (isActive: boolean) =>
  isActive
    ? "border-b-2 border-accent pb-[18px] pt-[18px] text-text-primary"
    : "border-b-2 border-transparent pb-[18px] pt-[18px] text-text-secondary hover:text-text-primary";

export function NavBar({
  variant,
  active,
}: {
  variant: "private" | "share";
  active?: "dashboard" | "history" | "trades" | "research";
}) {
  return (
    <header
      className="sticky top-0 z-10 h-14 border-b border-border backdrop-blur"
      style={{ background: "rgba(10,10,15,0.8)" }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={variant === "share" ? "/share" : "/"} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-accent" />
          <span className="text-sm font-semibold text-text-primary">Portfolio Tracker</span>
        </Link>

        {variant === "share" ? (
          <span className="rounded-lg border border-border bg-surface-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
            Read-only
          </span>
        ) : (
          <nav className="flex h-full items-center gap-5 text-sm">
            <Link href="/" className={linkClass(false)}>
              Overview
            </Link>
            <Link href="/dashboard" className={linkClass(active === "dashboard")}>
              Dashboard
            </Link>
            <Link href="/history" className={linkClass(active === "history")}>
              History
            </Link>
            <Link href="/trades" className={linkClass(active === "trades")}>
              Trades
            </Link>
            <Link href="/research" className={linkClass(active === "research")}>
              Research
            </Link>
            <LogoutButton />
          </nav>
        )}
      </div>
    </header>
  );
}
