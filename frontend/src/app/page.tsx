import Link from "next/link";
import { Boxes } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <Boxes className="size-10" />
      <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
        Inventory management for vendors of every size
      </h1>
      <p className="max-w-md text-muted-foreground">
        Track stock across warehouses, manage purchase and sales orders, and see
        what&apos;s running low before it does.
      </p>
      <div className="flex gap-3">
        <Link href="/register" className={buttonVariants()}>
          Get started
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Sign in
        </Link>
      </div>
    </main>
  );
}
