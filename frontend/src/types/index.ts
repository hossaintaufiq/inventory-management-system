// Domain types shared by the frontend and (later) the backend API contract.

export type ID = string;

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Category {
  id: ID;
  name: string;
  description?: string;
  productCount: number;
}

export interface Product {
  id: ID;
  sku: string;
  name: string;
  description?: string;
  categoryId: ID;
  unit: string;
  barcode?: string;
  costPrice: number;
  sellPrice: number;
  reorderPoint: number;
  /** Total on-hand quantity across all warehouses. */
  stock: number;
  status: "active" | "archived";
  createdAt: string;
}

export interface Warehouse {
  id: ID;
  name: string;
  code: string;
  address: string;
  city: string;
  manager: string;
  capacity: number;
  isDefault: boolean;
}

export interface StockLevel {
  productId: ID;
  warehouseId: ID;
  quantity: number;
}

export type MovementType =
  | "purchase"
  | "sale"
  | "adjustment"
  | "transfer_in"
  | "transfer_out"
  | "return";

export interface StockMovement {
  id: ID;
  productId: ID;
  warehouseId: ID;
  type: MovementType;
  /** Signed: positive adds stock, negative removes it. */
  quantity: number;
  reference?: string;
  note?: string;
  user: string;
  createdAt: string;
}

export type AdjustmentReason =
  | "count_correction"
  | "damaged"
  | "expired"
  | "lost"
  | "found"
  | "other";

export interface StockAdjustment {
  id: ID;
  number: string;
  productId: ID;
  warehouseId: ID;
  quantity: number;
  reason: AdjustmentReason;
  note?: string;
  user: string;
  createdAt: string;
}

export type TransferStatus = "draft" | "in_transit" | "completed" | "cancelled";

export interface StockTransfer {
  id: ID;
  number: string;
  fromWarehouseId: ID;
  toWarehouseId: ID;
  lines: { productId: ID; quantity: number }[];
  status: TransferStatus;
  createdAt: string;
}

export interface Contact {
  id: ID;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export type Supplier = Contact & { leadTimeDays: number };
export type Customer = Contact;

export interface OrderLine {
  productId: ID;
  quantity: number;
  unitPrice: number;
}

export type PurchaseOrderStatus =
  | "draft"
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled";

export type SalesOrderStatus =
  | "draft"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

interface OrderBase {
  id: ID;
  number: string;
  warehouseId: ID;
  lines: OrderLine[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
  expectedAt?: string;
}

export interface PurchaseOrder extends OrderBase {
  supplierId: ID;
  status: PurchaseOrderStatus;
}

export interface SalesOrder extends OrderBase {
  customerId: ID;
  status: SalesOrderStatus;
}

export type Role = "owner" | "admin" | "manager" | "staff";

export interface TeamMember {
  id: ID;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited";
  lastActiveAt?: string;
}

export interface Organization {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
  taxRate: number;
  lowStockAlerts: boolean;
}

export interface Notification {
  id: ID;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  kind: "low_stock" | "order" | "system";
}
