import type { Metadata } from "next";
import { BillingSettings } from "@/features/settings/billing-settings";

export const metadata: Metadata = { title: "Billing" };

export default function Page() {
  return <BillingSettings />;
}
