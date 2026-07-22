import { formatPercent } from "@/lib/format";
import type { ClassificationWeight } from "@/lib/portfolio/classification-weights";

export function ClassificationBarList({
  title,
  items,
}: {
  title: string;
  items: ClassificationWeight[];
}) {
  const maxWeight = Math.max(...items.map((i) => i.weight), 0.0001);

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-sm text-text-secondary">{item.label}</span>
            <div className="h-2 flex-1 rounded-full bg-surface-hover">
              <div
                className="h-2 rounded-full bg-accent"
                style={{
                  width: `${item.weight * 100}%`,
                  opacity: 0.35 + 0.65 * (item.weight / maxWeight),
                }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-sm text-text-primary">
              {formatPercent(item.weight, 1)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
