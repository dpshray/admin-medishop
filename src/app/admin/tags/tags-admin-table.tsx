"use client"

import {useCallback, useMemo, useState} from "react"
import {useMutation, useQuery} from "@tanstack/react-query"
import {DataTable} from "@/components/table/ReusableTable"
import tagService from "@/service/(tags)/tag.service"
import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {NoDataFound,} from "@/lib/helper"
import ActionModal from "@/components/modal/ConfirmModal"
import {toast} from "sonner"
import TagFormModal from "@/components/modal/tag-modal-from"
import {RowActions} from "@/lib/action-button";
import {ParamsType} from "@/types/types";

interface Tag {
    id: number
    name: string
    slug: string
}

interface TagResponse {
    items: Tag[]
    total_page: number
    total_items?: number
    page?: number
    per_page?: number
}

interface PaginationParams {
    page: number
    per_page: number
}

export default function TagsAdminTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isFormModalOpen, setFormModalOpen] = useState(false)
const [search, setSearch] = useState("")
    const {data, isLoading, refetch} = useQuery<TagResponse, Error>({
        queryKey: ["admin-tags", currentPage, pageSize,search],
        queryFn: async () => {
            const params: ParamsType = {page: currentPage, per_page: pageSize,search: search}
            return await tagService.getAllTags(params)
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
        enabled: true
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => tagService.deleteTag(id),
        onSuccess: (response: any) => {
            toast.success(response?.message || "Tag deleted successfully")
            setDeleteModalOpen(false)
            setSelectedTag(null)
            refetch()
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete tag")
        },
    })

    const tags = data?.items ?? []
    const totalPages = data?.total_page ?? 1
    const totalItems = data?.total_items ?? 0

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1)
    }, [])

    const handleAddTag = useCallback(() => {
        setSelectedTag(null)
        setFormModalOpen(true)
    }, [])

    const handleEditTag = useCallback((tag: Tag) => {
        setSelectedTag(tag)
        setFormModalOpen(true)
    }, [])

    const handleDeleteTag = useCallback((tag: Tag) => {
        setSelectedTag(tag)
        setDeleteModalOpen(true)
    }, [])

    const handleSearch = useCallback((value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }, [])

    const confirmDeleteTag = useCallback(() => {
        if (!selectedTag) return
        deleteMutation.mutate(selectedTag.id)
    }, [selectedTag, deleteMutation])

    const handleFormSubmit = useCallback(
        async (formData: { name: string }) => {
            try {
                if (selectedTag) {
                    const response = await tagService.updateTag(selectedTag.id, formData)
                    toast.success(response?.message || "Tag updated successfully")
                } else {
                    const response = await tagService.createTag(formData)
                    toast.success(response?.message || "Tag created successfully")
                }
                setFormModalOpen(false)
                setSelectedTag(null)
                refetch()
            } catch (error: any) {
                toast.error(error?.message || "Failed to save tag")
            }
        },
        [selectedTag, refetch]
    )

    const handleBulkDelete = useCallback(
        async (selectedTags: Tag[]) => {
            if (selectedTags.length === 0) return
            try {
                await Promise.all(selectedTags.map(tag => tagService.deleteTag(tag.id)))
                toast.success(`Successfully deleted ${selectedTags.length} tag(s)`)
                refetch()
            } catch (error: any) {
                toast.error(error?.message || "Failed to delete selected tags")
            }
        },
        [refetch]
    )

    const columns: ColumnDef<Tag>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({table}) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all tags"
                    />
                ),
                cell: ({row}) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={value => row.toggleSelected(!!value)}
                        aria-label={`Select tag ${row.original.name}`}
                        className="mx-auto"
                    />
                ),
                size: 50,
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "name",
                header: "Tag Name",
                size: 200,
                cell: ({row}) => <div className="font-medium text-gray-900">{row.original.name}</div>,
            },
            {
                accessorKey: "slug",
                header: "Slug",
                cell: ({row}) => <div className="font-medium text-gray-900">{row.original.slug}</div>,
            },
            {
                id: "actions",
                header: "Actions",
                size: 100,
                cell: ({row}) => (
                    <RowActions
                        row={row}
                        onEditAction={() => handleEditTag(row.original)}
                        onDeleteAction={() => handleDeleteTag(row.original)}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
        ],
        [handleEditTag, handleDeleteTag]
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Tag Management</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your tag catalog and settings</p>
                </div>
            </div>

            <DataTable<Tag, any>
                data={tags}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAddTag}
                onDeleteAction={handleBulkDelete}
                actionLabel="Add Tag"
                pagination={{
                    page: currentPage,
                    totalPages,
                    pageSize,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                    pageSizeOptions: [5, 10, 25, 50],
                    dataCount: totalItems,
                }}
                onSearchAction={handleSearch}
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search tags by name..."
                totalCount={totalItems}
                noDataText={<NoDataFound/>}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Tag"
                description={
                    selectedTag
                        ? `Are you sure you want to delete "${selectedTag.name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this tag?"
                }
                confirmLabel="Delete Tag"
                onConfirm={confirmDeleteTag}
                loading={deleteMutation.isPending}
            />

            <TagFormModal
                open={isFormModalOpen}
                onCloseAction={(open) => {
                    setFormModalOpen(open)
                    if (!open) setSelectedTag(null)
                }}
                onSubmitAction={handleFormSubmit}
                initialData={selectedTag ? {name: selectedTag.name} : undefined}
            />
        </div>
    )
}