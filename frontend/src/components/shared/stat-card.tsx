import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  hint,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /** Percent change vs. previous period. Positive is shown as good. */
  change?: number;
  hint?: string;
  loading?: boolean;
}) {
  const up = (change ?? 0) >= 0;
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon ? (
            <div className="flex size-8 items-center justify-center rounded-md bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
          ) : null}
        </div>
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {change !== undefined && !loading ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                up ? "text-[#006300] dark:text-success" : "text-critical",
              )}
            >
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(change).toFixed(1)}%
            </span>
          ) : null}
          {hint ? <span>{hint}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
