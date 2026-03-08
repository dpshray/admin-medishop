"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/ReusableTable";
import { RowActions } from "@/lib/action-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Building2,
  Eye,
  Package,
  RefreshCw,
} from "lucide-react";
import { PaginatedResponse } from "@/types/types";
import productService from "@/service/product/product.service";
import ActionModal from "@/components/modal/ConfirmModal";
import {
  CURRENCY_SYMBOL,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  LOW_STOCK_THRESHOLD,
  OUT_OF_STOCK,
  PAGE_SIZE_OPTIONS,
  QUERY_STALE_TIME,
} from "@/config/app-constant";
import { FormatCurrency } from "@/lib/helper";
import GlobalTableHoverImage from "../table/GlobalTableHoverImage";

type Variation = {
  id: number;
  name: string;
  size_value: number;
  size_unit: string;
  platform_price: number;
};

type Product = {
  uuid: string;
  published: boolean;
  name: string;
  brand: string;
  image: string;
  lowest_variant_price: number;
  total_stock: number;
  variations: Variation[];
};

interface ProductTableParams {
  page: number;
  per_page: number;
  search?: string;
}

export default function AdminProductTable() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<
    PaginatedResponse<Product>,
    Error
  >({
    queryKey: ["admin-products", currentPage, pageSize, search],
    queryFn: async () => {
      const params: ProductTableParams = {
        page: currentPage,
        per_page: pageSize,
        search,
      };
      return await productService.getAllProducts(params);
    },
    staleTime: QUERY_STALE_TIME,
  });

  const handleDeleteProduct = useCallback(
    async (product: Product) => {
      try {
        await productService.deleteProduct(product.uuid);
        toast.success(`Product "${product.name}" deleted successfully`);
        void refetch();
      } catch {
        toast.error("Failed to delete product");
      }
    },
    [refetch],
  );

  const confirmDeleteProduct = useCallback(() => {
    if (selectedProduct) {
      handleDeleteProduct(selectedProduct);
      setSelectedProduct(null);
      setDeleteModalOpen(false);
    }
  }, [selectedProduct, handleDeleteProduct]);

  const handleAddProduct = useCallback(() => {
    router.push("/admin/products/add-product");
  }, [router]);

  const handleViewProduct = useCallback(
    (uuid: string) => {
      router.push(`/admin/products/view-product/${uuid}`);
    },
    [router],
  );

  const handleEditProduct = useCallback(
    (uuid: string) => {
      router.push(`/admin/products/edit-product/${uuid}`);
    },
    [router],
  );

  const handleRefresh = useCallback(() => {
    void refetch();
    toast.success("Products refreshed");
  }, [refetch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(DEFAULT_PAGE);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(DEFAULT_PAGE);
  }, []);

  const renderStockBadge = useCallback((stock: number) => {
    if (stock === OUT_OF_STOCK) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" />
          <span>Out of Stock</span>
        </Badge>
      );
    }
    if (stock < LOW_STOCK_THRESHOLD) {
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1.5 border-orange-300 text-orange-700 bg-orange-50"
        >
          <AlertTriangle className="h-3 w-3" />
          <span>{stock} Low Stock</span>
        </Badge>
      );
    }
    return (
      <span className="font-medium text-emerald-600 flex items-center gap-1.5">
        <Package className="h-3.5 w-3.5" />
        {stock}
      </span>
    );
  }, []);

  const columns: ColumnDef<Product>[] = useMemo(
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
            aria-label="Select all products"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select product ${row.original.name}`}
            className="mx-auto"
          />
        ),
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "image",
        header: "Image",
        size: 100,
        cell: ({ row }) => (
          <GlobalTableHoverImage
            src={row.original.image}
            alt={row.original.name}
            fallbackSrc="/placeholder.png"
          />
        ),
        enableSorting: false,
      },
      {
        header: "Product Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div
              className="font-semibold text-gray-900 truncate max-w-[200px] cursor-pointer hover:text-[#4a358e] transition-colors"
              title={row.original.name}
              onClick={() => handleViewProduct(row.original.uuid)}
            >
              {row.original.name}
            </div>
            {row.original.variations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {row.original.variations.slice(0, 2).map((variation) => (
                  <span
                    key={variation.id}
                    className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                  >
                    {variation.name}
                  </span>
                ))}
                {row.original.variations.length > 2 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    +{row.original.variations.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        ),
        enableHiding: false,
        size: 250,
      },
      {
        header: "Brand",
        accessorKey: "brand",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-slate-100">
              <Building2 className="h-3.5 w-3.5 text-slate-600" />
            </div>
            <span
              className="truncate max-w-[120px] text-sm"
              title={row.original.brand}
            >
              {row.original.brand}
            </span>
          </div>
        ),
        size: 150,
      },
      {
        header: `Price (${CURRENCY_SYMBOL} ) `,
        accessorKey: "lowest_variant_price",
        cell: ({ row }) => (
          <span className="font-semibold text-emerald-600">
            {FormatCurrency(row.original.lowest_variant_price)}
          </span>
        ),
        size: 120,
      },
      {
        header: "Status",
        accessorKey: "published",
        cell: ({ row }) => (
          <Badge
            variant={row.original.published ? "default" : "secondary"}
            className={cn(
              "font-medium",
              row.original.published
                ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
            )}
          >
            {row.original.published ? "Published" : "Draft"}
          </Badge>
        ),
        size: 120,
      },
      {
        header: "Stock",
        accessorKey: "total_stock",
        cell: ({ row }) => renderStockBadge(row.original.total_stock),
        size: 150,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewProduct(row.original.uuid)}
              className="h-8 w-8 p-0 hover:bg-[#4a358e]/10 hover:text-[#4a358e]"
              title="View product details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <RowActions
              row={row}
              onDeleteAction={() => {
                setSelectedProduct(row.original);
                setDeleteModalOpen(true);
              }}
              onEditAction={() => handleEditProduct(row.original.uuid)}
            />
          </div>
        ),
        size: 120,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleViewProduct, handleEditProduct, renderStockBadge],
  );

  const noDataContent = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 rounded-full bg-slate-100 mb-4">
          <Package className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No products found
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Get started by creating your first product.
        </p>
        <Button
          onClick={handleAddProduct}
          style={{ backgroundColor: "#4a358e" }}
          className="text-white hover:opacity-90"
        >
          Add Product
        </Button>
      </div>
    ),
    [handleAddProduct],
  );

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Failed to load products
              </h3>
              <p className="text-sm text-red-700 mb-4">
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred."}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-red-300 text-red-800 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="ghost"
                  className="text-red-800 hover:bg-red-100"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4a358e] to-[#6b4fc7] bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your product inventory and pricing
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="hover:bg-slate-50"
          disabled={isFetching}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <DataTable<Product, unknown>
        data={data?.items || []}
        columns={columns}
        loading={isLoading || isFetching}
        onAddAction={handleAddProduct}
        onSearchAction={handleSearch}
        actionLabel="Add Product"
        enableRowSelection
        enableSorting
        enableSearch
        enableColumnVisibility
        searchPlaceholder="Search products by name..."
        totalCount={data?.total_items}
        pagination={{
          page: currentPage,
          totalPages: data?.total_page || 1,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
          pageSizeOptions: [...PAGE_SIZE_OPTIONS],
          dataCount: data?.total_items || 0,
        }}
        noDataText={noDataContent}
      />

      <ActionModal
        open={isDeleteModalOpen}
        setOpen={setDeleteModalOpen}
        title="Delete Product"
        description={
          selectedProduct
            ? `Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this product?"
        }
        confirmLabel="Delete Product"
        onConfirm={confirmDeleteProduct}
        loading={false}
      />
    </div>
  );
}
