'use client'

import { useQuery, useQueryClient } from "@tanstack/react-query"
import vendorOrderService from "@/service/order/vendor-order.service"
import { DEFAULT_PAGE_SIZE } from "@/config/app-constant"
import { useCallback, useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge } from "@/lib/helper"
import { DataTable } from "@/components/table/ReusableTable"
import ActionModal from "@/components/modal/ConfirmModal"
import { Package, ShoppingCart } from "lucide-react"

interface AssignedOrder {
    order_uuid: string
    payment_method: string
    payment_status: "PAID" | "UNPAID" | string
    status: string
    no_of_ordered_items: number
    order_code: string
    name: string
    email: string
    mobile: string
    address: string
}

export default function VendorOrderTable() {
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [totalItems, setTotalItems] = useState<number>(0)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
    const [selectedOrder, setSelectedOrder] = useState<AssignedOrder | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    const { data, isLoading, error } = useQuery({
        queryKey: ["vendor-orders", currentPage, pageSize],
        queryFn: async () => {
            const params = { page: currentPage, limit: pageSize }
            const res = await vendorOrderService.getVendorOrders(params)
            setTotalItems(res?.total_items || 0)
            setTotalPages(res?.total_page || 1)
            return res
        },
        staleTime: 30000,
        gcTime: 300000,
    })

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])

    const handleModalClose = useCallback(() => {
        setIsDeleteModalOpen(false)
        setSelectedOrder(null)
    }, [])

    const confirmDeleteProduct = useCallback(async () => {
        if (!selectedOrder) return

        setIsDeleting(true)
        try {
            // await vendorOrderService.deleteVendorOrder(selectedOrder.order_uuid)
            await queryClient.invalidateQueries({ queryKey: ["vendor-orders"] })
            handleModalClose()
        } catch (error) {
            console.error("Failed to delete order:", error)
        } finally {
            setIsDeleting(false)
        }
    }, [selectedOrder, queryClient, handleModalClose])

    const assignedOrderColumns = useMemo<ColumnDef<AssignedOrder>[]>(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all orders"
                        className="translate-y-[2px]"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={`Select order ${row.original.order_code}`}
                        className="translate-y-[2px]"
                    />
                ),
                size: 50,
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "order_code",
                header: "Order Code",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-gray-900">{row.original.order_code}</span>
                    </div>
                ),
            },
            {
                accessorKey: "name",
                header: "Customer",
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-900">{row.original.name}</span>
                        <span className="text-sm text-gray-500">{row.original.email}</span>
                    </div>
                ),
            },
            {
                accessorKey: "address",
                header: "Delivery Details",
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5 max-w-[250px]">
                        <span className="text-sm text-gray-900 line-clamp-2" title={row.original.address}>
                            {row.original.address}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">{row.original.mobile}</span>
                    </div>
                ),
            },
            {
                accessorKey: "payment_method",
                header: "Payment",
                cell: ({ row }) => (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                            {row.original.payment_method?.replace(/_/g, ' ')}
                        </span>
                        <StatusBadge status={row.original.payment_status} />
                    </div>
                ),
            },
            {
                accessorKey: "status",
                header: "Order Status",
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                accessorKey: "no_of_ordered_items",
                header: "Items",
                cell: ({ row }) => (
                    <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        <span className="font-medium text-gray-900">{row.original.no_of_ordered_items}</span>
                    </div>
                ),
            },
        ],
        []
    )

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="text-red-500 text-center">
                    <h3 className="text-lg font-semibold">Failed to load orders</h3>
                    <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Vendor Orders
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage and track all vendor-specific orders in one place
                    </p>
                </div>
            </div>

            <DataTable<AssignedOrder, unknown>
                data={data?.items || []}
                columns={assignedOrderColumns}
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search by order code, customer name, or email..."
                totalCount={data?.total_items ?? 0}
                loading={isLoading}
                pagination={{
                    page: currentPage,
                    totalPages,
                    pageSize,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                    pageSizeOptions: [5, 10, 25, 50],
                    dataCount: totalItems,
                }}
                noDataText="No orders found. Orders will appear here once customers place them."
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleModalClose}
                title="Delete Order"
                description={
                    selectedOrder
                        ? `Are you sure you want to delete order "${selectedOrder.order_code}" from ${selectedOrder.name}? This action cannot be undone and will permanently remove all order data.`
                        : "Are you sure you want to delete this order? This action cannot be undone."
                }
                confirmLabel={isDeleting ? "Deleting..." : "Delete Order"}
                onConfirm={confirmDeleteProduct}
                loading={isDeleting}
                confirmVariant="destructive"
            />
        </div>
    )
}