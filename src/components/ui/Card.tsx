import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = "p-6",
}: {
  children: ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface ${padding} transition-[border-color,box-shadow] duration-150 ease-out hover:border-border-strong hover:shadow-[0_0_32px_var(--accent-glow)] ${className}`}
    >
      {children}
    </div>
  );
}
