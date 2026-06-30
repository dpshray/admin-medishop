"use client";

import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/table/ReusableTable";
import { ColumnDef } from "@tanstack/react-table";
import { NoDataFound } from "@/lib/helper";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import GlobalTableHoverImage from "@/components/table/GlobalTableHoverImage";
import { CURRENCY_SYMBOL, DEFAULT_PAGE_SIZE } from "@/config/app-constant";
import { Package2, Star } from "lucide-react";
import TableHeading from "@/components/table/table-headers";
import { useFreeProducts } from "@/hooks/useProduct";
import { useRouter } from "next/navigation";
import { RowActions } from "@/lib/action-button";

interface ProductVariation {
  variation_id: number;
  name: string | null;
  size_value: number;
  size_unit: string;
  form_type: string;
  package_type: string;
  package_size: string;
  strength: string;
  price: number;
  previous_price: number;
  stock: number;
}

interface BrandProduct {
  name: string;
  uuid: string;
  slug: string;
  brand: string;
  isPrescriptionRequired: boolean;
  rating: number;
  price: number;
  previous_price: number;
  feature_image: string;
  liked: boolean;
  discount_percent: number;
  variations: ProductVariation[];
}

export default function BrandProductTable({
  brand_slug,
}: {
  brand_slug: string;
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isError, isLoading, error } = useFreeProducts({
    page: currentPage,
    search: searchQuery,
    per_page: DEFAULT_PAGE_SIZE,
    brand_slug: brand_slug,
  });

  const products = useMemo(() => data?.items || [], [data]);
  const totalPages = data?.total_page ?? 1;
  const totalItems = data?.total_items ?? 0;

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);
  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );

  const handleViewProduct = useCallback(
    (product: BrandProduct) => {
      router.push(`/admin/products/view-product/${product.uuid}`);
    },
    [router],
  );

  const columns: ColumnDef<BrandProduct>[] = useMemo(
    () => [
      {
        accessorKey: "feature_image",
        header: "Image",
        size: 100,
        cell: ({ row }) => (
          <GlobalTableHoverImage
            src={row.original.feature_image}
            alt={row.original.name}
            fallbackSrc="/placeholder.png"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Product Name",
        size: 220,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-900">
              {row.original.name}
            </span>
            <Badge variant="outline" className="w-fit text-xs">
              {row.original.slug}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        size: 150,
        cell: ({ row }) => {
          const { price, previous_price, discount_percent } = row.original;
          const hasDiscount = discount_percent > 0;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-gray-900">
                {CURRENCY_SYMBOL}
                {price.toFixed(2)}
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground line-through">
                    {CURRENCY_SYMBOL}
                    {previous_price.toFixed(2)}
                  </span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] px-1.5 py-0">
                    -{discount_percent}%
                  </Badge>
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "variations",
        header: "Variations",
        size: 130,
        cell: ({ row }) => {
          const count = row.original.variations?.length ?? 0;
          const totalStock = row.original.variations?.reduce(
            (sum, v) => sum + (v.stock ?? 0),
            0,
          );
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-gray-700">
                {count} {count === 1 ? "variation" : "variations"}
              </span>
              <span className="text-xs text-muted-foreground">
                {totalStock} in stock
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "isPrescriptionRequired",
        header: "Prescription",
        size: 120,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.isPrescriptionRequired ? "default" : "secondary"
            }
            className={cn(
              row.original.isPrescriptionRequired
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-gray-400 hover:bg-gray-500",
              "text-white",
            )}
          >
            {row.original.isPrescriptionRequired ? "Required" : "Not Required"}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "rating",
        header: "Rating",
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Star size={13} className="text-yellow-500 fill-yellow-500" />
            {row.original.rating.toFixed(1)}
          </div>
        ),
        enableSorting: false,
      },
      {
        id: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => (
          <RowActions
            row={row}
            onViewAction={() => handleViewProduct(row.original)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleViewProduct],
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
              Failed to load products
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
      <TableHeading
        title="Brand Products"
        description="All products listed under this brand"
        icon={Package2}
        className={cn("mt-2")}
      />

      <DataTable<BrandProduct, any>
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
        enableSorting
        enableSearch
        enableColumnVisibility
        searchPlaceholder="Search products by name..."
        totalCount={totalItems}
        noDataText={<NoDataFound />}
      />
    </div>
  );
}
