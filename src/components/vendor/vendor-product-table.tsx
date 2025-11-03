'use client'

import {useCallback, useMemo, useState, useTransition} from "react"
import {useRouter} from "next/navigation"
import {useQuery} from "@tanstack/react-query"
import {ColumnDef} from "@tanstack/react-table"
import {RefreshCw} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {DataTable} from "@/components/table/ReusableTable"
import ActionModal from "@/components/modal/ConfirmModal"
import {cn} from "@/lib/utils"
import {RowActions} from "@/lib/action-button"
import vendorProductService from "@/service/product/vendor-product.service"
import {toast} from "sonner"
import {StockCell} from "@/lib/stock"
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, QUERY_STALE_TIME} from "@/config/app-constant"

import {StatusBadge} from "@/lib/helper";
import {PriceCell, ProductCell} from "@/lib/table";
import VendorProductModal from "@/components/vendor/VendorProductModal";

interface VendorProduct {
    id: number
    status: string | null
    product_variation: {
        id: number
        product_name: string
        variation_name: string
        size_value: number
        size_unit: string
    }
    price: number
    units_in_stock: number
}

export default function VendorProductTable() {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState("")
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<VendorProduct | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isAdding, setIsAdding] = useState(false)


    const {data, isLoading, isFetching, refetch} = useQuery({
        queryKey: ["vendor-product", currentPage, pageSize, search],
        queryFn: async () => {
            return await vendorProductService.getVendorProducts({page: currentPage, pageSize, search})
        },
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: false,
    })

    const handleView = useCallback((product: VendorProduct) => {
        startTransition(() => router.push(`/vendor/products/${product.id}`))
    }, [router])

    const handleEdit = useCallback((productId: number) => {
        startTransition(() => router.push(`/vendor/product/${productId}`))
    }, [router])

    const handleDeleteClick = useCallback((product: VendorProduct) => {
        setSelectedProduct(product)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteProduct = useCallback(async () => {
        if (!selectedProduct) return
        setIsDeleting(true)
        try {
            const response = await vendorProductService.deleteVendorProduct(selectedProduct.id)
            toast.success('Product deleted', {description: response.message || "Deleted successfully"})
            setDeleteModalOpen(false)
            setSelectedProduct(null)
            await refetch()
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete product")
        } finally {
            setIsDeleting(false)
        }
    }, [selectedProduct, refetch])

    const columns: ColumnDef<VendorProduct>[] = useMemo(() => [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    className="mx-auto"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    className="mx-auto"
                />
            ),
            size: 50,
            enableSorting: false,
        },
        {
            accessorKey: "product_variation.product_name",
            header: "Product",
            cell: ({row}) => <ProductCell product={row.original.product_variation}/>,
            enableSorting: true,
            size: 300,
        },
        {
            accessorKey: "price",
            header: () => <div className="text-right">Price (Rs.)</div>,
            cell: ({row}) => <PriceCell price={row.original.price}/>,
            enableSorting: true,
            size: 140,
        },
        {
            accessorKey: "units_in_stock",
            header: () => <div className="flex justify-center w-full">Stock</div>,
            cell: ({row}) => <StockCell stock={row.original.units_in_stock}/>,
            enableSorting: true,
            size: 120,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({row}) => <StatusBadge status={row.original.status as string}/>,
            enableSorting: true,
            size: 150,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onDeleteAction={() => handleDeleteClick(row.original)}
                    onEditAction={() => handleEdit(row.original.id)}
                    onViewAction={() => handleView(row.original)}
                />
            ),
            size: 80,
            enableSorting: false,
        }
    ], [handleDeleteClick, handleView, handleEdit])

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])
    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(DEFAULT_PAGE)
    }, [])
    const handleRefresh = useCallback(() => refetch(), [refetch])
    const handleModalClose = useCallback((open: boolean) => {
        if (!isDeleting) {
            setDeleteModalOpen(open)
            if (!open) setSelectedProduct(null)
        }
    }, [isDeleting])

    const isTableLoading = isLoading || isFetching
    const handleAddProduct = useCallback(() => {
        setIsAdding(true)
    }, [])

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Vendor Products</h1>
                    <p className="text-sm text-muted-foreground">Manage vendor product listings and inventory</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isFetching}
                        className="w-full sm:w-auto h-10 gap-2">
                    <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")}/>
                    <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
                </Button>
            </div>

            <DataTable
                data={data?.items ?? []}
                columns={columns}
                loading={isTableLoading}
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search products..."
                totalCount={data?.total_items ?? 0}
                pagination={{
                    page: currentPage,
                    totalPages: data?.total_page ?? 1,
                    pageSize,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                    dataCount: data?.total_items ?? 0,
                }}
                noDataText="No vendor products found."
                onAddAction={handleAddProduct}
                actionLabel={'Add Product'}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleModalClose}
                title="Delete Vendor Product"
                description={selectedProduct ? `Are you sure you want to delete "${selectedProduct.product_variation.product_name}"?` : "Are you sure you want to delete this product?"}
                confirmLabel={isDeleting ? "Deleting..." : "Delete Product"}
                onConfirm={confirmDeleteProduct}
                loading={isDeleting}
                confirmVariant="destructive"
            />
            <VendorProductModal
                open={isAdding}
                onOpenChange={setIsAdding}

            />
        </div>
    )
}
