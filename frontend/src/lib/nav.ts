import {
  LayoutDashboard,
  Package,
  Boxes,
  Warehouse,
  ShoppingCart,
  Truck,
  Users,
  BarChart3,
  Settings,
  Tags,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", href: "/products", icon: Package },
      { title: "Categories", href: "/categories", icon: Tags },
    ],
  },
  {
    label: "Inventory",
    items: [
      { title: "Stock", href: "/inventory", icon: Boxes },
      { title: "Warehouses", href: "/warehouses", icon: Warehouse },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Purchase Orders", href: "/purchase-orders", icon: Truck },
      { title: "Suppliers", href: "/suppliers", icon: Users },
      { title: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
      { title: "Customers", href: "/customers", icon: Users },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports", href: "/reports", icon: BarChart3 },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
