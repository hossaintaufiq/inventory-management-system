import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/layout/sub-nav";
import { inventoryTabs } from "@/lib/nav";

export default function InventoryLayout({ children }: LayoutProps<"/inventory">) {
  return (
    <div className="space-y-6">
      <PageHeader title="Stock" description="Track quantities across locations and every change to them." />
      <SubNav tabs={inventoryTabs} />
      {children}
    </div>
  );
}
