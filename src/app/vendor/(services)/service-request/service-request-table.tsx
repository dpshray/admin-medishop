"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState, useTransition } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/table/ReusableTable"
import { FormatCurrency, NoDataFound, StatusBadge } from "@/lib/helper"
import type { ColumnDef } from "@tanstack/react-table"
import vendorServiceProviderService from "@/service/serivce-provider/vendor-service-provider.service"
import { QUERY_STALE_TIME } from "@/config/app-constant"

interface VendorServiceResponse {
    is_approved_by_admin: boolean
    vendor_service_status: boolean
    service_name: string
    service_slug: string
    vendor_price: number
}

interface VendorServicesResponse {
    items: VendorServiceResponse[]
    page: number
    total_page: number
    total_items: number
}

export default function ServiceRequestTable() {
    const [currentPage, setCurrentPage] = useState(1)

    const [searchTerm, setSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()

    const { data, isLoading, error } = useQuery<VendorServicesResponse>({
        queryKey: ["vendorServices", currentPage, searchTerm],
        queryFn: () =>
            vendorServiceProviderService.getRequestForService({
                page: currentPage,
                search: searchTerm,
            }),
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: false,
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

    const columns: ColumnDef<VendorServiceResponse>[] = useMemo(
        () => [
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
                        aria-label={`Select row ${row.index + 1}`}
                    />
                ),
                size: 40,
                enableSorting: false,
            },
            {
                header: "Service Name",
                accessorKey: "service_name",
                cell: ({ row }) => <span className="text-sm md:text-base">{row.original.service_name}</span>,
            },
            {
                header: "Slug",
                accessorKey: "service_slug",
                cell: ({ row }) => (
                    <code className="text-xs md:text-sm bg-muted px-2 py-1 rounded">{row.original.service_slug}</code>
                ),
            },
            {
                header: "Vendor Price",
                accessorKey: "vendor_price",
                cell: ({ row }) => (
                    <span className="text-sm md:text-base font-medium">{FormatCurrency(row.original.vendor_price)}</span>
                ),
            },
            {
                header: "Approval Status",
                accessorKey: "is_approved_by_admin",
                cell: ({ row }) => <StatusBadge status={row.original.is_approved_by_admin ? "Approved" : "Pending"} />,
            },
            {
                header: "Service Status",
                accessorKey: "vendor_service_status",
                cell: ({ row }) => <StatusBadge status={row.original.vendor_service_status ? "Active" : "Inactive"} />,
            },
        ],
        [],
    )

    if (error)
        return (
            <div className="w-full p-6 md:p-8 text-center text-destructive" role="alert">
                <p>Failed to load vendor services.</p>
            </div>
        )

    return (
        <main className="w-full space-y-4 md:space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Vendor Service Requests</h1>
                    <p className="text-sm md:text-base text-muted-foreground">List of services requested approved by admin.</p>
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
                    searchPlaceholder="Search by name or slug..."
                    totalCount={data?.total_items ?? 0}
                    pagination={{
                        page: currentPage,
                        totalPages: data?.total_page ?? 1,
                        onPageChange: handlePageChange,
                        dataCount: data?.total_items ?? 0,
                    }}
                    noDataText={
                        <NoDataFound
                            title="No service requests found"
                            description={
                                searchTerm ? "No service requests match your search." : "Requested services will appear here."
                            }
                        />
                    }
                />
            </div>
        </main>
    )
}
