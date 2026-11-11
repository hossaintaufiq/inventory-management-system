export type Plan = {
  id: "free" | "starter" | "business" | "enterprise";
  name: string;
  price: number | null;
  description: string;
  limits: { skus: string; warehouses: string; users: string };
  features: string[];
  highlighted?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "For makers and side businesses getting organized.",
    limits: { skus: "100 SKUs", warehouses: "1 location", users: "2 users" },
    features: ["Products & stock tracking", "Purchase & sales orders", "Low stock alerts", "CSV import / export"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "For small shops selling across a couple of channels.",
    limits: { skus: "1,000 SKUs", warehouses: "2 locations", users: "5 users" },
    features: ["Everything in Free", "Stock transfers", "Supplier management", "Standard reports"],
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    description: "For growing teams with multiple warehouses.",
    limits: { skus: "2,500 SKUs", warehouses: "10 locations", users: "25 users" },
    features: ["Everything in Starter", "Roles & permissions", "Advanced reports", "Integrations & API access"],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    description: "For large vendors with complex operations.",
    limits: { skus: "Unlimited SKUs", warehouses: "Unlimited locations", users: "Unlimited users" },
    features: ["Everything in Business", "SSO & audit logs", "Dedicated success manager", "99.9% uptime SLA"],
  },
];
