import type { Metadata } from "next";
import { TeamSettings } from "@/features/settings/team-settings";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <TeamSettings />;
}
