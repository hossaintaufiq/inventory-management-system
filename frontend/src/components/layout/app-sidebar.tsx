"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, CreditCard, LogOut, Plus, Settings, UserRound } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LogoMark } from "@/components/layout/logo";
import { navGroups, settingsNav, type NavItem } from "@/lib/nav";

const orgs = [
  { name: "Acme Retail", plan: "Business" },
  { name: "Acme Wholesale", plan: "Starter" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {items.map(({ title, href, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton
            render={<Link href={href} onClick={() => isMobile && setOpenMobile(false)} />}
            isActive={isActive(pathname, href)}
            tooltip={title}
          >
            <Icon />
            <span>{title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function Navigation({ pathname }: { pathname: string }) {
  return (
    <>
      {navGroups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <NavLinks items={group.items} pathname={pathname} />
        </SidebarGroup>
      ))}
      <SidebarGroup className="mt-auto">
        <NavLinks items={[settingsNav]} pathname={pathname} />
      </SidebarGroup>
    </>
  );
}

// usePathname() is runtime data and must render inside <Suspense> with Cache
// Components; the fallback is the same nav without an active item.
function ActiveNavigation() {
  return <Navigation pathname={usePathname()} />;
}

function OrgSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="data-popup-open:bg-sidebar-accent" />}
          >
            <LogoMark />
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-sm font-semibold">{orgs[0].name}</span>
              <span className="truncate text-xs text-muted-foreground">{orgs[0].plan} plan</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              {orgs.map((o, i) => (
                <DropdownMenuItem key={o.name}>
                  <div className="flex size-6 items-center justify-center rounded-md border text-xs font-medium">
                    {o.name[0]}
                  </div>
                  <span className="flex-1">{o.name}</span>
                  {i === 0 ? <Check className="size-4" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="size-4" />
              Create organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UsageCard() {
  return (
    <div className="rounded-lg border bg-background p-3 text-xs group-data-[collapsible=icon]:hidden">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">SKU usage</span>
        <span className="text-muted-foreground tabular">39 / 2,500</span>
      </div>
      <Progress value={(39 / 2500) * 100} aria-label="SKU usage" />
    </div>
  );
}

function UserMenu() {
  const router = useRouter();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="data-popup-open:bg-sidebar-accent" />}
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">AM</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Alex Morgan</span>
              <span className="truncate text-xs text-muted-foreground">alex@acmeretail.example</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" side="top" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <UserRound className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings/billing")}>
                <CreditCard className="size-4" /> Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/login")}>
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <Suspense fallback={<Navigation pathname="" />}>
          <ActiveNavigation />
        </Suspense>
      </SidebarContent>
      <SidebarFooter>
        <UsageCard />
        <UserMenu />
        <p className="px-2 pb-1 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          A product by Softlligence Technologies
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
