import type { NewsItem } from "@/lib/finnhub-news";
import { Card } from "@/components/ui/Card";
import { formatRelativeOrDate } from "@/lib/format";

/** Top headlines across all holdings, private dashboard only. Omitted entirely (by the caller) when there's nothing to show. */
export function LatestNews({ items }: { items: NewsItem[] }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Latest news</h2>
      <Card padding="p-0" className="mt-3 divide-y divide-border overflow-hidden">
        {items.map((item, i) => (
          <a
            key={`${item.url}-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 px-4 py-3 hover:bg-surface-hover"
          >
            <span className="mt-0.5 shrink-0 rounded-md border border-border bg-surface-hover px-1.5 py-0.5 font-mono text-[10px] font-medium text-text-secondary">
              {item.ticker}
            </span>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm text-text-primary">{item.headline}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {item.source} &middot; {formatRelativeOrDate(item.datetime)}
              </p>
            </div>
          </a>
        ))}
      </Card>
    </section>
  );
}
