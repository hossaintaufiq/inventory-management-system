import type { Metadata } from "next";
import { WarehouseList } from "@/features/warehouses/warehouse-list";

export const metadata: Metadata = { title: "Warehouses" };

export default function Page() {
  return <WarehouseList />;
}
