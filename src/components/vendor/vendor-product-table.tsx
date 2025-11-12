"use client"

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
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, QUERY_STALE_TIME} from "@/config/app-constant"
import {StatusBadge} from "@/lib/helper"
import VendorProductModal from "@/components/vendor/VendorProductModal"
import {STATUS_TYPE} from "@/types/enum"

interface ProductVariation {
    product_variation_id: number
    vendor_price: number
    units_in_stock: number
    variant_name: string
    variant_size_value: string
    variant_size_unit: string
}

interface VendorProduct {
    accepted: boolean
    product_uuid: string
    product_name: string
    brand: string
    variations: ProductVariation[]
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
            const res = await vendorProductService.getVendorProductsList({
                page: currentPage,
                pageSize,
                search,
            })
            console.log("Vendor product list response:", res)
            return res
        },
        staleTime: QUERY_STALE_TIME,
    })

    const handleView = useCallback(
        (product: VendorProduct) => {
            startTransition(() => router.push(`/vendor/products/${product.product_uuid}`))
        },
        [router]
    )

    const handleDeleteClick = useCallback((product: VendorProduct):void => {
        setSelectedProduct(product)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteProduct = useCallback(async () => {
        if (!selectedProduct) return
        setIsDeleting(true)
        try {
            await vendorProductService.deleteVendorProductFromVendor(selectedProduct.product_uuid).then((response) => {
                console.log("Delete response:", response)
                toast.success("Product deleted", {description: response.message || "Deleted successfully"})
            })
            setDeleteModalOpen(false)
            setSelectedProduct(null)
            await refetch()


        } catch (error: any) {
            toast.error(error?.message || "Failed to delete product")
        } finally {
            setIsDeleting(false)
        }
    }, [selectedProduct, refetch])

    const columns: ColumnDef<VendorProduct>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({table}) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        className="mx-auto"
                        aria-label="Select all rows"
                    />
                ),
                cell: ({row}) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        className="mx-auto"
                        aria-label={`Select row ${row.index + 1}`}
                    />
                ),
                size: 50,
                enableSorting: false,
            },
            {
                accessorKey: "product_name",
                header: "Product",
                cell: ({row}) => (
                    <div
                        className="flex flex-col items-start gap-1.5 min-w-0 cursor-pointer"
                        onClick={() => handleView(row.original)}
                    >
            <span
                className="font-medium text-sm truncate max-w-[200px] md:max-w-[300px]"
                title={row.original.product_name}
            >
              {row.original.product_name}
            </span>
                        <span
                            className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-[300px]"
                            title={row.original.product_uuid}
                        >
              {row.original.product_uuid}
            </span>
                    </div>
                ),
                enableSorting: true,
                minSize: 200,
            },
            {
                accessorKey: "brand",
                header: "Brand",
                cell: ({row}) => (
                    <span className="font-medium text-sm truncate block max-w-[150px]" title={row.original.brand}>
            {row.original.brand}
          </span>
                ),
                enableSorting: true,
                size: 150,
            },
            {
                accessorKey: "variations",
                header: () => <div className="text-right">Price (Rs.)</div>,
                cell: ({row}) => {
                    const price = row.original.variations?.[0]?.vendor_price
                    const displayPrice =
                        typeof price === "number" && !isNaN(price)
                            ? price.toLocaleString("en-NP", {minimumFractionDigits: 2, maximumFractionDigits: 2})
                            : "—"
                    return <div className="text-right font-medium text-sm tabular-nums">{displayPrice}</div>
                },
                enableSorting: true,
                size: 120,
            },
            {
                id: "stock",
                header: () => <div className="text-center">Stock</div>,
                cell: ({row}) => {
                    const stock = row.original.variations?.[0]?.units_in_stock
                    const displayStock =
                        typeof stock === "number" && !isNaN(stock) ? stock.toLocaleString("en-NP") : "—"
                    return <div className="text-center font-medium text-sm tabular-nums">{displayStock}</div>
                },
                enableSorting: true,
                size: 100,
            },
            {
                accessorKey: "accepted",
                header: "Status",
                cell: ({row}) => (
                    <StatusBadge status={row.original.accepted ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.PENDING}/>
                ),
                enableSorting: true,
                size: 120,
            },
            {
                id: "actions",
                header: () => <div className="text-center">Actions</div>,
                cell: ({row}) => (
                    <RowActions
                        row={row}
                        onDeleteAction={() => handleDeleteClick(row.original)}
                        onViewAction={() => handleView(row.original)}
                    />
                ),
                size: 80,
                enableSorting: false,
            },
        ],
        [handleDeleteClick, handleView]
    )

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])
    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(DEFAULT_PAGE)
    }, [])
    const handleRefresh = useCallback(() => refetch(), [refetch])
    const handleModalClose = useCallback(
        (open: boolean) => {
            if (!isDeleting) {
                setDeleteModalOpen(open)
                if (!open) setSelectedProduct(null)
            }
        },
        [isDeleting]
    )
    const handleAddProduct = useCallback(() => setIsAdding(true), [])
    const handleAddModalClose = useCallback(
        (open: boolean) => {
            setIsAdding(open)
            if (!open) refetch()
        },
        [refetch]
    )

    const isTableLoading = isLoading || isFetching

    return (
        <div className="space-y-4 md:space-y-6 w-full px-2 md:px-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Vendor Products</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Manage vendor product listings and inventory
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    disabled={isFetching}
                    className="w-full sm:w-auto h-9 md:h-10 gap-2"
                    aria-label="Refresh product list"
                >
                    <RefreshCw className={cn("h-3.5 w-3.5 md:h-4 md:w-4", isFetching && "animate-spin")}/>
                    <span className="text-xs sm:text-sm">
            {isFetching ? "Refreshing..." : "Refresh"}
          </span>
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
                actionLabel="Add Product"
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleModalClose}
                title="Delete Vendor Product"
                description={
                    selectedProduct
                        ? `Are you sure you want to delete "${selectedProduct.product_name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this product?"
                }
                confirmLabel={isDeleting ? "Deleting..." : "Delete Product"}
                onConfirm={confirmDeleteProduct}
                loading={isDeleting}
                confirmVariant="destructive"
            />

            <VendorProductModal open={isAdding} onOpenChange={handleAddModalClose}/>
        </div>
    )
}
