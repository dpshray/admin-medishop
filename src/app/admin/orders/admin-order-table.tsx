'use client'

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import orderService from "@/service/order.service";
import { ParamsType } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/table/ReusableTable";
import ActionModal from "@/components/modal/ConfirmModal";
import { cn } from "@/lib/utils";
import { RowActions } from "@/lib/helper";

type OrderType = {
    order_uuid: string;
    payment_method: string;
    payment_status: "PAID" | "UNPAID" | "PENDING";
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    no_of_ordered_items: number;
    order_code: string;
    name: string;
    email: string;
    mobile: string;
    address: string;
};

const PAYMENT_STATUS_VARIANTS: Record<OrderType['payment_status'], string> = {
    PAID: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300",
    UNPAID: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300",
    PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
};

const ORDER_STATUS_VARIANTS: Record<OrderType['status'], string> = {
    PENDING: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
    PROCESSING: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
    SHIPPED: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
    DELIVERED: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const QUERY_STALE_TIME = 30000;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

export default function AdminOrderTable() {
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = useState("");
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ["admin-orders", currentPage, pageSize, search],
        queryFn: async () => {
            const params: ParamsType = {
                page: currentPage,
                per_page: pageSize,
                search
            };
            const response = await orderService.getAllOrders(params);
            setCurrentPage(response.page);
            return response;
        },
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: false,
    });

    const handleView = useCallback((order: OrderType) => {
        router.push(`/admin/orders/${order.order_uuid}`);
    }, [router]);

    const handleEdit = useCallback((order: OrderType) => {
        router.push(`/admin/orders/${order.order_uuid}/edit`);
    }, [router]);

    const handleDeleteClick = useCallback((order: OrderType) => {
        setSelectedOrder(order);
        setDeleteModalOpen(true);
    }, []);

    const confirmDeleteOrder = useCallback(async () => {
        if (!selectedOrder) return;

        setIsDeleting(true);
        try {
            await orderService.deleteOrder(selectedOrder.order_uuid);
            setDeleteModalOpen(false);
            setSelectedOrder(null);
            await refetch();
        } catch (error) {
            console.error("Failed to delete order:", error);
        } finally {
            setIsDeleting(false);
        }
    }, [selectedOrder, refetch]);

    const columns: ColumnDef<OrderType>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all orders on this page"
                    className="mx-auto"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select order ${row.original.order_code}`}
                    className="mx-auto"
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
                <span className="font-medium text-sm whitespace-nowrap">
                    {row.original.order_code}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: "name",
            header: "Customer",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1 min-w-[150px] max-w-[250px]">
                    <span className="font-medium text-sm truncate">
                        {row.original.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        {row.original.email}
                    </span>
                </div>
            ),
            enableSorting: true,
        },
        {
            accessorKey: "no_of_ordered_items",
            header: () => (
                <span className="flex justify-center w-full">Items</span>
            ),
            cell: ({ row }) => (
                <span className="text-sm font-medium flex justify-center w-full">
                    {row.original.no_of_ordered_items}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: "payment_status",
            header: "Payment",
            cell: ({ row }) => {
                const status = row.original.payment_status;
                return (
                    <Badge
                        className={cn(
                            "text-xs font-medium capitalize",
                            PAYMENT_STATUS_VARIANTS[status]
                        )}
                        variant="secondary"
                    >
                        {status.toLowerCase()}
                    </Badge>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: "status",
            header: "Order Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge
                        className={cn(
                            "text-xs font-medium capitalize",
                            ORDER_STATUS_VARIANTS[status]
                        )}
                        variant="secondary"
                    >
                        {status.toLowerCase()}
                    </Badge>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: "address",
            header: "Delivery Info",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1 min-w-[180px] max-w-[250px]">
                    <span
                        className="text-sm truncate"
                        title={row.original.address}
                    >
                        {row.original.address}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.mobile}
                    </span>
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
                <RowActions
                    row={row}
                    onDeleteAction={() => handleDeleteClick(row.original)}
                    onEditAction={() => handleEdit(row.original)}
                    onViewAction={() => handleView(row.original)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }
    ], [handleDeleteClick, handleEdit, handleView]);

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setCurrentPage(DEFAULT_PAGE);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(DEFAULT_PAGE);
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleModalClose = useCallback((open: boolean) => {
        if (!isDeleting) {
            setDeleteModalOpen(open);
            if (!open) {
                setSelectedOrder(null);
            }
        }
    }, [isDeleting]);

    const isTableLoading = isLoading || isFetching;

    return (
        <div className="">
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

            <DataTable
                data={data?.items ?? []}
                columns={columns}
                loading={isTableLoading}
                onSearchAction={handleSearch}
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search by customer name, email, or order code..."
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
                noDataText="No orders found. Orders will appear here once customers place them."
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
    );
}