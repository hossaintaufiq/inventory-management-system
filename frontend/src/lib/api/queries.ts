"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  analyticsApi,
  categoriesApi,
  customersApi,
  productsApi,
  purchaseOrdersApi,
  salesOrdersApi,
  settingsApi,
  stockApi,
  suppliersApi,
  warehousesApi,
} from "./mock-db";

export const keys = {
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,
  categories: ["categories"] as const,
  warehouses: ["warehouses"] as const,
  warehouseSummaries: ["warehouses", "summaries"] as const,
  stockLevels: ["stock", "levels"] as const,
  movements: ["stock", "movements"] as const,
  adjustments: ["stock", "adjustments"] as const,
  transfers: ["stock", "transfers"] as const,
  suppliers: ["suppliers"] as const,
  customers: ["customers"] as const,
  purchaseOrders: ["purchase-orders"] as const,
  purchaseOrder: (id: string) => ["purchase-orders", id] as const,
  salesOrders: ["sales-orders"] as const,
  salesOrder: (id: string) => ["sales-orders", id] as const,
  dashboard: ["analytics", "dashboard"] as const,
  reports: ["analytics", "reports"] as const,
  organization: ["settings", "organization"] as const,
  team: ["settings", "team"] as const,
  notifications: ["notifications"] as const,
};

/** Stock changes ripple everywhere; invalidate every derived view at once. */
function useInvalidateInventory() {
  const qc = useQueryClient();
  return () =>
    Promise.all(
      [keys.products, ["stock"], keys.warehouses, ["analytics"], keys.categories].map((queryKey) =>
        qc.invalidateQueries({ queryKey }),
      ),
    );
}

// ---------------------------------------------------------------- queries

export const useProducts = () => useQuery({ queryKey: keys.products, queryFn: productsApi.list });
export const useProduct = (id: string) =>
  useQuery({ queryKey: keys.product(id), queryFn: () => productsApi.get(id), retry: false });
export const useCategories = () => useQuery({ queryKey: keys.categories, queryFn: categoriesApi.list });
export const useWarehouses = () => useQuery({ queryKey: keys.warehouses, queryFn: warehousesApi.list });
export const useWarehouseSummaries = () =>
  useQuery({ queryKey: keys.warehouseSummaries, queryFn: warehousesApi.summaries });
export const useStockLevels = () => useQuery({ queryKey: keys.stockLevels, queryFn: stockApi.levels });
export const useMovements = () => useQuery({ queryKey: keys.movements, queryFn: stockApi.movements });
export const useAdjustments = () => useQuery({ queryKey: keys.adjustments, queryFn: stockApi.adjustments });
export const useTransfers = () => useQuery({ queryKey: keys.transfers, queryFn: stockApi.transfers });
export const useSuppliers = () => useQuery({ queryKey: keys.suppliers, queryFn: suppliersApi.list });
export const useCustomers = () => useQuery({ queryKey: keys.customers, queryFn: customersApi.list });
export const usePurchaseOrders = () => useQuery({ queryKey: keys.purchaseOrders, queryFn: purchaseOrdersApi.list });
export const usePurchaseOrder = (id: string) =>
  useQuery({ queryKey: keys.purchaseOrder(id), queryFn: () => purchaseOrdersApi.get(id), retry: false, enabled: !!id });
export const useSalesOrders = () => useQuery({ queryKey: keys.salesOrders, queryFn: salesOrdersApi.list });
export const useSalesOrder = (id: string) =>
  useQuery({ queryKey: keys.salesOrder(id), queryFn: () => salesOrdersApi.get(id), retry: false, enabled: !!id });
export const useDashboard = () => useQuery({ queryKey: keys.dashboard, queryFn: analyticsApi.dashboard });
export const useReports = () => useQuery({ queryKey: keys.reports, queryFn: analyticsApi.reports });
export const useOrganization = () => useQuery({ queryKey: keys.organization, queryFn: settingsApi.organization });
export const useTeam = () => useQuery({ queryKey: keys.team, queryFn: settingsApi.team });
export const useNotifications = () => useQuery({ queryKey: keys.notifications, queryFn: settingsApi.notifications });

/** id → entity lookups for rendering names in tables. */
export function useLookups() {
  const products = useProducts().data;
  const warehouses = useWarehouses().data;
  const categories = useCategories().data;
  const suppliers = useSuppliers().data;
  const customers = useCustomers().data;
  return useMemo(
    () => ({
      product: new Map((products ?? []).map((x) => [x.id, x])),
      warehouse: new Map((warehouses ?? []).map((x) => [x.id, x])),
      category: new Map((categories ?? []).map((x) => [x.id, x])),
      supplier: new Map((suppliers ?? []).map((x) => [x.id, x])),
      customer: new Map((customers ?? []).map((x) => [x.id, x])),
    }),
    [products, warehouses, categories, suppliers, customers],
  );
}

// -------------------------------------------------------------- mutations

export function useCreateProduct() {
  const invalidate = useInvalidateInventory();
  return useMutation({ mutationFn: productsApi.create, onSuccess: invalidate });
}

export function useUpdateProduct(id: string) {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (input: Parameters<typeof productsApi.update>[1]) => productsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useArchiveProduct() {
  const invalidate = useInvalidateInventory();
  return useMutation({ mutationFn: productsApi.archive, onSuccess: invalidate });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories }),
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: warehousesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.warehouses }),
  });
}

export function useAdjustStock() {
  const invalidate = useInvalidateInventory();
  return useMutation({ mutationFn: stockApi.adjust, onSuccess: invalidate });
}

export function useTransferStock() {
  const invalidate = useInvalidateInventory();
  return useMutation({ mutationFn: stockApi.transfer, onSuccess: invalidate });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.suppliers }),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.customers }),
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: Parameters<typeof purchaseOrdersApi.create>) => purchaseOrdersApi.create(...args),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.purchaseOrders }),
  });
}

export function useSetPurchaseOrderStatus() {
  const qc = useQueryClient();
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (args: Parameters<typeof purchaseOrdersApi.setStatus>) => purchaseOrdersApi.setStatus(...args),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: keys.purchaseOrders }), invalidate()]),
  });
}

export function useCreateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: Parameters<typeof salesOrdersApi.create>) => salesOrdersApi.create(...args),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.salesOrders }),
  });
}

export function useSetSalesOrderStatus() {
  const qc = useQueryClient();
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (args: Parameters<typeof salesOrdersApi.setStatus>) => salesOrdersApi.setStatus(...args),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: keys.salesOrders }), invalidate()]),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateOrganization,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.organization }),
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: settingsApi.invite, onSuccess: () => qc.invalidateQueries({ queryKey: keys.team }) });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: Parameters<typeof settingsApi.updateRole>) => settingsApi.updateRole(...args),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.team }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: settingsApi.removeMember, onSuccess: () => qc.invalidateQueries({ queryKey: keys.team }) });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications }),
  });
}
