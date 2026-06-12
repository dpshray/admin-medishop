"use client";

import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/table/ReusableTable";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { NoDataFound } from "@/lib/helper";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/all-hook";
import { useGetVendorPerformanceReport } from "@/hooks/use-report";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import SearchSelectField from "../field/search-select";
import { CURRENCY_SYMBOL } from "@/config/app-constant";
import { DateRange } from "react-day-picker";

interface VendorPerformance {
  rank: number;
  vendor_id: number;
  store_name: string;
  owner_name: string;
  district: string;
  status: "active" | "suspended";
  total_orders: number;
  gmv: number;
  net_revenue: number;
  commission: number;
  fulfillment_rate: number;
  cancellation_rate: number;
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

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

const SORT_BY_OPTIONS = [
  { value: "store_name", label: "Store Name" },
  { value: "total_orders", label: "Total Orders" },
  { value: "gmv", label: "GMV" },
  { value: "net_revenue", label: "Net Revenue" },
  { value: "commission", label: "Commission" },
  { value: "fulfillment_rate", label: "Fulfillment Rate" },
  { value: "cancellation_rate", label: "Cancellation Rate" },
  { value: "return_rate", label: "Return Rate" },
];

const SORT_DIR_OPTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

export default function VendorPerformanceTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isCustomPreset = selectedPreset === "custom";

  const { categories = [] } = useCategories();

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const { data, isLoading, isError, error } = useGetVendorPerformanceReport({
    page: currentPage,
    search: searchQuery || undefined,
    category_id: selectedCategoryId ?? undefined,
    vendor_status: selectedStatus ?? undefined,
    preset: selectedPreset ?? undefined,
    date_from:
      isCustomPreset && dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
    date_to:
      isCustomPreset && dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : undefined,
    sort_by: sortBy ?? undefined,
    sort_dir: sortDir ?? undefined,
  });

  const vendors = useMemo(() => data?.data?.data || [], [data]);
  const totalPages = data?.data?.last_page || 1;
  const totalItems = data?.data?.total || 0;

  const hasActiveFilters =
    selectedCategoryId || selectedStatus || selectedPreset || sortBy || sortDir;

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );

  const handleClearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedStatus(null);
    setSelectedPreset(null);
    setSortBy(null);
    setSortDir(null);
    setDateRange(undefined);
    setCurrentPage(1);
  }, []);

  const columns: ColumnDef<VendorPerformance>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select ${row.original.store_name}`}
            className="mx-auto"
          />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "rank",
        header: "Rank",
        size: 70,
        cell: ({ row }) => (
          <span className="font-bold text-muted-foreground tabular-nums">
            #{row.original.rank}
          </span>
        ),
      },
      {
        accessorKey: "store_name",
        header: "Store",
        size: 200,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-gray-900">
              {row.original.store_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.owner_name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "district",
        header: "District",
        size: 150,
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.district}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 110,
        cell: ({ row }) => (
          <Badge
            className={cn(
              "text-white text-xs",
              row.original.status === "active"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600",
            )}
          >
            {row.original.status === "active" ? "Active" : "Suspended"}
          </Badge>
        ),
      },
      {
        accessorKey: "total_orders",
        header: "Orders",
        size: 100,
        cell: ({ row }) => (
          <span className="tabular-nums font-medium">
            {row.original.total_orders}
          </span>
        ),
      },
      {
        accessorKey: "gmv",
        header: "GMV",
        size: 130,
        cell: ({ row }) => (
          <span className="tabular-nums font-semibold text-green-700">
            {CURRENCY_SYMBOL}{" "}
            {row.original.gmv.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "net_revenue",
        header: "Net Revenue",
        size: 130,
        cell: ({ row }) => (
          <span className="tabular-nums font-semibold">
            {CURRENCY_SYMBOL}{" "}
            {row.original.net_revenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "commission",
        header: "Commission",
        size: 120,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {CURRENCY_SYMBOL}{" "}
            {row.original.commission.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "fulfillment_rate",
        header: "Fulfillment",
        size: 110,
        cell: ({ row }) => {
          const rate = row.original.fulfillment_rate;
          return (
            <Badge
              className={cn(
                "text-white text-xs",
                rate >= 80
                  ? "bg-green-500 hover:bg-green-600"
                  : rate >= 50
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-red-500 hover:bg-red-600",
              )}
            >
              {rate.toFixed(1)}%
            </Badge>
          );
        },
      },
      {
        accessorKey: "cancellation_rate",
        header: "Cancellation",
        size: 110,
        cell: ({ row }) => {
          const rate = row.original.cancellation_rate;
          return (
            <Badge
              className={cn(
                "text-white text-xs",
                rate === 0
                  ? "bg-green-500 hover:bg-green-600"
                  : rate < 10
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-red-500 hover:bg-red-600",
              )}
            >
              {rate.toFixed(1)}%
            </Badge>
          );
        },
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
              Failed to load vendor performance
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
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date preset */}
        {!isCustomPreset ? (
          <SearchSelectField
            placeholder="Date range"
            options={PRESET_OPTIONS}
            value={selectedPreset}
            onChange={(val) => {
              setSelectedPreset(val as string);
              setCurrentPage(1);
            }}
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
                    ? "text-gray-900"
                    : "text-muted-foreground",
                )}
              >
                <CalendarIcon size={14} />
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "MMM d, yyyy")} → ${format(dateRange.to, "MMM d, yyyy")}`
                  : "Pick a range"}
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
                    setTimeout(() => setCalendarOpen(false), 15000);
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
                    setSelectedPreset(null);
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

        {/* Vendor status */}
        <SearchSelectField
          placeholder="All statuses"
          options={STATUS_OPTIONS}
          value={selectedStatus}
          onChange={(val) => {
            setSelectedStatus(val as string);
            setCurrentPage(1);
          }}
          className="w-[150px]"
        />

        {/* Category */}
        <SearchSelectField
          placeholder="All categories"
          options={categoryOptions}
          value={selectedCategoryId}
          onChange={(val) => {
            setSelectedCategoryId(val === "" ? null : Number(val));
            setCurrentPage(1);
          }}
          searchPlaceholder="Search categories..."
          className="w-[180px]"
        />

        {/* Sort by */}
        <SearchSelectField
          placeholder="Sort by"
          options={SORT_BY_OPTIONS}
          value={sortBy}
          onChange={(val) => {
            setSortBy(val as string);
            setCurrentPage(1);
          }}
          className="w-[160px]"
        />

        {/* Sort direction */}
        {sortBy && (
          <SearchSelectField
            placeholder="Direction"
            options={SORT_DIR_OPTIONS}
            value={sortDir}
            onChange={(val) => {
              setSortDir(val as string);
              setCurrentPage(1);
            }}
            className="w-[140px]"
          />
        )}

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <DataTable<VendorPerformance, any>
        data={vendors}
        columns={columns}
        loading={isLoading}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: handlePageChange,
          dataCount: totalItems,
        }}
        onSearchAction={handleSearch}
        enableRowSelection
        enableSorting
        enableSearch
        enableColumnVisibility
        searchPlaceholder="Search by store name..."
        totalCount={totalItems}
        noDataText={<NoDataFound />}
      />
    </div>
  );
}
