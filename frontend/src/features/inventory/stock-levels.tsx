"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, SortableHeader, type Columns } from "@/components/shared/data-table";
import { SimpleSelect } from "@/components/shared/simple-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLookups, useProducts, useStockLevels } from "@/lib/api/queries";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatNumber, stockStatus } from "@/lib/format";
import type { StockStatus } from "@/types";
import { AdjustStockDialog } from "./adjust-stock-dialog";

type Row = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  quantity: number;
  reorderPoint: number;
  value: number;
  status: StockStatus;
};

export function StockLevels() {
  const router = useRouter();
  const { data: products, isLoading } = useProducts();
  const { data: levels, isLoading: levelsLoading } = useStockLevels();
  const lookups = useLookups();
  const [warehouse, setWarehouse] = useState("all");
  const [status, setStatus] = useState("all");
  const [adjusting, setAdjusting] = useState<string | null>(null);

  const rows = useMemo<Row[] | undefined>(() => {
    if (!products || !levels) return undefined;
    return products
      .filter((p) => p.status === "active")
      .map((p) => {
        const quantity =
          warehouse === "all"
            ? p.stock
            : levels.find((l) => l.productId === p.id && l.warehouseId === warehouse)?.quantity ?? 0;
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: lookups.category.get(p.categoryId)?.name ?? "—",
          unit: p.unit,
          quantity,
          reorderPoint: p.reorderPoint,
          value: quantity * p.costPrice,
          status: stockStatus(p),
        };
      })
      .filter((r) => status === "all" || r.status === status);
  }, [products, levels, warehouse, status, lookups.category]);

  const columns = useMemo<Columns<Row>>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} title="Product" />,
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.sku}</p>
          </div>
        ),
      },
      { accessorKey: "sku", header: "SKU", meta: { className: "hidden" } },
      { accessorKey: "category", header: "Category", meta: { className: "hidden lg:table-cell" } },
      {
        accessorKey: "quantity",
        header: ({ column }) => <SortableHeader column={column} title={warehouse === "all" ? "On hand (all)" : "On hand"} />,
        cell: ({ row }) => (
          <span className="font-medium tabular">
            {formatNumber(row.original.quantity)} <span className="text-xs font-normal text-muted-foreground">{row.original.unit}</span>
          </span>
        ),
      },
      {
        accessorKey: "reorderPoint",
        header: ({ column }) => <SortableHeader column={column} title="Reorder point" />,
        cell: ({ getValue }) => <span className="text-muted-foreground tabular">{formatNumber(getValue() as number)}</span>,
        meta: { className: "hidden md:table-cell" },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
        meta: { className: "hidden sm:table-cell" },
      },
      {
        accessorKey: "value",
        header: ({ column }) => <SortableHeader column={column} title="Value" />,
        cell: ({ getValue }) => <span className="tabular">{formatCurrency(getValue() as number)}</span>,
        meta: { className: "hidden md:table-cell" },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        meta: { className: "w-10 text-right" },
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Adjust stock for ${row.original.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setAdjusting(row.original.id);
            }}
          >
            <SlidersHorizontal />
          </Button>
        ),
      },
    ],
    [warehouse],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading || levelsLoading}
        searchPlaceholder="Search products…"
        onRowClick={(r) => router.push(`/products/${r.id}`)}
        initialSorting={[{ id: "quantity", desc: false }]}
        toolbar={
          <>
            <SimpleSelect
              value={warehouse}
              onValueChange={setWarehouse}
              className="w-full sm:w-48"
              options={[
                { value: "all", label: "All warehouses" },
                ...[...lookups.warehouse.values()].map((w) => ({ value: w.id, label: w.name })),
              ]}
            />
            <SimpleSelect
              value={status}
              onValueChange={setStatus}
              className="w-full sm:w-40"
              options={[
                { value: "all", label: "Any status" },
                { value: "in_stock", label: "In stock" },
                { value: "low_stock", label: "Low stock" },
                { value: "out_of_stock", label: "Out of stock" },
              ]}
            />
            <Button
              variant="outline"
              disabled={!rows?.length}
              onClick={() =>
                downloadCsv(
                  "stock-levels.csv",
                  (rows ?? []).map((r) => ({ SKU: r.sku, Product: r.name, Category: r.category, "On hand": r.quantity, "Reorder point": r.reorderPoint, Value: r.value.toFixed(2), Status: r.status })),
                )
              }
            >
              <Download /> Export
            </Button>
          </>
        }
      />
      <AdjustStockDialog open={adjusting !== null} onOpenChange={(o) => !o && setAdjusting(null)} productId={adjusting ?? undefined} />
    </>
  );
}
