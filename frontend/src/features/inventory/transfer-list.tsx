"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DataTable, SortableHeader, type Columns } from "@/components/shared/data-table";
import { SimpleSelect } from "@/components/shared/simple-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLookups, useProducts, useStockLevels, useTransferStock, useTransfers, useWarehouses } from "@/lib/api/queries";
import { formatDate, formatNumber } from "@/lib/format";

type Row = { id: string; number: string; from: string; to: string; items: number; units: number; status: string; createdAt: string };

export function TransferList() {
  const { data, isLoading } = useTransfers();
  const lookups = useLookups();
  const [open, setOpen] = useState(false);

  const rows = useMemo<Row[] | undefined>(
    () =>
      data?.map((t) => ({
        id: t.id,
        number: t.number,
        from: lookups.warehouse.get(t.fromWarehouseId)?.name ?? "—",
        to: lookups.warehouse.get(t.toWarehouseId)?.name ?? "—",
        items: t.lines.length,
        units: t.lines.reduce((s, l) => s + l.quantity, 0),
        status: t.status,
        createdAt: t.createdAt,
      })),
    [data, lookups.warehouse],
  );

  const columns = useMemo<Columns<Row>>(
    () => [
      { accessorKey: "number", header: ({ column }) => <SortableHeader column={column} title="Reference" />, cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      {
        id: "route",
        header: "Route",
        accessorFn: (r) => `${r.from} ${r.to}`,
        cell: ({ row }) => (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            {row.original.from} <ArrowRight className="size-3.5 text-muted-foreground" /> {row.original.to}
          </span>
        ),
      },
      { accessorKey: "items", header: "Lines", meta: { className: "hidden md:table-cell" }, cell: ({ getValue }) => <span className="tabular">{getValue() as number}</span> },
      { accessorKey: "units", header: ({ column }) => <SortableHeader column={column} title="Units" />, cell: ({ getValue }) => <span className="tabular">{formatNumber(getValue() as number)}</span>, meta: { className: "hidden sm:table-cell" } },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
      { accessorKey: "createdAt", header: ({ column }) => <SortableHeader column={column} title="Date" />, cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue() as string)}</span>, meta: { className: "hidden md:table-cell" } },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search transfers…"
        toolbar={
          <Button onClick={() => setOpen(true)}>
            <Plus /> New transfer
          </Button>
        }
      />
      <TransferDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

const schema = z
  .object({
    fromWarehouseId: z.string().min(1, "Required"),
    toWarehouseId: z.string().min(1, "Required"),
    lines: z
      .array(
        z.object({
          productId: z.string().min(1, "Choose a product"),
          quantity: z.number({ error: "Enter a quantity" }).int().positive("Must be at least 1"),
        }),
      )
      .min(1, "Add at least one product"),
  })
  .refine((v) => v.fromWarehouseId !== v.toWarehouseId, { path: ["toWarehouseId"], message: "Choose a different warehouse" });

type Values = z.infer<typeof schema>;

function TransferDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useProducts();
  const { data: levels = [] } = useStockLevels();
  const transfer = useTransferStock();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    // Start empty: field-array rows get random ids, which must not be generated during prerender.
    defaultValues: { fromWarehouseId: "", toWarehouseId: "", lines: [] },
  });
  const lines = useFieldArray({ control: form.control, name: "lines" });
  const from = useWatch({ control: form.control, name: "fromWarehouseId" });
  const watchedLines = useWatch({ control: form.control, name: "lines" });
  const err = form.formState.errors;

  useEffect(() => {
    if (open && warehouses.length >= 2) {
      form.reset({ fromWarehouseId: warehouses[0].id, toWarehouseId: warehouses[1].id, lines: [{ productId: "", quantity: 1 }] });
    }
  }, [open, warehouses, form]);

  const available = (productId: string) =>
    levels.find((l) => l.productId === productId && l.warehouseId === from)?.quantity ?? 0;

  const onSubmit = form.handleSubmit((v) => {
    const over = v.lines.find((l) => l.quantity > available(l.productId));
    if (over) {
      const i = v.lines.indexOf(over);
      form.setError(`lines.${i}.quantity`, { message: `Only ${available(over.productId)} available` });
      return;
    }
    transfer.mutate(v, {
      onSuccess: (t) => {
        toast.success(`Transfer ${t.number} completed`);
        onOpenChange(false);
      },
    });
  });

  const whOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));
  const productOptions = products.filter((p) => p.status === "active").map((p) => ({ value: p.id, label: `${p.name} · ${p.sku}` }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transfer stock</DialogTitle>
          <DialogDescription>Move inventory between your locations. Stock levels update immediately.</DialogDescription>
        </DialogHeader>
        <form id="transfer-form" onSubmit={onSubmit} className="max-h-[60vh] overflow-y-auto pr-1">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!err.fromWarehouseId}>
                <FieldLabel htmlFor="from">From</FieldLabel>
                <Controller control={form.control} name="fromWarehouseId" render={({ field }) => <SimpleSelect id="from" value={field.value || undefined} onValueChange={field.onChange} options={whOptions} />} />
              </Field>
              <Field data-invalid={!!err.toWarehouseId}>
                <FieldLabel htmlFor="to">To</FieldLabel>
                <Controller control={form.control} name="toWarehouseId" render={({ field }) => <SimpleSelect id="to" value={field.value || undefined} onValueChange={field.onChange} options={whOptions} invalid={!!err.toWarehouseId} />} />
                <FieldError errors={[err.toWarehouseId]} />
              </Field>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Products</p>
              {lines.fields.map((f, i) => {
                const pid = watchedLines?.[i]?.productId;
                return (
                  <div key={f.id} className="grid grid-cols-[1fr_6rem_auto] items-start gap-2">
                    <div className="min-w-0 space-y-1">
                      <Controller
                        control={form.control}
                        name={`lines.${i}.productId`}
                        render={({ field }) => (
                          <SimpleSelect value={field.value || undefined} onValueChange={field.onChange} placeholder="Select product" options={productOptions} invalid={!!err.lines?.[i]?.productId} />
                        )}
                      />
                      {pid ? <p className="text-xs text-muted-foreground">{formatNumber(available(pid))} available at source</p> : null}
                      <FieldError errors={[err.lines?.[i]?.productId]} />
                    </div>
                    <div className="space-y-1">
                      <Input type="number" min={1} aria-label="Quantity" aria-invalid={!!err.lines?.[i]?.quantity} {...form.register(`lines.${i}.quantity`, { valueAsNumber: true })} />
                      <FieldError errors={[err.lines?.[i]?.quantity]} className="text-xs" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => lines.remove(i)} disabled={lines.fields.length === 1} aria-label="Remove line">
                      <Trash2 />
                    </Button>
                  </div>
                );
              })}
              <Button type="button" variant="outline" size="sm" onClick={() => lines.append({ productId: "", quantity: 1 })}>
                <Plus /> Add product
              </Button>
            </div>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="transfer-form" disabled={transfer.isPending}>
            {transfer.isPending ? "Transferring…" : "Complete transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
