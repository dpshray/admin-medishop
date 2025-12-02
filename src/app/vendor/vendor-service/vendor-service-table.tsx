"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_STALE_TIME } from "@/config/app-constant"
import { useCallback, useMemo, useState, useTransition } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/table/ReusableTable"
import { FormatCurrency, NoDataFound, StatusBadge } from "@/lib/helper"
import ActionModal from "@/components/modal/ConfirmModal"

import type { ColumnDef } from "@tanstack/react-table"
import { RowActions } from "@/lib/action-button"
import vendorServiceProviderService from "@/service/serivce-provider/vendor-service-provider.service"
import { STATUS_TYPE } from "@/types/enum"
import VendorServiceDetailsModal from "@/app/vendor/vendor-service/vendeor-service-detaisl-modal"
import { EditIcon } from "lucide-react"
import VendorServiceApplyModal from "@/app/vendor/vendor-service/VendorServiceApplyModal"

interface VendorService {
    service_id: number
    is_made_available_by_admin: boolean
    is_approved_by_admin: boolean
    is_vendor_already_priced: boolean
    vendor_service_status: boolean
    service_name: string
    service_slug: string
    admin_price: number
    admin_discount_percent: number
}

interface VendorServicesResponse {
    items: VendorService[]
    page: number
    total_page: number
    total_items: number
}

export default function VendorServiceTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<VendorService | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()

    const queryClient = useQueryClient()

    const {
        data,
        isLoading: isTableLoading,
        error,
    } = useQuery<VendorServicesResponse>({
        queryKey: ["vendorServices", currentPage, searchTerm],
        queryFn: async () => {
            return await vendorServiceProviderService.getAllVendorServiceProviders({
                page: currentPage,
                search: searchTerm,
            })
        },
        staleTime: QUERY_STALE_TIME,
        placeholderData: (previousData) => previousData,
    })

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => vendorServiceProviderService.deleteVendorServiceProvider(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendorServices"] })
            handleDeleteModalClose()
        },
        onError: (error) => {
            console.error("Failed to delete service:", error)
        },
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

    const handleDeleteModalClose = useCallback(() => {
        setIsDeleteModalOpen(false)
        setSelectedService(null)
    }, [])

    const handleDetailsModalClose = useCallback(() => {
        setIsDetailsModalOpen(false)
        setSelectedService(null)
    }, [])

    const handleApplyModalClose = useCallback(() => {
        setIsApplyModalOpen(false)
        setSelectedService(null)
    }, [])

    const handleViewClick = useCallback((service: VendorService) => {
        setSelectedService(service)
        setIsDetailsModalOpen(true)
    }, [])

    const handleDeleteClick = useCallback((service: VendorService) => {
        setSelectedService(service)
        setIsDeleteModalOpen(true)
    }, [])

    const handleFormApplyClick = useCallback((service: VendorService) => {
        setSelectedService(service)
        setIsApplyModalOpen(true)
    }, [])

    const confirmDeleteService = useCallback(async () => {
        if (!selectedService) return
        await deleteMutation.mutateAsync(selectedService.service_slug)
    }, [selectedService, deleteMutation])

    const handleApplySubmit = useCallback(
        async (values: any) => {
            if (!selectedService) return
            try {
                // await vendorServiceProviderService.applyVendorService(selectedService.service_slug, values)
                queryClient.invalidateQueries({ queryKey: ["vendorServices"] })
                handleApplyModalClose()
            } catch (error) {
                console.error("Failed to update service:", error)
                throw error
            }
        },
        [selectedService, queryClient, handleApplyModalClose],
    )

    const columns: ColumnDef<VendorService>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all services on this page"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={`Select service ${row.original.service_name}`}
                    />
                ),
                size: 40,
                enableSorting: false,
                enableHiding: false,
            },
            {
                header: "Service Name",
                accessorKey: "service_name",
                cell: ({ row }) => <div className="font-medium">{row.original.service_name}</div>,
            },
            {
                header: "Slug",
                accessorKey: "service_slug",
                cell: ({ row }) => <code className="text-xs bg-muted px-2 py-1 rounded">{row.original.service_slug}</code>,
            },
            {
                header: " Admin Price",
                accessorKey: "admin_price",
                cell: ({ row }) => <div className="font-medium">{FormatCurrency(row.original.admin_price)}</div>,
            },
            {
                header: "Discount",
                accessorKey: "admin_discount_percent",
                cell: ({ row }) => <div className="text-sm">{row.original.admin_discount_percent}%</div>,
            },
            {
                header: "Vendor Service Status",
                accessorKey: "vendor_service_status",
                cell: ({ row }) => (
                    <StatusBadge status={row.original.vendor_service_status ? STATUS_TYPE.ACTIVE : STATUS_TYPE.INACTIVE} />
                ),
            },
            {
                header: "Admin Available",
                accessorKey: "is_made_available_by_admin",
                cell: ({ row }) => (
                    <StatusBadge status={row.original.is_made_available_by_admin ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.REJECTED} />
                ),
            },
            {
                header: "Approved",
                accessorKey: "is_approved_by_admin",
                cell: ({ row }) => (
                    <StatusBadge status={row.original.is_approved_by_admin ? STATUS_TYPE.ACCEPTED : STATUS_TYPE.PENDING} />
                ),
            },

            {
                header: "Vendor Priced",
                accessorKey: "is_vendor_already_priced",
                cell: ({ row }) => (
                    <StatusBadge status={row.original.is_vendor_already_priced ? STATUS_TYPE.COMPLETED : STATUS_TYPE.PENDING} />
                ),
            },

            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <RowActions
                        row={row}
                        onViewAction={() => handleViewClick(row.original)}
                        onDeleteAction={() => handleDeleteClick(row.original)}
                        onOtherAction={() => handleFormApplyClick(row.original)}
                        otherIcon={EditIcon}
                    />
                ),
                size: 100,
            },
        ],
        [handleViewClick, handleDeleteClick, handleFormApplyClick],
    )

    if (error) {
        return (
            <div className="w-full p-8 text-center">
                <p className="text-destructive" role="alert">
                    Failed to load vendor services. Please try again.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendor Services</h1>
                    <p className="text-sm text-muted-foreground">Manage and monitor all vendor service offerings</p>
                </div>
            </header>

            <div className="w-full overflow-x-auto">
                <DataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isTableLoading || isPending}
                    onSearchAction={handleSearch}
                    enableRowSelection
                    enableSorting
                    enableSearch
                    enableColumnVisibility
                    searchPlaceholder="Search by service name or slug..."
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
                            title="No services found"
                            description={
                                searchTerm
                                    ? "No services match your search. Try different keywords."
                                    : "Vendor services will appear here once available."
                            }
                        />
                    }
                />
            </div>

            {selectedService && (
                <VendorServiceDetailsModal
                    slug={selectedService.service_slug}
                    open={isDetailsModalOpen}
                    onCloseAction={handleDetailsModalClose}
                />
            )}

            {selectedService && (
                <VendorServiceApplyModal
                    open={isApplyModalOpen}
                    onCloseAction={handleApplyModalClose}
                    onSubmitAction={handleApplySubmit}
                    initialData={{
                        service_id: selectedService.service_id,
                        is_available: selectedService.vendor_service_status,
                        price: selectedService.admin_price,
                    }}
                    serviceName={selectedService.service_name}
                />
            )}

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleDeleteModalClose}
                title="Delete Service"
                description={
                    selectedService
                        ? `Are you sure you want to delete the service "${selectedService.service_name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this service? This action cannot be undone."
                }
                confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete Service"}
                onConfirm={confirmDeleteService}
                loading={deleteMutation.isPending}
                confirmVariant="destructive"
            />
        </div>
    )
}
