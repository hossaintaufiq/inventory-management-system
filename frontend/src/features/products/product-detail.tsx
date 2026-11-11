"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Barcode, Pencil, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSkeleton, NotFoundState } from "@/components/shared/detail-states";
import { DataTable, type Columns } from "@/components/shared/data-table";
import { useArchiveProduct, useLookups, useMovements, useProduct, useStockLevels } from "@/lib/api/queries";
import { formatCurrency, formatDateTime, formatNumber, stockStatus, titleCase } from "@/lib/format";
import type { StockMovement } from "@/types";
import { AdjustStockDialog } from "@/features/inventory/adjust-stock-dialog";
import { MovementQuantity } from "@/features/inventory/movement-quantity";

export function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: levels = [] } = useStockLevels();
  const { data: movements } = useMovements();
  const lookups = useLookups();
  const archive = useArchiveProduct();
  const [adjustOpen, setAdjustOpen] = useState(false);

  const byWarehouse = useMemo(
    () =>
      [...lookups.warehouse.values()].map((w) => ({
        warehouse: w,
        quantity: levels.find((l) => l.productId === id && l.warehouseId === w.id)?.quantity ?? 0,
      })),
    [lookups.warehouse, levels, id],
  );

  const history = useMemo(() => movements?.filter((m) => m.productId === id), [movements, id]);

  const historyColumns = useMemo<Columns<StockMovement>>(
    () => [
      { accessorKey: "createdAt", header: "Date", cell: ({ getValue }) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(getValue() as string)}</span> },
      { accessorKey: "type", header: "Type", cell: ({ getValue }) => titleCase(getValue() as string) },
      { id: "warehouse", header: "Warehouse", accessorFn: (m) => lookups.warehouse.get(m.warehouseId)?.name ?? "—", meta: { className: "hidden md:table-cell" } },
      { accessorKey: "reference", header: "Reference", cell: ({ getValue }) => <span className="font-medium">{(getValue() as string) ?? "—"}</span> },
      { accessorKey: "quantity", header: () => <div className="text-right">Change</div>, meta: { className: "text-right" }, cell: ({ getValue }) => <MovementQuantity value={getValue() as number} /> },
    ],
    [lookups.warehouse],
  );

  if (isLoading) return <DetailSkeleton />;
  if (isError || !product) return <NotFoundState what="Product" backHref="/products" />;

  const category = lookups.category.get(product.categoryId);
  const margin = product.sellPrice ? ((product.sellPrice - product.costPrice) / product.sellPrice) * 100 : 0;
  const maxQty = Math.max(1, ...byWarehouse.map((b) => b.quantity));

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-xs">{product.sku}</span>
            <span>·</span>
            <span>{category?.name}</span>
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                archive.mutate(product.id, {
                  onSuccess: () => toast.success(product.status === "archived" ? "Product restored" : "Product archived"),
                })
              }
            >
              <Archive /> {product.status === "archived" ? "Restore" : "Archive"}
            </Button>
            <Button variant="outline" onClick={() => setAdjustOpen(true)}>
              <SlidersHorizontal /> Adjust stock
            </Button>
            <Link href={`/products/${product.id}/edit`} className={buttonVariants()}>
              <Pencil /> Edit
            </Link>
          </>
        }
      >
        <div className="flex gap-2 pt-1">
          <StatusBadge status={product.status} />
          {product.status === "active" ? <StatusBadge status={stockStatus(product)} /> : null}
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="On hand" value={`${formatNumber(product.stock)} ${product.unit}`} hint={`Reorder at ${product.reorderPoint}`} />
        <StatCard label="Stock value" value={formatCurrency(product.stock * product.costPrice)} hint="At cost price" />
        <StatCard label="Selling price" value={formatCurrency(product.sellPrice)} hint={`Cost ${formatCurrency(product.costPrice)}`} />
        <StatCard label="Gross margin" value={`${margin.toFixed(1)}%`} hint={`${formatCurrency(product.sellPrice - product.costPrice)} per unit`} />
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stock by location</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock by warehouse</CardTitle>
              <CardDescription>Where this product is stored right now</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {byWarehouse.map(({ warehouse, quantity }) => (
                  <li key={warehouse.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5">
                    <div>
                      <p className="text-sm font-medium">{warehouse.name}</p>
                      <p className="text-xs text-muted-foreground">{warehouse.city}</p>
                    </div>
                    <p className="text-sm font-medium tabular">
                      {formatNumber(quantity)} <span className="text-xs font-normal text-muted-foreground">{product.unit}</span>
                    </p>
                    <Progress value={(quantity / maxQty) * 100} className="col-span-2" aria-label={`${warehouse.name} share`} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <DataTable
            columns={historyColumns}
            data={history}
            isLoading={!history}
            hideSearch
            emptyTitle="No stock movements yet"
            emptyDescription="Purchases, sales and adjustments for this product will appear here."
          />
        </TabsContent>

        <TabsContent value="details" className="pt-4">
          <Card>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {[
                  ["SKU", product.sku],
                  ["Barcode", product.barcode ?? "—"],
                  ["Category", category?.name ?? "—"],
                  ["Unit", product.unit],
                  ["Reorder point", formatNumber(product.reorderPoint)],
                  ["Created", formatDateTime(product.createdAt)],
                ].map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="flex items-center gap-1.5 text-sm font-medium">
                      {k === "Barcode" && v !== "—" ? <Barcode className="size-4 text-muted-foreground" /> : null}
                      {v}
                    </dd>
                  </div>
                ))}
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Description</dt>
                  <dd className="text-sm">{product.description ?? "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AdjustStockDialog open={adjustOpen} onOpenChange={setAdjustOpen} productId={product.id} />
    </div>
  );
}
