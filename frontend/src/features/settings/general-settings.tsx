"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SimpleSelect } from "@/components/shared/simple-select";
import { useOrganization, useUpdateOrganization } from "@/lib/api/queries";
import type { Organization } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  legalName: z.string().trim().min(2, "Legal name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().min(5, "Phone is required"),
  address: z.string().trim().min(5, "Address is required"),
  currency: z.string(),
  timezone: z.string(),
  taxRate: z.number({ error: "Required" }).min(0).max(100),
  lowStockAlerts: z.boolean(),
});

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "BDT", "JPY"].map((c) => ({ value: c, label: c }));
const timezones = [
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
].map((t) => ({ value: t, label: t.replace("_", " ") }));

export function GeneralSettings() {
  const { data, isLoading } = useOrganization();
  if (isLoading || !data) return <Skeleton className="h-[480px] rounded-xl" />;
  return <OrgForm org={data} />;
}

function OrgForm({ org }: { org: Organization }) {
  const update = useUpdateOrganization();
  const form = useForm<Organization>({ resolver: zodResolver(schema), defaultValues: org });
  const err = form.formState.errors;

  const onSubmit = form.handleSubmit((v) =>
    update.mutate(v, {
      onSuccess: (saved) => {
        form.reset(saved);
        toast.success("Settings saved");
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Shown on purchase orders, invoices and emails.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!err.name}>
                <FieldLabel htmlFor="org-name">Display name</FieldLabel>
                <Input id="org-name" {...form.register("name")} />
                <FieldError errors={[err.name]} />
              </Field>
              <Field data-invalid={!!err.legalName}>
                <FieldLabel htmlFor="org-legal">Legal name</FieldLabel>
                <Input id="org-legal" {...form.register("legalName")} />
                <FieldError errors={[err.legalName]} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!err.email}>
                <FieldLabel htmlFor="org-email">Contact email</FieldLabel>
                <Input id="org-email" type="email" {...form.register("email")} />
                <FieldError errors={[err.email]} />
              </Field>
              <Field data-invalid={!!err.phone}>
                <FieldLabel htmlFor="org-phone">Phone</FieldLabel>
                <Input id="org-phone" type="tel" {...form.register("phone")} />
                <FieldError errors={[err.phone]} />
              </Field>
            </div>
            <Field data-invalid={!!err.address}>
              <FieldLabel htmlFor="org-address">Business address</FieldLabel>
              <Textarea id="org-address" rows={2} {...form.register("address")} />
              <FieldError errors={[err.address]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localization & tax</CardTitle>
          <CardDescription>Defaults applied to new orders and reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="org-currency">Currency</FieldLabel>
              <Controller control={form.control} name="currency" render={({ field }) => <SimpleSelect id="org-currency" value={field.value} onValueChange={field.onChange} options={currencies} />} />
            </Field>
            <Field>
              <FieldLabel htmlFor="org-tz">Time zone</FieldLabel>
              <Controller control={form.control} name="timezone" render={({ field }) => <SimpleSelect id="org-tz" value={field.value} onValueChange={field.onChange} options={timezones} />} />
            </Field>
            <Field data-invalid={!!err.taxRate}>
              <FieldLabel htmlFor="org-tax">Default tax rate (%)</FieldLabel>
              <Input id="org-tax" type="number" step="0.01" min={0} max={100} {...form.register("taxRate", { valueAsNumber: true })} />
              <FieldError errors={[err.taxRate]} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="lowStockAlerts"
            render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex-1 space-y-0.5">
                  <FieldLabel htmlFor="org-alerts">Low stock alerts</FieldLabel>
                  <FieldDescription>Email admins when a product falls to its reorder point.</FieldDescription>
                </div>
                <Switch id="org-alerts" checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-4 pb-4">
          <Button type="button" variant="outline" onClick={() => form.reset(org)} disabled={!form.formState.isDirty}>
            Discard
          </Button>
          <Button type="submit" disabled={update.isPending || !form.formState.isDirty}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
