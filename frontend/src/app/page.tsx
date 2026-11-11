import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Check,
  Layers,
  ScanBarcode,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { plans } from "@/lib/plans";
import { cn } from "@/lib/utils";

const features = [
  { icon: Boxes, title: "Real-time stock levels", text: "Every receipt, sale, transfer and adjustment updates on-hand quantities instantly." },
  { icon: Warehouse, title: "Multi-warehouse", text: "Track stock per location and move it between warehouses in two clicks." },
  { icon: Truck, title: "Purchase orders", text: "Raise POs, receive partial deliveries and keep supplier lead times in view." },
  { icon: Layers, title: "Sales fulfilment", text: "Confirm, pack and ship orders with stock reserved from the right location." },
  { icon: Bell, title: "Low-stock alerts", text: "Reorder points flag what to buy before customers see “out of stock”." },
  { icon: BarChart3, title: "Actionable reports", text: "Valuation, margins and slow movers — exportable to CSV any time." },
  { icon: Users, title: "Roles & permissions", text: "Give owners, managers and floor staff exactly the access they need." },
  { icon: ScanBarcode, title: "SKUs & barcodes", text: "Structured catalog with categories, units and barcode support." },
  { icon: ShieldCheck, title: "Full audit trail", text: "An immutable history of every stock movement and who made it." },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "<200ms", label: "Median response" },
  { value: "14 days", label: "Free trial" },
  { value: "24/7", label: "Support on Business" },
];

function ProductPreview() {
  const bars = [38, 52, 45, 61, 58, 72, 66, 80, 74, 88, 83, 95];
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div aria-hidden className="absolute -inset-x-8 -top-8 -bottom-8 rounded-[2rem] bg-linear-to-b from-primary/10 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/5">
        <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="ml-3 text-xs text-muted-foreground">app.stockly.io/dashboard</span>
        </div>
        <div className="grid grid-cols-[10rem_1fr] max-md:grid-cols-1">
          <div className="space-y-1 border-r p-3 max-md:hidden">
            {["Dashboard", "Products", "Stock", "Warehouses", "Purchase Orders", "Sales Orders", "Reports"].map((n, i) => (
              <div key={n} className={cn("rounded-md px-2 py-1.5 text-xs", i === 0 ? "bg-accent font-medium" : "text-muted-foreground")}>
                {n}
              </div>
            ))}
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["Inventory value", "$184,210"],
                ["Revenue · 30d", "$42,880"],
                ["Orders · 30d", "312"],
                ["To reorder", "7"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border p-3">
                  <p className="text-[11px] text-muted-foreground">{k}</p>
                  <p className="mt-1 text-lg font-semibold tabular">{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs font-medium">Monthly sales</p>
              <div className="mt-4 flex h-32 items-end gap-1.5" aria-hidden>
                {bars.map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-[4px] bg-chart-1" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Sign in
            </Link>
            <Link href="/register" className={buttonVariants()}>
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:px-8">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_65%)]"
          />
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-xs hover:text-foreground"
            >
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">New</span>
              Multi-warehouse transfers are here <ArrowRight className="size-3" />
            </Link>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Inventory management that grows with you
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
              Stockly gives vendors of every size one place to track stock, buy from suppliers, fulfil orders and
              understand what&apos;s selling — across every warehouse.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "h-10 px-5")}>
                Start free trial <ArrowRight />
              </Link>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-5")}>
                View live demo
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">14-day free trial · No credit card required</p>
          </div>
          <ProductPreview />
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Everything in one place</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">From storeroom to multi-site operations</h2>
            <p className="mt-4 text-muted-foreground">
              Start simple with a single location, then switch on transfers, approvals and integrations as you scale.
            </p>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-background p-6">
                <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="mt-4 font-medium">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-primary">Pricing</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Simple plans for every stage</h2>
              <p className="mt-4 text-muted-foreground">Start free. Upgrade when you add locations, SKUs or teammates.</p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex flex-col rounded-xl border bg-card p-6",
                    p.highlighted && "relative ring-2 ring-primary",
                  )}
                >
                  {p.highlighted ? (
                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                      Most popular
                    </span>
                  ) : null}
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-1 min-h-10 text-sm text-muted-foreground">{p.description}</p>
                  <p className="mt-5">
                    {p.price === null ? (
                      <span className="text-3xl font-semibold">Custom</span>
                    ) : (
                      <>
                        <span className="text-3xl font-semibold">${p.price}</span>
                        <span className="text-sm text-muted-foreground"> / month</span>
                      </>
                    )}
                  </p>
                  <Link
                    href={p.price === null ? "#" : "/register"}
                    className={cn(buttonVariants({ variant: p.highlighted ? "default" : "outline" }), "mt-6 h-9 w-full")}
                  >
                    {p.price === null ? "Contact sales" : p.price === 0 ? "Get started" : "Start free trial"}
                  </Link>
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {[p.limits.skus, p.limits.warehouses, p.limits.users, ...p.features].map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
          <dl className="mt-10 divide-y rounded-xl border">
            {[
              ["Can I import my existing products?", "Yes. Upload a CSV of SKUs, prices and opening stock, or connect Shopify and WooCommerce to sync automatically."],
              ["Does it work for multiple warehouses?", "Every plan tracks stock per location. Starter and above add transfers between warehouses."],
              ["Is my data secure?", "Data is encrypted in transit and at rest, isolated per organization, and backed up daily."],
              ["Can I cancel any time?", "Yes. Plans are month-to-month and you can export all of your data at any point."],
            ].map(([q, a]) => (
              <div key={q} className="p-5">
                <dt className="font-medium">{q}</dt>
                <dd className="mt-1.5 text-sm text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">Ready to take control of your inventory?</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-85">Set up your workspace in under five minutes.</p>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-8 h-10 px-5")}
            >
              Start free trial <ArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <Logo />
          <p className="text-center sm:text-right">
            © 2026 Stockly · A product by <span className="font-medium text-foreground">Softlligence Technologies</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
