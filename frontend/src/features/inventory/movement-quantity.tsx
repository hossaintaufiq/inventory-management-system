import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

/** Signed stock change: "+12" / "−4", with sign as text (not color alone). */
export function MovementQuantity({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-medium tabular",
        value > 0 ? "text-[#006300] dark:text-success" : value < 0 ? "text-critical" : "text-muted-foreground",
      )}
    >
      {value > 0 ? "+" : value < 0 ? "−" : ""}
      {formatNumber(Math.abs(value))}
    </span>
  );
}
