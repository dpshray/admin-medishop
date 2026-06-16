"use client";

import { DataTable } from "@/components/table/ReusableTable";
import { CURRENCY_SYMBOL } from "@/config/app-constant";
import { ColumnDef } from "@tanstack/react-table";

export interface SalesTableRow {
  date: string;
  order_count: number;
  revenue: number;
  refunds: number;
  net: number;
}

export const vendorSalesTableColumns: ColumnDef<SalesTableRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-700 font-medium">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "order_count",
    header: "Orders",
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-700">{getValue<number>()}</span>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-gray-800">
        {`${CURRENCY_SYMBOL} ${getValue<number>()}`}
      </span>
    ),
  },
  {
    accessorKey: "refunds",
    header: "Refunds",
    cell: ({ getValue }) => {
      const val = getValue<number>();
      return (
        <span
          className={`text-sm font-medium ${val > 0 ? "text-red-500" : "text-gray-400"}`}
        >
          {val > 0 ? `-${CURRENCY_SYMBOL} ${val}` : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "net",
    header: "Net",
    cell: ({ getValue }) => (
      <span className="text-sm font-semibold text-emerald-600">
        {`${CURRENCY_SYMBOL} ${getValue<number>()}`}
      </span>
    ),
  },
];

interface Props {
  data?: SalesTableRow[];
  total?: number;
  lastPage?: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function VendorSalesReportTable({
  data = [],
  total = 0,
  lastPage = 1,
  page,
  perPage,
  onPageChange,
  isLoading,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Daily Breakdown</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Per-day orders, revenue, and net earnings
        </p>
      </div>

      <DataTable
        data={data}
        columns={vendorSalesTableColumns}
        loading={isLoading}
        noDataText="No sales data for the selected period."
        searchPlaceholder="Search by date…"
        enableRowSelection={false}
        pagination={{
          page,
          totalPages: lastPage,
          pageSize: perPage,
          dataCount: total,
          onPageChange,
        }}
      />
    </div>
  );
}
