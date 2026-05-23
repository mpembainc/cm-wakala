import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  SortingState,
  getSortedRowModel,
  PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DataTablePagination } from "./pagination";
import React from "react";
import { router } from "@inertiajs/react";
import { PaginatedResponse } from "@/types";

type ServerPagination = {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  paginated?: PaginatedResponse<TData>;
  textSize?: string;
};

function DataTable<TData, TValue>({
  columns,
  data,
  paginated,
  textSize,
}: DataTableProps<TData, TValue>) {
  const resolvedData = paginated?.data ?? data ?? [];

  const serverPagination: ServerPagination | undefined = 
    (paginated
      ? {
          pageIndex: Math.max(0, (paginated.meta?.current_page ?? 1) - 1),
          pageSize: paginated.meta?.per_page ?? 10,
          pageCount: paginated.meta?.last_page ?? 1,
          total: paginated.meta?.total ?? (paginated.data?.length ?? 0),
        }
      : undefined);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [pagination, setPagination] = React.useState<PaginationState>(() => ({
    pageIndex: serverPagination?.pageIndex ?? 0,
    pageSize: serverPagination?.pageSize ?? 10,
  }));

  React.useEffect(() => {
    if (!serverPagination) return;

    setPagination({
      pageIndex: serverPagination.pageIndex,
      pageSize: serverPagination.pageSize,
    });
  }, [serverPagination?.pageIndex, serverPagination?.pageSize]);

  const table = useReactTable({
    data: resolvedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(serverPagination
      ? {}
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
      setPagination((current) => {
        const next = typeof updater === "function" ? updater(current) : updater;
        if (!serverPagination) return next;
        // If the user changes page size, reset to the first page.
        const normalizedNext =
          next.pageSize !== current.pageSize
            ? { ...next, pageIndex: 0 }
            : next;

        const isSame =
          normalizedNext.pageIndex === current.pageIndex &&
          normalizedNext.pageSize === current.pageSize;

        if (!isSame) {
          const params = new URLSearchParams(window.location.search);
          params.set("page", String(normalizedNext.pageIndex + 1));
          params.set("per_page", String(normalizedNext.pageSize));

          router.reload({
            data: Object.fromEntries(params.entries()),
            replace: true,
          });
        }

        return normalizedNext;
      });
    },
    manualPagination: !!serverPagination,
    pageCount: serverPagination?.pageCount,
    state: {
      columnFilters,
      sorting,
      pagination,
    },
  });

  return (
    <>
      <div className="border rounded">
        <Table className={textSize}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='font-semibold! text-gray-700!'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={(cell.column.columnDef.meta as any)?.className}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} totalRows={serverPagination?.total} />
    </>
  );
}

export default DataTable;
