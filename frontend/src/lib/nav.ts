import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  Building2,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Inventory",
    items: [
      { title: "Products", href: "/products", icon: Package },
      { title: "Categories", href: "/categories", icon: Tags },
      { title: "Stock", href: "/inventory", icon: Boxes },
      { title: "Warehouses", href: "/warehouses", icon: Warehouse },
    ],
  },
  {
    label: "Purchasing",
    items: [
      { title: "Purchase Orders", href: "/purchase-orders", icon: Truck },
      { title: "Suppliers", href: "/suppliers", icon: Building2 },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
      { title: "Customers", href: "/customers", icon: Users },
    ],
  },
];

export const settingsNav: NavItem = { title: "Settings", href: "/settings", icon: Settings };

export const inventoryTabs = [
  { title: "Stock levels", href: "/inventory" },
  { title: "Adjustments", href: "/inventory/adjustments" },
  { title: "Transfers", href: "/inventory/transfers" },
  { title: "Movement history", href: "/inventory/movements" },
];

export const settingsTabs = [
  { title: "General", href: "/settings" },
  { title: "Team", href: "/settings/team" },
  { title: "Billing", href: "/settings/billing" },
  { title: "Integrations", href: "/settings/integrations" },
];

/** Breadcrumb labels for known path segments. */
export const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  reports: "Reports",
  products: "Products",
  categories: "Categories",
  inventory: "Stock",
  adjustments: "Adjustments",
  transfers: "Transfers",
  movements: "Movement history",
  warehouses: "Warehouses",
  "purchase-orders": "Purchase Orders",
  suppliers: "Suppliers",
  "sales-orders": "Sales Orders",
  customers: "Customers",
  settings: "Settings",
  team: "Team",
  billing: "Billing",
  integrations: "Integrations",
  new: "New",
  edit: "Edit",
};
