import type { Metadata } from "next";
import { StockLevels } from "@/features/inventory/stock-levels";

export const metadata: Metadata = { title: "Stock levels" };

export default function Page() {
  return <StockLevels />;
}
