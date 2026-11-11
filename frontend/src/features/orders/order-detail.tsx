"use client";

import Link from "next/link";
import { Check, Mail, MapPin, Phone, Printer, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSkeleton, NotFoundState } from "@/components/shared/detail-states";
import {
  useLookups,
  usePurchaseOrder,
  useSalesOrder,
  useSetPurchaseOrderStatus,
  useSetSalesOrderStatus,
} from "@/lib/api/queries";
import { formatCurrency, formatDate, formatDateTime, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Contact, PurchaseOrderStatus, SalesOrderStatus } from "@/types";
import { orderConfig, type OrderKind } from "./config";

export function OrderDetail({ kind, id }: { kind: OrderKind; id: string }) {
  const cfg = orderConfig[kind];
  const po = usePurchaseOrder(kind === "purchase" ? id : "");
  const so = useSalesOrder(kind === "sales" ? id : "");
  const q = kind === "purchase" ? po : so;
  const lookups = useLookups();
  const setPO = useSetPurchaseOrderStatus();
  const setSO = useSetSalesOrderStatus();
  const pending = setPO.isPending || setSO.isPending;

  if (q.isLoading) return <DetailSkeleton />;
  const order = kind === "purchase" ? po.data : so.data;
  if (q.isError || !order) return <NotFoundState what={cfg.singular} backHref={cfg.basePath} />;

  const party: Contact | undefined =
    kind === "purchase" ? lookups.supplier.get(po.data!.supplierId) : lookups.customer.get(so.data!.customerId);
  const warehouse = lookups.warehouse.get(order.warehouseId);
  const status = order.status;

  const changeStatus = (to: string) => {
    const onSuccess = () => toast.success(`${order.number} marked as ${titleCase(to).toLowerCase()}`);
    if (kind === "purchase") setPO.mutate([id, to as PurchaseOrderStatus], { onSuccess });
    else setSO.mutate([id, to as SalesOrderStatus], { onSuccess });
  };

  const actions = (cfg.actions as Record<string, { to: string; label: string; primary?: boolean }[]>)[status] ?? [];
  const steps = cfg.steps as readonly string[];
  const currentStep = steps.indexOf(status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {order.number} <StatusBadge status={status} />
          </span>
        }
        description={`Created ${formatDateTime(order.createdAt)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Print
            </Button>
            {cfg.cancellable.includes(status) ? (
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="outline" />}>
                  <X /> Cancel order
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel {order.number}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The order will be kept for your records but can no longer be fulfilled. This can&apos;t be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep order</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={() => changeStatus("cancelled")}>
                      Cancel order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
            {actions.map((a) => (
              <Button key={a.to} variant={a.primary ? "default" : "outline"} onClick={() => changeStatus(a.to)} disabled={pending}>
                {a.label}
              </Button>
            ))}
          </>
        }
      />

      {status !== "cancelled" ? (
        <Card size="sm">
          <CardContent>
            <ol className="flex items-center gap-2 overflow-x-auto">
              {steps.map((s, i) => {
                const done = i < currentStep || status === steps[steps.length - 1];
                const current = i === currentStep && !done;
                return (
                  <li key={s} className="flex min-w-fit flex-1 items-center gap-2">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                        done && "border-primary bg-primary text-primary-foreground",
                        current && "border-primary text-primary ring-3 ring-primary/15",
                      )}
                    >
                      {done ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className={cn("text-sm whitespace-nowrap", done || current ? "font-medium" : "text-muted-foreground")}>
                      {titleCase(s)}
                    </span>
                    {i < steps.length - 1 ? <span className={cn("h-px min-w-6 flex-1", done ? "bg-primary" : "bg-border")} /> : null}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-4 py-2 text-right font-medium">Qty</th>
                    <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">{cfg.priceLabel}</th>
                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.lines.map((l) => {
                    const p = lookups.product.get(l.productId);
                    return (
                      <tr key={l.productId}>
                        <td className="px-4 py-3">
                          <Link href={`/products/${l.productId}`} className="font-medium hover:underline">
                            {p?.name ?? "Unknown product"}
                          </Link>
                          <p className="text-xs text-muted-foreground">{p?.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-right tabular">{l.quantity}</td>
                        <td className="hidden px-4 py-3 text-right tabular sm:table-cell">{formatCurrency(l.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium tabular">{formatCurrency(l.quantity * l.unitPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="ml-auto max-w-xs space-y-2 px-4 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular">{formatCurrency(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{cfg.partyLabel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">{party?.name ?? "—"}</p>
                <p className="text-muted-foreground">{party?.contactPerson}</p>
              </div>
              {party ? (
                <div className="space-y-1.5 text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="size-4" /> {party.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-4" /> {party.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" /> {party.city}, {party.country}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fulfilment</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{kind === "purchase" ? "Deliver to" : "Ship from"}</dt>
                  <dd className="text-right font-medium">{warehouse?.name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Order date</dt>
                  <dd className="font-medium">{formatDate(order.createdAt)}</dd>
                </div>
                {order.expectedAt ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{kind === "purchase" ? "Expected" : "Ship by"}</dt>
                    <dd className="font-medium">{formatDate(order.expectedAt)}</dd>
                  </div>
                ) : null}
              </dl>
              {order.notes ? (
                <>
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{order.notes}</p>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
