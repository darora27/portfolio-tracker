import { describe, expect, it } from "vitest";
import { groupNewsByTicker } from "./public-news";

const NOW = new Date("2026-07-28T12:00:00Z");
const nowSeconds = Math.floor(NOW.getTime() / 1000);

describe("public held-ticker news projection", () => {
  it("caps each held ticker at three trailing-seven-day public fields", () => {
    const grouped = groupNewsByTicker(
      {
        IBM: Array.from({ length: 5 }, (_, index) => ({
          headline: `Headline ${index}`,
          source: "Wire",
          url: `https://example.com/${index}`,
          datetime: nowSeconds - index * 60,
          ticker: "OWNER_CANARY",
          ownerNote: "PRIVATE_NEWS_FIELD",
        })),
        MSFT: [
          {
            headline: "Too old",
            source: "Wire",
            url: "https://example.com/old",
            datetime: nowSeconds - 8 * 24 * 60 * 60,
          },
        ],
        PRIVATE: [
          {
            headline: "Not held",
            source: "Wire",
            url: "https://example.com/private",
            datetime: nowSeconds,
          },
        ],
      },
      ["IBM", "MSFT"],
      NOW,
    );
    expect(grouped.IBM).toHaveLength(3);
    expect(grouped.MSFT).toEqual([]);
    expect(grouped.PRIVATE).toBeUndefined();
    expect(Object.keys(grouped.IBM[0]).sort()).toEqual([
      "datetime",
      "headline",
      "source",
      "ticker",
      "url",
    ]);
    expect(JSON.stringify(grouped)).not.toMatch(
      /PRIVATE_NEWS_FIELD|OWNER_CANARY|ownerNote/,
    );
  });

  it("degrades an empty or unavailable ticker feed to an empty list", () => {
    expect(
      groupNewsByTicker({}, ["IBM"], NOW),
    ).toEqual({ IBM: [] });
  });
});
