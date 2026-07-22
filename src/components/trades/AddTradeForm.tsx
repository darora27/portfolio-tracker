"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
const inputClass =
  "mt-1 w-full rounded-md border border-border bg-surface-hover px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none";

export function AddTradeForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    ticker: "",
    action: "buy" as "buy" | "sell",
    shares: "",
    price: "",
    reason: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        ticker: form.ticker,
        action: form.action,
        shares: Number(form.shares),
        price: Number(form.price),
        reason: form.reason || null,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setForm((f) => ({ ...f, ticker: "", shares: "", price: "", reason: "" }));
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-surface p-6 transition-[border-color,box-shadow] duration-150 ease-out hover:border-border-strong"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Add trade
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="text-xs text-text-secondary">
          Date
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="text-xs text-text-secondary">
          Ticker
          <input
            type="text"
            required
            value={form.ticker}
            onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
            className={`${inputClass} uppercase`}
          />
        </label>
        <label className="text-xs text-text-secondary">
          Action
          <select
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value as "buy" | "sell" })}
            className={inputClass}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>
        <label className="text-xs text-text-secondary">
          Shares
          <input
            type="number"
            required
            min="0"
            step="any"
            value={form.shares}
            onChange={(e) => setForm({ ...form, shares: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="text-xs text-text-secondary">
          Price
          <input
            type="number"
            required
            min="0"
            step="any"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="text-xs text-text-secondary sm:col-span-3">
          Reason (optional)
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-loss">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Adding..." : "Add trade"}
      </button>
    </form>
  );
}
