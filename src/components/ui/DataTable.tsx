import type { ReactNode } from "react";

export function DataTable({ children, minWidth = "480px" }: { children: ReactNode; minWidth?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DataTableRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-border last:border-0 hover:bg-surface-hover">{children}</tr>;
}

export function Th({
  children,
  numeric = false,
  sticky = false,
}: {
  children: ReactNode;
  numeric?: boolean;
  sticky?: boolean;
}) {
  return (
    <th
      className={`px-3 py-2 font-medium ${numeric ? "text-right" : "text-left"} ${
        sticky ? "sticky left-0 bg-surface" : ""
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  numeric = false,
  sticky = false,
}: {
  children: ReactNode;
  numeric?: boolean;
  sticky?: boolean;
}) {
  return (
    <td
      className={`px-3 py-2 ${numeric ? "text-right font-mono tabular-nums" : ""} ${
        sticky ? "sticky left-0 bg-surface" : ""
      }`}
    >
      {children}
    </td>
  );
}
