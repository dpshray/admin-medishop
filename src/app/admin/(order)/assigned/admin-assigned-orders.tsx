'use client'
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/table/ReusableTable"
import ActionModal from "@/components/modal/ConfirmModal"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useQuery } from "@tanstack/react-query"
import { ParamsType } from "@/types/types"
import orderService from "@/service/order/order.service"
import {ColumnDef} from "@tanstack/react-table";

interface AdminAssignedOrder {
    id: number
    order_code: string
    price: number
    user_name: string
    user_email: string
    order_items_count: number
    status: 'pending' | 'completed' | 'processing' | 'cancelled'
    created_at: string
}

export default function AdminAssignedOrders() {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [search, setSearch] = useState<string>("")
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
    const [selectedProduct, setSelectedProduct] = useState<AdminAssignedOrder | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition()

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ["admin-assigned-orders", currentPage, search],
        queryFn: async () => {
            const params: ParamsType = { page: currentPage, search }
            const response = await orderService.getAdminAssignOrderList(params)
            setCurrentPage(response.page)
            console.log('Response from admin assigned orders', response)
            return response
        },
        staleTime: 300000,
        refetchOnWindowFocus: true
    })

    const columns: ColumnDef<AdminAssignedOrder>[] = [
        {
            accessorKey: 'order_code',
            header: 'Order Code',
        },
        {
            accessorKey: 'user_name',
            header: 'User Name',
        },
        {
            accessorKey: 'user_email',
            header: 'User Email',
        },
        {
            accessorKey: 'order_items_count',
            header: 'Items',
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: info => `NPR ${info.getValue<number>().toLocaleString()}`,
        },
        {
            accessorKey: 'status',
            header: 'Status',
        },
        {
            accessorKey: 'created_at',
            header: 'Created At',
            cell: info => new Date(info.getValue<string>()).toLocaleString(),
        }
    ]

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
            refetch()
        } finally {
            setIsDeleting(false)
        }
    }

    const isTableLoading = isLoading || isFetching

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Assigned Orders</h1>
                    <p className="text-sm text-muted-foreground">Manage orders assigned to administrators</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className={cn(isFetching && "animate-spin")}
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
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

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleModalClose}
                title="Delete Order"
                description="Are you sure you want to delete this assigned order?"
                confirmLabel={isDeleting ? "Deleting..." : "Delete"}
                onConfirm={confirmDeleteProduct}
                loading={isDeleting}
                confirmVariant="destructive"
            />
        </div>
    )
}