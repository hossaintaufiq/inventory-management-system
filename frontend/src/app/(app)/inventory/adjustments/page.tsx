import type { Metadata } from "next";
import { AdjustmentList } from "@/features/inventory/adjustment-list";

export const metadata: Metadata = { title: "Stock adjustments" };

export default function Page() {
  return <AdjustmentList />;
}
