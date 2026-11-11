"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, SortableHeader, type Columns } from "@/components/shared/data-table";
import { useAdjustments, useLookups } from "@/lib/api/queries";
import { formatDateTime, titleCase } from "@/lib/format";
import { AdjustStockDialog } from "./adjust-stock-dialog";
import { MovementQuantity } from "./movement-quantity";

type Row = {
  id: string;
  number: string;
  product: string;
  sku: string;
  warehouse: string;
  quantity: number;
  reason: string;
  user: string;
  createdAt: string;
  note?: string;
};

export function AdjustmentList() {
  const { data, isLoading } = useAdjustments();
  const lookups = useLookups();
  const [open, setOpen] = useState(false);

  const rows = useMemo<Row[] | undefined>(
    () =>
      data?.map((a) => ({
        id: a.id,
        number: a.number,
        product: lookups.product.get(a.productId)?.name ?? "—",
        sku: lookups.product.get(a.productId)?.sku ?? "",
        warehouse: lookups.warehouse.get(a.warehouseId)?.name ?? "—",
        quantity: a.quantity,
        reason: titleCase(a.reason),
        user: a.user,
        createdAt: a.createdAt,
        note: a.note,
      })),
    [data, lookups],
  );

  const columns = useMemo<Columns<Row>>(
    () => [
      { accessorKey: "number", header: ({ column }) => <SortableHeader column={column} title="Reference" />, cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      {
        accessorKey: "product",
        header: ({ column }) => <SortableHeader column={column} title="Product" />,
        cell: ({ row }) => (
          <div className="min-w-36">
            <p>{row.original.product}</p>
            <p className="text-xs text-muted-foreground">{row.original.sku}</p>
          </div>
        ),
      },
      { accessorKey: "warehouse", header: "Warehouse", meta: { className: "hidden md:table-cell" } },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <div>
            <p>{row.original.reason}</p>
            {row.original.note ? <p className="text-xs text-muted-foreground">{row.original.note}</p> : null}
          </div>
        ),
        meta: { className: "hidden sm:table-cell" },
      },
      { accessorKey: "user", header: "By", meta: { className: "hidden lg:table-cell" } },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <SortableHeader column={column} title="Date" />,
        cell: ({ getValue }) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(getValue() as string)}</span>,
        meta: { className: "hidden md:table-cell" },
      },
      { accessorKey: "quantity", header: () => <div className="text-right">Change</div>, meta: { className: "text-right" }, cell: ({ getValue }) => <MovementQuantity value={getValue() as number} /> },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search adjustments…"
        toolbar={
          <Button onClick={() => setOpen(true)}>
            <Plus /> New adjustment
          </Button>
        }
      />
      <AdjustStockDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
