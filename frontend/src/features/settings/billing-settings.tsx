"use client";

import { Check, CreditCard, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { useProducts, useTeam, useWarehouses } from "@/lib/api/queries";
import { formatCurrency, formatNumber } from "@/lib/format";
import { plans } from "@/lib/plans";
import { cn } from "@/lib/utils";

const CURRENT = "business";
const invoices = [
  { id: "INV-2026-011", date: "Nov 1, 2026", amount: 99 },
  { id: "INV-2026-010", date: "Oct 1, 2026", amount: 99 },
  { id: "INV-2026-009", date: "Sep 1, 2026", amount: 99 },
  { id: "INV-2026-008", date: "Aug 1, 2026", amount: 29 },
];

export function BillingSettings() {
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: team = [] } = useTeam();

  const usage = [
    { label: "SKUs", used: products.length, limit: 2500 },
    { label: "Locations", used: warehouses.length, limit: 10 },
    { label: "Team seats", used: team.length, limit: 25 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Business plan <Badge variant="secondary">Current</Badge>
          </CardTitle>
          <CardDescription>$99 per month · renews on December 1, 2026</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          {usage.map((u) => (
            <div key={u.label} className="space-y-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{u.label}</span>
                <span className="font-medium tabular">
                  {formatNumber(u.used)} <span className="font-normal text-muted-foreground">/ {formatNumber(u.limit)}</span>
                </span>
              </div>
              <Progress value={(u.used / u.limit) * 100} aria-label={`${u.label} usage`} />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex-wrap items-center justify-between gap-3 border-t pt-4 pb-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-12 items-center justify-center rounded-md border bg-muted">
              <CreditCard className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 08/2028</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => toast.info("Payment methods are managed through the billing provider once the backend is connected.")}>
            Update payment method
          </Button>
        </CardFooter>
      </Card>

      <div>
        <h2 className="mb-3 text-base font-semibold">Plans</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => {
            const current = p.id === CURRENT;
            return (
              <Card key={p.id} className={cn(current && "ring-2 ring-primary")}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {p.name}
                    {p.highlighted ? <Badge>Popular</Badge> : null}
                  </CardTitle>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p>
                    {p.price === null ? (
                      <span className="text-2xl font-semibold">Custom</span>
                    ) : (
                      <>
                        <span className="text-2xl font-semibold">${p.price}</span>
                        <span className="text-sm text-muted-foreground"> / month</span>
                      </>
                    )}
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[p.limits.skus, p.limits.warehouses, p.limits.users, ...p.features].map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={current ? "outline" : p.highlighted ? "default" : "outline"}
                    disabled={current}
                    onClick={() => toast.success(p.price === null ? "Our sales team will be in touch." : `Switched to ${p.name} (demo)`)}
                  >
                    {current ? "Current plan" : p.price === null ? "Contact sales" : "Switch plan"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y border-t">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                <span className="flex-1 font-medium">{inv.id}</span>
                <span className="hidden text-muted-foreground sm:inline">{inv.date}</span>
                <StatusBadge status="completed" className="hidden sm:inline-flex" />
                <span className="w-20 text-right tabular">{formatCurrency(inv.amount)}</span>
                <Button variant="ghost" size="icon-sm" aria-label={`Download ${inv.id}`}>
                  <Download />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
