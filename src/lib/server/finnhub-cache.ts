// Renamed to api-cache.ts in Phase 9 §4 (the cache module now serves more
// than Finnhub — general market news, insider transactions, Reddit). This
// re-export keeps the old import path working so nothing else has to
// change, including the existing test file at ./finnhub-cache.test.ts.
export * from "./api-cache";
