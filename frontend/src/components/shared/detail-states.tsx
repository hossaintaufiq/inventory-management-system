import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export function NotFoundState({ what, backHref }: { what: string; backHref: string }) {
  return (
    <EmptyState
      icon={FileQuestion}
      title={`${what} not found`}
      description="It may have been deleted, or the link is incorrect."
      action={
        <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
          Go back
        </Link>
      }
      className="py-24"
    />
  );
}
