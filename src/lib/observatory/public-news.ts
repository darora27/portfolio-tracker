import type { NewsItem } from "@/lib/finnhub-news";

export type PublicNewsItem = {
  headline: string;
  source: string;
  url: string;
  datetime: number;
  ticker: string;
};

type NewsByTicker =
  | Readonly<Record<string, readonly NewsItem[]>>
  | ReadonlyMap<string, readonly NewsItem[]>;

function entriesForTicker(
  newsByTicker: NewsByTicker,
  ticker: string,
): readonly NewsItem[] {
  if (newsByTicker instanceof Map) {
    return (newsByTicker as ReadonlyMap<string, readonly NewsItem[]>).get(ticker) ?? [];
  }
  return (newsByTicker as Readonly<Record<string, readonly NewsItem[]>>)[ticker] ?? [];
}

export function groupNewsByTicker(
  newsByTicker: NewsByTicker,
  heldTickers: readonly string[],
  now: Date | number = new Date(),
): Record<string, PublicNewsItem[]> {
  const nowSeconds =
    typeof now === "number"
      ? now > 10_000_000_000
        ? Math.floor(now / 1000)
        : Math.floor(now)
      : Math.floor(now.getTime() / 1000);
  const earliest = nowSeconds - 7 * 24 * 60 * 60;
  return Object.fromEntries(
    [...new Set(heldTickers.map((ticker) => ticker.toUpperCase()))].map(
      (ticker) => [
        ticker,
        entriesForTicker(newsByTicker, ticker)
          .filter(
            (item) =>
              Number.isFinite(item.datetime) &&
              item.datetime >= earliest &&
              item.datetime <= nowSeconds,
          )
          .sort((left, right) => right.datetime - left.datetime)
          .slice(0, 3)
          .map((item) => ({
            headline: item.headline,
            source: item.source,
            url: item.url,
            datetime: item.datetime,
            ticker,
          })),
      ],
    ),
  );
}
