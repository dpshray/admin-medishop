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
import {FormatCurrency, StatusBadge} from "@/lib/helper"
import VendorProductModal from "@/components/vendor/VendorProductModal"
import {STATUS_TYPE} from "@/types/enum"
import {ProductVariation} from "@/types/ProductTypes"

interface VendorProduct {
    accepted: boolean | null
    product_uuid: string
    product_name: string
    brand: string
    variations: ProductVariation[]
}

export default function VendorProductTable() {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
    const [totalPage, setTotalPage] = useState(DEFAULT_PAGE)
    const [search, setSearch] = useState("")
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<VendorProduct | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isAdding, setIsAdding] = useState(false)

    const {data, isLoading, isFetching, refetch} = useQuery({
        queryKey: ["vendor-product", currentPage, search],
        queryFn: async () => {
            const res = await vendorProductService.getVendorProductsList({
                page: currentPage,
                search,
                per_page: DEFAULT_PAGE_SIZE,
            })
            setCurrentPage(res.page)
            setTotalPage(res.total_page)
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

    const handleDeleteClick = useCallback((product: VendorProduct) => {
        setSelectedProduct(product)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteProduct = useCallback(async () => {
        if (!selectedProduct) return
        setIsDeleting(true)
        try {
            const response = await vendorProductService.deleteVendorProductFromVendor(selectedProduct.product_uuid)
            toast.success("Product deleted", {description: response.message || "Deleted successfully"})
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
                        className=""
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
                    <div className="space-y-1">
                        <div
                            className="font-semibold text-gray-900 truncate max-w-[200px] cursor-pointer hover:text-[#4a358e] transition-colors"
                            title={row.original.product_name}
                            onClick={() => handleView(row.original)}
                        >
                            {row.original.product_name}
                        </div>
                        {row.original.variations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {row.original.variations.slice(0, 2).map((variation) => (
                                    <span
                                        key={variation.product_variation_id}
                                        className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                                    >
                    {variation.variant_name}
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
                header: () => <div className="text-right">Price</div>,
                cell: ({row}) =>
                    <div
                        className=" font-medium text-sm tabular-nums">{FormatCurrency(row.original.variations?.[0]?.vendor_price)}</div>
                ,
                enableSorting: true,
                size: 120,
            },
            {
                id: "stock",
                header: () => <div className="text-center">Stock</div>,
                cell: ({row}) => {
                    const stock = row.original.variations?.[0]?.units_in_stock
                    const displayStock = typeof stock === "number" && !isNaN(stock) ? stock.toLocaleString("en-NP") : "—"
                    return <div className="text-center font-medium text-sm tabular-nums">{displayStock}</div>
                },
                enableSorting: true,
                size: 100,
            },
            {
                accessorKey: "accepted",
                header: "Product Status",
                cell: ({row}) => {
                    let status;
                    if (row.original.accepted === true) status = STATUS_TYPE.ACCEPTED;
                    else if (row.original.accepted === false) status = STATUS_TYPE.REJECTED;
                    else status = STATUS_TYPE.PENDING;

                    return <StatusBadge status={status}/>;
                },
                enableSorting: true,
                size: 120,
            }
            ,
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
                    <p className="text-xs sm:text-sm text-muted-foreground">Manage vendor product listings and
                        inventory</p>
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
                    <span className="text-xs sm:text-sm">{isFetching ? "Refreshing..." : "Refresh"}</span>
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
                onSearchAction={setSearch}
                searchPlaceholder="Search products..."
                totalCount={data?.total_items ?? 0}
                pagination={{
                    page: currentPage,
                    totalPages: totalPage,
                    onPageChange: handlePageChange,
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
