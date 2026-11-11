import Link from "next/link";
import { BarChart3, Boxes, Truck } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const highlights = [
  { icon: Boxes, title: "Real-time stock across locations", text: "Know exactly what's on every shelf, in every warehouse." },
  { icon: Truck, title: "Purchasing that runs itself", text: "Reorder points flag what to buy before you run out." },
  { icon: BarChart3, title: "Reports that answer questions", text: "Margins, slow movers and valuation — always up to date." },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10">
        <Link href="/" className="w-fit">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © 2026 Stockly · A product by Softlligence Technologies · <Link href="#" className="hover:underline">Privacy</Link> · <Link href="#" className="hover:underline">Terms</Link>
        </p>
      </div>
      <div className="relative hidden overflow-hidden border-l bg-muted/40 lg:flex lg:flex-col lg:justify-center lg:p-16">
        <div
          aria-hidden
          className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        <div className="relative max-w-md space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight">Inventory control for vendors of every size.</h2>
            <p className="text-muted-foreground">From a single storeroom to a network of warehouses — one place to manage it all.</p>
          </div>
          <ul className="space-y-6">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background shadow-xs">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
