import type { Metadata } from "next";
import { TransferList } from "@/features/inventory/transfer-list";

export const metadata: Metadata = { title: "Stock transfers" };

export default function Page() {
  return <TransferList />;
}
