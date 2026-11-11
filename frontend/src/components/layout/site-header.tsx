"use client";

import { Fragment, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Laptop,
  Moon,
  PackagePlus,
  Search,
  ShoppingCart,
  Sun,
  Truck,
  AlertTriangle,
  Info,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { navGroups, segmentLabels, settingsNav } from "@/lib/nav";
import { useMarkNotificationsRead, useNotifications } from "@/lib/api/queries";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

function Crumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {segments.map((seg, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const label = segmentLabels[seg] ?? "Details";
          const last = i === segments.length - 1;
          return (
            <Fragment key={href}>
              {i > 0 ? <BreadcrumbSeparator className="hidden sm:block" /> : null}
              <BreadcrumbItem className={cn(!last && "hidden sm:inline-flex")}>
                {last ? (
                  <BreadcrumbPage className="truncate">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-8 w-8 justify-start gap-2 px-0 text-muted-foreground sm:w-56 sm:px-2.5 max-sm:justify-center"
        aria-label="Search"
      >
        <Search className="size-4" />
        <span className="hidden flex-1 text-left text-sm font-normal sm:inline">Search…</span>
        <kbd className="pointer-events-none hidden h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          Ctrl K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Jump to a page or action">
        <Command>
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick actions">
              <CommandItem onSelect={() => go("/products/new")}>
                <PackagePlus /> New product <CommandShortcut>P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => go("/purchase-orders/new")}>
                <Truck /> New purchase order
              </CommandItem>
              <CommandItem onSelect={() => go("/sales-orders/new")}>
                <ShoppingCart /> New sales order
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigate">
              {[...navGroups.flatMap((g) => g.items), settingsNav].map(({ title, href, icon: Icon }) => (
                <CommandItem key={href} onSelect={() => go(href)}>
                  <Icon /> {title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

function Notifications() {
  const { data = [] } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const unread = data.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unread} unread)`} />}
      >
        <Bell />
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => markRead.mutate()} disabled={!unread}>
            Mark all as read
          </Button>
        </div>
        <ul className="max-h-80 divide-y overflow-y-auto">
          {data.map((n) => {
            const Icon = n.kind === "low_stock" ? AlertTriangle : n.kind === "order" ? Truck : Info;
            return (
              <li key={n.id} className="flex gap-3 px-4 py-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(n.createdAt)}</p>
                </div>
                {!n.read ? <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Toggle theme" />}>
        <Sun className="dark:hidden" />
        <Moon className="hidden dark:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="size-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="size-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="size-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-backdrop-filter:bg-background/70 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4 data-[orientation=vertical]:self-center" />
      <Suspense fallback={null}>
        <Crumbs />
      </Suspense>
      <div className="ml-auto flex items-center gap-1">
        <CommandMenu />
        <Notifications />
        <ThemeToggle />
      </div>
    </header>
  );
}
