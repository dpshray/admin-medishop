"use client"

import {useCallback, useMemo, useState, useTransition} from "react"
import {useRouter} from "next/navigation"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import packageService, {PackageParams} from "@/service/package.service"
import {ColumnDef} from "@tanstack/react-table"
import {DataTable} from "@/components/table/ReusableTable"
import {RowActions} from "@/lib/action-button"
import {Button} from "@/components/ui/button"
import {ChevronDown, ChevronRight} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import ActionModal from "@/components/modal/ConfirmModal"
import {toast} from "sonner"
import {cn} from "@/lib/utils";
import {FormatCurrency} from "@/lib/helper";

export interface Package {
    id: number
    package_name: string
    slug: string
    description: string
    status: boolean
    price: string
    discount_percent: number | null
    rating: string
    created_at?: string
    updated_at?: string
}

export default function PackageTable() {
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState("")
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const queryClient = useQueryClient()

    const {data: packages = [], isLoading, refetch} = useQuery({
        queryKey: ["packages", currentPage, pageSize, search],
        queryFn: async () => {
            const params: PackageParams = {page: currentPage, per_page: pageSize, search}
            const res = await packageService.getAllPackages(params)
            setCurrentPage(res.current_page)
            setTotalPages(res.last_page)
            setTotalItems(res.total_items)
            console.log('Resposne from',res.items)
            return res.items || []
        },
        refetchOnWindowFocus: true,
        retry: 2,
        staleTime: 0,
    })

    const handleDelete = useCallback((pkg: Package) => {
        setSelectedPackage(pkg)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeletePackage = useCallback(async () => {
        if (!selectedPackage?.slug) {
            toast.error("Invalid package selected")
            return
        }

        setIsDeleting(true)
        try {
            await packageService.deletePackage(selectedPackage.slug)

            const remainingItemsOnPage = packages.length - 1
            const shouldGoToPreviousPage = remainingItemsOnPage === 0 && currentPage > 1

            if (shouldGoToPreviousPage) {
                setCurrentPage(prev => prev - 1)
            }

            await queryClient.invalidateQueries({queryKey: ["packages"]})
            await refetch()

            setDeleteModalOpen(false)
            setSelectedPackage(null)

            startTransition(() => {
                router.refresh()
            })

            toast.success(`Package "${selectedPackage.package_name}" deleted successfully`)
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to delete package"
            toast.error(errorMessage)
            console.error("Delete error:", error)
        } finally {
            setIsDeleting(false)
        }
    }, [selectedPackage, refetch, packages.length, currentPage, queryClient, router])

    const columns: ColumnDef<Package>[] = useMemo(() => [
        {
            id: "expander",
            header: () => null,
            cell: ({row}) => {
                return row.getCanExpand() ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => row.toggleExpanded()}
                        className="p-0 h-8 w-8"
                        aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
                        aria-expanded={row.getIsExpanded()}
                    >
                        {row.getIsExpanded() ? (
                            <ChevronDown className="h-4 w-4" aria-hidden="true"/>
                        ) : (
                            <ChevronRight className="h-4 w-4" aria-hidden="true"/>
                        )}
                    </Button>
                ) : null
            },
            enableSorting: false,
            enableHiding: false,
            size: 50,
        },
        {
            accessorKey: "package_name",
            header: "Package Name",
            cell: ({row}) => (
                <div className="font-semibold text-base">{row.original.package_name}</div>
            ),
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({row}) => {
                const price = parseFloat(row.original.price)
                const discount = row.original.discount_percent
                const discountedPrice = discount ? price - (price * discount / 100) : price

                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-base">
                            {FormatCurrency(discountedPrice)}
                        </span>
                        {discount && (
                            <span className="text-xs text-muted-foreground line-through">
                               {FormatCurrency(price)} {price.toFixed(2) || 0.00}
                            </span>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "discount_percent",
            header: "Discount",
            cell: ({row}) => {
                const discount = row.original.discount_percent
                return discount ? (
                    <Badge className="text-green-700 bg-green-50 hover:bg-green-100 border-green-200">
                        {discount}% OFF
                    </Badge>
                ) : (
                    <span className="text-sm text-muted-foreground" aria-label="No discount">-</span>
                )
            },
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({row}) => {
                const rating = parseFloat(row.original.rating)
                return (
                    <div className="flex items-center gap-1" role="img"
                         aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}>
                        <span className="font-medium">{rating.toFixed(1)}</span>
                        <span className="text-yellow-500" aria-hidden="true">★</span>
                    </div>
                )
            },
        },{
            accessorKey: "status",
            header: "Status",
            cell: ({row}) => {
                return (
                    <Badge variant={row.original.status ? "default" : "destructive"}
                           className={cn(row.original.status ? "bg-green-600 " : "bg-red-500")}>
                        {row.original.status ? "Active" : "Inactive"}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({row}) => (
                <RowActions
                    row={row}
                    onViewAction={() => {
                        startTransition(() => {
                            router.push(`/admin/package/${row.original.slug}`)
                        })
                    }}
                    onEditAction={() => {
                        startTransition(() => {
                            router.push(`/admin/package/edit-package/${row.original.slug}`)
                        })
                    }}
                    onDeleteAction={() => handleDelete(row.original)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 100,
        },
        {
            id: "products",
            header: "Product",
            cell: ({row}) => (
                <Button variant={'default'} className={'bg-primaryColor hover:bg-primaryColor/80'}
                        onClick={() => {
                            startTransition(() => {
                                router.push(`/admin/package/${row.original.slug}`)
                            })
                        }}>
                    Add product
                </Button>
            )
        },
    ], [router, handleDelete])

    const handlePageChange = useCallback((page: number) => {
        startTransition(() => {
            setCurrentPage(page)
        })
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        startTransition(() => {
            setPageSize(size)
            setCurrentPage(1)
        })
    }, [])

    const handleAddPackage = useCallback(() => {
        startTransition(() => {
            router.push("/admin/package/add-package")
        })
    }, [router])

    const handleSearch = useCallback((value: string) => {
        startTransition(() => {
            setSearch(value)
            setCurrentPage(1)
        })
    }, [])

    const handleCloseModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModalOpen(false)
            setSelectedPackage(null)
        }
    }, [isDeleting])

    const renderSubComponent = useCallback((row: any) => {
        const pkg = row.original as Package
        return (
            <div className="border-l-4 border-primary/20 bg-muted/30 p-6" role="region"
                 aria-label="Package description">
                <h4 className="mb-3 text-sm font-semibold text-foreground">Package Description</h4>
                <div
                    className="prose prose-sm max-w-none text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{__html: pkg.description}}
                />
            </div>
        )
    }, [])

    const paginationConfig = useMemo(() => ({
        page: currentPage,
        totalPages: totalPages,
        pageSize: pageSize,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        pageSizeOptions: [5, 10, 25, 50, 100],
        dataCount: totalItems
    }), [currentPage, totalPages, pageSize, totalItems, handlePageChange, handlePageSizeChange])

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold text-gray-900">Package Management</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your packages and pricing</p>
            </header>

            <DataTable<Package, any>
                data={packages}
                columns={columns}
                loading={isLoading || isPending}
                onAddAction={handleAddPackage}
                onSearchAction={handleSearch}
                actionLabel="Add Package"
                pagination={paginationConfig}
                enableRowSelection={true}
                enableSorting={true}
                enableSearch={true}
                enableColumnVisibility={true}
                searchPlaceholder="Search packages by name..."
                totalCount={totalItems}
                enableExpanding={true}
                getRowCanExpand={(row) => !!row.original.description}
                renderSubComponent={renderSubComponent}
                noDataText="No packages found. Create your first package to get started."
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={handleCloseModal}
                title="Delete Package"
                description={
                    selectedPackage
                        ? `Are you sure you want to delete "${selectedPackage.package_name}"? This action cannot be undone and will permanently remove all associated data.`
                        : "Are you sure you want to delete this package?"
                }
                confirmLabel="Delete Package"
                onConfirm={confirmDeletePackage}
                loading={isDeleting}
            />
        </div>
    )
}