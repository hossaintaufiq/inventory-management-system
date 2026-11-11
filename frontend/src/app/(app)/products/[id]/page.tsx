import { Suspense } from "react";
import { DetailSkeleton } from "@/components/shared/detail-states";
import { ProductDetail } from "@/features/products/product-detail";

async function Resolve({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Resolve params={params} />
    </Suspense>
  );
}
