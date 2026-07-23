const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number, compact = false): string {
  return (compact ? compactCurrencyFormatter : currencyFormatter).format(value);
}

export function formatPercent(value: number, digits = 2): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatPercent(value, digits)}`;
}

export function formatSignedCurrency(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

export function formatNumber(value: number, digits = 2): string {
  return value.toFixed(digits);
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMonthYear(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Finnhub's market cap is in MILLIONS. $1B+ shows as e.g. "$608.7B"; below that, "$450.2M". */
export function formatMarketCap(millions: number): string {
  if (millions >= 1000) {
    return `$${(millions / 1000).toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}B`;
  }
  return `$${millions.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
}

/** "3h ago" / "12m ago" under 24h old, otherwise a plain date — for news timestamps. */
export function formatRelativeOrDate(unixSeconds: number, now = Date.now()): string {
  const diffMs = now - unixSeconds * 1000;
  const hours = diffMs / 3_600_000;
  if (hours < 1) {
    const minutes = Math.max(1, Math.round(diffMs / 60_000));
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${Math.round(hours)}h ago`;
  }
  return formatDate(new Date(unixSeconds * 1000).toISOString().slice(0, 10));
}
