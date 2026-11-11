import type { Metadata } from "next";
import { OrderForm } from "@/features/orders/order-form";

export const metadata: Metadata = { title: "New sales order" };

export default function Page() {
  return <OrderForm kind="sales" />;
}
