import type { NewsItem } from "@/lib/finnhub-news";
import { Card } from "@/components/ui/Card";
import { formatRelativeOrDate } from "@/lib/format";

/** Recent news for one ticker. Omitted entirely (by the caller) when there's nothing to show. */
export function StockNews({ items }: { items: NewsItem[] }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Recent news</h2>
      <Card padding="p-0" className="mt-3 divide-y divide-border overflow-hidden">
        {items.map((item, i) => (
          <a
            key={`${item.url}-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 hover:bg-surface-hover"
          >
            <p className="line-clamp-2 text-sm text-text-primary">{item.headline}</p>
            <p className="mt-1 text-xs text-text-secondary">
              {item.source} &middot; {formatRelativeOrDate(item.datetime)}
            </p>
          </a>
        ))}
      </Card>
    </section>
  );
}
