"use client";

import { useState, useCallback, useEffect } from "react";
import { SalesSummaryCards } from "./components/SalesSummaryCards";
import { SalesCharts } from "./components/SalesCharts";
import {
  SalesFiltersBar,
  type SalesFilters,
} from "./components/SalesFiltersBar";
import { useGetAdminSalesReport } from "@/hooks/use-report";
import { Clock } from "lucide-react";
import { DataTable } from "@/components/table/ReusableTable";
import { salesTableColumns } from "./components/salesTableColumns";
import { FormatDate } from "@/lib/helper";

export default function AdminSalesReportPage() {
  const [filters, setFilters] = useState<SalesFilters>({
    preset: "last_30_days",
  });
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);

  const { data, isLoading } = useGetAdminSalesReport({
    preset: filters.preset,
    date_from: filters.date_from,
    date_to: filters.date_to,
    vendor_id: filters.vendor_id,
    category_id: filters.category_id,
    district: filters.district,
    payment_method: filters.payment_method,
    status: filters.status,
    page,
    per_page: perPage,
  });

  const handleFilterChange = useCallback((partial: Partial<SalesFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1); // reset to page 1 on filter change
  }, []);

  const handleExport = useCallback(
    (format: "xlsx" | "csv") => {
      // TODO: call export endpoint with current filters
      // console.log("export", format, filters);
    },
    [filters],
  );

  const tableData = data?.table.data ?? [];
  const totalPages = data?.table.last_page ?? 1;
  const totalCount = data?.table.total ?? 0;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sales Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Platform-wide sales performance
          </p>
        </div>
        {data?.meta && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={12} />
            <span>
              {data.meta.data_freshness === "real_time"
                ? "Real-time"
                : "Cached"}{" "}
              · Generated {FormatDate(data.meta.generated_at)}
            </span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <SalesSummaryCards data={data?.summary_cards} isLoading={isLoading} />

      {/* Filters */}
      <SalesFiltersBar
        filters={filters}
        onChange={handleFilterChange}
        onExport={handleExport}
      />

      {/* Charts */}
      <SalesCharts
        revenueTrend={data?.charts.revenue_trend}
        ordersTrend={data?.charts.orders_trend}
        salesByCategory={data?.charts.sales_by_category}
        isLoading={isLoading}
      />

      {/* Table */}
      <DataTable
        data={tableData}
        columns={salesTableColumns}
        loading={isLoading}
        noDataText="No sales data for the selected filters."
        searchPlaceholder="Search by date..."
        enableRowSelection={false}
        pagination={{
          page,
          totalPages,
          pageSize: perPage,
          dataCount: totalCount,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
