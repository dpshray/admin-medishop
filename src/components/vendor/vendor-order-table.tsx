'use client'

import {useQuery, useQueryClient} from "@tanstack/react-query"
import vendorOrderService from "@/service/order/vendor-order.service"
import {DEFAULT_PAGE_SIZE} from "@/config/app-constant"
import {useCallback, useMemo, useState, useTransition} from "react"
import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {StatusBadge} from "@/lib/helper"
import {DataTable} from "@/components/table/ReusableTable"
import ActionModal from "@/components/modal/ConfirmModal"
import {Package, ShoppingCart} from "lucide-react"
import {RowActions} from "@/lib/action-button"
import {useRouter} from "next/navigation"

interface AssignedOrder {
    order_uuid: string
    order_code: string
    customer_name: string
    order_status: string
    delivery_address: string
    mobile: string
    email: string
    order_items_count: number
}

export default function VendorOrderTable() {
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<AssignedOrder | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [pending, startTransition] = useTransition()
    const router = useRouter()

    const {data, isLoading, error} = useQuery({
        queryKey: ["vendor-orders", currentPage, pageSize],
        queryFn: async () => {
            const params = {page: currentPage, limit: pageSize}
            const res = await vendorOrderService.getVendorOrders(params)
            setTotalItems(res?.total_items || 0)
            setTotalPages(res?.total_page || 1)
            return res
        },
        staleTime: 30000,
        gcTime: 300000,
    })

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])
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
            await queryClient.invalidateQueries({queryKey: ["vendor-orders"]})
            handleModalClose()
        } finally {
            setIsDeleting(false)
        }
    }, [selectedOrder, queryClient, handleModalClose])

    const handleViewOrder = useCallback(
        (order: AssignedOrder) => {
            startTransition(() => {
                router.push(`/vendor/vendor-orders/${order.order_uuid}`)
            })
        },
        [router, startTransition]
    )

    const assignedOrderColumns = useMemo<ColumnDef<AssignedOrder>[]>(
        () => [
            {
                id: "select",
                header: ({table}) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all orders"
                        className="translate-y-[2px]"
                    />
                ),
                cell: ({row}) => (
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
                cell: ({row}) => (
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-gray-900">{row.original.order_code}</span>
                    </div>
                ),
            },
            {
                accessorKey: "customer_name",
                header: "Customer",
                cell: ({row}) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-gray-900">{row.original.customer_name}</span>
                        <span className="text-sm text-gray-500">{row.original.email}</span>
                    </div>
                ),
            },
            {
                accessorKey: "delivery_address",
                header: "Delivery Details",
                cell: ({row}) => (
                    <div className="flex flex-col gap-0.5 max-w-[250px]">
                        <span className="text-sm text-gray-900 line-clamp-2">{row.original.delivery_address}</span>
                        <span className="text-sm text-gray-500 font-medium">{row.original.mobile}</span>
                    </div>
                ),
            },
            {
                accessorKey: "order_status",
                header: "Order Status",
                cell: ({row}) => <StatusBadge status={row.original.order_status} />,
            },
            {
                accessorKey: "order_items_count",
                header: "Items",
                cell: ({row}) => (
                    <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        <span className="font-medium text-gray-900">{row.original.order_items_count}</span>
                    </div>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({row}) => <RowActions row={row} onViewAction={() => handleViewOrder(row.original)} />,
            },
        ],
        [handleViewOrder]
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Vendor Orders</h1>
                    <p className="text-sm text-gray-500">Manage and track all vendor-specific orders in one place</p>
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
                        ? `Are you sure you want to delete order "${selectedOrder.order_code}" from ${selectedOrder.customer_name}?`
                        : "Are you sure you want to delete this order?"
                }
                confirmLabel={isDeleting ? "Deleting..." : "Delete Order"}
                onConfirm={confirmDeleteProduct}
                loading={isDeleting}
                confirmVariant="destructive"
            />
        </div>
    )
}
