import type { Metadata } from "next";
import { MovementList } from "@/features/inventory/movement-list";

export const metadata: Metadata = { title: "Movement history" };

export default function Page() {
  return <MovementList />;
}
