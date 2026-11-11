"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Plus, UserRound, Warehouse as WarehouseIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useCreateWarehouse, useWarehouseSummaries } from "@/lib/api/queries";
import { formatCurrency, formatNumber } from "@/lib/format";

export function WarehouseList() {
  const { data, isLoading } = useWarehouseSummaries();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Every location where you store stock."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Add warehouse
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading || !data
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
          : data.map((w) => {
              const used = Math.min(100, (w.units / w.capacity) * 100);
              return (
                <Card key={w.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                        <WarehouseIcon className="size-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {w.name}
                          {w.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs">{w.code}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4" /> {w.address}, {w.city}
                      </p>
                      <p className="flex items-center gap-2">
                        <UserRound className="size-4" /> {w.manager}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity used</span>
                        <span className="font-medium tabular">
                          {formatNumber(w.units)} / {formatNumber(w.capacity)}
                        </span>
                      </div>
                      <Progress value={used} aria-label={`${w.name} capacity used`} />
                    </div>
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 divide-x border-t bg-muted/30 p-0">
                    <div className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">SKUs stocked</p>
                      <p className="text-sm font-semibold tabular">{formatNumber(w.skus)}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">Stock value</p>
                      <p className="text-sm font-semibold tabular">{formatCurrency(w.value)}</p>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
      </div>
      <WarehouseDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  code: z.string().trim().min(2, "Code is required").max(6, "Max 6 characters"),
  address: z.string().trim().min(3, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  manager: z.string().trim().min(2, "Manager is required"),
  capacity: z.number({ error: "Capacity is required" }).int().positive(),
});
type Values = z.infer<typeof schema>;

function WarehouseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateWarehouse();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", code: "", address: "", city: "", manager: "", capacity: 5000 } });
  const err = form.formState.errors;

  const onSubmit = form.handleSubmit((v) =>
    create.mutate(
      { ...v, code: v.code.toUpperCase() },
      {
        onSuccess: (w) => {
          toast.success(`${w.name} added`);
          form.reset();
          onOpenChange(false);
        },
      },
    ),
  );

  const text = (name: keyof Values, label: string, placeholder?: string) => (
    <Field data-invalid={!!err[name]}>
      <FieldLabel htmlFor={`wh-${name}`}>{label}</FieldLabel>
      <Input id={`wh-${name}`} placeholder={placeholder} {...form.register(name)} />
      <FieldError errors={[err[name]]} />
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add warehouse</DialogTitle>
          <DialogDescription>Add a new location to track stock separately.</DialogDescription>
        </DialogHeader>
        <form id="warehouse-form" onSubmit={onSubmit}>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              {text("name", "Name", "e.g. West Distribution")}
              {text("code", "Code", "WEST")}
            </div>
            {text("address", "Street address")}
            <div className="grid gap-4 sm:grid-cols-2">
              {text("city", "City")}
              {text("manager", "Manager")}
            </div>
            <Field data-invalid={!!err.capacity}>
              <FieldLabel htmlFor="wh-capacity">Capacity (units)</FieldLabel>
              <Input id="wh-capacity" type="number" min={1} {...form.register("capacity", { valueAsNumber: true })} />
              <FieldError errors={[err.capacity]} />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="warehouse-form" disabled={create.isPending}>
            Add warehouse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
