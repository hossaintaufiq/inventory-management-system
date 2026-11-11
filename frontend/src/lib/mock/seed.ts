// Deterministic seed data. A fixed PRNG seed and a fixed "now" keep server and
// client renders identical (no hydration mismatches) and screenshots stable.
// Replaced wholesale by real API calls once the backend exists.

import type {
  AdjustmentReason,
  Category,
  Customer,
  Notification,
  Organization,
  Product,
  PurchaseOrder,
  PurchaseOrderStatus,
  SalesOrder,
  SalesOrderStatus,
  StockAdjustment,
  StockLevel,
  StockMovement,
  StockTransfer,
  Supplier,
  TeamMember,
  Warehouse,
} from "@/types";

export const NOW = new Date("2026-11-11T10:00:00Z");

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261111);
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const round2 = (n: number) => Math.round(n * 100) / 100;
const daysAgo = (d: number, h = int(8, 18)) => {
  const date = new Date(NOW);
  date.setUTCDate(date.getUTCDate() - d);
  date.setUTCHours(h, int(0, 59), 0, 0);
  return date.toISOString();
};
const pad = (n: number, w = 4) => String(n).padStart(w, "0");

// ---------------------------------------------------------------- catalog

const catalog: Record<string, { prefix: string; items: [string, number][] }> = {
  Electronics: {
    prefix: "ELC",
    items: [
      ["Wireless Earbuds Pro", 39], ["USB-C Charging Cable 2m", 3.5], ["Bluetooth Speaker Mini", 22],
      ["27\" 4K Monitor", 210], ["Mechanical Keyboard", 48], ["Wireless Mouse", 12],
      ["Power Bank 20,000mAh", 18], ["HDMI 2.1 Cable", 6],
    ],
  },
  Apparel: {
    prefix: "APP",
    items: [
      ["Organic Cotton T-Shirt", 6], ["Slim Fit Chinos", 14], ["Merino Wool Sweater", 32],
      ["Rain Jacket", 28], ["Running Socks (3-pack)", 4],
    ],
  },
  "Home & Kitchen": {
    prefix: "HMK",
    items: [
      ["Ceramic Pour-Over Set", 15], ["Cast Iron Skillet 10\"", 17], ["Bamboo Cutting Board", 7],
      ["Glass Storage Jars (6)", 11], ["Linen Napkins (4)", 9],
    ],
  },
  "Office Supplies": {
    prefix: "OFS",
    items: [
      ["A5 Dotted Notebook", 3], ["Gel Pens (10-pack)", 4], ["Desk Organizer", 9],
      ["Ergonomic Chair Cushion", 13],
    ],
  },
  "Health & Beauty": {
    prefix: "HLB",
    items: [
      ["Vitamin C Serum 30ml", 8], ["Bamboo Toothbrush (4)", 2.5], ["SPF 50 Sunscreen", 6],
      ["Natural Deodorant", 3.5],
    ],
  },
  "Sports & Outdoors": {
    prefix: "SPO",
    items: [
      ["Yoga Mat 6mm", 12], ["Insulated Water Bottle 1L", 7], ["Resistance Bands Set", 6],
      ["Trekking Poles", 19], ["Camping Lantern", 10],
    ],
  },
  "Food & Beverage": {
    prefix: "FNB",
    items: [
      ["Single-Origin Coffee 1kg", 14], ["Matcha Powder 100g", 9], ["Dark Chocolate Bar", 1.4],
      ["Raw Honey 500g", 5],
    ],
  },
  "Tools & Hardware": {
    prefix: "TLH",
    items: [
      ["Cordless Drill 18V", 58], ["Precision Screwdriver Set", 11], ["Tape Measure 8m", 4],
      ["LED Work Light", 15],
    ],
  },
};

export const categories: Category[] = Object.keys(catalog).map((name, i) => ({
  id: `cat_${i + 1}`,
  name,
  description: `${name} products`,
  productCount: catalog[name].items.length,
}));

const units = ["pcs", "pcs", "pcs", "box", "pack"];

export const products: Product[] = [];
Object.entries(catalog).forEach(([catName, { prefix, items }]) => {
  const cat = categories.find((c) => c.name === catName)!;
  items.forEach(([name, cost], i) => {
    const margin = 1.4 + rand() * 0.9;
    products.push({
      id: `prd_${products.length + 1}`,
      sku: `${prefix}-${pad(100 + i * 7 + int(0, 6))}`,
      name,
      description: `${name} — part of the ${catName.toLowerCase()} range.`,
      categoryId: cat.id,
      unit: pick(units),
      barcode: String(int(100000000, 999999999)) + String(int(1000, 9999)),
      costPrice: cost,
      sellPrice: round2(cost * margin),
      reorderPoint: pick([10, 15, 20, 25, 40, 50]),
      stock: 0,
      status: rand() > 0.94 ? "archived" : "active",
      createdAt: daysAgo(int(60, 600)),
    });
  });
});

// ------------------------------------------------------------- warehouses

export const warehouses: Warehouse[] = [
  { id: "wh_1", name: "Main Warehouse", code: "MAIN", address: "120 Harbor Rd", city: "Seattle", manager: "Priya Nair", capacity: 12000, isDefault: true },
  { id: "wh_2", name: "East Fulfillment", code: "EAST", address: "48 Commerce Ave", city: "Newark", manager: "Daniel Okafor", capacity: 8000, isDefault: false },
  { id: "wh_3", name: "Retail Backroom", code: "RTL", address: "9 Market St", city: "Portland", manager: "Sofia Martins", capacity: 2500, isDefault: false },
];

export const stockLevels: StockLevel[] = [];
products.forEach((p, idx) => {
  warehouses.forEach((w, wi) => {
    let qty = wi === 0 ? int(0, 260) : wi === 1 ? int(0, 140) : int(0, 40);
    // Make a handful of products deliberately low / out of stock.
    if (idx % 9 === 3) qty = wi === 0 ? int(1, Math.max(2, p.reorderPoint - 4)) : 0;
    if (idx % 13 === 5) qty = 0;
    stockLevels.push({ productId: p.id, warehouseId: w.id, quantity: qty });
  });
  p.stock = stockLevels
    .filter((s) => s.productId === p.id)
    .reduce((sum, s) => sum + s.quantity, 0);
});

// --------------------------------------------------------------- contacts

const companyNames = [
  "Northwind Traders", "Bluebird Supply Co.", "Summit Wholesale", "Pacific Goods Ltd", "Evergreen Imports",
  "Atlas Distribution", "Brightline Manufacturing", "Harbor & Pine", "Copperleaf Partners", "Redwood Sourcing",
];
const customerNames = [
  "Maple Street Market", "Urban Nest Home", "Peak Performance Gym", "The Corner Café", "Lumen Studio",
  "Greenfield Grocers", "Oak & Ember", "Nomad Outfitters", "Brightside Pharmacy", "Coastline Retail",
  "Little Fox Boutique", "Metro Office Hub", "Riverbend Hardware", "Willow Wellness", "Skyline Sports",
];
const people = [
  "Ava Thompson", "Liam Chen", "Noah Patel", "Emma Rossi", "Mia Johansson", "Lucas Silva", "Zara Ahmed",
  "Ethan Brooks", "Chloe Dubois", "Omar Haddad", "Grace Kim", "Leo Novak", "Isla Murphy", "Ravi Shah",
];
const places: [string, string][] = [
  ["Seattle", "US"], ["Austin", "US"], ["Toronto", "CA"], ["Chicago", "US"], ["London", "GB"],
  ["Denver", "US"], ["Vancouver", "CA"], ["Boston", "US"], ["Dublin", "IE"], ["Sydney", "AU"],
];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 14);

export const suppliers: Supplier[] = companyNames.map((name, i) => {
  const [city, country] = pick(places);
  const person = pick(people);
  return {
    id: `sup_${i + 1}`,
    name,
    contactPerson: person,
    email: `${person.split(" ")[0].toLowerCase()}@${slug(name)}.com`,
    phone: `+1 (${int(200, 989)}) ${int(200, 989)}-${pad(int(0, 9999))}`,
    city,
    country,
    leadTimeDays: pick([3, 5, 7, 10, 14, 21]),
    totalOrders: 0,
    totalSpent: 0,
    createdAt: daysAgo(int(200, 700)),
  };
});

export const customers: Customer[] = customerNames.map((name, i) => {
  const [city, country] = pick(places);
  const person = pick(people);
  return {
    id: `cus_${i + 1}`,
    name,
    contactPerson: person,
    email: `${person.split(" ")[0].toLowerCase()}@${slug(name)}.com`,
    phone: `+1 (${int(200, 989)}) ${int(200, 989)}-${pad(int(0, 9999))}`,
    city,
    country,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: daysAgo(int(30, 500)),
  };
});

// ----------------------------------------------------------------- orders

const TAX_RATE = 0.08;
const activeProducts = products.filter((p) => p.status === "active");

function makeLines(priceOf: (p: Product) => number, maxQty: number) {
  const count = int(1, 4);
  const chosen = new Set<Product>();
  while (chosen.size < count) chosen.add(pick(activeProducts));
  return [...chosen].map((p) => ({
    productId: p.id,
    quantity: int(2, maxQty),
    unitPrice: priceOf(p),
  }));
}

function totals(lines: { quantity: number; unitPrice: number }[]) {
  const subtotal = round2(lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0));
  const tax = round2(subtotal * TAX_RATE);
  return { subtotal, tax, total: round2(subtotal + tax) };
}

function poStatus(age: number): PurchaseOrderStatus {
  if (age < 4) return pick(["draft", "ordered"] as const);
  if (age < 14) return pick(["ordered", "partially_received", "received"] as const);
  return rand() > 0.93 ? "cancelled" : "received";
}

function soStatus(age: number): SalesOrderStatus {
  if (age < 2) return pick(["draft", "confirmed"] as const);
  if (age < 5) return pick(["confirmed", "packed", "shipped"] as const);
  if (age < 10) return pick(["shipped", "delivered"] as const);
  return rand() > 0.95 ? "cancelled" : "delivered";
}

export const purchaseOrders: PurchaseOrder[] = Array.from({ length: 64 }, (_, i) => {
  const age = Math.floor(Math.pow(rand(), 1.3) * 360);
  const lines = makeLines((p) => p.costPrice, 120);
  const supplier = pick(suppliers);
  const createdAt = daysAgo(age);
  const expected = new Date(createdAt);
  expected.setUTCDate(expected.getUTCDate() + supplier.leadTimeDays);
  return {
    id: `po_${i + 1}`,
    number: "",
    supplierId: supplier.id,
    warehouseId: pick(warehouses).id,
    lines,
    ...totals(lines),
    status: poStatus(age),
    createdAt,
    expectedAt: expected.toISOString(),
  };
})
  .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  .map((po, i) => ({ ...po, number: `PO-${pad(1001 + i)}` }))
  .reverse();

export const salesOrders: SalesOrder[] = Array.from({ length: 180 }, (_, i) => {
  // Skew towards recent dates and add gentle growth over the year.
  const age = Math.floor(Math.pow(rand(), 1.15) * 360);
  const lines = makeLines((p) => p.sellPrice, 24);
  return {
    id: `so_${i + 1}`,
    number: "",
    customerId: pick(customers).id,
    warehouseId: pick(warehouses).id,
    lines,
    ...totals(lines),
    status: soStatus(age),
    createdAt: daysAgo(age),
  };
})
  .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  .map((so, i) => ({ ...so, number: `SO-${pad(2001 + i)}` }))
  .reverse();

purchaseOrders.forEach((po) => {
  if (po.status === "cancelled" || po.status === "draft") return;
  const s = suppliers.find((x) => x.id === po.supplierId)!;
  s.totalOrders += 1;
  s.totalSpent = round2(s.totalSpent + po.total);
});
salesOrders.forEach((so) => {
  if (so.status === "cancelled" || so.status === "draft") return;
  const c = customers.find((x) => x.id === so.customerId)!;
  c.totalOrders += 1;
  c.totalSpent = round2(c.totalSpent + so.total);
});

// ------------------------------------------------------ inventory activity

const staff = ["Priya Nair", "Daniel Okafor", "Sofia Martins", "Alex Morgan"];
const reasons: AdjustmentReason[] = ["count_correction", "damaged", "expired", "lost", "found", "other"];

export const adjustments: StockAdjustment[] = Array.from({ length: 22 }, (_, i) => {
  const reason = pick(reasons);
  const magnitude = int(1, 12);
  return {
    id: `adj_${i + 1}`,
    number: `ADJ-${pad(301 + i)}`,
    productId: pick(activeProducts).id,
    warehouseId: pick(warehouses).id,
    quantity: reason === "found" || (reason === "count_correction" && rand() > 0.5) ? magnitude : -magnitude,
    reason,
    note: reason === "damaged" ? "Damaged on receipt" : undefined,
    user: pick(staff),
    createdAt: daysAgo(int(0, 90)),
  };
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const transfers: StockTransfer[] = Array.from({ length: 12 }, (_, i) => {
  const from = pick(warehouses);
  const to = pick(warehouses.filter((w) => w.id !== from.id));
  const age = int(0, 60);
  return {
    id: `trf_${i + 1}`,
    number: `TRF-${pad(501 + i)}`,
    fromWarehouseId: from.id,
    toWarehouseId: to.id,
    lines: makeLines(() => 0, 40).map(({ productId, quantity }) => ({ productId, quantity })),
    status: (age < 3 ? pick(["draft", "in_transit"] as const) : rand() > 0.9 ? "cancelled" : "completed") as StockTransfer["status"],
    createdAt: daysAgo(age),
  };
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const movements: StockMovement[] = [];
let mv = 0;
purchaseOrders
  .filter((po) => po.status === "received" || po.status === "partially_received")
  .forEach((po) =>
    po.lines.forEach((l) =>
      movements.push({
        id: `mv_${++mv}`, productId: l.productId, warehouseId: po.warehouseId, type: "purchase",
        quantity: l.quantity, reference: po.number, user: pick(staff), createdAt: po.expectedAt ?? po.createdAt,
      }),
    ),
  );
salesOrders
  .filter((so) => so.status === "shipped" || so.status === "delivered")
  .forEach((so) =>
    so.lines.forEach((l) =>
      movements.push({
        id: `mv_${++mv}`, productId: l.productId, warehouseId: so.warehouseId, type: "sale",
        quantity: -l.quantity, reference: so.number, user: pick(staff), createdAt: so.createdAt,
      }),
    ),
  );
adjustments.forEach((a) =>
  movements.push({
    id: `mv_${++mv}`, productId: a.productId, warehouseId: a.warehouseId, type: "adjustment",
    quantity: a.quantity, reference: a.number, note: a.note, user: a.user, createdAt: a.createdAt,
  }),
);
transfers
  .filter((t) => t.status === "completed")
  .forEach((t) =>
    t.lines.forEach((l) => {
      movements.push({
        id: `mv_${++mv}`, productId: l.productId, warehouseId: t.fromWarehouseId, type: "transfer_out",
        quantity: -l.quantity, reference: t.number, user: pick(staff), createdAt: t.createdAt,
      });
      movements.push({
        id: `mv_${++mv}`, productId: l.productId, warehouseId: t.toWarehouseId, type: "transfer_in",
        quantity: l.quantity, reference: t.number, user: pick(staff), createdAt: t.createdAt,
      });
    }),
  );
movements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

// --------------------------------------------------------- organization

export const organization: Organization = {
  name: "Acme Retail",
  legalName: "Acme Retail Inc.",
  email: "ops@acmeretail.example",
  phone: "+1 (206) 555-0142",
  address: "120 Harbor Rd, Seattle, WA 98101",
  currency: "USD",
  timezone: "America/Los_Angeles",
  taxRate: 8,
  lowStockAlerts: true,
};

export const team: TeamMember[] = [
  { id: "usr_1", name: "Alex Morgan", email: "alex@acmeretail.example", role: "owner", status: "active", lastActiveAt: daysAgo(0) },
  { id: "usr_2", name: "Priya Nair", email: "priya@acmeretail.example", role: "admin", status: "active", lastActiveAt: daysAgo(0) },
  { id: "usr_3", name: "Daniel Okafor", email: "daniel@acmeretail.example", role: "manager", status: "active", lastActiveAt: daysAgo(1) },
  { id: "usr_4", name: "Sofia Martins", email: "sofia@acmeretail.example", role: "staff", status: "active", lastActiveAt: daysAgo(3) },
  { id: "usr_5", name: "Jordan Lee", email: "jordan@acmeretail.example", role: "staff", status: "invited" },
];

export const notifications: Notification[] = [
  { id: "n1", kind: "low_stock", title: "Low stock alert", description: "5 products fell below their reorder point.", createdAt: daysAgo(0, 9), read: false },
  { id: "n2", kind: "order", title: `${purchaseOrders[0].number} is due`, description: "Expected delivery from supplier today.", createdAt: daysAgo(0, 8), read: false },
  { id: "n3", kind: "order", title: `New order ${salesOrders[0].number}`, description: "A new sales order was created.", createdAt: daysAgo(1), read: true },
  { id: "n4", kind: "system", title: "Weekly report ready", description: "Your inventory summary for last week is available.", createdAt: daysAgo(3), read: true },
];
