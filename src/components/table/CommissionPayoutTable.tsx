"use client";

import { useCallback, useMemo, useState } from "react";

import { DataTable } from "@/components/table/ReusableTable";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  NoDataFound,
  StatusBadge,
  FormatDate,
  FormatCurrency,
} from "@/lib/helper";
import { useGetVendorCommissionPayout } from "@/hooks/use-report";
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

interface PayoutHistory {
  id: number;
  uuid: string;
  vendor_id: number;
  period_from: string;
  period_to: string;
  gross_sales: string;
  commission_amount: string;
  refund_adjustments: string;
  net_payable: string;
  commission_rate: string;
  status: string;
  requested_at: string;
  settlement_date: string | null;
  remarks: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
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

const PAYOUT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PAID", label: "Paid" },
  { value: "REJECTED", label: "Rejected" },
];

const DEFAULT_FILTERS = {
  preset: null as string | null,
  payout_status: null as string | null,
};

export default function CommissionPayoutTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isCustomPreset = filters.preset === "custom";

  const { data, isLoading, isError, error } = useGetVendorCommissionPayout({
    page: currentPage,
    preset: filters.preset ?? undefined,
    date_from:
      isCustomPreset && dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
    date_to:
      isCustomPreset && dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : undefined,
    payout_status: filters.payout_status ?? undefined,
  });

  const payouts = useMemo(() => data?.data?.data || [], [data]);
  const totalPages = data?.data?.last_page || 1;
  const totalItems = data?.data?.total || 0;

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

  const hasActiveFilters = filters.preset || filters.payout_status;

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

  const columns: ColumnDef<PayoutHistory>[] = useMemo(
    () => [
      {
        accessorKey: "period_from",
        header: "Period",
        size: 200,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-900">
              {FormatDate(row.original.period_from)}
            </span>
            <span className="text-xs text-gray-500">
              to {FormatDate(row.original.period_to)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "gross_sales",
        header: "Gross Sales",
        size: 140,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-gray-800">
            {FormatCurrency(row.original.gross_sales)}
          </span>
        ),
      },
      {
        accessorKey: "commission_rate",
        header: "Commission Rate",
        size: 140,
        cell: ({ row }) => (
          <span className="tabular-nums text-gray-700">
            {Number(row.original.commission_rate).toFixed(2)}%
          </span>
        ),
      },
      {
        accessorKey: "commission_amount",
        header: "Commission",
        size: 140,
        cell: ({ row }) => (
          <span className="tabular-nums text-red-600 font-medium">
            {FormatCurrency(row.original.commission_amount)}
          </span>
        ),
      },
      {
        accessorKey: "refund_adjustments",
        header: "Refund Adj.",
        size: 130,
        cell: ({ row }) => (
          <span className="tabular-nums text-gray-600">
            {FormatCurrency(row.original.refund_adjustments)}
          </span>
        ),
      },
      {
        accessorKey: "net_payable",
        header: "Net Payable",
        size: 140,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-green-700">
            {FormatCurrency(row.original.net_payable)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "requested_at",
        header: "Requested",
        size: 160,
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {FormatDate(row.original.requested_at)}
          </span>
        ),
      },
      {
        accessorKey: "settlement_date",
        header: "Settled On",
        size: 160,
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.settlement_date
              ? FormatDate(row.original.settlement_date)
              : "—"}
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
              Failed to load payout history
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
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Preset — swaps to calendar trigger when "custom" is selected */}
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

        {/* Status */}
        <SearchSelectField
          placeholder="All Statuses"
          options={PAYOUT_STATUS_OPTIONS}
          value={filters.payout_status}
          onChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              payout_status: v === "" ? null : String(v),
            }))
          }
          searchPlaceholder="Search status..."
          className="w-[155px]"
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

      <DataTable<PayoutHistory, any>
        data={payouts}
        columns={columns}
        loading={isLoading}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: handlePageChange,
          dataCount: totalItems,
        }}
        enableRowSelection
        enableSorting
        enableColumnVisibility
        enableSearch={false}
        totalCount={totalItems}
        noDataText={<NoDataFound />}
      />
    </div>
  );
}
