"use client";

import { useState, useCallback } from "react";
import PageHeader from "@/components/headers/PageHeader";
import { Wallet } from "lucide-react";
import { useGetVendorSalesReport } from "@/hooks/use-report";
import VendorSalesReportFilters, {
  VendorSalesFilters,
} from "./components/VendorSalesReportFilters";
import VendorSalesReportCards from "./components/VendorSalesReportCards";
import VendorSalesReportCharts from "./components/VendorSalesReportCharts";
import VendorProductPicker from "./components/VendorProductPicker";
import VendorSalesReportTable from "./components/vendorSalesTableColumns";

interface SelectedProduct {
  product_id: string;
  product_name: string;
}
export default function VendorSalesReportPage() {
  const [filters, setFilters] = useState<VendorSalesFilters>({});

  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);

  const [page, setPage] = useState(1);
  const perPage = 25;

  const { data, isLoading } = useGetVendorSalesReport({
    preset: filters.preset,
    start_date: filters.start_date,
    end_date: filters.end_date,
    group_by: filters.group_by,
    order_status: filters.order_status,
    product_id: selectedProduct?.product_id,
    page,
    per_page: perPage,
  });

  const handleFilterChange = useCallback(
    (partial: Partial<VendorSalesFilters>) => {
      setFilters((prev) => ({ ...prev, ...partial }));
      setPage(1);
    },
    [],
  );

  const handleProductSelect = useCallback((product: SelectedProduct | null) => {
    setSelectedProduct(product);
    setPage(1);
  }, []);

  const summary = data?.summary_cards;
  const charts = data?.charts;
  const tableData = data?.table.data ?? [];
  const total = data?.table.total ?? 0;
  const lastPage = data?.table.last_page ?? 1;

  return (
    <div className="mainContainer">
      <PageHeader
        title="Vendor Sales Report"
        description="View your sales report"
        icon={Wallet}
      />

      <div className="mt-6 space-y-6">
        {/* Summary cards */}
        <VendorSalesReportCards data={summary} isLoading={isLoading} />

        <VendorSalesReportFilters
          filters={filters}
          onChange={handleFilterChange}
        />

        {/* Charts */}
        <VendorSalesReportCharts
          revenueTrend={charts?.revenue_trend}
          topProducts={charts?.top_products}
          isLoading={isLoading}
        />

        {/* Table section with its own product filter */}
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Daily Breakdown
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Filter by product variant to drill into specific sales
              </p>
            </div>
            <VendorProductPicker
              selected={selectedProduct}
              onSelect={handleProductSelect}
            />
          </div>

          <VendorSalesReportTable
            data={tableData}
            total={total}
            lastPage={lastPage}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
