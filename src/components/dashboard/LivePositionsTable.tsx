"use client";

import { useLiveQuotes } from "./LiveQuotesProvider";
import { PositionsTable } from "./PositionsTable";

export function LivePositionsTable() {
  const { positions } = useLiveQuotes();
  return <PositionsTable positions={positions} />;
}
