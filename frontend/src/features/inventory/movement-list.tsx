"use client";

import { useMemo, useState } from "react";
import { DataTable, SortableHeader, type Columns } from "@/components/shared/data-table";
import { SimpleSelect } from "@/components/shared/simple-select";
import { useLookups, useMovements } from "@/lib/api/queries";
import { formatDateTime, titleCase } from "@/lib/format";
import { MovementQuantity } from "./movement-quantity";

type Row = {
  id: string;
  createdAt: string;
  type: string;
  product: string;
  sku: string;
  warehouse: string;
  reference: string;
  user: string;
  quantity: number;
};

const types = ["purchase", "sale", "adjustment", "transfer_in", "transfer_out", "return"];

export function MovementList() {
  const { data, isLoading } = useMovements();
  const lookups = useLookups();
  const [type, setType] = useState("all");
  const [warehouse, setWarehouse] = useState("all");

  const rows = useMemo<Row[] | undefined>(
    () =>
      data
        ?.filter((m) => (type === "all" || m.type === type) && (warehouse === "all" || m.warehouseId === warehouse))
        .map((m) => ({
          id: m.id,
          createdAt: m.createdAt,
          type: titleCase(m.type),
          product: lookups.product.get(m.productId)?.name ?? "—",
          sku: lookups.product.get(m.productId)?.sku ?? "",
          warehouse: lookups.warehouse.get(m.warehouseId)?.name ?? "—",
          reference: m.reference ?? "—",
          user: m.user,
          quantity: m.quantity,
        })),
    [data, lookups, type, warehouse],
  );

  const columns = useMemo<Columns<Row>>(
    () => [
      {
        accessorKey: "createdAt",
        header: ({ column }) => <SortableHeader column={column} title="Date" />,
        cell: ({ getValue }) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(getValue() as string)}</span>,
      },
      { accessorKey: "type", header: "Type" },
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
      { accessorKey: "sku", header: "SKU", meta: { className: "hidden" } },
      { accessorKey: "warehouse", header: "Warehouse", meta: { className: "hidden lg:table-cell" } },
      { accessorKey: "reference", header: "Reference", meta: { className: "hidden md:table-cell" }, cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      { accessorKey: "user", header: "By", meta: { className: "hidden xl:table-cell" } },
      { accessorKey: "quantity", header: () => <div className="text-right">Change</div>, meta: { className: "text-right" }, cell: ({ getValue }) => <MovementQuantity value={getValue() as number} /> },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      pageSize={15}
      searchPlaceholder="Search product, SKU or reference…"
      toolbar={
        <>
          <SimpleSelect
            value={type}
            onValueChange={setType}
            className="w-full sm:w-40"
            options={[{ value: "all", label: "All types" }, ...types.map((t) => ({ value: t, label: titleCase(t) }))]}
          />
          <SimpleSelect
            value={warehouse}
            onValueChange={setWarehouse}
            className="w-full sm:w-48"
            options={[
              { value: "all", label: "All warehouses" },
              ...[...lookups.warehouse.values()].map((w) => ({ value: w.id, label: w.name })),
            ]}
          />
        </>
      }
    />
  );
}
