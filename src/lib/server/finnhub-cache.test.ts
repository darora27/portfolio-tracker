import { beforeEach, describe, expect, it, vi } from "vitest";
import { _resetFinnhubCacheForTests, getOrFetch } from "./finnhub-cache";

describe("getOrFetch", () => {
  beforeEach(() => {
    _resetFinnhubCacheForTests();
  });

  it("calls fn on a cold key and caches the result", async () => {
    const fn = vi.fn().mockResolvedValue("value-1");
    expect(await getOrFetch("k", 10_000, fn)).toBe("value-1");
    expect(await getOrFetch("k", 10_000, fn)).toBe("value-1");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("refetches once the TTL has elapsed", async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce("v2");
    expect(await getOrFetch("k", 1_000, fn)).toBe("v1");
    vi.advanceTimersByTime(1_001);
    expect(await getOrFetch("k", 1_000, fn)).toBe("v2");
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("falls back to the stale cached value when fn throws", async () => {
    const fn = vi.fn().mockResolvedValueOnce("v1").mockRejectedValueOnce(new Error("boom"));
    vi.useFakeTimers();
    expect(await getOrFetch("k", 1, fn)).toBe("v1");
    vi.advanceTimersByTime(2);
    expect(await getOrFetch("k", 1, fn)).toBe("v1");
    vi.useRealTimers();
  });

  it("falls back to null when fn throws and nothing was ever cached", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("boom"));
    expect(await getOrFetch("k", 1_000, fn)).toBeNull();
  });

  it("falls back to the stale cached value when fn resolves null", async () => {
    const fn = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce(null);
    vi.useFakeTimers();
    expect(await getOrFetch("k", 1, fn)).toBe("v1");
    vi.advanceTimersByTime(2);
    expect(await getOrFetch("k", 1, fn)).toBe("v1");
    vi.useRealTimers();
  });

  it("stops calling fn once the call budget (50/min) is exhausted, falling back to cache", async () => {
    const fn = vi.fn().mockImplementation((n: number) => Promise.resolve(`v${n}`));
    for (let i = 0; i < 50; i++) {
      await getOrFetch(`key-${i}`, 0, () => fn(i));
    }
    expect(fn).toHaveBeenCalledTimes(50);

    // 51st distinct key within the same window: budget exhausted, no cached
    // value for this brand-new key, so null rather than a 51st network call.
    const overBudgetFn = vi.fn().mockResolvedValue("should-not-be-called");
    expect(await getOrFetch("key-new", 10_000, overBudgetFn)).toBeNull();
    expect(overBudgetFn).not.toHaveBeenCalled();
  });
});
