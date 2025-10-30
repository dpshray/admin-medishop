'use client'

import {useCallback, useMemo, useState} from "react"
import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {DataTable} from "@/components/table/ReusableTable"
import {useMutation, useQuery} from "@tanstack/react-query"
import categoriesService from "@/service/categories.service"
import {RowActions} from "@/lib/action-button"
import ActionModal from "@/components/modal/ConfirmModal"
import {Badge} from "@/components/ui/badge"
import {toast} from "sonner"
import {CategoryFormModal, CategoryFormValues} from "@/components/categories/CategoryFromModal"
import GlobalTableHoverImage from "@/components/table/GlobalTableHoverImage"
import {DEFAULT_PAGE} from "@/config/app-constant"

interface Category {
    id: number
    slug: string
    name: string
    image: string
    discount_percent?: number
}

interface CategoryResponse {
    items: Category[]
    total_page: number
    total_items?: number
}

interface PaginationParams {
    page: number
    per_page: number
}

export default function CategoryTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isFormModalOpen, setFormModalOpen] = useState(false)

    const {data, isLoading, isError, error, refetch} = useQuery<CategoryResponse, Error>({
        queryKey: ["admin-categories", currentPage, pageSize, search],
        queryFn: async () => {
            const params: PaginationParams = {page: currentPage, per_page: pageSize}
            return categoriesService.getAllCategories(params).then(response => {
                setTotalPages(response.total_page)
                setTotalItems(response.total_items || 0)
                console.log('Total Items', response.total_items)
                return response
            })
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    })
    console.log('Total Pages', totalItems)
    const categories = useMemo(() => data?.items || [], [data?.items])

    const deleteMutation = useMutation({
        mutationFn: (id: number) => categoriesService.deleteCategory(id),
        onSuccess: (res: any) => {
            toast.success(res?.message || "Category deleted successfully")
            setDeleteModalOpen(false)
            setSelectedCategory(null)
            refetch()
        },
        onError: (err: any) => {
            toast.error(err?.message || "Failed to delete category")
        },
    })

    const handleSearch = useCallback((value: string) => {
        setSearch(value)
        setCurrentPage(DEFAULT_PAGE)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])


    const handleAddCategory = useCallback(() => {
        setSelectedCategory(null)
        setFormModalOpen(true)
    }, [])

    const handleEditCategory = useCallback((category: Category) => {
        setSelectedCategory(category)
        setFormModalOpen(true)
    }, [])

    const handleDeleteCategory = useCallback((category: Category) => {
        setSelectedCategory(category)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteCategory = useCallback(() => {
        if (!selectedCategory) return
        deleteMutation.mutate(selectedCategory.id)
    }, [selectedCategory, deleteMutation])

    const handleFormSubmit = useCallback(async (formData: CategoryFormValues) => {
        try {
            if (selectedCategory) {
                await categoriesService.updateCategory(selectedCategory.id, formData).then(res => {
                    toast.success(res?.message || "Category updated successfully")
                    setFormModalOpen(false)
                    setSelectedCategory(null)
                    refetch()
                })
            } else {
                await categoriesService.createCategory(formData).then(res => {
                    toast.success(res?.message || "Category created successfully")
                    setFormModalOpen(false)
                    setSelectedCategory(null)
                    refetch()
                })
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to save category")
        }
    }, [selectedCategory, refetch])


    const handleCloseFormModal = useCallback(() => {
        setFormModalOpen(false)
        setSelectedCategory(null)
    }, [])

    const columns: ColumnDef<Category>[] = useMemo(() => [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all categories"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={value => row.toggleSelected(!!value)}
                    aria-label={`Select category ${row.original.name}`}
                />
            ),
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: "ID",
            size: 80,
            cell: ({row}) => <Badge variant="outline" className="font-mono">#{row.original.id}</Badge>
        },
        {
            accessorKey: "name",
            header: "Category Name",
            size: 200,
            cell: ({row}) => <div className="font-medium text-gray-900">{row.original.name}</div>
        },
        {
            accessorKey: "discount_percent",
            header: "Discount Percent",
            size: 180,
            cell: ({row}) =>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {row.original.discount_percent || "-"}
                </span>
        },
        {
            accessorKey: "image",
            header: "Image",
            size: 120,
            cell: ({row}) => (
                <GlobalTableHoverImage src={row.original.image} alt={`${row.original.name} category image`} size={32}/>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Actions",
            size: 100,
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onEditAction={() => handleEditCategory(row.original)}
                    onDeleteAction={() => handleDeleteCategory(row.original)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }
    ], [handleEditCategory, handleDeleteCategory])

    const formModalInitialData = useMemo(() =>
            selectedCategory ? {
                name: selectedCategory.name,
                image: selectedCategory.image
            } : undefined,
        [selectedCategory]
    )

    const deleteModalDescription = useMemo(() =>
            selectedCategory
                ? `Are you sure you want to delete "${selectedCategory.name}"? This action cannot be undone.`
                : "Are you sure you want to delete this category?",
        [selectedCategory]
    )

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"/>
                    </svg>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Failed to load categories</h3>
                        <p className="mt-1 text-sm text-red-700">{error?.message || "An unexpected error occurred"}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 ">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Category Management</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your product categories and organization</p>
                </div>
            </div>

            <DataTable<Category, any>
                data={categories}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAddCategory}
                onSearchAction={handleSearch}
                actionLabel="Add Category"
                pagination={{
                    page: currentPage,
                    totalPages,
                    pageSize,
                    onPageChange: handlePageChange,
                    dataCount: 15,
                }}
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search categories by name..."
                noDataText={
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                        <h3 className="mt-4 text-sm font-medium text-gray-900">No categories found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first category.</p>
                    </div>
                }
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Category"
                description={deleteModalDescription}
                confirmLabel="Delete Category"
                onConfirm={confirmDeleteCategory}
                loading={deleteMutation.isPending}
            />

            <CategoryFormModal
                open={isFormModalOpen}
                onCloseAction={handleCloseFormModal}
                onSubmitAction={handleFormSubmit}
                slug={selectedCategory?.slug}
                isLoading={false}
                initialData={formModalInitialData}
            />
        </div>
    )
}