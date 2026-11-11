"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Props = { onNavigate?: () => void };

// usePathname() is runtime data; with Cache Components it must sit inside
// <Suspense>. The fallback renders the same nav with no active item.
export function SidebarNav(props: Props) {
  return (
    <Suspense fallback={<NavList pathname="" {...props} />}>
      <ActiveNavList {...props} />
    </Suspense>
  );
}

function ActiveNavList(props: Props) {
  return <NavList pathname={usePathname()} {...props} />;
}

function NavList({ pathname, onNavigate }: Props & { pathname: string }) {
  return (
    <nav className="flex flex-col gap-5 p-3">
      {navGroups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-2 text-xs font-medium text-muted-foreground">
            {group.label}
          </p>
          {group.items.map(({ title, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {title}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
