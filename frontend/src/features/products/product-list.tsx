"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Download, MoreHorizontal, Pencil, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, SortableHeader, type Columns } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SimpleSelect } from "@/components/shared/simple-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { useArchiveProduct, useCategories, useProducts } from "@/lib/api/queries";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatNumber, stockStatus } from "@/lib/format";
import type { Product, StockStatus } from "@/types";
import { AdjustStockDialog } from "@/features/inventory/adjust-stock-dialog";

type Row = Product & { categoryName: string; stockState: StockStatus };

export function ProductList() {
  const router = useRouter();
  const { data: products, isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const archive = useArchiveProduct();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [adjusting, setAdjusting] = useState<string | null>(null);

  const rows = useMemo<Row[] | undefined>(() => {
    if (!products) return undefined;
    const catName = new Map(categories.map((c) => [c.id, c.name]));
    return products
      .map((p) => ({ ...p, categoryName: catName.get(p.categoryId) ?? "—", stockState: stockStatus(p) }))
      .filter((p) => category === "all" || p.categoryId === category)
      .filter((p) => {
        if (status === "all") return p.status === "active";
        if (status === "archived") return p.status === "archived";
        return p.status === "active" && p.stockState === status;
      });
  }, [products, categories, category, status]);

  const columns = useMemo<Columns<Row>>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} title="Product" />,
        cell: ({ row }) => (
          <div className="flex min-w-48 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-semibold text-muted-foreground">
              {row.original.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.sku}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "sku", header: "SKU", meta: { className: "hidden" } },
      {
        accessorKey: "categoryName",
        header: ({ column }) => <SortableHeader column={column} title="Category" />,
        meta: { className: "hidden md:table-cell" },
      },
      {
        accessorKey: "stock",
        header: ({ column }) => <SortableHeader column={column} title="On hand" />,
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="font-medium tabular">
              {formatNumber(row.original.stock)} <span className="text-xs font-normal text-muted-foreground">{row.original.unit}</span>
            </span>
            <StatusBadge status={row.original.stockState} />
          </div>
        ),
      },
      {
        accessorKey: "costPrice",
        header: ({ column }) => <SortableHeader column={column} title="Cost" />,
        cell: ({ getValue }) => <span className="tabular">{formatCurrency(getValue() as number)}</span>,
        meta: { className: "hidden lg:table-cell" },
      },
      {
        accessorKey: "sellPrice",
        header: ({ column }) => <SortableHeader column={column} title="Price" />,
        cell: ({ getValue }) => <span className="font-medium tabular">{formatCurrency(getValue() as number)}</span>,
        meta: { className: "hidden sm:table-cell" },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        meta: { className: "w-10 text-right" },
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Product actions" />}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push(`/products/${row.original.id}/edit`)}>
                  <Pencil className="size-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAdjusting(row.original.id)}>
                  <SlidersHorizontal className="size-4" /> Adjust stock
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    archive.mutate(row.original.id, {
                      onSuccess: () =>
                        toast.success(row.original.status === "archived" ? "Product restored" : "Product archived"),
                    })
                  }
                >
                  <Archive className="size-4" /> {row.original.status === "archived" ? "Restore" : "Archive"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [archive, router],
  );

  const exportCsv = () =>
    downloadCsv(
      "products.csv",
      (rows ?? []).map((p) => ({
        SKU: p.sku,
        Name: p.name,
        Category: p.categoryName,
        Unit: p.unit,
        "On hand": p.stock,
        "Reorder point": p.reorderPoint,
        Cost: p.costPrice,
        Price: p.sellPrice,
        Status: p.status,
      })),
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Your catalog — every SKU you buy, store and sell."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv} disabled={!rows?.length}>
              <Download /> Export
            </Button>
            <Link href="/products/new" className={buttonVariants()}>
              <Plus /> Add product
            </Link>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search by name or SKU…"
        onRowClick={(p) => router.push(`/products/${p.id}`)}
        emptyTitle="No products found"
        toolbar={
          <>
            <SimpleSelect
              value={category}
              onValueChange={setCategory}
              className="w-full sm:w-44"
              options={[{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            />
            <SimpleSelect
              value={status}
              onValueChange={setStatus}
              className="w-full sm:w-40"
              options={[
                { value: "all", label: "All active" },
                { value: "in_stock", label: "In stock" },
                { value: "low_stock", label: "Low stock" },
                { value: "out_of_stock", label: "Out of stock" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </>
        }
      />
      <AdjustStockDialog
        open={adjusting !== null}
        onOpenChange={(o) => !o && setAdjusting(null)}
        productId={adjusting ?? undefined}
      />
    </div>
  );
}
