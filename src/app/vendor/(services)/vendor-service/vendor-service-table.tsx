"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState, useTransition } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/table/ReusableTable"
import { FormatCurrency, NoDataFound } from "@/lib/helper"
import { ColumnDef } from "@tanstack/react-table"
import vendorServiceProviderService from "@/service/serivce-provider/vendor-service-provider.service"
import { Button } from "@/components/ui/button"
import VendorServiceRequestModal from "@/app/vendor/(services)/vendor-service/VendorServiceRequestModal"
import { QUERY_STALE_TIME } from "@/config/app-constant"

interface VendorService {
    id: number
    name: string
    slug: string
    admin_price: number
}

interface VendorServicesResponse {
    items: VendorService[]
    page: number
    total_page: number
    total_items: number
}

export default function VendorServiceTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedService, setSelectedService] = useState<VendorService | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery<VendorServicesResponse>({
        queryKey: ["vendorServices", currentPage, searchTerm],
        queryFn: async () =>
            vendorServiceProviderService.getAllVendorServiceProviders({
                page: currentPage,
                search: searchTerm,
            }),
        staleTime: QUERY_STALE_TIME,
        refetchOnWindowFocus: true,
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

    const handleRequestClick = useCallback((service: VendorService) => {
        setSelectedService(service)
        setIsRequestModalOpen(true)
    }, [])

    const columns: ColumnDef<VendorService>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        aria-label="Select all"
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        aria-label={`Select row ${row.index + 1}`}
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                    />
                ),
                size: 40,
                enableSorting: false,
            },
            { header: "Name", accessorKey: "name" },
            { header: "Slug", accessorKey: "slug", cell: ({ row }) => <code>{row.original.slug}</code> },
            {
                header: "Admin Price",
                accessorKey: "admin_price",
                cell: ({ row }) => FormatCurrency(row.original.admin_price),
            },
            {
                header: "Request Service",
                cell: ({ row }) => (
                    <Button
                        aria-label={`Request service for ${row.original.name}`}
                        onClick={() => handleRequestClick(row.original)}
                    >
                        Request Service
                    </Button>
                ),
            },
        ],
        [handleRequestClick]
    )

    if (error) {
        return (
            <div className="w-full p-8 text-center text-destructive">
                Failed to load vendor services.
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Vendor Services</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and monitor all vendor service offerings
                    </p>
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
                            title="No services found"
                            description={
                                searchTerm
                                    ? "No services match your search."
                                    : "Vendor services will appear here."
                            }
                        />
                    }
                />
            </div>

            {selectedService && (
                <VendorServiceRequestModal
                    open={isRequestModalOpen}
                    onCloseAction={(open) => {
                        setIsRequestModalOpen(open)
                        if (!open) setSelectedService(null)
                    }}
                    onSubmitAction={async () => {
                        queryClient.invalidateQueries({ queryKey: ["vendorServices"] })
                        setIsRequestModalOpen(false)
                        setSelectedService(null)
                    }}
                    slug={selectedService.slug}
                    serviceName={selectedService.name}
                />
            )}
        </div>
    )
}
