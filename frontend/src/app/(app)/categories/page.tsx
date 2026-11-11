import type { Metadata } from "next";
import { CategoryList } from "@/features/products/category-list";

export const metadata: Metadata = { title: "Categories" };

export default function Page() {
  return <CategoryList />;
}
