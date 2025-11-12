'use client'

import {memo, useCallback, useMemo, useState, useTransition} from "react"
import {useRouter} from "next/navigation"
import {useQuery} from "@tanstack/react-query"
import {ColumnDef} from "@tanstack/react-table"
import {RefreshCw} from "lucide-react"
import {ParamsType} from "@/types/types"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {DataTable} from "@/components/table/ReusableTable"
import ActionModal from "@/components/modal/ConfirmModal"
import {cn} from "@/lib/utils"
import {RowActions} from "@/lib/action-button"
import vendorProductService from "@/service/product/vendor-product.service"
import {toast} from "sonner"
import {StatusCell, StockCell} from "@/lib/stock"
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, QUERY_STALE_TIME} from "@/config/app-constant"

interface VendorProduct {
    id: number
    status: string | null
    vendor: {
        id: number
        name: string
    }
    product_variation: {
        id: number
        variation_name: string
        product_name: string
        size_value: number
        size_unit: string
    }
    price: number
    units_in_stock: number
}

const ProductCell = memo(({product}: {product: VendorProduct['product_variation']}) => (
    <div className="flex items-start gap-3 max-w-[150px]">
        <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-medium text-sm truncate" title={product.product_name}>
                {product.product_name}
            </span>
            <span className="text-xs text-muted-foreground truncate" title={product.variation_name}>
                {product.variation_name}
            </span>
        </div>
    </div>
))
ProductCell.displayName = "ProductCell"
const VendorCell = memo(({name}: {name: string}) => (
    <span className="font-medium text-sm truncate block max-w-[150px]" title={name}>
        {name}
    </span>
))
VendorCell.displayName = "VendorCell"
const SizeCell = memo(({value, unit}: {value: number; unit: string}) => (
    <span className="text-sm whitespace-nowrap tabular-nums">
        {value} {unit}
    </span>
))
SizeCell.displayName = "SizeCell"
const PriceCell = memo(({price}: {price: number}) => (
    <div className="text-right font-medium text-sm tabular-nums">
        {price.toLocaleString('en-NP', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}
    </div>
))
PriceCell.displayName = "PriceCell"

export default function AdminProductRequestsTable() {
    const router = useRouter()

    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState("")
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<VendorProduct | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPending, startTransition] = useTransition()

    const {data, isLoading, isFetching, refetch} = useQuery({
        queryKey: ["vendor-product", currentPage, pageSize, search],
        queryFn: async () => {
            const params: ParamsType = {
                page: currentPage,
                per_page: pageSize,
                search
            }
            const response = await vendorProductService.vendorProductListByAdmin(params)
            console.log("Vendor product list response:", response)
            setCurrentPage(response.page)
            return response
        },
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: false,
    })

    const handleAccept = useCallback(async (productId: number) => {
        const toastId = 'accept-product'
        try {
            toast.loading('Processing...', {id: toastId})
            const response = await vendorProductService.acceptAndRejectVendorProduct(productId, true)
            toast.success(response?.message || 'Product approved successfully', {id: toastId})
            await refetch()
        } catch (error: any) {
            toast.error(error?.message || 'Failed to approve product', {id: toastId})
            console.error('Failed to accept product:', error)
        }
    }, [refetch])

    const handleReject = useCallback(async (productId: number) => {
        const toastId = 'reject-product'
        try {
            toast.loading('Processing...', {id: toastId})
            const response = await vendorProductService.acceptAndRejectVendorProduct(productId, false)
            toast.success(response?.message || 'Product rejected successfully', {id: toastId})
            await refetch()
        } catch (error: any) {
            toast.error(error?.message || 'Failed to reject product', {id: toastId})
            console.error('Failed to reject product:', error)
        }
    }, [refetch])

    const handleView = useCallback((product: VendorProduct) => {
        startTransition(() => {
            router.push(`/admin/vendor-products/${product.id}`)
        })
    }, [router])

    const handleEdit = useCallback((productId: number) => {
        startTransition(() => {
            router.push(`/admin/vendor-product/${productId}`)
        })
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
            toast.success('Product deleted', {
                description: response.message || "Vendor product deleted successfully",
            })
            setDeleteModalOpen(false)
            setSelectedProduct(null)
            await refetch()
        } catch (error: any) {
            toast.error('Failed to delete product', {
                description: error?.message || 'An error occurred while deleting the product. Please try again.'
            })
            console.error("Failed to delete vendor product:", error)
        } finally {
            setIsDeleting(false)
        }
    }, [selectedProduct, refetch])

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
                    aria-label={`Select ${row.original.product_variation.product_name}`}
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
            cell: ({row}) => <ProductCell product={row.original.product_variation}/>,
            enableSorting: true,
            size: 300,
        },
        {
            accessorKey: "vendor.name",
            header: "Vendor",
            cell: ({row}) => <VendorCell name={row.original.vendor.name}/>,
            enableSorting: true,
            size: 200,
        },
        {
            accessorKey: "size",
            header: "Size",
            cell: ({row}) => (
                <SizeCell
                    value={row.original.product_variation.size_value}
                    unit={row.original.product_variation.size_unit}
                />
            ),
            size: 120,
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
            cell: ({row}) => (
                <StatusCell
                    status={row.original.status}
                    onAcceptAction={handleAccept}
                    onRejectAction={handleReject}
                    productId={row.original.id}
                />
            ),
            enableSorting: true,
            size: 150,
        },
        {
            id: "actions",
            header: () => <span className="">Actions</span>,
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onDeleteAction={() => handleDeleteClick(row.original)}
                    onEditAction={() => handleEdit(row.original.id)}
                    onViewAction={() => handleView(row.original)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 80,
        }
    ], [handleDeleteClick, handleView, handleEdit, handleAccept, handleReject])

    const handleSearch = useCallback((value: string) => {
        setSearch(value)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(DEFAULT_PAGE)
    }, [])

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

    const handleModalClose = useCallback((open: boolean) => {
        if (!isDeleting) {
            setDeleteModalOpen(open)
            if (!open) {
                setSelectedProduct(null)
            }
        }
    }, [isDeleting])

    const isTableLoading = isLoading || isFetching

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
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
                    className="w-full sm:w-auto h-10 gap-2"
                >
                    <RefreshCw
                        className={cn(
                            "h-4 w-4",
                            isFetching && "animate-spin"
                        )}
                        aria-hidden="true"
                    />
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
    )
}