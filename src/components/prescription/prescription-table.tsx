'use client'

import {useMutation, useQuery} from "@tanstack/react-query"
import healthConditionService from "@/service/healthCondition.service"
import {useCallback, useMemo, useState} from "react"
import {ColumnDef} from "@tanstack/react-table"
import {DataTable} from "@/components/table/ReusableTable"
import {Checkbox} from "@/components/ui/checkbox"
import GlobalTableHoverImage from "@/components/table/GlobalTableHoverImage"
import {NoDataFound} from "@/lib/helper"
import {Badge} from "@/components/ui/badge"
import {RowActions} from "@/lib/action-button"
import ActionModal from "@/components/modal/ConfirmModal"
import {toast} from "sonner"
import HealthConditionForm from "@/components/healthCondition/healt-condition-modal-from"

interface HealthCondition {
    id: string
    name: string
    slug: string
    description?: string
    image?: string
}

export default function PrescriptionTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedHealthCondition, setSelectedHealthCondition] = useState<HealthCondition | null>(null)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)

    const {data, isLoading, refetch} = useQuery({
        queryKey: ["health-condition", currentPage, pageSize, searchQuery],
        queryFn: async () => {
            const params = {
                page: currentPage,
                per_page: pageSize,
                search: searchQuery,
            }
            return await healthConditionService.getHealthConditionList(params)
        }
    })

    const tableData = useMemo(() => data?.items ?? [], [data])

    const handleEditHealthCondition = useCallback((healthCondition: HealthCondition) => {
        setSelectedHealthCondition(healthCondition)
        setEditModalOpen(true)
    }, [])

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => healthConditionService.deleteHealthCondition(slug),
        onSuccess: () => {
            toast.success("Health condition deleted successfully")
            setDeleteModalOpen(false)
            setSelectedHealthCondition(null)
            refetch()
        },
        onError: (error) => {
            console.error("Error deleting health condition:", error)
            toast.error("Failed to delete health condition")
        }
    })

    const handleDeleteHealthCondition = useCallback((healthCondition: HealthCondition) => {
        setSelectedHealthCondition(healthCondition)
        setDeleteModalOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(() => {
        if (selectedHealthCondition) {
            deleteMutation.mutate(selectedHealthCondition.slug)
        }
    }, [selectedHealthCondition, deleteMutation])

    const columns: ColumnDef<HealthCondition>[] = useMemo(() => [
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
                <GlobalTableHoverImage
                    src={row.original.image}
                    alt={row.original.name}
                    fallbackSrc="/placeholder.png"
                />
            ),
            size: 80,
            enableSorting: false,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({row}) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900">{row.original.name}</span>
                    <Badge variant="outline" className="w-fit text-xs">
                        {row.original.slug}
                    </Badge>
                </div>
            ),
            size: 200,
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
            accessorKey: "actions",
            header: "Actions",
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onEditAction={() => handleEditHealthCondition(row.original)}
                    onDeleteAction={() => handleDeleteHealthCondition(row.original)}
                />
            ),
            size: 100,
            enableSorting: false,
            enableHiding: false,
        },
    ], [handleEditHealthCondition, handleDeleteHealthCondition])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    const handleFormSuccess = useCallback(async () => {
        await refetch()
    }, [refetch])

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Health Conditions
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage health conditions and their information
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
                        title="No Health Conditions Found"
                        description="Start by adding your first health condition"
                    />
                }
                searchPlaceholder="Search health conditions..."
                enableSearch={true}
                onSearchAction={handleSearch}
                enableColumnVisibility={true}
                enableRowSelection={true}
                enableSorting={true}
                actionLabel="Add Health Condition"
                onAddAction={() => setCreateModalOpen(true)}
            />

            <ActionModal
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Health Condition"
                description={`Are you sure you want to delete "${selectedHealthCondition?.name}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
            />

            <HealthConditionForm
                mode="create"
                open={createModalOpen}
                onCloseAction={setCreateModalOpen}
                onSubmitAction={handleFormSuccess}
            />

            <HealthConditionForm
                mode="update"
                open={editModalOpen}
                slug={selectedHealthCondition?.slug}
                onCloseAction={(isOpen) => {
                    setEditModalOpen(isOpen)
                    if (!isOpen) {
                        setSelectedHealthCondition(null)
                    }
                }}
                onSubmitAction={handleFormSuccess}
            />
        </div>
    )
}