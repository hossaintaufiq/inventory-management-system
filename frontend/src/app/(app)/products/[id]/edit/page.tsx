import { Suspense } from "react";
import { DetailSkeleton } from "@/components/shared/detail-states";
import { EditProduct } from "@/features/products/edit-product";

async function Resolve({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProduct id={id} />;
}

export default function EditProductPage({ params }: PageProps<"/products/[id]/edit">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Resolve params={params} />
    </Suspense>
  );
}
