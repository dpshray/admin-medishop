'use client'

import {useMutation, useQuery} from "@tanstack/react-query"
import {useCallback, useMemo, useState} from "react"
import {ColumnDef} from "@tanstack/react-table"
import {DataTable} from "@/components/table/ReusableTable"
import {Checkbox} from "@/components/ui/checkbox"
import {NoDataFound} from "@/lib/helper"
import {Badge} from "@/components/ui/badge"
import {RowActions} from "@/lib/action-button"
import ActionModal from "@/components/modal/ConfirmModal"
import {toast} from "sonner"
import genericNameService from "@/service/generic-name.service"
import GenericModalForm from "@/components/generic-name/generic-modal-form"

interface GenericName {
    id: string
    name: string
    slug: string
}

export default function GenericNameTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [totalPages, setTotalPages] = useState(1)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<GenericName | null>(null)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [createModalOpen, setCreateModalOpen] = useState(false)

    const {data, isLoading, refetch, isFetching} = useQuery({
        queryKey: ["generic-name", currentPage, searchQuery],
        queryFn: async () => {
            const params = {page: currentPage, search: searchQuery}
            return await genericNameService.getAllGenericNames(params).then((res: any) => {
                setTotalPages(res?.total_page ?? 1)
                return res
            })
        },

    })

    const tableData = useMemo(() => data?.items ?? [], [data])

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => genericNameService.deleteGenericName(slug),
        onSuccess: () => {
            toast.success("Generic name deleted successfully")
            setDeleteModalOpen(false)
            setSelectedItem(null)
            refetch()
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete generic name")
        }
    })

    const handleEdit = useCallback((item: GenericName) => {
        setSelectedItem(item)
        setEditModalOpen(true)
    }, [])

    const handleDelete = useCallback((item: GenericName) => {
        setSelectedItem(item)
        setDeleteModalOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(() => {
        if (selectedItem?.slug) {
            deleteMutation.mutate(selectedItem.slug)
        }
    }, [selectedItem, deleteMutation])

    const handleCloseEditModal = useCallback((open: boolean) => {
        setEditModalOpen(open)
        if (!open) {
            setSelectedItem(null)
        }
    }, [])

    const columns: ColumnDef<GenericName>[] = useMemo(() => [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "generic_name",
            header: "Name",
            cell: ({row}) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium capitalize text-gray-900">{row.original.name}</span>
                </div>
            ),
            size: 200,
        },
        {
            accessorKey: "slug",
            header: "Slug",
            cell: ({row}) => (
                <Badge variant="outline" className="w-fit text-xs">
                    {row.original.slug}
                </Badge>
            ),
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({row}) => (
                <div className={'flex flex-row justify-end items-end'}>
                    <RowActions
                        row={row}
                        onEditAction={() => handleEdit(row.original)}
                        onDeleteAction={() => handleDelete(row.original)}
                        className={'flex flex-row gap-2'}
                    />
                </div>
            ),
            size: 100,
            enableSorting: false,
            enableHiding: false,
        },
    ], [handleEdit, handleDelete])

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])
    const handleFormSuccess = useCallback(async () => {
        await refetch()
        setCreateModalOpen(false)
        setEditModalOpen(false)
    }, [refetch])

    const handleUpdateSucess = useCallback(async () => {
        await refetch()
        setEditModalOpen(false)
        setSelectedItem(null)
    }, [refetch])

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Generic Names</h1>
                    <p className="text-sm text-muted-foreground">Manage generic names and their information</p>
                </div>
            </div>

            <DataTable
                data={tableData}
                columns={columns}
                pagination={{
                    page: currentPage,
                    totalPages: totalPages,
                    onPageChange: handlePageChange,
                    dataCount: data?.total_items ?? 0,
                }}
                loading={isLoading || isFetching}
                noDataText={<NoDataFound title="No Generic Names Found"
                                         description="Start by adding your first generic name"/>}
                searchPlaceholder="Search generic names..."
                enableSearch
                onSearchAction={handleSearch}
                enableColumnVisibility
                enableRowSelection
                enableSorting
                actionLabel="Add Generic Name"
                onAddAction={() => setCreateModalOpen(true)}
            />

            <ActionModal
                open={deleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Generic Name"
                description={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                loading={deleteMutation.isPending}
            />

            <GenericModalForm
                mode="create"
                open={createModalOpen}
                onCloseAction={setCreateModalOpen}
                onSubmitAction={handleFormSuccess}
            />

            <GenericModalForm
                mode="edit"
                open={editModalOpen}
                onCloseAction={handleCloseEditModal}
                slug={selectedItem?.slug}
                loading={isLoading}
                onSubmitAction={handleUpdateSucess}
            />
        </div>
    )
}
