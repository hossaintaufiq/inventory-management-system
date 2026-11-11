import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/layout/sub-nav";
import { settingsTabs } from "@/lib/nav";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your organization, team and subscription." />
      <SubNav tabs={settingsTabs} />
      <div className="max-w-5xl">{children}</div>
    </div>
  );
}
