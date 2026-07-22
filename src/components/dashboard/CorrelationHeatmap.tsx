"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/format";

function cellBackground(value: number): string {
  if (value >= 0) {
    return `color-mix(in srgb, var(--accent) ${Math.round(Math.min(value, 1) * 55)}%, var(--surface))`;
  }
  return `color-mix(in srgb, var(--loss) ${Math.round(Math.min(-value, 1) * 55)}%, var(--surface))`;
}

export function CorrelationHeatmap({
  tickers,
  matrix,
}: {
  tickers: string[];
  matrix: (number | null)[][];
}) {
  const [hovered, setHovered] = useState<{ i: number; j: number } | null>(null);

  if (tickers.length === 0) return null;

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Correlation
      </h2>
      <div className="mt-3 overflow-x-auto">
        <table className="border-separate" style={{ borderSpacing: 3 }}>
          <tbody>
            {tickers.map((rowTicker, i) => (
              <tr key={rowTicker}>
                <td className="pr-2 text-right font-mono text-xs text-text-secondary">{rowTicker}</td>
                {tickers.slice(0, i + 1).map((colTicker, j) => {
                  const value = matrix[i][j];
                  const isHovered = hovered?.i === i && hovered?.j === j;
                  return (
                    <td
                      key={colTicker}
                      className="relative h-8 w-8 rounded-md text-center align-middle font-mono text-[10px]"
                      style={{ background: value !== null ? cellBackground(value) : "var(--surface)" }}
                      onMouseEnter={() => setHovered({ i, j })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {value !== null ? (
                        <span className="text-text-primary">{formatNumber(value, 2)}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                      {isHovered && value !== null && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border-strong bg-surface px-2 py-1 text-xs text-text-primary shadow-lg">
                          {rowTicker} × {colTicker}: {formatNumber(value, 3)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td />
              {tickers.map((colTicker) => (
                <td key={colTicker} className="pt-1 text-center font-mono text-[10px] text-text-muted">
                  {colTicker}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
