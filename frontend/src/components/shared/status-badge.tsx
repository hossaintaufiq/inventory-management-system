import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "critical" | "progress";

const toneClass: Record<Tone, { dot: string; badge: string }> = {
  neutral: { dot: "bg-muted-foreground/60", badge: "text-muted-foreground" },
  info: { dot: "bg-chart-1", badge: "text-foreground" },
  progress: { dot: "bg-chart-5", badge: "text-foreground" },
  success: { dot: "bg-success", badge: "text-foreground" },
  warning: { dot: "bg-warning", badge: "text-foreground" },
  critical: { dot: "bg-critical", badge: "text-foreground" },
};

const statusMap: Record<string, { label: string; tone: Tone }> = {
  // Stock
  in_stock: { label: "In stock", tone: "success" },
  low_stock: { label: "Low stock", tone: "warning" },
  out_of_stock: { label: "Out of stock", tone: "critical" },
  // Product
  active: { label: "Active", tone: "success" },
  archived: { label: "Archived", tone: "neutral" },
  // Orders
  draft: { label: "Draft", tone: "neutral" },
  ordered: { label: "Ordered", tone: "info" },
  partially_received: { label: "Partially received", tone: "progress" },
  received: { label: "Received", tone: "success" },
  confirmed: { label: "Confirmed", tone: "info" },
  packed: { label: "Packed", tone: "progress" },
  shipped: { label: "Shipped", tone: "progress" },
  delivered: { label: "Delivered", tone: "success" },
  cancelled: { label: "Cancelled", tone: "critical" },
  // Transfers
  in_transit: { label: "In transit", tone: "progress" },
  completed: { label: "Completed", tone: "success" },
  // Team
  invited: { label: "Invited", tone: "warning" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = statusMap[status] ?? { label: status, tone: "neutral" as Tone };
  const t = toneClass[s.tone];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border bg-background px-2 text-xs font-medium whitespace-nowrap",
        t.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", t.dot)} aria-hidden />
      {s.label}
    </span>
  );
}
