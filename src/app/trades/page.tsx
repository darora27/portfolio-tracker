import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { AddTradeForm } from "@/components/trades/AddTradeForm";
import { NavBar } from "@/components/layout/NavBar";
import { TradeLogTable } from "@/components/trades/TradeLogTable";
import { ShareSettingsToggle } from "@/components/trades/ShareSettingsToggle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trade Log — Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function TradesPage() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <Link href="/share" className="text-sm text-text-secondary hover:text-text-primary hover:underline">
          View public share page
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Trade log</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view and add trades.</p>
        <LoginForm />
      </div>
    );
  }

  const [{ data: trades, error }, { data: setting }] = await Promise.all([
    supabase.from("trades").select("*").order("date", { ascending: false }),
    supabase.from("settings").select("value").eq("key", "share_hide_dollars").maybeSingle(),
  ]);
  if (error) throw error;

  return (
    <>
      <NavBar variant="private" active="trades" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-text-primary">Trade log</h1>
            <a
              href="/api/export/trades.csv"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border-strong hover:text-text-primary"
            >
              Export CSV
            </a>
          </div>

          <div className="space-y-4">
            <ShareSettingsToggle initialHideDollars={setting?.value ?? true} />
            <AddTradeForm />
          </div>

          <TradeLogTable trades={trades ?? []} />
        </div>
      </div>
    </>
  );
}
