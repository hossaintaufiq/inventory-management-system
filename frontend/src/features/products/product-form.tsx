"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { SimpleSelect } from "@/components/shared/simple-select";
import { useCategories, useCreateProduct, useUpdateProduct, useWarehouses } from "@/lib/api/queries";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

const units = ["pcs", "box", "pack", "kg", "g", "l", "ml", "m", "pair", "set"];

const money = (label: string) =>
  z.number({ error: `${label} is required` }).min(0, `${label} can't be negative`);

const schema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    sku: z
      .string()
      .trim()
      .min(2, "SKU is required")
      .regex(/^[A-Za-z0-9-_]+$/, "Letters, numbers, - and _ only"),
    barcode: z.string().trim().optional(),
    description: z.string().max(1000).optional(),
    categoryId: z.string().min(1, "Choose a category"),
    unit: z.string().min(1),
    costPrice: money("Cost price"),
    sellPrice: money("Selling price"),
    reorderPoint: z.number({ error: "Required" }).int().min(0),
    active: z.boolean(),
    initialStock: z.array(z.object({ warehouseId: z.string(), quantity: z.number().int().min(0).or(z.nan()) })),
  })
  .refine((v) => v.sellPrice >= v.costPrice, {
    path: ["sellPrice"],
    message: "Selling price is below cost",
  });

type Values = z.infer<typeof schema>;

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { data: warehouses = [] } = useWarehouses();
  const create = useCreateProduct();
  const update = useUpdateProduct(product?.id ?? "");
  const isEdit = !!product;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: useMemo(
      () => ({
        name: product?.name ?? "",
        sku: product?.sku ?? "",
        barcode: product?.barcode ?? "",
        description: product?.description ?? "",
        categoryId: product?.categoryId ?? "",
        unit: product?.unit ?? "pcs",
        costPrice: product?.costPrice ?? (undefined as unknown as number),
        sellPrice: product?.sellPrice ?? (undefined as unknown as number),
        reorderPoint: product?.reorderPoint ?? 10,
        active: (product?.status ?? "active") === "active",
        initialStock: warehouses.map((w) => ({ warehouseId: w.id, quantity: 0 })),
      }),
      [product, warehouses],
    ),
    resetOptions: { keepDirtyValues: true },
  });

  const err = form.formState.errors;
  const [cost, price] = useWatch({ control: form.control, name: ["costPrice", "sellPrice"] });
  const margin = price > 0 && cost >= 0 ? ((price - cost) / price) * 100 : null;

  const onSubmit = form.handleSubmit((v) => {
    const payload = {
      name: v.name,
      sku: v.sku.toUpperCase(),
      barcode: v.barcode || undefined,
      description: v.description || undefined,
      categoryId: v.categoryId,
      unit: v.unit,
      costPrice: v.costPrice,
      sellPrice: v.sellPrice,
      reorderPoint: v.reorderPoint,
      status: v.active ? ("active" as const) : ("archived" as const),
    };
    if (isEdit) {
      update.mutate(payload, {
        onSuccess: () => {
          toast.success("Product updated");
          router.push(`/products/${product.id}`);
        },
      });
    } else {
      create.mutate(
        {
          ...payload,
          initialStock: v.initialStock.filter((s) => s.quantity > 0),
        },
        {
          onSuccess: (p) => {
            toast.success(`${p.name} added to your catalog`);
            router.push(`/products/${p.id}`);
          },
        },
      );
    }
  });

  const pending = create.isPending || update.isPending;
  const cancelHref = isEdit ? `/products/${product.id}` : "/products";

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <PageHeader
        title={isEdit ? `Edit ${product.name}` : "Add product"}
        description={isEdit ? "Update catalog details and pricing." : "Add a new SKU to your catalog."}
        actions={
          <>
            <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
              Cancel
            </Link>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
              <CardDescription>How this product appears to your team and on documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={!!err.name}>
                  <FieldLabel htmlFor="name">Product name</FieldLabel>
                  <Input id="name" placeholder="e.g. Wireless Earbuds Pro" aria-invalid={!!err.name} {...form.register("name")} />
                  <FieldError errors={[err.name]} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!err.sku}>
                    <FieldLabel htmlFor="sku">SKU</FieldLabel>
                    <Input id="sku" placeholder="ELC-0101" className="uppercase" aria-invalid={!!err.sku} {...form.register("sku")} />
                    <FieldError errors={[err.sku]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="barcode">Barcode (optional)</FieldLabel>
                    <Input id="barcode" placeholder="EAN / UPC" {...form.register("barcode")} />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea id="description" rows={4} placeholder="Materials, dimensions, notes…" {...form.register("description")} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Cost drives inventory valuation; price is the default on sales orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={!!err.costPrice}>
                  <FieldLabel htmlFor="costPrice">Cost price</FieldLabel>
                  <Input id="costPrice" type="number" step="0.01" min={0} placeholder="0.00" aria-invalid={!!err.costPrice} {...form.register("costPrice", { valueAsNumber: true })} />
                  <FieldError errors={[err.costPrice]} />
                </Field>
                <Field data-invalid={!!err.sellPrice}>
                  <FieldLabel htmlFor="sellPrice">Selling price</FieldLabel>
                  <Input id="sellPrice" type="number" step="0.01" min={0} placeholder="0.00" aria-invalid={!!err.sellPrice} {...form.register("sellPrice", { valueAsNumber: true })} />
                  <FieldError errors={[err.sellPrice]} />
                </Field>
                <Field>
                  <FieldLabel>Margin</FieldLabel>
                  <div className="flex h-8 items-center rounded-lg border bg-muted/40 px-2.5 text-sm tabular">
                    {margin === null || Number.isNaN(margin) ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span>
                        {margin.toFixed(1)}% <span className="text-muted-foreground">· {formatCurrency(price - cost)} / unit</span>
                      </span>
                    )}
                  </div>
                </Field>
              </div>
            </CardContent>
          </Card>

          {!isEdit && warehouses.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Opening stock</CardTitle>
                <CardDescription>Quantities already on hand. Recorded as an adjustment in the stock history.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y rounded-lg border">
                  {warehouses.map((w, i) => (
                    <div key={w.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{w.name}</p>
                        <p className="text-xs text-muted-foreground">{w.city}</p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        className="w-28 text-right"
                        aria-label={`Opening stock at ${w.name}`}
                        {...form.register(`initialStock.${i}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="active"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <div className="flex-1 space-y-0.5">
                      <FieldLabel htmlFor="active">Active</FieldLabel>
                      <FieldDescription>Archived products are hidden from new orders.</FieldDescription>
                    </div>
                    <Switch id="active" checked={field.value} onCheckedChange={field.onChange} />
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={!!err.categoryId}>
                  <FieldLabel htmlFor="categoryId">Category</FieldLabel>
                  <Controller
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <SimpleSelect
                        id="categoryId"
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        placeholder="Select a category"
                        invalid={!!err.categoryId}
                        options={categories.map((c) => ({ value: c.id, label: c.name }))}
                      />
                    )}
                  />
                  <FieldError errors={[err.categoryId]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="unit">Unit of measure</FieldLabel>
                  <Controller
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <SimpleSelect
                        id="unit"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={units.map((u) => ({ value: u, label: u }))}
                      />
                    )}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reordering</CardTitle>
            </CardHeader>
            <CardContent>
              <Field data-invalid={!!err.reorderPoint}>
                <FieldLabel htmlFor="reorderPoint">Reorder point</FieldLabel>
                <Input id="reorderPoint" type="number" min={0} {...form.register("reorderPoint", { valueAsNumber: true })} />
                <FieldDescription>You&apos;ll be alerted when total stock falls to this level.</FieldDescription>
                <FieldError errors={[err.reorderPoint]} />
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
