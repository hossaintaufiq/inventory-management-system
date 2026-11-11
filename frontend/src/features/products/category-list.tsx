"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MoreHorizontal, Plus, Tags, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, SortableHeader, type Columns } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useCategories, useCreateCategory, useDeleteCategory, useProducts } from "@/lib/api/queries";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Category } from "@/types";

type Row = Category & { units: number; value: number };

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z.string().max(200).optional(),
});

export function CategoryList() {
  const { data: categories, isLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const remove = useDeleteCategory();
  const [open, setOpen] = useState(false);

  const rows = useMemo<Row[] | undefined>(
    () =>
      categories?.map((c) => {
        const items = products.filter((p) => p.categoryId === c.id && p.status === "active");
        return {
          ...c,
          productCount: items.length,
          units: items.reduce((s, p) => s + p.stock, 0),
          value: items.reduce((s, p) => s + p.stock * p.costPrice, 0),
        };
      }),
    [categories, products],
  );

  const columns = useMemo<Columns<Row>>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} title="Category" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md border bg-muted">
              <Tags className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.description}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "productCount",
        header: ({ column }) => <SortableHeader column={column} title="Products" />,
        cell: ({ getValue }) => <span className="tabular">{formatNumber(getValue() as number)}</span>,
      },
      {
        accessorKey: "units",
        header: ({ column }) => <SortableHeader column={column} title="Units on hand" />,
        cell: ({ getValue }) => <span className="tabular">{formatNumber(getValue() as number)}</span>,
        meta: { className: "hidden sm:table-cell" },
      },
      {
        accessorKey: "value",
        header: ({ column }) => <SortableHeader column={column} title="Stock value" />,
        cell: ({ getValue }) => <span className="font-medium tabular">{formatCurrency(getValue() as number)}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        meta: { className: "w-10 text-right" },
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Category actions" />}>
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                variant="destructive"
                disabled={row.original.productCount > 0}
                onClick={() => remove.mutate(row.original.id, { onSuccess: () => toast.success("Category deleted") })}
              >
                <Trash2 className="size-4" />
                {row.original.productCount > 0 ? "Has products" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [remove],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Group products for reporting and faster filtering."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> New category
          </Button>
        }
      />
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search categories…" />
      <CategoryDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function CategoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateCategory();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "" } });
  const err = form.formState.errors;

  const onSubmit = form.handleSubmit((v) =>
    create.mutate(v, {
      onSuccess: (c) => {
        toast.success(`Category "${c.name}" created`);
        form.reset();
        onOpenChange(false);
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>Categories help you organize and report on products.</DialogDescription>
        </DialogHeader>
        <form id="category-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!err.name}>
              <FieldLabel htmlFor="cat-name">Name</FieldLabel>
              <Input id="cat-name" placeholder="e.g. Accessories" {...form.register("name")} />
              <FieldError errors={[err.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="cat-desc">Description</FieldLabel>
              <Textarea id="cat-desc" rows={3} {...form.register("description")} />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={create.isPending}>
            Create category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
