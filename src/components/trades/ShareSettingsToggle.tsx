"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

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
    <Card className="flex items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-medium text-text-primary">Share view: hide dollar amounts</h3>
        <p className="mt-0.5 text-xs text-text-secondary">
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
          hideDollars ? "bg-accent" : "bg-surface-hover"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            hideDollars ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </Card>
  );
}
