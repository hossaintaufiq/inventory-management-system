"use client";

import { DetailSkeleton, NotFoundState } from "@/components/shared/detail-states";
import { useProduct } from "@/lib/api/queries";
import { ProductForm } from "./product-form";

export function EditProduct({ id }: { id: string }) {
  const { data, isLoading, isError } = useProduct(id);
  if (isLoading) return <DetailSkeleton />;
  if (isError || !data) return <NotFoundState what="Product" backHref="/products" />;
  return <ProductForm product={data} />;
}
