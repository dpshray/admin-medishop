'use client'

import {useCallback, useMemo, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {ColumnDef} from "@tanstack/react-table";
import {RefreshCw} from "lucide-react";
import {ParamsType} from "@/types/types";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Checkbox} from "@/components/ui/checkbox";
import {DataTable} from "@/components/table/ReusableTable";
import ActionModal from "@/components/modal/ConfirmModal";
import {cn} from "@/lib/utils";
import {RowActions} from "@/lib/helper";
import vendorProductService from "@/service/product/vendor-product.service";
import {toast} from "sonner";

interface VendorProduct {
    id: number;
    status: boolean;
    is_approved: boolean;
    vendor: {
        id: number;
        name: string;
    };
    product_variation: {
        id: number;
        name: string;
        product_name: string;
        size_value: number;
        size_unit: string;
    };
    price: number;
    units_in_stock: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const QUERY_STALE_TIME = 30000;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

export default function VendorProductTable() {
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = useState("");
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<VendorProduct | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPending, startTransition] = useTransition()

    const {data, isLoading, isFetching, refetch} = useQuery({
        queryKey: ["vendor-product", currentPage, pageSize, search],
        queryFn: async () => {
            const params: ParamsType = {
                page: currentPage,
                per_page: pageSize,
                search
            };
            const response = await vendorProductService.vendorProductList(params);
            console.log('Response vendor product table', response)
            setCurrentPage(response.page);
            return response;
        },
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: false,
    });

    const handleView = useCallback((product: VendorProduct) => {
        router.push(`/admin/vendor-products/${product.id}`);
    }, [router]);


    const handleDeleteClick = useCallback((product: VendorProduct) => {
        setSelectedProduct(product);
        setDeleteModalOpen(true);
    }, []);

    const confirmDeleteProduct = useCallback(async () => {
        if (!selectedProduct) return;

        setIsDeleting(true);
        try {
            await vendorProductService.deleteVendorProduct(selectedProduct.id).then(
                (res)=>{
                    toast('Deleted successfully',{
                        description: res.message || "Vendor product deleted successfully",
                    })
                    console.log('Response delete vendor product', res)
                }
            )
            setDeleteModalOpen(false);
            setSelectedProduct(null);
            await refetch();
        } catch (error) {
            console.error("Failed to delete vendor product:", error);
        } finally {
            setIsDeleting(false);
        }
    }, [selectedProduct, refetch]);

    const columns: ColumnDef<VendorProduct>[] = useMemo(() => [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all vendor products on this page"
                    className="mx-auto"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select product ${row.original.product_variation.product_name}`}
                    className="mx-auto"
                />
            ),
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "product_variation.product_name",
            header: "Product",
            cell: ({row}) => (
                <div className="flex flex-col gap-1 min-w-[200px]">
                    <span className="font-medium text-sm">
                        {row.original.product_variation.product_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.product_variation.name}
                    </span>
                </div>
            ),
            enableSorting: true,
        },
        {
            accessorKey: "vendor.name",
            header: "Vendor",
            cell: ({row}) => (
                <span className="font-medium text-sm">
                    {row.original.vendor.name}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: "Unit",
            header: "Size",
            cell: ({row}) => (
                <span className="text-sm whitespace-nowrap">
                    {row.original.product_variation.size_value}{" "}
                    {row.original.product_variation.size_unit}
                </span>
            ),
        },
        {
            accessorKey: "price",
            header: "Price (Rs.)",
            cell: ({row}) => (
                <span className="font-medium text-sm">
                    {row.original.price.toFixed(2)}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: "units_in_stock",
            header: () => (
                <span className="flex justify-center w-full">Stock</span>
            ),
            cell: ({row}) => {
                const stock = row.original.units_in_stock;
                const isLowStock = stock < 10;
                const isOutOfStock = stock === 0;

                return (
                    <span
                        className={cn(
                            "text-sm font-medium flex justify-center w-full",
                            isOutOfStock && "text-red-600",
                            isLowStock && !isOutOfStock && "text-yellow-600"
                        )}
                    >
                        {stock}
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: "is_approved",
            header: "Approval",
            cell: ({row}) => (
                <Badge
                    className={cn(
                        "text-xs font-medium",
                        row.original.is_approved
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
                            : "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
                    )}
                    variant="secondary"
                >
                    {row.original.is_approved ? "Approved" : "Pending"}
                </Badge>
            ),
            enableSorting: true,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({row}) => (
                <Badge
                    className={cn(
                        "text-xs font-medium",
                        row.original.status
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                    )}
                    variant="secondary"
                >
                    {row.original.status ? "Active" : "Inactive"}
                </Badge>
            ),
            enableSorting: true,
        },
        {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onDeleteAction={() => handleDeleteClick(row.original)}
                    onEditAction={() => startTransition(() => {
                        router.push(`/admin/vendor-product/${row.original.id}`)
                    })}
                    onViewAction={() => handleView(row.original)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }
    ], [handleDeleteClick, handleView, router]);

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setCurrentPage(DEFAULT_PAGE);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(DEFAULT_PAGE);
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleModalClose = useCallback((open: boolean) => {
        if (!isDeleting) {
            setDeleteModalOpen(open);
            if (!open) {
                setSelectedProduct(null);
            }
        }
    }, [isDeleting]);

    const isTableLoading = isLoading || isFetching;

    return (
        <div className="">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Vendor Products
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage vendor product listings and inventory
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    disabled={isFetching}
                    aria-label="Refresh vendor products list"
                    className="w-full sm:w-auto"
                >
                    <RefreshCw
                        className={cn(
                            "h-4 w-4 mr-2",
                            isFetching && "animate-spin"
                        )}
                        aria-hidden="true"
                    />
                    {isFetching ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            <DataTable
                data={data?.items ?? []}
                columns={columns}
                loading={isTableLoading}
                onSearchAction={handleSearch}
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search by product name, vendor, or variation..."
                totalCount={data?.total_items ?? 0}
                pagination={{
                    page: currentPage,
                    totalPages: data?.total_page ?? 1,
                    pageSize,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                    pageSizeOptions: [...PAGE_SIZE_OPTIONS],
                    dataCount: data?.total_items ?? 0,
                }}
                noDataText="No vendor products found. Products will appear here once vendors add them."
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleModalClose}
                title="Delete Vendor Product"
                description={
                    selectedProduct
                        ? `Are you sure you want to delete "${selectedProduct.product_variation.product_name}" by ${selectedProduct.vendor.name}? This action cannot be undone and will permanently remove this product listing.`
                        : "Are you sure you want to delete this vendor product? This action cannot be undone."
                }
                confirmLabel={isDeleting ? "Deleting..." : "Delete Product"}
                onConfirm={confirmDeleteProduct}
                loading={isDeleting}
                confirmVariant="destructive"
            />
        </div>
    );
}