"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { DollarSign, Download, Percent, ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, SortableHeader, type Columns } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ValueByCategoryChart } from "@/features/dashboard/charts";
import { useReports } from "@/lib/api/queries";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatCurrencyCompact, formatNumber, stockStatus } from "@/lib/format";
import type { Product } from "@/types";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  grossProfit: number;
  margin: number;
  stock: number;
  stockValue: number;
  cover: number;
  product: Product;
};

const profitConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  profit: { label: "Gross profit", color: "var(--chart-2)" },
} satisfies ChartConfig;

const ordersConfig = { orders: { label: "Orders", color: "var(--chart-1)" } } satisfies ChartConfig;

export function ReportsView() {
  const { data, isLoading } = useReports();
  const [tab, setTab] = useState("sales");

  const rows = useMemo<ProductRow[] | undefined>(
    () =>
      data?.productRows.map((r) => ({
        id: r.product.id,
        name: r.product.name,
        sku: r.product.sku,
        unitsSold: r.unitsSold,
        revenue: r.revenue,
        grossProfit: r.grossProfit,
        margin: r.margin,
        stock: r.product.stock,
        stockValue: r.stockValue,
        cover: r.cover,
        product: r.product,
      })),
    [data],
  );

  const totals = useMemo(() => {
    const m = data?.monthly ?? [];
    const revenue = m.reduce((s, x) => s + x.revenue, 0);
    const profit = m.reduce((s, x) => s + x.profit, 0);
    const orders = m.reduce((s, x) => s + x.orders, 0);
    return { revenue, profit, orders, margin: revenue ? (profit / revenue) * 100 : 0, aov: orders ? revenue / orders : 0 };
  }, [data]);

  const slowMovers = useMemo(
    () => rows?.filter((r) => r.stock > 0 && (r.cover === Infinity || r.cover > 6)).sort((a, b) => b.stockValue - a.stockValue),
    [rows],
  );

  const productColumns = useMemo<Columns<ProductRow>>(
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
      { accessorKey: "unitsSold", header: ({ column }) => <SortableHeader column={column} title="Units sold" />, cell: ({ getValue }) => <span className="tabular">{formatNumber(getValue() as number)}</span> },
      { accessorKey: "revenue", header: ({ column }) => <SortableHeader column={column} title="Revenue" />, cell: ({ getValue }) => <span className="font-medium tabular">{formatCurrency(getValue() as number)}</span> },
      { accessorKey: "grossProfit", header: ({ column }) => <SortableHeader column={column} title="Gross profit" />, cell: ({ getValue }) => <span className="tabular">{formatCurrency(getValue() as number)}</span>, meta: { className: "hidden md:table-cell" } },
      { accessorKey: "margin", header: ({ column }) => <SortableHeader column={column} title="Margin" />, cell: ({ getValue }) => <span className="tabular">{(getValue() as number).toFixed(1)}%</span>, meta: { className: "hidden sm:table-cell" } },
    ],
    [],
  );

  const slowColumns = useMemo<Columns<ProductRow>>(
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
      { accessorKey: "stock", header: ({ column }) => <SortableHeader column={column} title="On hand" />, cell: ({ getValue }) => <span className="tabular">{formatNumber(getValue() as number)}</span> },
      { accessorKey: "unitsSold", header: "Sold (12 mo)", cell: ({ getValue }) => <span className="tabular">{formatNumber(getValue() as number)}</span>, meta: { className: "hidden sm:table-cell" } },
      {
        accessorKey: "cover",
        header: "Months of cover",
        cell: ({ getValue }) => {
          const v = getValue() as number;
          return v === Infinity ? <span className="text-muted-foreground">No sales</span> : <span className="tabular">{v.toFixed(1)}</span>;
        },
      },
      { accessorKey: "stockValue", header: ({ column }) => <SortableHeader column={column} title="Tied-up value" />, cell: ({ getValue }) => <span className="font-medium tabular">{formatCurrency(getValue() as number)}</span> },
    ],
    [],
  );

  const exportCurrent = () => {
    if (!rows) return;
    if (tab === "inventory") {
      downloadCsv("slow-moving-stock.csv", (slowMovers ?? []).map((r) => ({ SKU: r.sku, Product: r.name, "On hand": r.stock, "Sold 12mo": r.unitsSold, "Months of cover": r.cover === Infinity ? "no sales" : r.cover.toFixed(1), Value: r.stockValue.toFixed(2) })));
    } else {
      downloadCsv("product-performance.csv", rows.map((r) => ({ SKU: r.sku, Product: r.name, "Units sold": r.unitsSold, Revenue: r.revenue.toFixed(2), "Gross profit": r.grossProfit.toFixed(2), "Margin %": r.margin.toFixed(1), Status: stockStatus(r.product) })));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Sales performance and inventory health over the last 12 months."
        actions={
          <Button variant="outline" onClick={exportCurrent} disabled={!rows}>
            <Download /> Export CSV
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue (12 mo)" icon={DollarSign} loading={isLoading} value={formatCurrency(totals.revenue)} hint="Excludes tax" />
            <StatCard label="Gross profit" icon={TrendingUp} loading={isLoading} value={formatCurrency(totals.profit)} hint="Revenue minus cost of goods" />
            <StatCard label="Gross margin" icon={Percent} loading={isLoading} value={`${totals.margin.toFixed(1)}%`} />
            <StatCard label="Avg. order value" icon={ShoppingCart} loading={isLoading} value={formatCurrency(totals.aov)} hint={`${formatNumber(totals.orders)} orders`} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue and gross profit</CardTitle>
                <CardDescription>Monthly, excluding tax</CardDescription>
              </CardHeader>
              <CardContent>
                {!data ? (
                  <Skeleton className="h-72" />
                ) : (
                  <ChartContainer config={profitConfig} className="aspect-auto h-72 w-full">
                    <LineChart data={data.monthly} margin={{ left: 4, right: 12, top: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
                      <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => formatCurrencyCompact(v)} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            indicator="line"
                            formatter={(value, name) => (
                              <div className="flex w-full items-center justify-between gap-4">
                                <span className="text-muted-foreground">{profitConfig[name as keyof typeof profitConfig]?.label}</span>
                                <span className="font-medium tabular">{formatCurrency(Number(value))}</span>
                              </div>
                            )}
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Line dataKey="profit" type="monotone" stroke="var(--color-profit)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Orders per month</CardTitle>
                <CardDescription>Confirmed sales orders</CardDescription>
              </CardHeader>
              <CardContent>
                {!data ? (
                  <Skeleton className="h-72" />
                ) : (
                  <ChartContainer config={ordersConfig} className="aspect-auto h-72 w-full">
                    <BarChart data={data.monthly} margin={{ left: -16, right: 4, top: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" minTickGap={20} />
                      <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
                      <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product performance</CardTitle>
              <CardDescription>Ranked by revenue over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={productColumns}
                data={rows}
                isLoading={isLoading}
                searchPlaceholder="Search products…"
                initialSorting={[{ id: "revenue", desc: true }]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock value by warehouse</CardTitle>
              <CardDescription>On-hand quantity × cost price</CardDescription>
            </CardHeader>
            <CardContent>
              {!data ? <Skeleton className="h-40" /> : <ValueByCategoryChart data={data.valueByWarehouse} labelKey="warehouse" />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Slow-moving stock</CardTitle>
              <CardDescription>More than 6 months of cover at the current sell rate, or no sales at all</CardDescription>
              <CardAction>
                <span className="text-sm text-muted-foreground tabular">
                  {formatCurrency((slowMovers ?? []).reduce((s, r) => s + r.stockValue, 0))} tied up
                </span>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DataTable columns={slowColumns} data={slowMovers} isLoading={isLoading} hideSearch emptyTitle="No slow movers" emptyDescription="Everything is selling through at a healthy pace." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
