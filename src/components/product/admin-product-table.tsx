"use client"

import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/table/ReusableTable"
import { RowActions } from "@/lib/helper"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AlertTriangle, Building2, Eye } from "lucide-react"
import { PaginatedResponse } from "@/types/types"
import productService from "@/service/product/product.service"
import ActionModal from "@/components/modal/ConfirmModal"

interface Product {
    uuid: string
    name: string
    lowest_variant_price: number
    brand: string
    published: boolean
    total_stock: number
}

interface ProductTableParams {
    page: number
    per_page: number
    search?: string
}

export default function AdminProductTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState("")
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const router = useRouter()

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery<PaginatedResponse<Product>, Error>({
        queryKey: ["admin-products", currentPage, pageSize, search],
        queryFn: async () => {
            const params: ProductTableParams = { page: currentPage, per_page: pageSize, search }
            return await productService.getAllProducts(params)
        },
    })

    const handleDeleteProduct = useCallback(
        async (product: Product) => {
            try {
                await productService.deleteProduct(product.uuid)
                toast.success(`Product "${product.name}" deleted successfully`)
                void refetch()
            } catch {
                toast.error("Failed to delete product")
            }
        },
        [refetch]
    )

    const confirmDeleteProduct = useCallback(() => {
        if (selectedProduct) {
            handleDeleteProduct(selectedProduct)
            setSelectedProduct(null)
            setDeleteModalOpen(false)
        }
    }, [selectedProduct, handleDeleteProduct])

    const handleDeleteSelected = useCallback(
        async (selected: Product[]) => {
            try {
                await Promise.all(selected.map((product) => productService.deleteProduct(product.uuid)))
                toast.success(`${selected.length} product${selected.length > 1 ? "s" : ""} deleted successfully`)
                void refetch()
            } catch {
                toast.error("Failed to delete selected products")
            }
        },
        [refetch]
    )

    const handleAddProduct = useCallback(() => {
        router.push("/admin/products/add-product")
    }, [router])

    const handleViewProduct = useCallback(
        (uuid: string) => {
            router.push(`/admin/products/view-product/${uuid}`)
        },
        [router]
    )

    const handleEditProduct = useCallback(
        (uuid: string) => {
            router.push(`/admin/products/edit-product/${uuid}`)
        },
        [router]
    )

    const handleRefresh = useCallback(() => {
        void refetch()
        toast.success("Products refreshed")
    }, [refetch])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])

    const handleSearch = useCallback((value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }, [])

    const formatPrice = useCallback(
        (price: number) =>
            new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(price),
        []
    )

    const columns: ColumnDef<Product>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
                header: "Product Name",
                accessorKey: "name",
                cell: ({ row }) => (
                    <div
                        className="font-semibold text-gray-900 truncate max-w-[200px] cursor-pointer hover:text-blue-600"
                        title={row.original.name}
                        onClick={() => handleViewProduct(row.original.uuid)}
                    >
                        {row.original.name}
                    </div>
                ),
                enableHiding: false,
                size: 250,
            },
            {
                header: "Brand",
                accessorKey: "brand",
                cell: ({ row }) => (
                    <div className="flex items-center space-x-2">
                        <Building2 size={16} className="text-gray-400" />
                        <span className="truncate max-w-[120px]" title={row.original.brand}>
              {row.original.brand}
            </span>
                    </div>
                ),
                size: 150,
            },
            {
                header: "Price",
                accessorKey: "lowest_variant_price",
                cell: ({ row }) => <span className="font-medium text-green-600">{formatPrice(row.original.lowest_variant_price)}</span>,
                size: 120,
            },
            {
                header: "Status",
                accessorKey: "published",
                cell: ({ row }) => (
                    <Badge
                        variant={row.original.published ? "default" : "secondary"}
                        className={cn(
                            row.original.published
                                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
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
                cell: ({ row }) => {
                    const stock = row.original.total_stock
                    if (stock === 0) {
                        return (
                            <Badge variant="destructive" className="flex items-center space-x-1">
                                <AlertTriangle size={12} />
                                <span>Out of Stock</span>
                            </Badge>
                        )
                    }
                    if (stock < 10) {
                        return (
                            <Badge variant="outline" className="flex items-center space-x-1 border-orange-300 text-orange-700">
                                <AlertTriangle size={12} />
                                <span>{stock} Low Stock</span>
                            </Badge>
                        )
                    }
                    return <span className="font-medium">{stock}</span>
                },
                size: 150,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProduct(row.original.uuid)}
                            className="h-8 w-8 p-0"
                            title="View product details"
                        >
                            <Eye size={16} />
                        </Button>
                        <RowActions row={row} onDeleteAction={() => { setSelectedProduct(row.original); setDeleteModalOpen(true) }} onEditAction={() => handleEditProduct(row.original.uuid)} />
                    </div>
                ),
                size: 120,
                enableSorting: false,
                enableHiding: false,
            },
        ],
        [handleViewProduct, handleEditProduct, formatPrice]
    )

    const noDataContent = useMemo(
        () => (
            <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first product.</p>
                <Button onClick={handleAddProduct} variant="outline" className="mt-4">
                    Add Product
                </Button>
            </div>
        ),
        [handleAddProduct]
    )

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load products</h3>
                            <p className="text-red-700 mb-4">{error instanceof Error ? error.message : "An unexpected error occurred."}</p>
                            <div className="flex space-x-3">
                                <Button onClick={handleRefresh} variant="outline" className="border-red-300 text-red-800 hover:bg-red-100">
                                    Try Again
                                </Button>
                                <Button onClick={() => window.location.reload()} variant="ghost" className="text-red-800 hover:bg-red-100">
                                    Reload Page
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600">Manage your product inventory and pricing</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>
            <DataTable<Product, unknown>
                data={data?.items || []}
                columns={columns}
                loading={isLoading || isFetching}
                onAddAction={handleAddProduct}
                onDeleteAction={handleDeleteSelected}
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
                    pageSizeOptions: [5, 10, 25, 50, 100],
                    dataCount: data?.total_items || 0,
                }}
                noDataText={noDataContent}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Product"
                description={selectedProduct ? `Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.` : "Are you sure you want to delete this product?"}
                confirmLabel="Delete Product"
                onConfirm={confirmDeleteProduct}
                loading={false}
            />
        </div>
    )
}
