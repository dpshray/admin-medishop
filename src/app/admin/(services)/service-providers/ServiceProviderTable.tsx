"use client"

import {useCallback, useMemo, useState, useTransition} from "react"
import {DataTable} from "@/components/table/ReusableTable"
import {NoDataFound} from "@/lib/helper"
import ActionModal from "@/components/modal/ConfirmModal"
import ServiceProviderFormModal from "@/app/admin/(services)/service-providers/service-modal-form"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {QUERY_STALE_TIME} from "@/config/app-constant"
import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {RowActions} from "@/lib/action-button"
import serviceProvider from "@/service/serivce-provider/service-provider.service"

interface ServiceProvider {
    name: string
    slug: string
    description: string
    logo: string
    price: number
    is_active: boolean
}

type FormMode = "create" | "edit"

export default function AdminServiceProviderTable() {
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false)
    const [formMode, setFormMode] = useState<FormMode>("create")
    const [selectedService, setSelectedService] = useState<ServiceProvider | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const [isPending, startTransition] = useTransition()

    const {data, isLoading: isTableLoading, refetch} = useQuery({
        queryKey: ['serviceProviders', currentPage, searchTerm],
        queryFn: async () => {
            const response = await serviceProvider.getAllServiceProviders({
                page: currentPage,
                search: searchTerm
            })
            return response
        },
        staleTime: QUERY_STALE_TIME,
        placeholderData: (previousData) => previousData,
    })

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => serviceProvider.deleteServiceProvider(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['serviceProviders']})
            handleDeleteModalClose()
        },
        onError: (error) => {
            console.error('Failed to delete service:', error)
        },
    })

    const handlePageChange = useCallback((page: number) => {
        startTransition(() => {
            setCurrentPage(page)
        })
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

    const handleFormModalClose = useCallback(() => {
        setIsFormModalOpen(false)
        setSelectedService(null)
        setFormMode("create")
    }, [])

    const handleAddClick = useCallback(() => {
        setSelectedService(null)
        setFormMode("create")
        setIsFormModalOpen(true)
    }, [])

    const handleEditClick = useCallback((service: ServiceProvider) => {
        setSelectedService(service)
        setFormMode("edit")
        setIsFormModalOpen(true)
    }, [])

    const handleDeleteClick = useCallback((service: ServiceProvider) => {
        setSelectedService(service)
        setIsDeleteModalOpen(true)
    }, [])

    const confirmDeleteService = useCallback(() => {
        if (selectedService?.slug) {
            deleteMutation.mutate(selectedService.slug)
        }
    }, [selectedService, deleteMutation])

    const handleFormSuccess = useCallback(async () => {
        await queryClient.invalidateQueries({queryKey: ['serviceProviders']})
        handleFormModalClose()
    }, [queryClient, handleFormModalClose])

    const columns: ColumnDef<ServiceProvider>[] = useMemo(() => [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all services on this page"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select service ${row.original.name}`}
                />
            ),
            size: 40,
            enableSorting: false,
            enableHiding: false,
        },
        {
            header: "Name",
            accessorKey: "name",
            cell: ({row}) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            header: "Price",
            accessorKey: "price",
            cell: ({row}) => (
                <div className="font-medium">NPR {row.original.price.toFixed(2)}</div>
            ),
        },
        {
            header: "Status",
            accessorKey: "is_active",
            cell: ({row}) => (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    row.original.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </div>
            ),
        },
        {
            header: "Slug",
            accessorKey: "slug",
            cell: ({row}) => (
                <code className="text-xs bg-muted px-2 py-1 rounded">
                    {row.original.slug}
                </code>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onEditAction={() => handleEditClick(row.original)}
                    onDeleteAction={() => handleDeleteClick(row.original)}
                />
            ),
            size: 80,
        }
    ], [handleEditClick, handleDeleteClick])

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Service Providers
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and organize all service providers
                    </p>
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
                    onAddAction={handleAddClick}
                    actionLabel="Add Service"
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
                                    : "Service providers will appear here once added."
                            }
                        />
                    }
                />
            </div>

            <ServiceProviderFormModal
                open={isFormModalOpen}
                onCloseAction={handleFormModalClose}
                onSubmitAction={handleFormSuccess}
                slug={selectedService?.slug}
                mode={formMode}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleDeleteModalClose}
                title="Delete Service"
                description={
                    selectedService
                        ? `Are you sure you want to delete the service "${selectedService.name}"? This action cannot be undone.`
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