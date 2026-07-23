import Link from "next/link";
import { FlaskConical, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

/** FlipCard-sized entry point into /compare — dashboard only, never on any share surface (PHASE9.md §5). */
export function CompareEntryPoint() {
  return (
    <Link href="/compare" className="block min-h-[44px]">
      <Card className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <FlaskConical className="h-4 w-4 text-accent" aria-hidden />
          vs. three simulated portfolios
        </span>
        <ArrowRight className="h-4 w-4 text-text-secondary" aria-hidden />
      </Card>
    </Link>
  );
}
