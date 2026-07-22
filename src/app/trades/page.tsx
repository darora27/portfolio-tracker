import Link from "next/link";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";
import { LoginForm } from "@/components/trades/LoginForm";
import { AddTradeForm } from "@/components/trades/AddTradeForm";
import { LogoutButton } from "@/components/trades/LogoutButton";
import { TradeLogTable } from "@/components/trades/TradeLogTable";

export const dynamic = "force-dynamic";

export default async function TradesPage() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          &larr; Dashboard
        </Link>
        <h1 className="mt-3 text-xl font-semibold">Trade log</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in to view and add trades.</p>
        <LoginForm />
      </div>
    );
  }

  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/" className="text-sm text-zinc-500 hover:underline">
            &larr; Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">Trade log</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8">
        <AddTradeForm />
      </div>

      <div className="mt-10">
        <TradeLogTable trades={trades ?? []} />
      </div>
    </div>
  );
}
