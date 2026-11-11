"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency, formatCurrencyCompact, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const trendConfig = {
  sales: { label: "Sales", color: "var(--chart-1)" },
  purchases: { label: "Purchases", color: "var(--chart-2)" },
} satisfies ChartConfig;

/** Sales vs purchases — same unit (currency), so one shared y-axis. */
export function SalesPurchasesChart({
  data,
}: {
  data: { month: string; sales: number; purchases: number }[];
}) {
  return (
    <ChartContainer config={trendConfig} className="aspect-auto h-72 w-full">
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="0" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => formatCurrencyCompact(v)}
        />
        <ChartTooltip
          cursor={{ strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              indicator="line"
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">{trendConfig[name as keyof typeof trendConfig]?.label}</span>
                  <span className="font-medium tabular">{formatCurrency(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line dataKey="sales" type="monotone" stroke="var(--color-sales)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
        <Line dataKey="purchases" type="monotone" stroke="var(--color-purchases)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
      </LineChart>
    </ChartContainer>
  );
}

const valueConfig = { value: { label: "Stock value", color: "var(--chart-1)" } } satisfies ChartConfig;

/** Ranked horizontal bars — one series, one color. */
export function ValueByCategoryChart({
  data,
  labelKey = "category",
}: {
  data: Record<string, string | number>[];
  labelKey?: string;
}) {
  return (
    <ChartContainer config={valueConfig} className="aspect-auto w-full" style={{ height: Math.max(160, data.length * 34) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }} barCategoryGap={6}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v: number) => formatCurrencyCompact(v)} />
        <YAxis
          type="category"
          dataKey={labelKey}
          tickLine={false}
          axisLine={false}
          width={118}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(value) => <span className="font-medium tabular">{formatCurrency(Number(value))}</span>}
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

const statusRows = [
  { key: "in_stock", label: "In stock", icon: CheckCircle2, bar: "bg-success", text: "text-success" },
  { key: "low_stock", label: "Low stock", icon: AlertTriangle, bar: "bg-warning", text: "text-warning" },
  { key: "out_of_stock", label: "Out of stock", icon: XCircle, bar: "bg-critical", text: "text-critical" },
] as const;

/** Part-to-whole as a segmented bar; status color is always paired with icon + label. */
export function StockHealth({ health }: { health: Record<"in_stock" | "low_stock" | "out_of_stock", number> }) {
  const total = health.in_stock + health.low_stock + health.out_of_stock || 1;
  return (
    <div className="space-y-5">
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Stock health breakdown">
        {statusRows.map((s) =>
          health[s.key] > 0 ? (
            <div
              key={s.key}
              className={cn("h-full first:rounded-l-full last:rounded-r-full", s.bar)}
              style={{ width: `${(health[s.key] / total) * 100}%` }}
              title={`${s.label}: ${health[s.key]}`}
            />
          ) : null,
        )}
      </div>
      <ul className="space-y-3">
        {statusRows.map((s) => (
          <li key={s.key} className="flex items-center gap-3 text-sm">
            <s.icon className={cn("size-4", s.text)} aria-hidden />
            <span className="flex-1">{s.label}</span>
            <span className="font-medium tabular">{formatNumber(health[s.key])}</span>
            <span className="w-12 text-right text-muted-foreground tabular">
              {Math.round((health[s.key] / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
