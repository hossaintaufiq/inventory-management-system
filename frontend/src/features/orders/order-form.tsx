"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PackageOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SimpleSelect } from "@/components/shared/simple-select";
import {
  useCreatePurchaseOrder,
  useCreateSalesOrder,
  useCustomers,
  useOrganization,
  useProducts,
  useStockLevels,
  useSuppliers,
  useWarehouses,
} from "@/lib/api/queries";
import { formatCurrency, formatNumber } from "@/lib/format";
import { orderConfig, type OrderKind } from "./config";

const schema = z.object({
  partyId: z.string().min(1, "Required"),
  warehouseId: z.string().min(1, "Required"),
  expectedAt: z.string().optional(),
  notes: z.string().max(500).optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1, "Choose a product"),
        quantity: z.number({ error: "Qty required" }).int().positive("Min 1"),
        unitPrice: z.number({ error: "Price required" }).min(0, "Can't be negative"),
      }),
    )
    .min(1, "Add at least one line item"),
});
type Values = z.infer<typeof schema>;

export function OrderForm({ kind }: { kind: OrderKind }) {
  const cfg = orderConfig[kind];
  const router = useRouter();
  const { data: suppliers = [] } = useSuppliers();
  const { data: customers = [] } = useCustomers();
  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useProducts();
  const { data: levels = [] } = useStockLevels();
  const { data: org } = useOrganization();
  const createPO = useCreatePurchaseOrder();
  const createSO = useCreateSalesOrder();
  const pending = createPO.isPending || createSO.isPending;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { partyId: "", warehouseId: "", expectedAt: "", notes: "", lines: [] },
  });
  const lines = useFieldArray({ control: form.control, name: "lines" });
  const watched = useWatch({ control: form.control, name: "lines" });
  const warehouseId = useWatch({ control: form.control, name: "warehouseId" });
  const err = form.formState.errors;

  useEffect(() => {
    const def = warehouses.find((w) => w.isDefault);
    if (def && !form.getValues("warehouseId")) form.setValue("warehouseId", def.id);
  }, [warehouses, form]);

  const subtotal = (watched ?? []).reduce((s, l) => s + (l.quantity || 0) * (l.unitPrice || 0), 0);
  const taxRate = org?.taxRate ?? 0;
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax;

  const productOptions = products
    .filter((p) => p.status === "active")
    .map((p) => ({ value: p.id, label: `${p.name} · ${p.sku}` }));

  const partyOptions = (kind === "purchase" ? suppliers : customers).map((p) => ({ value: p.id, label: p.name }));

  const submit = (status: "draft" | "final") =>
    form.handleSubmit((v) => {
      const input = { ...v, expectedAt: v.expectedAt ? new Date(v.expectedAt).toISOString() : undefined };
      const onSuccess = (o: { id: string; number: string }) => {
        toast.success(`${cfg.singular} ${o.number} ${status === "draft" ? "saved as draft" : "created"}`);
        router.push(`${cfg.basePath}/${o.id}`);
      };
      if (kind === "purchase") createPO.mutate([input, status === "draft" ? "draft" : "ordered"], { onSuccess });
      else createSO.mutate([input, status === "draft" ? "draft" : "confirmed"], { onSuccess });
    });

  const onProductChange = (i: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    form.setValue(`lines.${i}.productId`, productId, { shouldValidate: true });
    if (p) form.setValue(`lines.${i}.unitPrice`, kind === "purchase" ? p.costPrice : p.sellPrice, { shouldValidate: true });
  };

  return (
    <form onSubmit={submit("final")} className="space-y-6" noValidate>
      <PageHeader
        title={`New ${cfg.singular.toLowerCase()}`}
        description={kind === "purchase" ? "Order stock from a supplier." : "Create an order for a customer."}
        actions={
          <>
            <Link href={cfg.basePath} className={buttonVariants({ variant: "ghost" })}>
              Cancel
            </Link>
            <Button type="button" variant="outline" onClick={submit("draft")} disabled={pending}>
              Save as draft
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : kind === "purchase" ? "Place order" : "Confirm order"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!err.partyId}>
                    <FieldLabel htmlFor="party">{cfg.partyLabel}</FieldLabel>
                    <Controller
                      control={form.control}
                      name="partyId"
                      render={({ field }) => (
                        <SimpleSelect id="party" value={field.value || undefined} onValueChange={field.onChange} placeholder={`Select ${cfg.partyLabel.toLowerCase()}`} options={partyOptions} invalid={!!err.partyId} />
                      )}
                    />
                    <FieldError errors={[err.partyId]} />
                  </Field>
                  <Field data-invalid={!!err.warehouseId}>
                    <FieldLabel htmlFor="warehouse">{kind === "purchase" ? "Deliver to" : "Ship from"}</FieldLabel>
                    <Controller
                      control={form.control}
                      name="warehouseId"
                      render={({ field }) => (
                        <SimpleSelect id="warehouse" value={field.value || undefined} onValueChange={field.onChange} options={warehouses.map((w) => ({ value: w.id, label: w.name }))} />
                      )}
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="expectedAt">{kind === "purchase" ? "Expected delivery" : "Ship by"}</FieldLabel>
                    <Input id="expectedAt" type="date" {...form.register("expectedAt")} />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>{kind === "purchase" ? "Prices default to each product's cost." : "Prices default to each product's selling price."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lines.fields.length === 0 ? (
                <EmptyState
                  icon={PackageOpen}
                  title="No items yet"
                  description="Add the products you want on this order."
                  className="rounded-lg border border-dashed py-8"
                  action={
                    <Button type="button" variant="outline" size="sm" onClick={() => lines.append({ productId: "", quantity: 1, unitPrice: 0 })}>
                      <Plus /> Add item
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="hidden grid-cols-[1fr_5.5rem_7rem_6.5rem_2rem] gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid">
                    <span>Product</span>
                    <span>Qty</span>
                    <span>{cfg.priceLabel}</span>
                    <span className="text-right">Amount</span>
                    <span />
                  </div>
                  {lines.fields.map((f, i) => {
                    const line = watched?.[i];
                    const onHand = line?.productId
                      ? levels.find((l) => l.productId === line.productId && l.warehouseId === warehouseId)?.quantity ?? 0
                      : null;
                    const short = kind === "sales" && onHand !== null && (line?.quantity ?? 0) > onHand;
                    return (
                      <div key={f.id} className="grid grid-cols-2 gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_5.5rem_7rem_6.5rem_2rem] sm:items-start sm:border-0 sm:p-0">
                        <div className="col-span-2 min-w-0 space-y-1 sm:col-span-1">
                          <Controller
                            control={form.control}
                            name={`lines.${i}.productId`}
                            render={({ field }) => (
                              <SimpleSelect value={field.value || undefined} onValueChange={(v) => onProductChange(i, v)} placeholder="Select product" options={productOptions} invalid={!!err.lines?.[i]?.productId} />
                            )}
                          />
                          {onHand !== null ? (
                            <p className={short ? "text-xs text-critical" : "text-xs text-muted-foreground"}>
                              {formatNumber(onHand)} on hand{short ? " · not enough stock" : ""}
                            </p>
                          ) : null}
                          <FieldError errors={[err.lines?.[i]?.productId]} className="text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Input type="number" min={1} aria-label="Quantity" aria-invalid={!!err.lines?.[i]?.quantity} {...form.register(`lines.${i}.quantity`, { valueAsNumber: true })} />
                          <FieldError errors={[err.lines?.[i]?.quantity]} className="text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Input type="number" step="0.01" min={0} aria-label={cfg.priceLabel} aria-invalid={!!err.lines?.[i]?.unitPrice} {...form.register(`lines.${i}.unitPrice`, { valueAsNumber: true })} />
                          <FieldError errors={[err.lines?.[i]?.unitPrice]} className="text-xs" />
                        </div>
                        <p className="flex h-8 items-center justify-end text-sm font-medium tabular">
                          {formatCurrency((line?.quantity || 0) * (line?.unitPrice || 0))}
                        </p>
                        <Button type="button" variant="ghost" size="icon" onClick={() => lines.remove(i)} aria-label="Remove line" className="justify-self-end">
                          <Trash2 />
                        </Button>
                      </div>
                    );
                  })}
                  <Button type="button" variant="outline" size="sm" onClick={() => lines.append({ productId: "", quantity: 1, unitPrice: 0 })}>
                    <Plus /> Add item
                  </Button>
                </>
              )}
              {err.lines?.root || err.lines?.message ? (
                <FieldError>{err.lines?.root?.message ?? err.lines?.message}</FieldError>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                <span className="tabular">{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea rows={4} placeholder={kind === "purchase" ? "Instructions for the supplier…" : "Delivery instructions, gift message…"} aria-label="Notes" {...form.register("notes")} />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
