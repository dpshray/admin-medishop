"use client"

import { useQuery } from "@tanstack/react-query"
import bookingService from "@/service/serivce-provider/booking-service-.service"
import { ParamsType } from "@/types/types"
import { useCallback, useMemo, useState, useTransition } from "react"
import { DataTable } from "@/components/table/ReusableTable"
import { FormatDate, NoDataFound, StatusBadge } from "@/lib/helper"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { RowActions } from "@/lib/action-button"
import { STATUS_TYPE } from "@/types/enum"
import { useRouter } from "next/navigation"

/**
 * Type definition for a booked service item
 */
type BookedService = {
    booking_uuid: string
    status: string
    ordered_by: string
    service_name: string
    service_slug: string
    assigned_vendor: string | null
    appointment_at: string
    created_at: string
}

/**
 * Type definition for the API response containing booked services
 */
type BookedServiceResponse = {
    items: BookedService[]
    page: number
    total_page: number
    total_items: number
}

/**
 * BookingServiceTable Component
 *
 * Displays a paginated, searchable table of booked services with the following features:
 * - Row selection with checkboxes
 * - Search functionality with debouncing
 * - Pagination controls
 * - Status badges for service and vendor assignment status
 * - Action buttons for viewing booking details
 *
 * @returns {JSX.Element} The rendered booking service table
 */
export default function BookingServiceTable() {
    // State management
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    /**
     * Fetches booked services data with pagination and search
     * Uses React Query for caching and automatic refetching
     */
    const { data, isLoading: isTableLoading } = useQuery<BookedServiceResponse>({
        queryKey: ["booked-services", currentPage, searchTerm],
        queryFn: async () => {
            const params: ParamsType = { page: currentPage, search: searchTerm }
            return await bookingService.getAllBookingServices(params)
        },
        // Enable background refetching for better UX
        staleTime: 30000, // Consider data fresh for 30 seconds
        // Keep previous data while fetching new data to prevent loading flickers
        placeholderData: (previousData) => previousData,
    })

    /**
     * Handles search input changes
     * Resets to first page when search term changes
     * Uses transition to prevent blocking UI updates
     *
     * @param {string} value - The search term entered by user
     */
    const handleSearch = useCallback((value: string) => {
        startTransition(() => {
            setSearchTerm(value)
            setCurrentPage(1)
        })
    }, [])

    /**
     * Handles pagination page changes
     * Uses transition for non-blocking updates
     *
     * @param {number} page - The page number to navigate to
     */
    const handlePageChange = useCallback((page: number) => {
        startTransition(() => {
            setCurrentPage(page)
        })
    }, [])

    /**
     * Navigates to the booking detail page
     * Memoized to prevent unnecessary re-renders of child components
     *
     * @param {BookedService} row - The booking service row data
     */
    const handleViewClick = useCallback(
        (row: BookedService) => {
            router.push(`/admin/booked-services/${row.booking_uuid}`)
        },
        [router]
    )

    /**
     * Column definitions for the data table
     * Memoized to prevent unnecessary recalculations on re-renders
     */
    const columns: ColumnDef<BookedService>[] = useMemo(
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
                        aria-label="Select all rows"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={`Select booking for ${row.original.ordered_by}`}
                    />
                ),
                size: 40,
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: "User",
                accessorKey: "ordered_by",
                cell: ({ row }) => (
                    <div className="font-medium" title={row.original.ordered_by}>
                        {row.original.ordered_by}
                    </div>
                ),
            },
            {
                header: "Service",
                accessorKey: "service_name",
                cell: ({ row }) => (
                    <div title={row.original.service_name}>
                        {row.original.service_name}
                    </div>
                ),
            },
            {
                header: "Appointment",
                accessorKey: "appointment_at",
                cell: ({ row }) => (
                    <div title={row.original.appointment_at}>
                        {row.original.appointment_at}
                    </div>
                ),
            },
            {
                header: "Status",
                accessorKey: "status",
                cell: ({ row }) => (
                    <div>
                        <StatusBadge status={row.original.status} />
                    </div>
                ),
            },
            {
                header: "Vendor",
                accessorKey: "assigned_vendor",
                cell: ({ row }) => (
                    <div>
                        {row.original.assigned_vendor ? (
                            <span title={row.original.assigned_vendor}>
                                {row.original.assigned_vendor}
                            </span>
                        ) : (
                            <StatusBadge status={STATUS_TYPE.NOTASSIGNED} />
                        )}
                    </div>
                ),
            },
            {
                header: "Created",
                accessorKey: "created_at",
                cell: ({ row }) => (
                    <div title={row.original.created_at}>
                        {FormatDate(row.original.created_at)}
                    </div>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <RowActions
                        row={row}
                        onViewAction={() => handleViewClick(row.original)}
                    />
                ),
                size: 80,
            },
        ],
        [handleViewClick]
    )

    // Combine loading states for better UX
    const isLoading = isTableLoading || isPending

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            {/* Page Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Booked Services
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage all booked services
                    </p>
                </div>
            </header>

            {/* Data Table Container */}
            <div className="w-full overflow-x-auto">
                <DataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isLoading}
                    onSearchAction={handleSearch}
                    enableRowSelection
                    enableSorting
                    enableSearch
                    enableColumnVisibility
                    searchPlaceholder="Search booked services..."
                    totalCount={data?.total_items ?? 0}
                    className="w-full"
                    tableClassName="min-w-full"
                    pagination={{
                        page: currentPage,
                        totalPages: data?.total_page ?? 1,
                        onPageChange: handlePageChange,
                        dataCount: data?.total_items ?? 0,
                    }}
                    noDataText={
                        <NoDataFound
                            title="No booked services found"
                            description={
                                searchTerm
                                    ? "No bookings match your search."
                                    : "Booked services will appear here once available."
                            }
                        />
                    }
                />
            </div>
        </div>
    )
}