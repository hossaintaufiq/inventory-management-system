"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MoreHorizontal, UserPlus, UserX } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DataTable, type Columns } from "@/components/shared/data-table";
import { SimpleSelect } from "@/components/shared/simple-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { useInviteMember, useRemoveMember, useTeam, useUpdateMemberRole } from "@/lib/api/queries";
import { formatRelative, initials, titleCase } from "@/lib/format";
import type { Role, TeamMember } from "@/types";

const roles: { value: Role; label: string; description: string }[] = [
  { value: "owner", label: "Owner", description: "Full access, including billing and deleting the organization." },
  { value: "admin", label: "Admin", description: "Manage settings, team members and all inventory data." },
  { value: "manager", label: "Manager", description: "Create and approve orders, adjust stock, view reports." },
  { value: "staff", label: "Staff", description: "Receive and fulfil orders, record stock counts." },
];

export function TeamSettings() {
  const { data, isLoading } = useTeam();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const [open, setOpen] = useState(false);

  const columns = useMemo<Columns<TeamMember>>(
    () => [
      {
        accessorKey: "name",
        header: "Member",
        cell: ({ row }) => (
          <div className="flex min-w-48 items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials(row.original.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email", meta: { className: "hidden" } },
      { accessorKey: "role", header: "Role", cell: ({ getValue }) => titleCase(getValue() as string) },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
        meta: { className: "hidden sm:table-cell" },
      },
      {
        accessorKey: "lastActiveAt",
        header: "Last active",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() ? formatRelative(getValue() as string) : "—"}</span>,
        meta: { className: "hidden md:table-cell" },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        meta: { className: "w-10 text-right" },
        cell: ({ row }) =>
          row.original.role === "owner" ? null : (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Manage ${row.original.name}`} />}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Change role</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={row.original.role}
                    onValueChange={(v) =>
                      updateRole.mutate([row.original.id, v as Role], { onSuccess: () => toast.success(`${row.original.name} is now ${titleCase(v as string)}`) })
                    }
                  >
                    {roles
                      .filter((r) => r.value !== "owner")
                      .map((r) => (
                        <DropdownMenuRadioItem key={r.value} value={r.value}>
                          {r.label}
                        </DropdownMenuRadioItem>
                      ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => removeMember.mutate(row.original.id, { onSuccess: () => toast.success(`${row.original.name} removed`) })}
                >
                  <UserX className="size-4" /> Remove from team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
      },
    ],
    [updateRole, removeMember],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>Invite people to collaborate. Your plan includes up to 25 seats.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            searchPlaceholder="Search members…"
            toolbar={
              <Button onClick={() => setOpen(true)}>
                <UserPlus /> Invite member
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles & permissions</CardTitle>
          <CardDescription>What each role can do in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y rounded-lg border">
            {roles.map((r) => (
              <li key={r.value} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
                <span className="w-24 shrink-0 text-sm font-medium">{r.label}</span>
                <span className="text-sm text-muted-foreground">{r.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <InviteDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

const inviteSchema = z.object({ email: z.email("Enter a valid email"), role: z.enum(["admin", "manager", "staff"]) });

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const invite = useInviteMember();
  const form = useForm<z.infer<typeof inviteSchema>>({ resolver: zodResolver(inviteSchema), defaultValues: { email: "", role: "staff" } });
  const err = form.formState.errors;

  const onSubmit = form.handleSubmit((v) =>
    invite.mutate(v, {
      onSuccess: () => {
        toast.success(`Invitation sent to ${v.email}`);
        form.reset();
        onOpenChange(false);
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>They&apos;ll get an email with a link to join your organization.</DialogDescription>
        </DialogHeader>
        <form id="invite-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={!!err.email}>
              <FieldLabel htmlFor="invite-email">Email address</FieldLabel>
              <Input id="invite-email" type="email" placeholder="name@company.com" {...form.register("email")} />
              <FieldError errors={[err.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <SimpleSelect
                    id="invite-role"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={roles.filter((r) => r.value !== "owner").map((r) => ({ value: r.value, label: r.label }))}
                  />
                )}
              />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="invite-form" disabled={invite.isPending}>
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
