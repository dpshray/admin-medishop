"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CURRENCY_SYMBOL } from "@/config/app-constant";

export interface SalesTableRow {
  date: string;
  order_count: number;
  gmv: string;
  // refunds: number;
  // net: string;
  commission: number;
}

const formatNPR = (value: number | string) =>
  `${CURRENCY_SYMBOL} ${Number(value).toLocaleString("en-NP", { minimumFractionDigits: 2 })}`;

export const salesTableColumns: ColumnDef<SalesTableRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="font-medium text-gray-800 tabular-nums">
        {row.original.date}
      </span>
    ),
  },
  {
    accessorKey: "order_count",
    header: "Orders",
    cell: ({ row }) => (
      <Badge variant="secondary" className="tabular-nums font-semibold">
        {row.original.order_count}
      </Badge>
    ),
  },
  {
    accessorKey: "gmv",
    header: "GMV",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium text-gray-800">
        {formatNPR(row.original.gmv)}
      </span>
    ),
  },
  // {
  //   accessorKey: "refunds",
  //   header: "Refunds",
  //   cell: ({ row }) => (
  //     <span
  //       className={`tabular-nums font-medium ${row.original.refunds > 0 ? "text-red-600" : "text-gray-400"}`}
  //     >
  //       {row.original.refunds > 0 ? formatNPR(row.original.refunds) : "—"}
  //     </span>
  //   ),
  // },
  // {
  //   accessorKey: "net",
  //   header: "Net Revenue",
  //   cell: ({ row }) => (
  //     <span className="tabular-nums font-semibold text-emerald-700">
  //       {formatNPR(row.original.net)}
  //     </span>
  //   ),
  // },
  {
    accessorKey: "commission",
    header: "Commission",
    cell: ({ row }) => (
      <span
        className={`tabular-nums font-medium ${row.original.commission > 0 ? "text-indigo-600" : "text-gray-400"}`}
      >
        {row.original.commission > 0 ? formatNPR(row.original.commission) : "—"}
      </span>
    ),
  },
];
