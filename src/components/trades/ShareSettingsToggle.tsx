"use client";

import { useState } from "react";

export function ShareSettingsToggle({ initialHideDollars }: { initialHideDollars: boolean }) {
  const [hideDollars, setHideDollars] = useState(initialHideDollars);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    const next = !hideDollars;
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hideDollars: next }),
    });
    setSaving(false);
    if (res.ok) setHideDollars(next);
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <h3 className="text-sm font-medium">Share view: hide dollar amounts</h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          When on, /share shows percentages and weights only — no total value, invested amount,
          or dollar gains.
        </p>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={saving}
        role="switch"
        aria-checked={hideDollars}
        aria-label="Hide dollar amounts on share view"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          hideDollars ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform dark:bg-zinc-900 ${
            hideDollars ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
