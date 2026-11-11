"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, SortableHeader, type Columns } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLookups, usePurchaseOrders, useSalesOrders } from "@/lib/api/queries";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { matchesFilter, orderConfig, type OrderFilter, type OrderKind } from "./config";

type Row = {
  id: string;
  number: string;
  party: string;
  warehouse: string;
  createdAt: string;
  expectedAt?: string;
  items: number;
  status: string;
  total: number;
};

export function OrderList({ kind }: { kind: OrderKind }) {
  const cfg = orderConfig[kind];
  const router = useRouter();
  const po = usePurchaseOrders();
  const so = useSalesOrders();
  const query = kind === "purchase" ? po : so;
  const lookups = useLookups();
  const [filter, setFilter] = useState<OrderFilter>(cfg.filters[0]);

  const all = useMemo<Row[] | undefined>(() => {
    if (kind === "purchase") {
      return po.data?.map((o) => ({
        id: o.id,
        number: o.number,
        party: lookups.supplier.get(o.supplierId)?.name ?? "—",
        warehouse: lookups.warehouse.get(o.warehouseId)?.name ?? "—",
        createdAt: o.createdAt,
        expectedAt: o.expectedAt,
        items: o.lines.reduce((s, l) => s + l.quantity, 0),
        status: o.status,
        total: o.total,
      }));
    }
    return so.data?.map((o) => ({
      id: o.id,
      number: o.number,
      party: lookups.customer.get(o.customerId)?.name ?? "—",
      warehouse: lookups.warehouse.get(o.warehouseId)?.name ?? "—",
      createdAt: o.createdAt,
      items: o.lines.reduce((s, l) => s + l.quantity, 0),
      status: o.status,
      total: o.total,
    }));
  }, [kind, po.data, so.data, lookups]);

  const rows = useMemo(() => all?.filter((r) => matchesFilter(r.status, filter)), [all, filter]);
  const counts = useMemo(
    () => Object.fromEntries(cfg.filters.map((f) => [f.value, all?.filter((r) => matchesFilter(r.status, f)).length ?? 0])),
    [all, cfg.filters],
  );

  const columns = useMemo<Columns<Row>>(
    () => [
      {
        accessorKey: "number",
        header: ({ column }) => <SortableHeader column={column} title="Order" />,
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: "party",
        header: ({ column }) => <SortableHeader column={column} title={cfg.partyLabel} />,
        cell: ({ row }) => (
          <div className="min-w-32">
            <p>{row.original.party}</p>
            <p className="text-xs text-muted-foreground md:hidden">{formatDate(row.original.createdAt)}</p>
          </div>
        ),
      },
      { accessorKey: "warehouse", header: "Warehouse", meta: { className: "hidden xl:table-cell" } },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <SortableHeader column={column} title="Date" />,
        cell: ({ getValue }) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(getValue() as string)}</span>,
        meta: { className: "hidden md:table-cell" },
      },
      ...(kind === "purchase"
        ? ([
            {
              accessorKey: "expectedAt",
              header: "Expected",
              cell: ({ getValue }) => <span className="whitespace-nowrap text-muted-foreground">{getValue() ? formatDate(getValue() as string) : "—"}</span>,
              meta: { className: "hidden lg:table-cell" },
            },
          ] as Columns<Row>)
        : []),
      {
        accessorKey: "items",
        header: "Units",
        cell: ({ getValue }) => <span className="tabular">{getValue() as number}</span>,
        meta: { className: "hidden lg:table-cell" },
      },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
      {
        accessorKey: "total",
        header: ({ column }) => <SortableHeader column={column} title="Total" className="ml-auto" />,
        cell: ({ getValue }) => <div className="text-right font-medium tabular">{formatCurrency(getValue() as number)}</div>,
        meta: { className: "text-right" },
      },
    ],
    [cfg.partyLabel, kind],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={cfg.title}
        description={cfg.description}
        actions={
          <>
            <Button
              variant="outline"
              disabled={!rows?.length}
              onClick={() =>
                downloadCsv(
                  `${cfg.basePath.slice(1)}.csv`,
                  (rows ?? []).map((r) => ({ Order: r.number, [cfg.partyLabel]: r.party, Warehouse: r.warehouse, Date: r.createdAt.slice(0, 10), Status: r.status, Units: r.items, Total: r.total })),
                )
              }
            >
              <Download /> Export
            </Button>
            <Link href={`${cfg.basePath}/new`} className={buttonVariants()}>
              <Plus /> New order
            </Link>
          </>
        }
      />

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex min-w-max gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Filter by status">
          {cfg.filters.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter.value === f.value}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground",
                filter.value === f.value && "bg-background font-medium text-foreground shadow-sm",
              )}
            >
              {f.label}
              <span className="rounded-full bg-muted-foreground/10 px-1.5 text-xs tabular">{counts[f.value]}</span>
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={query.isLoading}
        searchPlaceholder={`Search order # or ${cfg.partyLabel.toLowerCase()}…`}
        onRowClick={(r) => router.push(`${cfg.basePath}/${r.id}`)}
        emptyTitle="No orders here yet"
      />
    </div>
  );
}
