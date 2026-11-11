"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { PageHeader } from "@/components/shared/page-header";
import { useCreateCustomer, useCreateSupplier, useCustomers, useSuppliers } from "@/lib/api/queries";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import type { Supplier } from "@/types";

type Kind = "supplier" | "customer";
type Row = Omit<Supplier, "leadTimeDays"> & { leadTimeDays?: number };

const copy = {
  supplier: { title: "Suppliers", singular: "supplier", description: "Vendors you purchase stock from.", spent: "Purchased" },
  customer: { title: "Customers", singular: "customer", description: "Businesses and people you sell to.", spent: "Lifetime value" },
};

export function ContactList({ kind }: { kind: Kind }) {
  const s = useSuppliers();
  const c = useCustomers();
  const q = kind === "supplier" ? s : c;
  const t = copy[kind];
  const [open, setOpen] = useState(false);

  const columns = useMemo<Columns<Row>>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <div className="flex min-w-44 items-center gap-3">
            <Avatar className="size-8 rounded-md">
              <AvatarFallback className="rounded-md text-xs">{initials(row.original.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.contactPerson}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
          <div className="text-sm">
            <a href={`mailto:${row.original.email}`} className="inline-flex items-center gap-1.5 hover:underline">
              <Mail className="size-3.5 text-muted-foreground" />
              {row.original.email}
            </a>
            <p className="text-xs text-muted-foreground">{row.original.phone}</p>
          </div>
        ),
        meta: { className: "hidden md:table-cell" },
      },
      {
        id: "location",
        header: "Location",
        accessorFn: (r) => `${r.city}, ${r.country}`,
        meta: { className: "hidden lg:table-cell" },
      },
      ...(kind === "supplier"
        ? ([
            {
              accessorKey: "leadTimeDays",
              header: ({ column }) => <SortableHeader column={column} title="Lead time" />,
              cell: ({ getValue }) => <span className="tabular">{getValue() as number} days</span>,
              meta: { className: "hidden sm:table-cell" },
            },
          ] as Columns<Row>)
        : []),
      {
        accessorKey: "totalOrders",
        header: ({ column }) => <SortableHeader column={column} title="Orders" />,
        cell: ({ getValue }) => <span className="tabular">{getValue() as number}</span>,
        meta: { className: "hidden sm:table-cell" },
      },
      {
        accessorKey: "totalSpent",
        header: ({ column }) => <SortableHeader column={column} title={t.spent} />,
        cell: ({ getValue }) => <span className="font-medium tabular">{formatCurrency(getValue() as number)}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Since",
        cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue() as string)}</span>,
        meta: { className: "hidden xl:table-cell" },
      },
    ],
    [kind, t.spent],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        description={t.description}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Add {t.singular}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={q.data as Row[] | undefined}
        isLoading={q.isLoading}
        searchPlaceholder={`Search ${t.title.toLowerCase()}…`}
        initialSorting={[{ id: "totalSpent", desc: true }]}
      />
      <ContactDialog kind={kind} open={open} onOpenChange={setOpen} />
    </div>
  );
}

const schema = z.object({
  name: z.string().trim().min(2, "Company name is required"),
  contactPerson: z.string().trim().min(2, "Contact name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().min(5, "Phone is required"),
  city: z.string().trim().min(2, "City is required"),
  country: z.string().trim().min(2, "Country is required"),
  leadTimeDays: z.number().int().min(0).optional(),
});
type Values = z.infer<typeof schema>;

function ContactDialog({ kind, open, onOpenChange }: { kind: Kind; open: boolean; onOpenChange: (o: boolean) => void }) {
  const createSupplier = useCreateSupplier();
  const createCustomer = useCreateCustomer();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contactPerson: "", email: "", phone: "", city: "", country: "", leadTimeDays: 7 },
  });
  const err = form.formState.errors;
  const pending = createSupplier.isPending || createCustomer.isPending;

  const onSubmit = form.handleSubmit(({ leadTimeDays, ...v }) => {
    const done = (x: { name: string }) => {
      toast.success(`${x.name} added`);
      form.reset();
      onOpenChange(false);
    };
    if (kind === "supplier") createSupplier.mutate({ ...v, leadTimeDays: leadTimeDays ?? 7 }, { onSuccess: done });
    else createCustomer.mutate(v, { onSuccess: done });
  });

  const text = (name: Exclude<keyof Values, "leadTimeDays">, label: string, type = "text") => (
    <Field data-invalid={!!err[name]}>
      <FieldLabel htmlFor={`c-${name}`}>{label}</FieldLabel>
      <Input id={`c-${name}`} type={type} aria-invalid={!!err[name]} {...form.register(name)} />
      <FieldError errors={[err[name]]} />
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add {copy[kind].singular}</DialogTitle>
          <DialogDescription>Contact details are used on orders and documents.</DialogDescription>
        </DialogHeader>
        <form id="contact-form" onSubmit={onSubmit}>
          <FieldGroup>
            {text("name", "Company name")}
            <div className="grid gap-4 sm:grid-cols-2">
              {text("contactPerson", "Contact person")}
              {text("email", "Email", "email")}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("phone", "Phone", "tel")}
              {text("city", "City")}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("country", "Country")}
              {kind === "supplier" ? (
                <Field>
                  <FieldLabel htmlFor="c-lead">Lead time (days)</FieldLabel>
                  <Input id="c-lead" type="number" min={0} {...form.register("leadTimeDays", { valueAsNumber: true })} />
                </Field>
              ) : null}
            </div>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="contact-form" disabled={pending}>
            Add {copy[kind].singular}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
