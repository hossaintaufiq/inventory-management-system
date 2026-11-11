"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, DollarSign, Package, Plus, ShoppingCart, Truck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDashboard, useLookups } from "@/lib/api/queries";
import { formatCurrency, formatDate, formatNumber, stockStatus } from "@/lib/format";
import { SalesPurchasesChart, StockHealth, ValueByCategoryChart } from "./charts";

export function DashboardView() {
  const { data, isLoading } = useDashboard();
  const lookups = useLookups();
  const router = useRouter();
  const k = data?.kpis;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning, Alex"
        description="Here's what's happening across your inventory today."
        actions={
          <>
            <Link href="/purchase-orders/new" className={buttonVariants({ variant: "outline" })}>
              <Truck /> New purchase order
            </Link>
            <Link href="/sales-orders/new" className={buttonVariants()}>
              <Plus /> New sales order
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Inventory value"
          icon={Package}
          loading={isLoading}
          value={k ? formatCurrency(k.inventoryValue) : null}
          hint={k ? `${formatNumber(k.totalUnits)} units on hand` : undefined}
        />
        <StatCard
          label="Revenue · last 30 days"
          icon={DollarSign}
          loading={isLoading}
          value={k ? formatCurrency(k.revenue) : null}
          change={k?.revenueChange}
          hint="vs previous 30 days"
        />
        <StatCard
          label="Sales orders · last 30 days"
          icon={ShoppingCart}
          loading={isLoading}
          value={k ? formatNumber(k.orders) : null}
          change={k?.ordersChange}
          hint="vs previous 30 days"
        />
        <StatCard
          label="Items to reorder"
          icon={AlertTriangle}
          loading={isLoading}
          value={k ? formatNumber(k.lowStock) : null}
          hint={k ? `${k.openPurchaseOrders} purchase orders open` : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales vs purchases</CardTitle>
            <CardDescription>Monthly order value, last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-72 w-full" /> : <SalesPurchasesChart data={data.trend} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock health</CardTitle>
            <CardDescription>Active products by stock status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-40 w-full" /> : <StockHealth health={data.health} />}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Stock value by category</CardTitle>
            <CardDescription>On-hand quantity × cost price</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-64 w-full" /> : <ValueByCategoryChart data={data.valueByCategory} />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Needs reordering</CardTitle>
            <CardDescription>At or below reorder point</CardDescription>
            <CardAction>
              <Link href="/inventory" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View all <ArrowRight />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {isLoading || !data ? (
              <div className="space-y-3 px-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <ul className="divide-y">
                {data.lowStockItems.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.sku} · reorder at {p.reorderPoint}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium tabular">{formatNumber(p.stock)}</p>
                        <StatusBadge status={stockStatus(p)} className="mt-0.5" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sales orders</CardTitle>
          <CardDescription>Latest orders across all channels</CardDescription>
          <CardAction>
            <Link href="/sales-orders" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View all <ArrowRight />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Order</th>
                  <th className="px-4 py-2 font-medium">Customer</th>
                  <th className="hidden px-4 py-2 font-medium sm:table-cell">Date</th>
                  <th className="hidden px-4 py-2 font-medium sm:table-cell">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(data?.recentSales ?? []).map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/sales-orders/${o.id}`)}
                  >
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap">{o.number}</td>
                    <td className="px-4 py-2.5">{lookups.customer.get(o.customerId)?.name ?? "—"}</td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{formatDate(o.createdAt)}</td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium whitespace-nowrap tabular">{formatCurrency(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading ? (
              <div className="space-y-2 px-4 pt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
