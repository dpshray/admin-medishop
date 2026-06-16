"use client";

import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/table/ReusableTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  NoDataFound,
  StatusBadge,
  FormatDate,
  FormatCurrency,
} from "@/lib/helper";
import { useGetVendorSalesReport } from "@/hooks/use-report";
import SearchSelectField from "@/components/field/search-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface SalesRow {
  date: string;
  order_count: number;
  revenue: number;
  refunds: number;
  net: number;
}

interface SummaryCards {
  my_revenue: number;
  my_orders: number;
  items_sold: number;
  avg_order_value: number;
}

interface TopProduct {
  product_id: string;
  product_name: string;
  units_sold: string;
  revenue: string;
}

interface RevenueTrend {
  label: string;
  revenue: number;
  order_count: number;
}

const PRESET_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const GROUP_BY_OPTIONS = [
  { value: "day", label: "By Day" },
  { value: "week", label: "By Week" },
  { value: "month", label: "By Month" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "PROCESSING", label: "Processing" },
  { value: "READY_FOR_DISPATCH", label: "Ready for Dispatch" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NOT_COMPLETELY_BATCHED", label: "Not Completely Batched" },
];

const PER_PAGE_OPTIONS = [
  { value: 10, label: "10 / page" },
  { value: 25, label: "25 / page" },
  { value: 50, label: "50 / page" },
  { value: 100, label: "100 / page" },
];

const DEFAULT_FILTERS = {
  preset: null as string | null,
  group_by: null as string | null,
  order_status: null as string | null,
};

export default function VendorSalesReportTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isCustomPreset = filters.preset === "custom";

  const { data, isLoading, isError, error } = useGetVendorSalesReport({
    page: currentPage,
    per_page: perPage,
    preset: filters.preset ?? undefined,
    start_date:
      isCustomPreset && dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
    end_date:
      isCustomPreset && dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : undefined,
    group_by: filters.group_by ?? undefined,
    order_status: filters.order_status ?? undefined,
  });

  const tableData = useMemo(() => data?.data?.table?.data || [], [data]);
  const totalPages = useMemo(() => data?.data?.table?.last_page || 1, [data]);
  const totalItems = useMemo(() => data?.data?.table?.total || 0, [data]);
  const summary: SummaryCards | undefined = data?.data?.summary_cards;
  const topProducts: TopProduct[] = useMemo(
    () => data?.data?.charts?.top_products || [],
    [data],
  );
  const revenueTrend: RevenueTrend[] = useMemo(
    () => data?.data?.charts?.revenue_trend || [],
    [data],
  );

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );

  const handlePresetChange = useCallback((value: string | number) => {
    const v = value === "" ? null : String(value);
    setFilters((prev) => ({ ...prev, preset: v }));
    if (v !== "custom") setDateRange(undefined);
    if (v === "custom") setCalendarOpen(true);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    filters.preset || filters.group_by || filters.order_status;

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDateRange(undefined);
    setCurrentPage(1);
  }, []);

  const calendarTriggerLabel = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM d")} → ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    return "Pick a range";
  }, [dateRange]);

  const columns: ColumnDef<SalesRow>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        size: 160,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-900">
            {FormatDate(row.original.date)}
          </span>
        ),
      },
      {
        accessorKey: "order_count",
        header: "Orders",
        size: 100,
        cell: ({ row }) => (
          <span className="tabular-nums font-medium text-gray-800">
            {row.original.order_count}
          </span>
        ),
      },
      {
        accessorKey: "revenue",
        header: "Revenue",
        size: 140,
        cell: ({ row }) => (
          <span className="tabular-nums font-semibold text-green-700">
            {FormatCurrency(row.original.revenue)}
          </span>
        ),
      },
      {
        accessorKey: "refunds",
        header: "Refunds",
        size: 130,
        cell: ({ row }) => (
          <span className="tabular-nums text-red-500">
            {FormatCurrency(row.original.refunds)}
          </span>
        ),
      },
      {
        accessorKey: "net",
        header: "Net",
        size: 140,
        cell: ({ row }) => (
          <span className="tabular-nums font-semibold text-gray-900">
            {FormatCurrency(row.original.net)}
          </span>
        ),
      },
    ],
    [],
  );

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Failed to load sales report
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "My Revenue",
              value: FormatCurrency(summary.my_revenue),
              color: "text-green-700",
            },
            {
              label: "My Orders",
              value: summary.my_orders,
              color: "text-blue-700",
            },
            {
              label: "Items Sold",
              value: summary.items_sold,
              color: "text-purple-700",
            },
            {
              label: "Avg Order Value",
              value: FormatCurrency(summary.avg_order_value),
              color: "text-orange-700",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p
                className={cn(
                  "mt-1 text-xl font-bold tabular-nums",
                  card.color,
                )}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Top Products
          </h3>
          <div className="space-y-2">
            {topProducts.map((p) => (
              <div
                key={p.product_id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700 truncate max-w-[60%]">
                  {p.product_name}
                </span>
                <div className="flex gap-4 text-right">
                  <span className="text-muted-foreground">
                    {p.units_sold} units
                  </span>
                  <span className="font-medium text-green-700">
                    {FormatCurrency(p.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Preset */}
        {!isCustomPreset ? (
          <SearchSelectField
            placeholder="Date range"
            options={PRESET_OPTIONS}
            value={filters.preset}
            onChange={handlePresetChange}
            searchPlaceholder="Search presets..."
            className="w-[160px]"
          />
        ) : (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 gap-2 text-sm font-normal",
                  dateRange?.from && dateRange?.to
                    ? "border-[#4a358e] text-[#4a358e]"
                    : "text-muted-foreground",
                )}
              >
                <CalendarIcon size={14} />
                {calendarTriggerLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (range?.from && range?.to) {
                    setCurrentPage(1);
                    setCalendarOpen(false);
                  }
                }}
                numberOfMonths={2}
                initialFocus
              />
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, preset: null }));
                    setDateRange(undefined);
                    setCalendarOpen(false);
                  }}
                >
                  ← Back to presets
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Group By */}
        <SearchSelectField
          placeholder="Group by"
          options={GROUP_BY_OPTIONS}
          value={filters.group_by}
          onChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              group_by: v === "" ? null : String(v),
            }))
          }
          className="w-[130px]"
        />

        {/* Order Status */}
        <SearchSelectField
          placeholder="Order status"
          options={ORDER_STATUS_OPTIONS}
          value={filters.order_status}
          onChange={(v) => {
            setFilters((prev) => ({
              ...prev,
              order_status: v === "" ? null : String(v),
            }));
            setCurrentPage(1);
          }}
          searchPlaceholder="Search status..."
          className="w-[190px]"
        />

        {/* Per Page */}
        <SearchSelectField
          placeholder="25 / page"
          options={PER_PAGE_OPTIONS}
          value={perPage}
          onChange={(v) => {
            setPerPage(Number(v));
            setCurrentPage(1);
          }}
          className="w-[130px]"
        />

        {/* Clear */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable<SalesRow, any>
        data={tableData}
        columns={columns}
        loading={isLoading}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: handlePageChange,
          dataCount: totalItems,
        }}
        enableRowSelection={false}
        enableSorting
        enableColumnVisibility
        enableSearch={false}
        totalCount={totalItems}
        noDataText={<NoDataFound />}
      />
    </div>
  );
}
