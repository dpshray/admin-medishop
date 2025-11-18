'use client'

import {useCallback, useMemo, useState} from "react"
import {useRouter} from "next/navigation"
import {useQuery} from "@tanstack/react-query"

import {RefreshCw} from "lucide-react"
import orderService from "@/service/order/order.service"
import {ParamsType} from "@/types/types"
import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {DataTable} from "@/components/table/ReusableTable"
import ActionModal from "@/components/modal/ConfirmModal"
import {cn} from "@/lib/utils"
import {NoDataFound, StatusBadge} from "@/lib/helper"
import {RowActions} from "@/lib/action-button"
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, QUERY_STALE_TIME} from "@/config/app-constant"
import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge";
import {ORDER_STATUS, PAYMENT_STATUS} from "@/types/enum";


interface OrderType {
    order_uuid: string
    payment_method: string
    payment_status: PAYMENT_STATUS
    status: ORDER_STATUS
    no_of_ordered_items: number
    git_wrap: boolean
    is_already_assigned_to_vendor: boolean
    order_code: string
    name: string
    email: string
    mobile: string
    address: string
}

interface OrdersResponse {
    items: OrderType[]
    total_items: number
    total_page: number
    page: number
}

export default function AdminOrderTable() {
    const router = useRouter()

    const [currentPage, setCurrentPage] = useState<number>(DEFAULT_PAGE)
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState<string>("")
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const {data, isLoading, isFetching, refetch} = useQuery<OrdersResponse>({
        queryKey: ["admin-orders", currentPage, pageSize, search],
        queryFn: async () => {
            const params: ParamsType = {
                page: currentPage,
                per_page: pageSize,
                search
            }
            const response = await orderService.getAllOrders(params)
            setCurrentPage(response.page)
            console.log("Orders response:", response)
            return response
        },
        staleTime: QUERY_STALE_TIME,
    })
    const handleView = useCallback((order: OrderType): void => {
        router.push(`/admin/orders/${order.order_uuid}`)
    }, [router])


    const handleDeleteClick = useCallback((order: OrderType): void => {
        setSelectedOrder(order)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteOrder = useCallback(async (): Promise<void> => {
        if (!selectedOrder) return

        setIsDeleting(true)
        try {
            await orderService.deleteOrder(selectedOrder.order_uuid)
            setDeleteModalOpen(false)
            setSelectedOrder(null)
            await refetch()
        } catch (error) {
            console.error("Failed to delete order:", error)
        } finally {
            setIsDeleting(false)
        }
    }, [selectedOrder, refetch])

    const columns: ColumnDef<OrderType>[] = useMemo(() => [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all orders on this page"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select order ${row.original.order_uuid}`}
                />
            ),
            size: 40,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "order_code",
            header: "Order Code",
            cell: ({row}) => (
                <div className="font-medium text-sm cursor-pointer" onClick={() => handleView(row.original)}>
                    {row.original.order_code}
                </div>
            ),
            enableSorting: true,
            size: 180,
        },
        {
            accessorKey: "name",
            header: "Customer",
            cell: ({row}) => (
                <div className="flex flex-col gap-0.5">
                    <div className="font-medium text-sm">
                        {row.original.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.email}
                    </div>
                </div>
            ),
            enableSorting: true,
            size: 200,
        },
        {
            accessorKey: "no_of_ordered_items",
            header: "Order Items",
            cell: ({row}) => (
                <div className="text-sm font-medium text-center">
                    {row.original.no_of_ordered_items}
                </div>
            ),
            enableSorting: true,
            size: 80,
        },
        {
            accessorKey: "payment_status",
            header: "Payment Status:",
            cell: ({row}) => (
                <StatusBadge status={row.original.payment_status}/>
            ),
            enableSorting: true,
            size: 120,
        },
        {
            accessorKey: 'is_already_assigned_to_vendor',
            header: 'Order Assigned',
            cell: ({row}) => (
                <StatusBadge
                    status={row.original.is_already_assigned_to_vendor ? ORDER_STATUS.ASSIGNED : ORDER_STATUS.PENDING}/>
            ),
            enableSorting: true,
            size: 120,
        },
        {
            accessorKey: "gift_wrap",
            header: "Gift Wrap",
            cell: ({row}) => (
                <Badge
                    variant={'outline'}
                    className={cn(row.original.git_wrap ? "bg-green-500" : "bg-red-500", "font-medium text-white")}>{row.original.git_wrap ? "Yes" : "No"}</Badge>
            )

        },
        {
            accessorKey: "status",
            header: "Order Status",
            cell: ({row}) => (
                <StatusBadge status={row.original.status}/>
            ),
            enableSorting: true,
            size: 140,
        },
        {
            accessorKey: "address",
            header: "Delivery Address",
            cell: ({row}) => (
                <div className="flex flex-col gap-0.5">
                    <div className="text-sm">
                        {row.original.address}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.mobile}
                    </div>
                </div>
            ),
            size: 250,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onDeleteAction={() => handleDeleteClick(row.original)}
                    onViewAction={() => handleView(row.original)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 80,
        }
    ], [handleDeleteClick, handleView])

    const handleSearch = useCallback((value: string): void => {
        setSearch(value)
        setCurrentPage(DEFAULT_PAGE)
    }, [])

    const handlePageChange = useCallback((page: number): void => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number): void => {
        setPageSize(size)
        setCurrentPage(DEFAULT_PAGE)
    }, [])

    const handleRefresh = useCallback((): void => {
        refetch()
    }, [refetch])

    const handleModalClose = useCallback((open: boolean): void => {
        if (!isDeleting) {
            setDeleteModalOpen(open)
            if (!open) {
                setSelectedOrder(null)
            }
        }
    }, [isDeleting])

    const isTableLoading = isLoading || isFetching

    return (
        <div className="w-full space-y-6 ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Orders
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and track all customer orders
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    disabled={isFetching}
                    aria-label="Refresh orders list"
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

            <div className={'w-fit'}>
                <DataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isTableLoading}
                    onSearchAction={handleSearch}
                    enableRowSelection={true}
                    enableSorting={true}
                    enableSearch={true}
                    enableColumnVisibility={true}
                    searchPlaceholder="Search by customer name, email, or order code..."
                    totalCount={data?.total_items ?? 0}
                    className="w-full"
                    tableClassName="w-full"
                    pagination={{
                        page: currentPage,
                        totalPages: data?.total_page ?? 1,
                        pageSize,
                        onPageChange: handlePageChange,
                        onPageSizeChange: handlePageSizeChange,
                        pageSizeOptions: [...PAGE_SIZE_OPTIONS],
                        dataCount: data?.total_items ?? 0,
                    }}
                    noDataText={
                        <NoDataFound
                            title="No orders found"
                            description="Orders will appear here once customers place them."
                        />
                    }
                />

                <ActionModal
                    open={isDeleteModalOpen}
                    setOpen={handleModalClose}
                    title="Delete Order"
                    description={
                        selectedOrder
                            ? `Are you sure you want to delete order "${selectedOrder.order_code}"? This action cannot be undone and will permanently remove all order data.`
                            : "Are you sure you want to delete this order? This action cannot be undone."
                    }
                    confirmLabel={isDeleting ? "Deleting..." : "Delete Order"}
                    onConfirm={confirmDeleteOrder}
                    loading={isDeleting}
                    confirmVariant="destructive"
                />
            </div>
        </div>
    )
}