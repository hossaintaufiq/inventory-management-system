import type { PurchaseOrderStatus, SalesOrderStatus } from "@/types";

export type OrderKind = "purchase" | "sales";

type Action<S extends string> = { to: S; label: string; primary?: boolean };

export const orderConfig = {
  purchase: {
    title: "Purchase Orders",
    singular: "Purchase order",
    basePath: "/purchase-orders",
    partyLabel: "Supplier",
    partyPath: "/suppliers",
    priceLabel: "Unit cost",
    description: "Buy stock from suppliers and receive it into your warehouses.",
    /** Happy-path steps for the status timeline. */
    steps: ["draft", "ordered", "partially_received", "received"] as PurchaseOrderStatus[],
    filters: [
      { value: "all", label: "All" },
      { value: "draft", label: "Draft" },
      { value: "open", label: "Open", match: ["ordered", "partially_received"] },
      { value: "received", label: "Received" },
      { value: "cancelled", label: "Cancelled" },
    ],
    actions: {
      draft: [{ to: "ordered", label: "Mark as ordered", primary: true }],
      ordered: [
        { to: "partially_received", label: "Partially received" },
        { to: "received", label: "Receive all items", primary: true },
      ],
      partially_received: [{ to: "received", label: "Receive remaining", primary: true }],
      received: [],
      cancelled: [],
    } as Record<PurchaseOrderStatus, Action<PurchaseOrderStatus>[]>,
    cancellable: ["draft", "ordered"] as string[],
  },
  sales: {
    title: "Sales Orders",
    singular: "Sales order",
    basePath: "/sales-orders",
    partyLabel: "Customer",
    partyPath: "/customers",
    priceLabel: "Unit price",
    description: "Sell to customers and fulfil orders from stock.",
    steps: ["draft", "confirmed", "packed", "shipped", "delivered"] as SalesOrderStatus[],
    filters: [
      { value: "all", label: "All" },
      { value: "draft", label: "Draft" },
      { value: "open", label: "To fulfil", match: ["confirmed", "packed"] },
      { value: "shipped", label: "Shipped" },
      { value: "delivered", label: "Delivered" },
      { value: "cancelled", label: "Cancelled" },
    ],
    actions: {
      draft: [{ to: "confirmed", label: "Confirm order", primary: true }],
      confirmed: [{ to: "packed", label: "Mark as packed", primary: true }],
      packed: [{ to: "shipped", label: "Ship order", primary: true }],
      shipped: [{ to: "delivered", label: "Mark as delivered", primary: true }],
      delivered: [],
      cancelled: [],
    } as Record<SalesOrderStatus, Action<SalesOrderStatus>[]>,
    cancellable: ["draft", "confirmed", "packed"] as string[],
  },
} as const;

export type OrderFilter = { value: string; label: string; match?: readonly string[] };

export function matchesFilter(status: string, filter: OrderFilter) {
  if (filter.value === "all") return true;
  return filter.match ? filter.match.includes(status) : status === filter.value;
}
