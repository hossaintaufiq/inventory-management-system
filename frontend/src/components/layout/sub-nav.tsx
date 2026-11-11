"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Tab = { title: string; href: string };

function Tabs({ tabs, pathname }: { tabs: Tab[]; pathname: string }) {
  // Longest matching prefix wins so "/inventory" isn't active on "/inventory/transfers".
  const active = [...tabs]
    .sort((a, b) => b.href.length - a.href.length)
    .find((t) => pathname === t.href || pathname.startsWith(`${t.href}/`))?.href;

  return (
    <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-1 border-b">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active === t.href ? "page" : undefined}
            className={cn(
              "relative px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
              "after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full",
              active === t.href && "font-medium text-foreground after:bg-primary",
            )}
          >
            {t.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function ActiveTabs({ tabs }: { tabs: Tab[] }) {
  return <Tabs tabs={tabs} pathname={usePathname()} />;
}

/** Underlined section tabs that are real links (one route per tab). */
export function SubNav({ tabs }: { tabs: Tab[] }) {
  return (
    <Suspense fallback={<Tabs tabs={tabs} pathname="" />}>
      <ActiveTabs tabs={tabs} />
    </Suspense>
  );
}
