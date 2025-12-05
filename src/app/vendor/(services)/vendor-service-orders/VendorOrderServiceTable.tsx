"use client"

import { useQuery } from "@tanstack/react-query"
import { useCallback, useMemo, useState, useTransition, memo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/table/ReusableTable"
import { NoDataFound, StatusBadge } from "@/lib/helper"
import type { ColumnDef } from "@tanstack/react-table"
import vendorServiceProviderService from "@/service/serivce-provider/vendor-service-provider.service"
import { StatusUpdateModal } from "./StatusUpdateModal"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

interface BookingResponse {
    booking_uuid: string
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | string
    user_name: string
    service_name: string
    service_slug: string
    message: string | null
    appointment_at: string
}

interface VendorServicesResponse {
    items: BookingResponse[]
    page: number
    total_page: number
    total_items: number
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

function VendorOrderServiceTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()
    const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const { data, isLoading, error, refetch } = useQuery<VendorServicesResponse>({
        queryKey: ["vendorServices", currentPage, searchTerm],
        queryFn: () =>
            vendorServiceProviderService.getServiceOrders({
                page: currentPage,
                search: searchTerm,
            }),
        staleTime: 60000,
        gcTime: 5 * 60 * 1000,
        placeholderData: (prev) => prev,
    })

    const handlePageChange = useCallback((page: number) => {
        startTransition(() => setCurrentPage(page))
    }, [])

    const handleSearch = useCallback((query: string) => {
        startTransition(() => {
            setSearchTerm(query)
            setCurrentPage(1)
        })
    }, [])

    const openStatusModal = useCallback((booking: BookingResponse) => {
        setSelectedBooking(booking)
        setModalOpen(true)
    }, [])

    const closeStatusModal = useCallback(() => {
        setSelectedBooking(null)
        setModalOpen(false)
    }, [])

    const handleStatusSuccess = useCallback(async () => {
        await refetch()
    }, [refetch])

    const columns: ColumnDef<BookingResponse>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all bookings"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={`Select booking ${row.original.booking_uuid}`}
                    />
                ),
                size: 40,
                enableSorting: false,
            },
            {
                header: "User",
                accessorKey: "user_name",
                cell: ({ row }) => <span className="truncate font-medium">{row.original.user_name}</span>,
            },
            {
                header: "Service",
                accessorKey: "service_name",
                cell: ({ row }) => <span className="truncate text-sm">{row.original.service_name}</span>,
            },
            {
                header: "Status",
                accessorKey: "status",
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                header: "Appointment",
                accessorKey: "appointment_at",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(row.original.appointment_at)}
                    </span>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <Button
                        variant="outline"
                        size="sm"
                        className="transition-all hover:scale-105 cursor-pointer bg-transparent"
                        onClick={() => openStatusModal(row.original)}
                    >
                        Update Status
                        <Edit className="ml-2 h-4 w-4" />
                    </Button>
                ),
                size: 120,
            },
        ],
        [openStatusModal],
    )

    if (error) {
        return (
            <div className="w-full p-8 text-center" role="alert">
                <div className="text-destructive font-semibold mb-2">Failed to load vendor services</div>
                <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
        )
    }

    return (
        <div className="w-full space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendor Services</h1>
                    <p className="text-sm text-muted-foreground">Manage and monitor all service bookings</p>
                </div>
            </header>

            <div className="w-full overflow-x-auto">
                <DataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isLoading || isPending}
                    onSearchAction={handleSearch}
                    enableRowSelection
                    enableSorting
                    enableSearch
                    enableColumnVisibility
                    searchPlaceholder="Search by name or service..."
                    totalCount={data?.total_items ?? 0}
                    pagination={{
                        page: currentPage,
                        totalPages: data?.total_page ?? 1,
                        onPageChange: handlePageChange,
                        dataCount: data?.total_items ?? 0,
                    }}
                    noDataText={
                        <NoDataFound
                            title="No bookings found"
                            description={searchTerm ? "No bookings match your search." : "Service bookings will appear here."}
                        />
                    }
                />
            </div>
            <StatusUpdateModal
                open={modalOpen}
                onClose={closeStatusModal}
                booking={selectedBooking}
                onSubmitAction={handleStatusSuccess}
            />
        </div>
    )
}

export default memo(VendorOrderServiceTable)
