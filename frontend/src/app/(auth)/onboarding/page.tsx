import type { Metadata } from "next";
import { OnboardingWizard } from "@/features/auth/onboarding-wizard";

export const metadata: Metadata = { title: "Set up your workspace" };

export default function Page() {
  return <OnboardingWizard />;
}
