import { supabase } from "@/lib/supabase/client";

export default async function Home() {
  const [{ data: trades, error: tradesError }, { data: snapshots, error: snapshotsError }] =
    await Promise.all([
      supabase.from("trades").select("*").order("date", { ascending: true }),
      supabase.from("snapshots").select("*").order("date", { ascending: true }),
    ]);

  if (tradesError) throw tradesError;
  if (snapshotsError) throw snapshotsError;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 font-sans">
      <h1 className="text-2xl font-semibold">Portfolio Tracker — Phase 1 check</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Raw data pulled straight from Supabase to confirm the import worked.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Trades ({trades?.length ?? 0})</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-zinc-500 dark:border-zinc-700">
              <th className="py-1 pr-4">Date</th>
              <th className="py-1 pr-4">Ticker</th>
              <th className="py-1 pr-4">Action</th>
              <th className="py-1 pr-4">Shares</th>
              <th className="py-1 pr-4">Price</th>
              <th className="py-1 pr-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {trades?.map((trade) => (
              <tr key={trade.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-1 pr-4">{trade.date}</td>
                <td className="py-1 pr-4">{trade.ticker}</td>
                <td className="py-1 pr-4">{trade.action}</td>
                <td className="py-1 pr-4">{trade.shares}</td>
                <td className="py-1 pr-4">${trade.price.toFixed(2)}</td>
                <td className="py-1 pr-4">${trade.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Snapshots ({snapshots?.length ?? 0})</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-zinc-500 dark:border-zinc-700">
              <th className="py-1 pr-4">Date</th>
              <th className="py-1 pr-4">Total cost</th>
              <th className="py-1 pr-4">Total value</th>
            </tr>
          </thead>
          <tbody>
            {snapshots?.map((snapshot) => (
              <tr key={snapshot.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-1 pr-4">{snapshot.date}</td>
                <td className="py-1 pr-4">${snapshot.total_cost.toFixed(2)}</td>
                <td className="py-1 pr-4">${snapshot.total_value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
