"use client";

import { useCallback, useMemo, useState } from "react";

import { DataTable } from "@/components/table/ReusableTable";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { NoDataFound } from "@/lib/helper";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useVendor from "@/hooks/use-vendor";
import { useCategories } from "@/hooks/all-hook";
import { useGetProductsPerformaceReport } from "@/hooks/use-report";
import { Vendor } from "@/app/admin/vendors/VenderTable";
import SearchSelectField from "../field/search-select";
import { CURRENCY_SYMBOL } from "@/config/app-constant";

interface ProductPerformance {
  product_id: number;
  product_name: string;
  product_slug: string;
  vendor_id: number;
  vendor_name: string;
  category_id: number;
  category_name: string;
  units_sold: string;
  revenue: string;
  return_rate_pct: string;
}

export default function ProductPerformanceTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const { vendors = [] } = useVendor({ page: 1 });
  const { categories = [] } = useCategories();

  const vendorOptions = useMemo(
    () =>
      vendors.map((vendor: Vendor) => ({
        value: vendor.id,
        label: vendor.store_name,
      })),
    [vendors],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories],
  );

  const { data, isLoading, isError, error } = useGetProductsPerformaceReport({
    page: currentPage,
    search: searchQuery,
    vendor_id: selectedVendorId,
    category_id: selectedCategoryId,
  });

  const products = useMemo(() => data?.data?.data || [], [data]);
  const totalPages = data?.data?.last_page || 1;
  const totalItems = data?.data?.total || 0;

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );

  const handleVendorFilter = useCallback((value: string | number) => {
    setSelectedVendorId(value === "" ? null : Number(value));
    setCurrentPage(1);
  }, []);

  const handleCategoryFilter = useCallback((value: string | number) => {
    setSelectedCategoryId(value === "" ? null : Number(value));
    setCurrentPage(1);
  }, []);

  const columns: ColumnDef<ProductPerformance>[] = useMemo(
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
            aria-label={`Select ${row.original.product_name}`}
            className="mx-auto"
          />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "product_name",
        header: "Product",
        size: 220,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-900">
              {row.original.product_name}
            </span>
            <Badge variant="outline" className="w-fit text-xs">
              {row.original.product_slug}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "vendor_name",
        header: "Vendor",
        size: 180,
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.vendor_name}
          </span>
        ),
      },
      {
        accessorKey: "category_name",
        header: "Category",
        size: 160,
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-xs">
            {row.original.category_name}
          </Badge>
        ),
      },
      {
        accessorKey: "units_sold",
        header: "Units Sold",
        size: 120,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {row.original.units_sold}
          </span>
        ),
      },
      {
        accessorKey: "revenue",
        header: "Revenue",
        size: 140,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-green-700">
            {CURRENCY_SYMBOL}{" "}
            {Number(row.original.revenue).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      //   {
      //     accessorKey: "return_rate_pct",
      //     header: "Return Rate",
      //     size: 120,
      //     cell: ({ row }) => {
      //       const rate = parseFloat(row.original.return_rate_pct);
      //       return (
      //         <Badge
      //           className={cn(
      //             "text-white text-xs",
      //             rate === 0
      //               ? "bg-green-500 hover:bg-green-600"
      //               : rate < 5
      //                 ? "bg-yellow-500 hover:bg-yellow-600"
      //                 : "bg-red-500 hover:bg-red-600",
      //           )}
      //         >
      //           {rate.toFixed(2)}%
      //         </Badge>
      //       );
      //     },
      //   },
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
              Failed to load product performance
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
        <SearchSelectField
          placeholder="All Vendors"
          options={vendorOptions}
          value={selectedVendorId}
          onChange={handleVendorFilter}
          searchPlaceholder="Search vendors..."
          className="w-[200px]"
        />

        <SearchSelectField
          placeholder="All Categories"
          options={categoryOptions}
          value={selectedCategoryId}
          onChange={handleCategoryFilter}
          searchPlaceholder="Search categories..."
          className="w-[200px]"
        />

        {(selectedVendorId || selectedCategoryId) && (
          <button
            onClick={() => {
              setSelectedVendorId(null);
              setSelectedCategoryId(null);
              setCurrentPage(1);
            }}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <DataTable<ProductPerformance, any>
        data={products}
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
        searchPlaceholder="Search by product name..."
        totalCount={totalItems}
        noDataText={<NoDataFound />}
      />
    </div>
  );
}
