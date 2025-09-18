'use client'

import {useCallback, useMemo, useState,} from "react"
import {useMutation, useQuery} from "@tanstack/react-query"
import {DataTable} from "@/components/table/ReusableTable"
import brandService from "@/service/brand.service"
import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox"
import {NoDataFound, RowActions} from "@/lib/helper"
import ActionModal from "@/components/modal/ConfirmModal"
import {toast} from "sonner"
import {BrandFormModal} from "@/components/brand/BrandFormModal"
import {Badge} from "@/components/ui/badge"
import {cn} from "@/lib/utils"
import GlobalTableHoverImage from "@/components/table/GlobalTableHoverImage";

interface Brand {
    id: number
    name: string
    slug: string
    image: string
    is_featured?: boolean
    is_popular?: boolean
}

interface BrandResponse {
    items: Brand[]
    total_page: number
    total_items?: number
}

interface PaginationParams {
    page: number
    per_page: number
}

export default function BrandAdminTable() {
    const [paginationState, setPaginationState] = useState({
        currentPage: 1,
        pageSize: 10,
    })

    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isFormModalOpen, setFormModalOpen] = useState(false)

    const {data, isLoading, isError, error, refetch} = useQuery<BrandResponse, Error>({
        queryKey: ["admin-brands", paginationState.currentPage, paginationState.pageSize],
        queryFn: async () => {
            const params: PaginationParams = {
                page: paginationState.currentPage,
                per_page: paginationState.pageSize
            }
            return await brandService.getAllBrands(params)
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => brandService.deleteBrand(id),
        onSuccess: (response: any) => {
            toast.success(response?.message || "Brand deleted successfully")
            setDeleteModalOpen(false)
            setSelectedBrand(null)
            refetch()
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete brand")
        },
    })

    const brands = data?.items ?? []
    const totalPages = data?.total_page ?? 1
    const totalItems = data?.total_items ?? 0

    const handlePageChange = useCallback((page: number) => {
        setPaginationState(prev => ({
            ...prev,
            currentPage: page
        }))
    }, [])

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPaginationState({
            currentPage: 1,
            pageSize: newPageSize
        })
    }, [])

    const handleAddBrand = useCallback(() => {
        setSelectedBrand(null)
        setFormModalOpen(true)
    }, [])

    const handleEditBrand = useCallback((brand: Brand) => {
        setSelectedBrand(brand)
        setFormModalOpen(true)
    }, [])

    const handleDeleteBrand = useCallback((brand: Brand) => {
        setSelectedBrand(brand)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteBrand = useCallback(() => {
        if (!selectedBrand) return
        deleteMutation.mutate(selectedBrand.id)
    }, [selectedBrand, deleteMutation])

    const handleFormSubmit = useCallback(async (formData: any) => {
        try {
            console.log('Form Data', formData)
            if (selectedBrand) {
                const response = await brandService.updateBrand(selectedBrand.id, formData)
                toast.success(response?.message || "Brand updated successfully")
            } else {
                const response = await brandService.createBrand(formData)
                toast.success(response?.message || "Brand created successfully")
            }

            setFormModalOpen(false)
            setSelectedBrand(null)
            refetch()
        } catch (error: any) {
            toast.error(error?.message || "Failed to save brand")
        }
    }, [selectedBrand, refetch])

    const handleBulkDelete = useCallback(async (selectedBrands: Brand[]) => {
        if (selectedBrands.length === 0) return

        try {
            const promises = selectedBrands.map(brand => brandService.deleteBrand(brand.id))
            await Promise.all(promises)
            toast.success(`Successfully deleted ${selectedBrands.length} brand(s)`)
            refetch()
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete selected brands")
        }
    }, [refetch])

    const columns: ColumnDef<Brand>[] = useMemo(() => [
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all brands"
                    className="mx-auto"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select brand ${row.original.name}`}
                    className="mx-auto"
                />
            ),
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Brand Name",
            size: 200,
            cell: ({row}) => (
                <div className="font-medium text-gray-900">
                    {row.original.name}
                </div>
            ),
        },
        {
            accessorKey: "is_featured",
            header: "Featured",
            size: 120,
            cell: ({row}) => (
                <Badge
                    variant={row.original.is_featured ? "default" : "secondary"}
                    className={cn(
                        row.original.is_featured
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-400 hover:bg-gray-500",
                        "text-white"
                    )}
                >
                    {row.original.is_featured ? "Featured" : "Standard"}
                </Badge>
            ),
        },
        {
            accessorKey: "is_popular",
            header: "Popular",
            size: 120,
            cell: ({row}) => (
                <Badge
                    variant={row.original.is_popular ? "default" : "secondary"}
                    className={cn(
                        row.original.is_popular
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-400 hover:bg-gray-500",
                        "text-white"
                    )}
                >
                    {row.original.is_popular ? "Popular" : "Standard"}
                </Badge>
            ),
        },
        {
            accessorKey: "image",
            header: "Image",
            size: 100,
            cell: ({row}) => (
                <GlobalTableHoverImage
                    src={row.original.image}
                    alt={row.original.name}
                />
            ),
            enableSorting: false,
        },
        {
            accessorKey: "slug",
            header: "Slug",
            size: 150,
            cell: ({row}) => (
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {row.original.slug}
                </code>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            size: 100,
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onEditAction={() => handleEditBrand(row.original)}
                    onDeleteAction={() => handleDeleteBrand(row.original)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ], [handleEditBrand, handleDeleteBrand])

    if (isError) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Failed to load brands
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                                {error?.message || "An unexpected error occurred"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 ">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Brand Management</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your brand catalog and settings
                    </p>
                </div>
            </div>

            <DataTable<Brand, any>
                data={brands}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAddBrand}
                onDeleteAction={handleBulkDelete}
                actionLabel="Add Brand"
                pagination={{
                    page: paginationState.currentPage,
                    totalPages: totalPages,
                    pageSize: paginationState.pageSize,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
                    pageSizeOptions: [5, 10, 25, 50],
                    dataCount: totalItems,
                }}
                enableRowSelection={true}
                enableSorting={true}
                enableSearch={true}
                enableColumnVisibility={true}
                searchColumn="name"
                searchPlaceholder="Search brands by name..."
                totalCount={totalItems}
                noDataText={<NoDataFound/>}
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Brand"
                description={
                    selectedBrand
                        ? `Are you sure you want to delete "${selectedBrand.name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this brand?"
                }
                confirmLabel="Delete Brand"
                onConfirm={confirmDeleteBrand}
                loading={deleteMutation.isPending}
            />

            <BrandFormModal
                open={isFormModalOpen}
                onCloseAction={() => {
                    setFormModalOpen(false)
                    setSelectedBrand(null)
                }}
                onSubmitAction={handleFormSubmit}
                slug={selectedBrand?.slug}
                isLoading={false}
            />
        </div>
    )
}