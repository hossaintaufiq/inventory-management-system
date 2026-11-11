import type { Metadata } from "next";
import { ContactList } from "@/features/contacts/contact-list";

export const metadata: Metadata = { title: "Suppliers" };

export default function Page() {
  return <ContactList kind="supplier" />;
}
