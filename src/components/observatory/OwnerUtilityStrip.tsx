import Link from "next/link";
import { formatCurrency, formatSignedPercent } from "@/lib/format";
import styles from "./owner-utility-strip.module.css";

export type OwnerUtilityStripProps = {
  totalValue: number;
  totalCost: number;
  simpleReturnPct: number;
};

const OWNER_ACTIONS = [
  { href: "/dashboard", label: "Open the full dashboard" },
  { href: "/trades", label: "Record a trade" },
  { href: "/research", label: "Research" },
  { href: "/history", label: "History" },
] as const;

export function OwnerUtilityStrip({
  totalValue,
  totalCost,
  simpleReturnPct,
}: OwnerUtilityStripProps) {
  return (
    <section className={styles.strip} aria-label="Owner utilities">
      <dl className={styles.stats}>
        <div>
          <dt>Total value</dt>
          <dd>{formatCurrency(totalValue)}</dd>
        </div>
        <div>
          <dt>Total cost</dt>
          <dd>{formatCurrency(totalCost)}</dd>
        </div>
        <div>
          <dt>Simple return</dt>
          <dd>{formatSignedPercent(simpleReturnPct, 1)}</dd>
        </div>
      </dl>

      <nav className={styles.actions} aria-label="Private portfolio actions">
        {OWNER_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            {action.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
