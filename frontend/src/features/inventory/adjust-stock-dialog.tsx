"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SimpleSelect } from "@/components/shared/simple-select";
import { useAdjustStock, useProducts, useStockLevels, useWarehouses } from "@/lib/api/queries";
import { formatNumber } from "@/lib/format";

const reasons = [
  { value: "count_correction", label: "Stock count correction" },
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "lost", label: "Lost / stolen" },
  { value: "found", label: "Found" },
  { value: "other", label: "Other" },
] as const;

const schema = z.object({
  productId: z.string().min(1, "Choose a product"),
  warehouseId: z.string().min(1, "Choose a warehouse"),
  direction: z.enum(["add", "remove"]),
  quantity: z.number({ error: "Enter a quantity" }).int("Whole units only").positive("Must be at least 1"),
  reason: z.enum(["count_correction", "damaged", "expired", "lost", "found", "other"]),
  note: z.string().max(200).optional(),
});
type Values = z.infer<typeof schema>;

export function AdjustStockDialog({
  open,
  onOpenChange,
  productId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
}) {
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: levels = [] } = useStockLevels();
  const adjust = useAdjustStock();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { productId: "", warehouseId: "", direction: "remove", reason: "count_correction", note: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        productId: productId ?? "",
        warehouseId: warehouses.find((w) => w.isDefault)?.id ?? "",
        direction: "remove",
        reason: "count_correction",
        note: "",
      });
    }
  }, [open, productId, warehouses, form]);

  const [pid, wid] = useWatch({ control: form.control, name: ["productId", "warehouseId"] });
  const current = levels.find((l) => l.productId === pid && l.warehouseId === wid)?.quantity ?? 0;

  const onSubmit = form.handleSubmit((v) => {
    adjust.mutate(
      {
        productId: v.productId,
        warehouseId: v.warehouseId,
        quantity: v.direction === "add" ? v.quantity : -v.quantity,
        reason: v.reason,
        note: v.note || undefined,
      },
      {
        onSuccess: (adj) => {
          toast.success(`Stock adjusted (${adj.number})`);
          onOpenChange(false);
        },
      },
    );
  });

  const err = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>Record a manual change, such as a count correction or damaged goods.</DialogDescription>
        </DialogHeader>
        <form id="adjust-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!err.productId}>
              <FieldLabel htmlFor="adj-product">Product</FieldLabel>
              <Controller
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <SimpleSelect
                    id="adj-product"
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    placeholder="Select a product"
                    invalid={!!err.productId}
                    options={products
                      .filter((p) => p.status === "active")
                      .map((p) => ({ value: p.id, label: `${p.name} · ${p.sku}` }))}
                  />
                )}
              />
              <FieldError errors={[err.productId]} />
            </Field>
            <Field data-invalid={!!err.warehouseId}>
              <FieldLabel htmlFor="adj-warehouse">Warehouse</FieldLabel>
              <Controller
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <SimpleSelect
                    id="adj-warehouse"
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    placeholder="Select a warehouse"
                    options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  />
                )}
              />
              {pid && wid ? (
                <FieldDescription>
                  Currently on hand: <span className="font-medium text-foreground tabular">{formatNumber(current)}</span>
                </FieldDescription>
              ) : null}
              <FieldError errors={[err.warehouseId]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Controller
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4 pt-1.5">
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="add" /> Add
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="remove" /> Remove
                      </label>
                    </RadioGroup>
                  )}
                />
              </Field>
              <Field data-invalid={!!err.quantity}>
                <FieldLabel htmlFor="adj-qty">Quantity</FieldLabel>
                <Input id="adj-qty" type="number" min={1} inputMode="numeric" {...form.register("quantity", { valueAsNumber: true })} />
                <FieldError errors={[err.quantity]} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="adj-reason">Reason</FieldLabel>
              <Controller
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <SimpleSelect
                    id="adj-reason"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={reasons.map((r) => ({ value: r.value, label: r.label }))}
                  />
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="adj-note">Note (optional)</FieldLabel>
              <Textarea id="adj-note" rows={2} placeholder="Add context for your team" {...form.register("note")} />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="adjust-form" disabled={adjust.isPending}>
            {adjust.isPending ? "Saving…" : "Save adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
