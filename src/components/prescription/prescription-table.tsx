'use client'

import {useMutation, useQuery} from "@tanstack/react-query"
import prescriptionService from "@/service/prescription.service"
import {useCallback, useMemo, useState} from "react"
import {ColumnDef} from "@tanstack/react-table"
import {DataTable} from "@/components/table/ReusableTable"
import {Checkbox} from "@/components/ui/checkbox"
import GlobalTableHoverImage from "@/components/table/GlobalTableHoverImage"
import {NoDataFound} from "@/lib/helper"
import {RowActions} from "@/lib/action-button"
import ActionModal from "@/components/modal/ConfirmModal"
import {toast} from "sonner"
import { Phone, User } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface User {
    id: number
    name: string
    email: string
    mobile_number: string
}

interface Prescriptions {
    id: number
    description?: string
    prescription_image?: string
    created_at?: string
    user?: User
}

export default function PrescriptionTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedPrescription, setSelectedPrescription] = useState<Prescriptions | null>(null)

    const {data, isLoading, refetch} = useQuery({
        queryKey: ["prescriptions", currentPage, pageSize, searchQuery],
        queryFn: async () => {
            const params = {
                page: currentPage,
                per_page: pageSize,
                search: searchQuery,
            }
            return await prescriptionService.getAllPrescriptions(params)
        }
    })

    const tableData = useMemo(() => data?.items ?? [], [data])

    const deleteMutation = useMutation({
        mutationFn: (id: number) => prescriptionService.deletePrescription(id),
        onSuccess: () => {
            toast.success("Prescription deleted successfully")
            setDeleteModalOpen(false)
            setSelectedPrescription(null)
            refetch()
        },
        onError: (error) => {
            console.error("Error deleting prescription:", error)
            toast.error("Failed to delete prescription")
        }
    })

    const handleDeletePrescription = useCallback((prescription: Prescriptions) => {
        setSelectedPrescription(prescription)
        setDeleteModalOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(() => {
        if (selectedPrescription) {
            deleteMutation.mutate(selectedPrescription.id)
        }
    }, [selectedPrescription, deleteMutation])

    const columns: ColumnDef<Prescriptions>[] = useMemo(() => [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="mx-auto"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="mx-auto"
                />
            ),
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "image",
            header: "Image",
            cell: ({row}) => (
                <Link href={row.original.prescription_image || ""} target="_blank" rel="noopener noreferrer">
                    <GlobalTableHoverImage
                        src={row.original.prescription_image || ""}
                        alt={`Prescription of ${row.original.user?.name}`}
                        fallbackSrc="/placeholder.png"
                    />
                </Link>
            ),
            size: 80,
            enableSorting: false,
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({row}) => (
                <div className="max-w-md">
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {row.original.description || "No description available"}
                    </p>
                </div>
            ),
            size: 400,
        },
        {
            accessorKey: "user.name",
            header: "User Details",
            cell: ({ row }) => {
                const user = row.original.user;
                return (
                    <div className="max-w-md space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                            <User className="inline-block mr-1 mb-1 text-blue-600" size={14} />
                            {user?.name || "No name available"}
                        </p>
                        <p className="text-xs text-gray-500">
                            <Phone className="inline-block mr-1 mb-1 text-red-600" size={12} />
                            {user?.mobile_number || "No phone number"}
                        </p>
                    </div>
                );
            },
            size: 400,
        },
        {
            accessorKey: "user.email",
            header: "User Email",
            cell: ({row}) => (
                <div className="max-w-md">
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {row.original.user?.email || "No user email available"}
                    </p>
                </div>
            ),
            size: 400,
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({row}) => {
                const date = row.original.created_at
                return (
                    <p className="text-sm text-gray-600">
                        {date ? format(new Date(date), "MMM dd, yyyy • hh:mm a") : "No date"}
                    </p>
                )
            },
            size: 200,
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onDeleteAction={() => handleDeletePrescription(row.original)}
                />
            ),
            size: 100,
            enableSorting: false,
            enableHiding: false,
        },
    ], [handleDeletePrescription])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Prescriptions
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage priscriptions and their information
                    </p>
                </div>
            </div>

            <DataTable
                data={tableData}
                columns={columns}
                pagination={{
                    page: currentPage,
                    totalPages: data?.total_page ?? 1,
                    pageSize: pageSize,
                    onPageChange: handlePageChange,
                    dataCount: data?.total_items ?? 0,
                }}
                loading={isLoading}
                noDataText={
                    <NoDataFound
                        title="No Priscriptions Found"
                        description="Start by adding your first prescription"
                    />
                }
                searchPlaceholder="Search prescriptions by name or email..."
                enableSearch={true}
                onSearchAction={handleSearch}
                enableColumnVisibility={true}
                enableRowSelection={true}
                enableSorting={true}
                actionLabel="Add Prescription"
            />

            <ActionModal
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Prescription"
                description={`Are you sure you want to delete "${selectedPrescription?.id}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}