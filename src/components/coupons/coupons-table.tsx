'use client'

import { useCallback, useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/table/ReusableTable"
import { RowActions } from "@/lib/action-button"
import ActionModal from "@/components/modal/ConfirmModal"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import CouponForm from "@/components/coupons/coupons-from"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import couponService from "@/service/product/coupon.service"
import { DEFAULT_PAGE } from "@/config/app-constant"

interface Coupon {
    id: number
    uuid: string
    code: string
    discount_percent: number
    description: string
    start_date: string | null
    end_date: string | null
    is_active: boolean
}

export default function PromoCouponsTable() {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isCouponFormOpen, setCouponFormOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")

    const queryClient = useQueryClient()

    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ['coupons', currentPage, searchQuery],
        queryFn: async () => {
            const params = { page: currentPage, search: searchQuery }
            const response = await couponService.getAllCoupons(params)
            setTotalPages(response.total_page)
            return response.items
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (uuid: string) => couponService.deleteCoupon(uuid),
        onSuccess: () => {
            toast.success("Coupon deleted successfully")
            queryClient.invalidateQueries({ queryKey: ['coupons'] })
        }
    })

    const handleAddCoupon = useCallback(() => {
        setIsEditMode(false)
        setSelectedCoupon(null)
        setCouponFormOpen(true)
    }, [])

    const handleEditCoupon = useCallback((coupon: Coupon) => {
        setIsEditMode(true)
        setSelectedCoupon(coupon)
        setCouponFormOpen(true)
    }, [])

    const handleDeleteCoupon = useCallback((coupon: Coupon) => {
        setSelectedCoupon(coupon)
        setDeleteModalOpen(true)
    }, [])

    const confirmDeleteCoupon = useCallback(() => {
        if (!selectedCoupon?.uuid) return
        deleteMutation.mutate(selectedCoupon.uuid)
        setDeleteModalOpen(false)
        setSelectedCoupon(null)
    }, [selectedCoupon, deleteMutation])

    const handleCloseCouponForm = useCallback(() => {
        setCouponFormOpen(false)
        setIsEditMode(false)
        setSelectedCoupon(null)
        queryClient.invalidateQueries({ queryKey: ['coupons'] })
    }, [queryClient])

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])

    const columns: ColumnDef<Coupon>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={value => row.toggleSelected(!!value)}
                />
            ),
            size: 50
        },
        {
            accessorKey: "code",
            header: "Coupon Code",
            size: 150,
            cell: ({ row }) => (
                <span className="font-medium text-gray-900 text-sm sm:text-base">{row.original.code}</span>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            size: 250,
            cell: ({ row }) => (
               <div className={'max-w-[250px] overflow-hidden whitespace-normal break-words'}>
                   <span className="text-gray-700 text-xs sm:text-sm line-clamp-2">{row.original.description}</span>
               </div>
            ),
        },
        {
            accessorKey: "discount_percent",
            header: "Discount",
            size: 120,
            cell: ({ row }) => <span className="text-sm font-semibold text-green-600">{row.original.discount_percent}%</span>,
        },
        {
            accessorKey: "start_date",
            header: "Date Range",
            size: 180,
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">From:</span>
                        <span className="text-xs font-medium text-gray-700">{row.original.start_date || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">To:</span>
                        <span className="text-xs font-medium text-gray-700">{row.original.end_date || "N/A"}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            size: 100,
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? "default" : "outline"}
                    className={row.original.is_active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                >
                    {row.original.is_active ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            size: 100,
            cell: ({ row }) => (
                <RowActions
                    row={row}
                    onEditAction={() => handleEditCoupon(row.original)}
                    onDeleteAction={() => handleDeleteCoupon(row.original)}
                />
            ),
        },
    ], [handleEditCoupon, handleDeleteCoupon])

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(DEFAULT_PAGE)
    }, [])

    const deleteModalDescription = selectedCoupon
        ? `Are you sure you want to delete coupon "${selectedCoupon.code}"?`
        : "Are you sure you want to delete this coupon?"

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Promo Coupons</h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">Manage your discount coupons and promotions</p>
                </div>
            </div>

            <DataTable<Coupon, any>
                data={coupons}
                columns={columns}
                loading={isLoading}
                onAddAction={handleAddCoupon}
                actionLabel="Add Coupon"
                onSearchAction={handleSearch}
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search by customer name, email, or order code..."
                pagination={{
                    page: currentPage,
                    totalPages,
                    onPageChange: handlePageChange,
                    dataCount: 10,
                }}
                noDataText="No coupons found"
            />

            <ActionModal
                open={isDeleteModalOpen}
                setOpen={setDeleteModalOpen}
                title="Delete Coupon"
                description={deleteModalDescription}
                confirmLabel="Delete Coupon"
                onConfirm={confirmDeleteCoupon}
            />

            <CouponForm
                mode={isEditMode ? 'edit' : 'create'}
                slug={selectedCoupon?.uuid}
                open={isCouponFormOpen}
                onCloseAction={handleCloseCouponForm}
            />
        </div>
    )
}
