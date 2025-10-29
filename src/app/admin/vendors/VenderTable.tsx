"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {useCallback, useMemo, useState} from "react"
import {DataTable} from "@/components/table/ReusableTable"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import vendorService from "@/service/vendor.service"
import {RowActions} from "@/lib/action-button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import ActionModal from "@/components/modal/ConfirmModal"
import {toast} from "sonner"
import {useRouter} from "next/navigation"
import {StatusBadge} from "@/lib/helper"
import {STATUS_TYPE} from "@/types/enum";

export interface Vendor {
    user_uuid: string
    vendor_uuid: string
    verified: boolean
    name: string
    email: string
    mobile_number: string
    store_name: string
    id: number
    status: boolean
}

export default function VendorTable() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const {data: vendors, isLoading, error} = useQuery({
        queryKey: ["admin-vendor", currentPage, pageSize, searchTerm],
        queryFn: async () => {
            const res = await vendorService.getAllVendor({
                page: currentPage,
                per_page: pageSize,
                search: searchTerm,
            })
            setTotalPages(res?.total_page || 1)
            setCurrentPage(res?.page || 1)
            return res
        },
        retry: 2,
        retryDelay: 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => vendorService.deleteVendor(id),
        onSuccess: () => {
            toast.success("Vendor deleted successfully")
            setDeleteModalOpen(false)
            setSelectedVendor(null)
            queryClient.invalidateQueries({queryKey: ["admin-vendor"]})
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete vendor"
            toast.error(errorMessage)
        },
    })

    const handleEditVendor = useCallback(
        (vendor: Vendor) => {
            setSelectedVendor(vendor)
            router.push(`/admin/vendors/edit-vendor/${vendor.user_uuid}`)
        },
        [router]
    )

    const handleDeleteVendor = useCallback((vendor: Vendor) => {
        setSelectedVendor(vendor)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteVendor = useCallback(() => {
        if (!selectedVendor) return
        deleteMutation.mutate(selectedVendor.vendor_uuid)
    }, [selectedVendor, deleteMutation])

    const vendorData = useMemo(() => vendors?.items ?? [], [vendors])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }, [])

    const handleAddVendor = useCallback(() => {
        router.push("/admin/vendors/add-vendor")
    }, [router])

    const handleViewVendor = useCallback(
        (vendor: Vendor) => {
            setSelectedVendor(vendor)
            router.push(`/admin/vendors/view-vendor/${vendor.user_uuid}`)
        },
        [router]
    )

    const columns: ColumnDef<Vendor>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({table}) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all rows"
                    />
                ),
                cell: ({row}) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        className="mx-auto data-[state=checked]:bg-primaryColor data-[state=checked]:text-white data-[state=checked]:border-primaryColor"
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                size: 10,
            },
            {
                header: "Name",
                accessorKey: "name",
                enableHiding: false,
                cell: ({row}) => {
                    const name = row.getValue("name") as string
                    const email = row.original.email
                    return (
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                                <AvatarImage src="https://via.placeholder.com/150" alt={name}/>
                                <AvatarFallback className="text-xs">
                                    {name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="font-medium text-xs sm:text-sm truncate">{name}</span>
                                <span className="text-muted-foreground text-xs truncate max-w-[100px] sm:max-w-[140px]">
                                    {email}
                                </span>
                            </div>
                        </div>
                    )
                },
                enableSorting: false,
            },
            {
                header: "Vendor ID",
                accessorKey: "vendor_uuid",
                cell: ({row}) => (
                    <div
                        className="text-xs sm:text-sm font-mono truncate max-w-[80px] sm:max-w-[120px] lg:max-w-[160px]"
                        title={row.getValue("vendor_uuid") as string}
                    >
                        {(row.getValue("vendor_uuid") as string)?.slice(0, 8)}...
                    </div>
                ),
            },
            {
                header: "Verified",
                accessorKey: "verified",
                cell: ({row}) => {
                    const verified = row.getValue("verified") as boolean
                    return <StatusBadge status={verified ? STATUS_TYPE.VERIFIED : STATUS_TYPE.UNVERIFIED}/>
                },
            },
            {
                header: "Status",
                accessorKey: "status",
                cell: ({row}) => {
                    const status = row.getValue("status") as boolean
                    return <StatusBadge status={status ? "Active" : "Inactive"}/>
                },
            },
            {
                header: "Store & Mobile",
                accessorKey: "store_name",
                cell: ({row}) => (
                    <div
                        className="flex flex-col text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px] lg:max-w-[160px]"
                        title={`${row.getValue("store_name") || "N/A"} | ${row.original.mobile_number || "N/A"}`}
                    >
                        <span>{row.getValue("store_name") || "N/A"}</span>
                        <span className="text-muted-foreground">{row.original.mobile_number || "N/A"}</span>
                    </div>
                ),
            },
            {
                id: "actions",
                accessorKey: "actions",
                header: () => <span className="text-xs sm:text-sm">Actions</span>,
                cell: ({row}) => (
                    <RowActions
                        row={row}
                        onEditAction={() => handleEditVendor(row.original)}
                        onDeleteAction={() => handleDeleteVendor(row.original)}
                        onViewAction={() => handleViewVendor(row.original)}
                    />
                ),
                size: 60,
                enableHiding: false,
            },
        ],
        [handleEditVendor, handleDeleteVendor, handleViewVendor]
    )

    const handleSearch = (searchValue: string) => {
        setSearchTerm(searchValue)
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-4">
                <div className="text-center space-y-4">
                    <div className="text-red-500 text-lg font-semibold">Failed to load vendors</div>
                    <p className="text-gray-600">Please try refreshing the page or contact support if the problem
                        persists.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Vendor Management</h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Manage your vendors and their details
                        {vendors?.total_items && ` (${vendors.total_items} total)`}
                    </p>
                </div>
            </div>
            <DataTable<Vendor, any>
                data={vendorData}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAddVendor}
                onSearchAction={handleSearch}
                actionLabel="Add Vendor"
                pagination={{
                    page: currentPage,
                    totalPages,
                    pageSize,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                    pageSizeOptions: [5, 10, 25, 50, 100],
                }}
                totalCount={vendors?.total_items ?? 0}
                searchPlaceholder="Search vendors by name..."
                enableSearch
                enableColumnVisibility
                enableRowSelection
                enableSorting
                noDataText={
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                        <div className="text-gray-400 text-sm">No vendors found</div>
                        <p className="text-gray-300 text-xs">Add your first vendor to get started</p>
                    </div>
                }
                className="w-full"
                tableClassName="min-w-full"
            />
            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Vendor"
                description={
                    selectedVendor
                        ? `Are you sure you want to delete "${selectedVendor.name}"? This action cannot be undone and will remove all associated data.`
                        : "Are you sure you want to delete this vendor?"
                }
                confirmLabel="Delete Vendor"
                onConfirm={confirmDeleteVendor}
                loading={deleteMutation.isPending}
            />
        </div>
    )
}
