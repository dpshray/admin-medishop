'use client'

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { RefreshCw } from "lucide-react"
import { ParamsType } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/table/ReusableTable"
import ActionModal from "@/components/modal/ConfirmModal"
import { cn } from "@/lib/utils"
import { RowActions } from "@/lib/action-button"
import vendorProductService from "@/service/product/vendor-product.service"
import { toast } from "sonner"
import { StatusCell, StockCell } from "@/lib/stock"

export interface Vendor {
    id: number
    name: string
}

export interface VendorProductStock {
    status: boolean
    product_uuid: string
    product_name: string
    vendor: Vendor
    units_in_stock: number
}

export default function AdminProductRequestsTable() {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState("")
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<VendorProductStock | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPending, startTransition] = useTransition()

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ["vendor-product", currentPage, pageSize, search],
        queryFn: async () => {
            const params: ParamsType = { page: currentPage, per_page: pageSize, search }
            const response = await vendorProductService.vendorProductListByAdmin(params)
            setCurrentPage(response.page)
            return response
        },
        staleTime: 300000,
        refetchOnWindowFocus: false,
    })

    const handleAccept = useCallback(async (productUuid: string) => {
        const toastId = 'accept-product'
        try {
            toast.loading('Processing...', { id: toastId })
            const response = await vendorProductService.acceptAndRejectVendorProduct(productUuid, true)
            toast.success(response?.message || 'Product approved successfully', { id: toastId })
            await refetch()
        } catch (error: any) {
            toast.error(error?.message || 'Failed to approve product', { id: toastId })
        }
    }, [refetch])

    const handleReject = useCallback(async (productUuid: string) => {
        const toastId = 'reject-product'
        try {
            toast.loading('Processing...', { id: toastId })
            const response = await vendorProductService.acceptAndRejectVendorProduct(productUuid, false)
            toast.success(response?.message || 'Product rejected successfully', { id: toastId })
            await refetch()
        } catch (error: any) {
            toast.error(error?.message || 'Failed to reject product', { id: toastId })
        }
    }, [refetch])

    const handleView = useCallback((product: VendorProductStock) => {
        startTransition(() => router.push(`/admin/vendor-product/${product.product_uuid}`))
    }, [router])

    const confirmDeleteProduct = useCallback(async () => {
        if (!selectedProduct) return
        setIsDeleting(true)
        try {
            const response = await vendorProductService.deleteVendorProduct(selectedProduct.product_uuid)
            toast.success('Product deleted', { description: response.message || "Vendor product deleted successfully" })
            setDeleteModalOpen(false)
            setSelectedProduct(null)
            await refetch()
        } catch (error: any) {
            toast.error('Failed to delete product', { description: error?.message || 'An error occurred while deleting the product.' })
        } finally {
            setIsDeleting(false)
        }
    }, [selectedProduct, refetch])

    const columns: ColumnDef<VendorProductStock>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all vendor products on this page"
                    className="mx-auto"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select ${row.original.product_uuid}`}
                    className="mx-auto"
                />
            ),
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "product_name",
            header: "Product Name",
            cell: ({ row }) => (
                <div className="font-medium text-sm truncate max-w-[150px]">
                    {row.original.product_name}
                    <p className="text-xs text-muted-foreground truncate">{row.original.product_uuid}</p>
                </div>
            ),
            enableSorting: true,
            size: 200,
        },
        {
            accessorKey: "vendor.name",
            header: "Vendor",
            cell: ({ row }) => (
                <span className="font-medium text-sm truncate max-w-[150px]">{row.original.vendor.name}</span>
            ),
            enableSorting: true,
            size: 200,
        },
        {
            accessorKey: "units_in_stock",
            header: "Stock",
            cell: ({ row }) => <StockCell stock={row.original.units_in_stock} />,
            enableSorting: true,
            size: 120,
        },
        {
            accessorKey: "status",
            header: "Product Status",
            cell: ({ row }) => (
                <StatusCell
                    status={row.original.status}
                    onAcceptAction={handleAccept}
                    onRejectAction={handleReject}
                    productId={row.original.product_uuid}
                />
            ),
            enableSorting: true,
            size: 150,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => <RowActions row={row} onViewAction={() => handleView(row.original)} />,
            enableSorting: false,
            enableHiding: false,
            size: 80,
        }
    ], [handleView, handleAccept, handleReject])

    const handleSearch = useCallback((value: string) => setSearch(value), [])
    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])
    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])
    const handleRefresh = useCallback(() => refetch(), [refetch])
    const handleModalClose = useCallback((open: boolean) => {
        if (!isDeleting) {
            setDeleteModalOpen(open)
            if (!open) setSelectedProduct(null)
        }
    }, [isDeleting])
    const isTableLoading = isLoading || isFetching

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Vendor Products</h1>
                    <p className="text-sm text-muted-foreground">Manage vendor product listings and inventory</p>
                </div>
                <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    disabled={isFetching}
                    aria-label="Refresh vendor products list"
                    className="w-full sm:w-auto h-10 gap-2"
                >
                    <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} aria-hidden="true" />
                    <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
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
                searchPlaceholder="Search by vendor or status..."
                totalCount={data?.total_items ?? 0}
                pagination={{
                    page: currentPage,
                    totalPages: data?.total_page ?? 1,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                    dataCount: data?.total_items ?? 0,
                }}
                noDataText="No vendor products found."
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleModalClose}
                title="Delete Vendor Product"
                description={selectedProduct ? `Are you sure you want to delete product ${selectedProduct.product_uuid} by ${selectedProduct.vendor.name}?` : "Are you sure you want to delete this vendor product?"}
                confirmLabel={isDeleting ? "Deleting..." : "Delete Product"}
                onConfirm={confirmDeleteProduct}
                loading={isDeleting}
                confirmVariant="destructive"
            />
        </div>
    )
}
