import { Suspense } from "react";
import { DetailSkeleton } from "@/components/shared/detail-states";
import { OrderDetail } from "@/features/orders/order-detail";

async function Resolve({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail kind="purchase" id={id} />;
}

export default function Page({ params }: PageProps<"/purchase-orders/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Resolve params={params} />
    </Suspense>
  );
}
