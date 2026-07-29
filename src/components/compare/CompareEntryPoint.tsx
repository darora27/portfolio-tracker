import Link from "next/link";
import { FlaskConical, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

/** Owner-only entry into Mission Control's carried DRAFT test rig. */
export function CompareEntryPoint() {
  return (
    <Link href="/?focus=portfolio&camera=command&draft=open" className="block min-h-[44px]">
      <Card className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <FlaskConical className="h-4 w-4 text-accent" aria-hidden />
          open the DRAFT allocation rig
        </span>
        <ArrowRight className="h-4 w-4 text-text-secondary" aria-hidden />
      </Card>
    </Link>
  );
}
