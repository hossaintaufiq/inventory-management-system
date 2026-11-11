"use client";

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type SortingState,
  type RowData,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

// One stable feature registry for every table in the app (TanStack Table v9).
export const tableFeatureSet = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, datetime: sortFn_datetime, basic: sortFn_basic },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

type Features = typeof tableFeatureSet;

/** Column list type for DataTable. TValue is left open per column. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Columns<T extends RowData> = ColumnDef<Features, T, any>[];
export const columnHelper = <T extends RowData>() => createColumnHelper<Features, T>();

const EMPTY: never[] = [];

export function SortableHeader<T extends RowData>({
  column,
  title,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<Features, T, any>;
  title: string;
  className?: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp className="size-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ChevronsUpDown className="size-3.5 opacity-50" />
      )}
    </button>
  );
}

export function DataTable<T extends RowData>({
  columns,
  data,
  isLoading,
  searchPlaceholder = "Search…",
  toolbar,
  onRowClick,
  pageSize = 10,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting your search or filters.",
  initialSorting = [],
  hideSearch,
}: {
  columns: Columns<T>;
  data: T[] | undefined;
  isLoading?: boolean;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  initialSorting?: SortingState;
  hideSearch?: boolean;
}) {
  const table = useTable({
    features: tableFeatureSet,
    columns,
    data: data ?? (EMPTY as T[]),
    globalFilterFn: "includesString",
    initialState: { sorting: initialSorting, pagination: { pageIndex: 0, pageSize } },
  });

  const globalFilter = (table.state.globalFilter as string | undefined) ?? "";
  const { pageIndex } = table.state.pagination;
  const rows = table.getRowModel().rows;
  const total = table.getPrePaginatedRowModel().rows.length;
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(total, (pageIndex + 1) * pageSize);
  const colCount = columns.length;

  return (
    <div className="space-y-3">
      {!hideSearch || toolbar ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {!hideSearch ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
                aria-label="Search table"
              />
            </div>
          ) : null}
          {toolbar ? <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{toolbar}</div> : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn("h-10 text-xs font-medium text-muted-foreground", header.column.columnDef.meta?.className)}
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {Array.from({ length: colCount }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-36" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={cn("py-2.5", cell.column.columnDef.meta?.className)}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && total > pageSize ? (
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="tabular">
            {from}–{to} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            <span className="px-2 tabular">
              {pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
