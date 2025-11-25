'use client'

import { cn } from "@/lib/utils"
import { DataTable } from "@/components/table/ReusableTable"
import ActionModal from "@/components/modal/ConfirmModal"
import { useRouter } from "next/navigation"
import {useState, useTransition, useMemo, useCallback} from "react"
import { useQuery } from "@tanstack/react-query"
import { ParamsType } from "@/types/types"
import orderService from "@/service/order/order.service"
import { ColumnDef } from "@tanstack/react-table"
import { QUERY_STALE_TIME } from "@/config/app-constant"
import {FormatCurrency, StatusBadge} from "@/lib/helper"
import { Checkbox } from "@/components/ui/checkbox"
import {RowActions} from "@/lib/action-button";

interface AdminAssignedOrder {
    order_uuid: string
    order_code: string
    customer_name: string
    email: string
    mobile: string
    order_status: string
    delivery_address: string
    order_items_count: number
    price: number
}

export default function AdminAssignedOrders() {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [search, setSearch] = useState("")
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<AdminAssignedOrder | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPending, startTransition] = useTransition()

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["admin-assigned-orders", currentPage, search],
        queryFn: async () => {
            const params: ParamsType = { page: currentPage, search }
            const response = await orderService.getAdminAssignOrderList(params)
            setCurrentPage(response.page)
            console.log("response", response)
            return response
        },
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: true,
    })

    const handleViewAction =useCallback((order: AdminAssignedOrder) => {
        router.push(`/admin/assigned/${order.order_uuid}`)
    },[router])

    const columns: ColumnDef<AdminAssignedOrder>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all rows"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select order ${row.original.order_code}`}
                />
            ),
            size: 50,
            enableSorting: false,
        },
        {
            accessorKey: "order_uuid",
            header: "UUID",
            cell: ({ row }) => (
                <span className="font-mono text-xs truncate max-w-[100px] block" title={row.original.order_uuid}>
                    {row.original.order_uuid}
                </span>
            )
        },
        {
            accessorKey: "order_code",
            header: "Order Code",
            cell: ({ row }) => (
                <span className="font-semibold whitespace-nowrap">
                    {row.original.order_code}
                </span>
            )
        },
        {
            accessorKey: "customer_name",
            header: "Customer Details",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1 min-w-[180px]">
                    <div className="font-medium truncate" title={row.original.customer_name}>
                        {row.original.customer_name}
                    </div>
                    <span className="text-xs text-muted-foreground truncate" title={row.original.email}>
                        {row.original.email}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "mobile",
            header: "Mobile",
            cell: ({ row }) => (
                <span className="whitespace-nowrap">{row.original.mobile}</span>
            )
        },
        {
            accessorKey: "order_status",
            header: "Order Status",
            cell: ({ row }) => (
                <StatusBadge status={row.original.order_status} />
            )
        },
        {
            accessorKey: "delivery_address",
            header: "Address",
            cell: ({ row }) => (
                <span className="truncate max-w-[200px] block" title={row.original.delivery_address}>
                    {row.original.delivery_address}
                </span>
            )
        },
        {
            accessorKey: "order_items_count",
            header: "Items",
            cell: ({ row }) => (
                <span className="text-center block">{row.original.order_items_count}</span>
            )
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => (
                <span className="font-semibold whitespace-nowrap">
                    {FormatCurrency(row.original.price)}
                </span>
            )
        },

        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <RowActions row={row}
                            onViewAction={() => handleViewAction(row.original)}
                            />
            )
        }
    ], [handleViewAction])

    const handlePageChange = (page: number) => {
        startTransition(() => setCurrentPage(page))
    }

    const handleSearch = (value: string) => {
        startTransition(() => {
            setSearch(value)
            setCurrentPage(1)
        })
    }

    const handleModalClose = () => {
        setDeleteModalOpen(false)
        setSelectedProduct(null)
    }

    const confirmDeleteProduct = async () => {
        if (!selectedProduct) return
        setIsDeleting(true)
        try {
            handleModalClose()
            await refetch()
        } finally {
            setIsDeleting(false)
        }
    }



    // const isTableLoading = isLoading || isFetching || isPending

    return (
        <div className="space-y-4 sm:space-y-6 w-full ">
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                        Admin Assigned Orders
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Manage orders assigned to administrators
                    </p>
                </div>
            </div>

            <div className="">
                <DataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isLoading}
                    onSearchAction={handleSearch}
                    enableRowSelection
                    enableSorting
                    enableSearch
                    enableColumnVisibility
                    searchPlaceholder="Search orders..."
                    totalCount={data?.total_items ?? 0}
                    pagination={{
                        page: currentPage,
                        totalPages: data?.total_page ?? 1,
                        onPageChange: handlePageChange,
                        dataCount: data?.total_items ?? 0
                    }}
                    noDataText="No assigned orders found."
                />
            </div>

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleModalClose}
                title="Delete Order"
                description="Are you sure you want to delete this assigned order? This action cannot be undone."
                confirmLabel={isDeleting ? "Deleting..." : "Delete"}
                onConfirm={confirmDeleteProduct}
                loading={isDeleting}
                confirmVariant="destructive"
            />
        </div>
    )
}