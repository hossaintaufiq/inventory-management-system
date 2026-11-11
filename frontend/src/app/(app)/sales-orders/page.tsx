import type { Metadata } from "next";
import { OrderList } from "@/features/orders/order-list";

export const metadata: Metadata = { title: "Sales orders" };

export default function Page() {
  return <OrderList kind="sales" />;
}
