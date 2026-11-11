// In-memory mock backend. Every function is async and returns plain data so
// swapping to the real REST API later only means changing this file.

import * as db from "@/lib/mock/seed";
import { stockStatus } from "@/lib/format";
import type {
  AdjustmentReason,
  Category,
  Contact,
  Customer,
  Organization,
  Product,
  PurchaseOrder,
  PurchaseOrderStatus,
  Role,
  SalesOrder,
  SalesOrderStatus,
  StockMovement,
  Supplier,
  TeamMember,
  Warehouse,
} from "@/types";

const LATENCY = 350;
const delay = <T,>(value: T, ms = LATENCY) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));

let seq = 1000;
const uid = (prefix: string) => `${prefix}_${++seq}`;
const nowIso = () => new Date().toISOString();
const round2 = (n: number) => Math.round(n * 100) / 100;

class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`);
  }
}

// ------------------------------------------------------------- stock core

function recomputeProductStock(productId: string) {
  const p = db.products.find((x) => x.id === productId);
  if (!p) return;
  p.stock = db.stockLevels
    .filter((s) => s.productId === productId)
    .reduce((sum, s) => sum + s.quantity, 0);
}

function applyStock(
  productId: string,
  warehouseId: string,
  delta: number,
  type: StockMovement["type"],
  reference?: string,
  note?: string,
) {
  let level = db.stockLevels.find((s) => s.productId === productId && s.warehouseId === warehouseId);
  if (!level) {
    level = { productId, warehouseId, quantity: 0 };
    db.stockLevels.push(level);
  }
  level.quantity = Math.max(0, level.quantity + delta);
  recomputeProductStock(productId);
  db.movements.unshift({
    id: uid("mv"),
    productId,
    warehouseId,
    type,
    quantity: delta,
    reference,
    note,
    user: "Alex Morgan",
    createdAt: nowIso(),
  });
}

// --------------------------------------------------------------- products

export type ProductInput = Omit<Product, "id" | "stock" | "createdAt"> & {
  initialStock?: { warehouseId: string; quantity: number }[];
};

export const productsApi = {
  list: () => delay(db.products),
  get: (id: string) => {
    const p = db.products.find((x) => x.id === id);
    return p ? delay(p) : Promise.reject(new NotFoundError("Product"));
  },
  create: (input: ProductInput) => {
    const { initialStock, ...rest } = input;
    const product: Product = { ...rest, id: uid("prd"), stock: 0, createdAt: nowIso() };
    db.products.unshift(product);
    initialStock?.forEach((s) => s.quantity > 0 && applyStock(product.id, s.warehouseId, s.quantity, "adjustment", undefined, "Opening stock"));
    const cat = db.categories.find((c) => c.id === product.categoryId);
    if (cat) cat.productCount += 1;
    return delay(product);
  },
  update: (id: string, input: Partial<ProductInput>) => {
    const p = db.products.find((x) => x.id === id);
    if (!p) return Promise.reject(new NotFoundError("Product"));
    const rest = { ...input };
    delete rest.initialStock;
    Object.assign(p, rest);
    return delay(p);
  },
  archive: (id: string) => {
    const p = db.products.find((x) => x.id === id);
    if (p) p.status = p.status === "archived" ? "active" : "archived";
    return delay(p);
  },
};

// ------------------------------------------------------------- categories

export const categoriesApi = {
  list: () => delay(db.categories),
  create: (input: Pick<Category, "name" | "description">) => {
    const cat: Category = { ...input, id: uid("cat"), productCount: 0 };
    db.categories.push(cat);
    return delay(cat);
  },
  remove: (id: string) => {
    const i = db.categories.findIndex((c) => c.id === id);
    if (i >= 0 && db.categories[i].productCount === 0) db.categories.splice(i, 1);
    return delay(true);
  },
};

// ------------------------------------------------------------- warehouses

export type WarehouseSummary = Warehouse & { units: number; skus: number; value: number };

export const warehousesApi = {
  list: () => delay(db.warehouses),
  summaries: () =>
    delay(
      db.warehouses.map<WarehouseSummary>((w) => {
        const levels = db.stockLevels.filter((s) => s.warehouseId === w.id && s.quantity > 0);
        return {
          ...w,
          units: levels.reduce((s, l) => s + l.quantity, 0),
          skus: levels.length,
          value: round2(
            levels.reduce((s, l) => s + l.quantity * (db.products.find((p) => p.id === l.productId)?.costPrice ?? 0), 0),
          ),
        };
      }),
    ),
  create: (input: Omit<Warehouse, "id" | "isDefault">) => {
    const w: Warehouse = { ...input, id: uid("wh"), isDefault: false };
    db.warehouses.push(w);
    return delay(w);
  },
};

// ------------------------------------------------------------------ stock

export const stockApi = {
  levels: () => delay(db.stockLevels),
  movements: () => delay(db.movements),
  adjustments: () => delay(db.adjustments),
  transfers: () => delay(db.transfers),
  adjust: (input: { productId: string; warehouseId: string; quantity: number; reason: AdjustmentReason; note?: string }) => {
    const number = `ADJ-${String(301 + db.adjustments.length).padStart(4, "0")}`;
    const adj = { ...input, id: uid("adj"), number, user: "Alex Morgan", createdAt: nowIso() };
    db.adjustments.unshift(adj);
    applyStock(input.productId, input.warehouseId, input.quantity, "adjustment", number, input.note);
    return delay(adj);
  },
  transfer: (input: { fromWarehouseId: string; toWarehouseId: string; lines: { productId: string; quantity: number }[] }) => {
    const number = `TRF-${String(501 + db.transfers.length).padStart(4, "0")}`;
    const t = { ...input, id: uid("trf"), number, status: "completed" as const, createdAt: nowIso() };
    db.transfers.unshift(t);
    input.lines.forEach((l) => {
      applyStock(l.productId, input.fromWarehouseId, -l.quantity, "transfer_out", number);
      applyStock(l.productId, input.toWarehouseId, l.quantity, "transfer_in", number);
    });
    return delay(t);
  },
};

// --------------------------------------------------------------- contacts

export type ContactInput = Pick<Contact, "name" | "contactPerson" | "email" | "phone" | "city" | "country">;

export const suppliersApi = {
  list: () => delay(db.suppliers),
  create: (input: ContactInput & { leadTimeDays: number }) => {
    const s: Supplier = { ...input, id: uid("sup"), totalOrders: 0, totalSpent: 0, createdAt: nowIso() };
    db.suppliers.unshift(s);
    return delay(s);
  },
};

export const customersApi = {
  list: () => delay(db.customers),
  create: (input: ContactInput) => {
    const c: Customer = { ...input, id: uid("cus"), totalOrders: 0, totalSpent: 0, createdAt: nowIso() };
    db.customers.unshift(c);
    return delay(c);
  },
};

// ----------------------------------------------------------------- orders

export type OrderInput = {
  partyId: string;
  warehouseId: string;
  expectedAt?: string;
  notes?: string;
  lines: { productId: string; quantity: number; unitPrice: number }[];
};

function orderTotals(lines: OrderInput["lines"]) {
  const subtotal = round2(lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0));
  const tax = round2((subtotal * db.organization.taxRate) / 100);
  return { subtotal, tax, total: round2(subtotal + tax) };
}

export const purchaseOrdersApi = {
  list: () => delay(db.purchaseOrders),
  get: (id: string) => {
    const po = db.purchaseOrders.find((x) => x.id === id);
    return po ? delay(po) : Promise.reject(new NotFoundError("Purchase order"));
  },
  create: ({ partyId, ...input }: OrderInput, status: PurchaseOrderStatus = "ordered") => {
    const po: PurchaseOrder = {
      ...input,
      ...orderTotals(input.lines),
      id: uid("po"),
      number: `PO-${String(1001 + db.purchaseOrders.length).padStart(4, "0")}`,
      supplierId: partyId,
      status,
      createdAt: nowIso(),
    };
    db.purchaseOrders.unshift(po);
    return delay(po);
  },
  setStatus: (id: string, status: PurchaseOrderStatus) => {
    const po = db.purchaseOrders.find((x) => x.id === id);
    if (!po) return Promise.reject(new NotFoundError("Purchase order"));
    if (status === "received" && po.status !== "received") {
      po.lines.forEach((l) => applyStock(l.productId, po.warehouseId, l.quantity, "purchase", po.number));
    }
    po.status = status;
    return delay(po);
  },
};

export const salesOrdersApi = {
  list: () => delay(db.salesOrders),
  get: (id: string) => {
    const so = db.salesOrders.find((x) => x.id === id);
    return so ? delay(so) : Promise.reject(new NotFoundError("Sales order"));
  },
  create: ({ partyId, ...input }: OrderInput, status: SalesOrderStatus = "confirmed") => {
    const so: SalesOrder = {
      ...input,
      ...orderTotals(input.lines),
      id: uid("so"),
      number: `SO-${String(2001 + db.salesOrders.length).padStart(4, "0")}`,
      customerId: partyId,
      status,
      createdAt: nowIso(),
    };
    db.salesOrders.unshift(so);
    return delay(so);
  },
  setStatus: (id: string, status: SalesOrderStatus) => {
    const so = db.salesOrders.find((x) => x.id === id);
    if (!so) return Promise.reject(new NotFoundError("Sales order"));
    const shippedBefore = so.status === "shipped" || so.status === "delivered";
    if (status === "shipped" && !shippedBefore) {
      so.lines.forEach((l) => applyStock(l.productId, so.warehouseId, -l.quantity, "sale", so.number));
    }
    so.status = status;
    return delay(so);
  },
};

// -------------------------------------------------------------- analytics

const monthKey = (iso: string) => iso.slice(0, 7);
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function last12Months() {
  const out: { key: string; label: string }[] = [];
  const d = new Date(db.NOW);
  d.setUTCDate(1);
  for (let i = 11; i >= 0; i--) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    out.push({
      key: m.toISOString().slice(0, 7),
      label: `${MONTH_LABELS[m.getUTCMonth()]} ${String(m.getUTCFullYear()).slice(2)}`,
    });
  }
  return out;
}

function sumSince(orders: { createdAt: string; total: number; status: string }[], from: Date, to: Date) {
  return orders
    .filter((o) => o.status !== "cancelled" && o.status !== "draft")
    .filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= from.getTime() && t < to.getTime();
    })
    .reduce((s, o) => s + o.total, 0);
}

export const analyticsApi = {
  dashboard: () => {
    const now = db.NOW;
    const d30 = new Date(now.getTime() - 30 * 864e5);
    const d60 = new Date(now.getTime() - 60 * 864e5);
    const end = new Date(now.getTime() + 864e5);

    const revenue = sumSince(db.salesOrders, d30, end);
    const revenuePrev = sumSince(db.salesOrders, d60, d30);
    const ordersNow = db.salesOrders.filter((o) => new Date(o.createdAt) >= d30).length;
    const ordersPrev = db.salesOrders.filter((o) => new Date(o.createdAt) >= d60 && new Date(o.createdAt) < d30).length;

    const active = db.products.filter((p) => p.status === "active");
    const inventoryValue = round2(active.reduce((s, p) => s + p.stock * p.costPrice, 0));
    const lowStock = active.filter((p) => stockStatus(p) !== "in_stock");

    const months = last12Months();
    const trend = months.map(({ key, label }) => ({
      month: label,
      sales: round2(db.salesOrders.filter((o) => o.status !== "cancelled" && o.status !== "draft" && monthKey(o.createdAt) === key).reduce((s, o) => s + o.total, 0)),
      purchases: round2(db.purchaseOrders.filter((o) => o.status !== "cancelled" && o.status !== "draft" && monthKey(o.createdAt) === key).reduce((s, o) => s + o.total, 0)),
    }));

    const valueByCategory = db.categories
      .map((c) => ({
        category: c.name,
        value: round2(active.filter((p) => p.categoryId === c.id).reduce((s, p) => s + p.stock * p.costPrice, 0)),
      }))
      .sort((a, b) => b.value - a.value);

    const health = {
      in_stock: active.filter((p) => stockStatus(p) === "in_stock").length,
      low_stock: active.filter((p) => stockStatus(p) === "low_stock").length,
      out_of_stock: active.filter((p) => stockStatus(p) === "out_of_stock").length,
    };

    return delay({
      kpis: {
        inventoryValue,
        revenue: round2(revenue),
        revenueChange: revenuePrev ? ((revenue - revenuePrev) / revenuePrev) * 100 : 0,
        orders: ordersNow,
        ordersChange: ordersPrev ? ((ordersNow - ordersPrev) / ordersPrev) * 100 : 0,
        lowStock: lowStock.length,
        openPurchaseOrders: db.purchaseOrders.filter((p) => p.status === "ordered" || p.status === "partially_received").length,
        totalUnits: active.reduce((s, p) => s + p.stock, 0),
      },
      trend,
      sparkline: trend.map((t) => ({ v: t.sales })),
      valueByCategory,
      health,
      lowStockItems: lowStock.sort((a, b) => a.stock - b.stock).slice(0, 6),
      recentSales: db.salesOrders.slice(0, 6),
    });
  },
  reports: () => {
    const months = last12Months();
    const sold = new Map<string, { qty: number; revenue: number; cost: number }>();
    db.salesOrders
      .filter((o) => o.status !== "cancelled" && o.status !== "draft")
      .forEach((o) =>
        o.lines.forEach((l) => {
          const p = db.products.find((x) => x.id === l.productId);
          const cur = sold.get(l.productId) ?? { qty: 0, revenue: 0, cost: 0 };
          cur.qty += l.quantity;
          cur.revenue += l.quantity * l.unitPrice;
          cur.cost += l.quantity * (p?.costPrice ?? 0);
          sold.set(l.productId, cur);
        }),
      );

    const productRows = db.products.map((p) => {
      const s = sold.get(p.id) ?? { qty: 0, revenue: 0, cost: 0 };
      return {
        product: p,
        unitsSold: s.qty,
        revenue: round2(s.revenue),
        grossProfit: round2(s.revenue - s.cost),
        margin: s.revenue ? ((s.revenue - s.cost) / s.revenue) * 100 : 0,
        stockValue: round2(p.stock * p.costPrice),
        // Months of cover at the trailing-12-month sell rate.
        cover: s.qty ? (p.stock / (s.qty / 12)) : Infinity,
      };
    });

    const monthly = months.map(({ key, label }) => {
      const orders = db.salesOrders.filter((o) => o.status !== "cancelled" && o.status !== "draft" && monthKey(o.createdAt) === key);
      let cost = 0;
      orders.forEach((o) => o.lines.forEach((l) => (cost += l.quantity * (db.products.find((p) => p.id === l.productId)?.costPrice ?? 0))));
      const revenue = orders.reduce((s, o) => s + o.subtotal, 0);
      return { month: label, revenue: round2(revenue), profit: round2(revenue - cost), orders: orders.length };
    });

    const valueByWarehouse = db.warehouses.map((w) => ({
      warehouse: w.name,
      value: round2(
        db.stockLevels
          .filter((s) => s.warehouseId === w.id)
          .reduce((s, l) => s + l.quantity * (db.products.find((p) => p.id === l.productId)?.costPrice ?? 0), 0),
      ),
    }));

    return delay({ productRows, monthly, valueByWarehouse });
  },
};

// --------------------------------------------------------------- settings

export const settingsApi = {
  organization: () => delay(db.organization),
  updateOrganization: (input: Partial<Organization>) => {
    Object.assign(db.organization, input);
    return delay(db.organization);
  },
  team: () => delay(db.team),
  invite: (input: { email: string; role: Role }) => {
    const m: TeamMember = { id: uid("usr"), name: input.email.split("@")[0], email: input.email, role: input.role, status: "invited" };
    db.team.push(m);
    return delay(m);
  },
  updateRole: (id: string, role: Role) => {
    const m = db.team.find((x) => x.id === id);
    if (m) m.role = role;
    return delay(m);
  },
  removeMember: (id: string) => {
    const i = db.team.findIndex((x) => x.id === id);
    if (i >= 0 && db.team[i].role !== "owner") db.team.splice(i, 1);
    return delay(true);
  },
  notifications: () => delay(db.notifications, 150),
  markAllRead: () => {
    db.notifications.forEach((n) => (n.read = true));
    return delay(true, 100);
  },
};
