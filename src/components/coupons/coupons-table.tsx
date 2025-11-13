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

interface Coupon {
    id: number
    coupon_code: string
    description: string
    discount_percent: number
    is_active: boolean
    start_date?: string | null
    end_date?: string | null
    slug?: string
}

const staticCoupons: Coupon[] = [
    { id: 1, coupon_code: "WELCOME10", description: "10% off for new users", discount_percent: 10, is_active: true, start_date: "2025-01-01", end_date: "2025-12-31", slug: "welcome10" },
    { id: 2, coupon_code: "SUMMER25", description: "25% off summer sale", discount_percent: 25, is_active: true, start_date: "2025-06-01", end_date: "2025-06-30", slug: "summer25" },
    { id: 3, coupon_code: "WINTER20", description: "20% off winter collection", discount_percent: 20, is_active: true, start_date: "2025-12-01", end_date: "2025-12-31", slug: "winter20" },
    { id: 4, coupon_code: "NEWYEAR30", description: "30% off on New Year sale", discount_percent: 30, is_active: true, start_date: "2025-12-25", end_date: "2026-01-05", slug: "newyear30" },
    { id: 5, coupon_code: "EXPIRED15", description: "15% off expired coupon", discount_percent: 15, is_active: false, slug: "expired15" },
    { id: 6, coupon_code: "FESTIVE40", description: "40% off festive offers", discount_percent: 40, is_active: true, slug: "festive40" },
    { id: 7, coupon_code: "SUMMER50", description: "50% off summer clearance", discount_percent: 50, is_active: true, slug: "summer50" },
    { id: 8, coupon_code: "STUDENT15", description: "15% off for students", discount_percent: 15, is_active: true, slug: "student15" },
    { id: 9, coupon_code: "WELCOME25", description: "25% off for first order", discount_percent: 25, is_active: true, slug: "welcome25" },
    { id: 10, coupon_code: "TEST10", description: "10% test coupon", discount_percent: 10, is_active: false, slug: "test10" },
]

export default function PromoCouponsTable() {
    const [coupons, setCoupons] = useState<Coupon[]>(staticCoupons)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isCouponFormOpen, setCouponFormOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5
    const totalPages = Math.ceil(coupons.length / itemsPerPage)

    const paginatedCoupons = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return coupons.slice(start, start + itemsPerPage)
    }, [coupons, currentPage])

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
        if (!selectedCoupon) return
        setCoupons(prev => prev.filter(c => c.id !== selectedCoupon.id))
        toast.success(`Coupon ${selectedCoupon.coupon_code} deleted successfully`)
        setDeleteModalOpen(false)
        setSelectedCoupon(null)
    }, [selectedCoupon])

    const handleCloseCouponForm = useCallback(() => {
        setCouponFormOpen(false)
        setIsEditMode(false)
        setSelectedCoupon(null)
    }, [])

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])

    const columns: ColumnDef<Coupon>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all coupons"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={value => row.toggleSelected(!!value)}
                    aria-label={`Select coupon ${row.original.coupon_code}`}
                    className="data-[state=checked]:bg-primaryColor data-[state=checked]:text-primary-foreground"
                />
            ),
            size: 50,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "coupon_code",
            header: "Coupon Code",
            size: 150,
            cell: ({ row }) => (
                <span className="font-medium text-gray-900 text-sm sm:text-base">
                    {row.original.coupon_code}
                </span>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            size: 250,
            cell: ({ row }) => (
                <span className="text-gray-700 text-xs sm:text-sm line-clamp-2">
                    {row.original.description}
                </span>
            ),
        },
        {
            accessorKey: "discount_percent",
            header: "Discount",
            size: 120,
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-green-600">
                        {row.original.discount_percent}%
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "start_date",
            header: "Date Range",
            size: 180,
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">From:</span>
                        <span className="text-xs font-medium text-gray-700">
                            {row.original.start_date || "N/A"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">To:</span>
                        <span className="text-xs font-medium text-gray-700">
                            {row.original.end_date || "N/A"}
                        </span>
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
            enableSorting: false,
            enableHiding: false,
        },
    ], [handleEditCoupon, handleDeleteCoupon])

    const deleteModalDescription = useMemo(
        () => selectedCoupon
            ? `Are you sure you want to delete coupon "${selectedCoupon.coupon_code}"? This action cannot be undone.`
            : "Are you sure you want to delete this coupon?",
        [selectedCoupon]
    )

    return (
        <div className="space-y-4 ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
                        Promo Coupons
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Manage your discount coupons and promotions
                    </p>
                </div>
            </div>

            <DataTable<Coupon, any>
                data={paginatedCoupons}
                columns={columns}
                loading={false}
                onAddAction={handleAddCoupon}
                actionLabel="Add Coupon"
                enableRowSelection
                enableSorting
                enableSearch
                enableColumnVisibility
                searchPlaceholder="Search coupons by code..."
                pagination={{
                    page: currentPage,
                    totalPages,
                    onPageChange: handlePageChange,
                    dataCount: itemsPerPage,
                }}
                noDataText={
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                        <h3 className="mt-4 text-sm font-medium text-gray-900">
                            No coupons found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by adding your first coupon.
                        </p>
                    </div>
                }
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
                isEditMode={isEditMode}
                slug={selectedCoupon?.slug}
                open={isCouponFormOpen}
                onCloseAction={handleCloseCouponForm}
            />
        </div>
    )
}