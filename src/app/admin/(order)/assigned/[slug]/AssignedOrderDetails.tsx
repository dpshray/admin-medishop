'use client'

import { useQuery } from "@tanstack/react-query"
import orderService from "@/service/order/order.service"
import React, { useCallback, useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Download, Mail, MapPin, Package, User } from "lucide-react"
import SearchSelectField from "@/components/field/search-select"
import { FormatCurrency, StatusBadge } from "@/lib/helper"
import VendorOrderedItemCard from "@/components/vendor/vendor-details/vendor-order-card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import vendorOrderService from "@/service/order/vendor-order.service"
import { toast } from "sonner"
import { ORDER_STATUS } from "@/types/enum"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface StatusOption {
    value: string
    label: string
}

const STATUS_OPTIONS: StatusOption[] = [
    { value: ORDER_STATUS.PROCESSING, label: "Processing" },
    { value: ORDER_STATUS.DELIVERED, label: "Delivered" },
]

export default function AssignedOrderDetailsPage({ slug }: { slug: string }) {
    const [statusError, setStatusError] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const { data: adminOrder, refetch, isLoading } = useQuery({
        queryKey: ["assigned-order", slug],
        queryFn: async () => {
            const res = await orderService.getAssignedAdminOrderDetail(slug)
            console.log('Response From Order Service:', res)
            return res.data
        },
        staleTime: 30000,
    })

    const [selectedStatus, setSelectedStatus] = useState<string>("")

    useEffect(() => {
        if (adminOrder?.status) {
            setSelectedStatus(adminOrder.status)
        }
    }, [adminOrder?.status])

    const handleStatusChange = useCallback((value: string | number | null) => {
        if (value) setSelectedStatus(String(value))
    }, [])

    const handleUpdateStatus = useCallback(async () => {
        if (!adminOrder || selectedStatus === adminOrder.status || isUpdating) return

        setIsUpdating(true)
        setStatusError(null)

        try {
            const payload = { status: selectedStatus }
            const res = await vendorOrderService.updateVendorOrderStatus(slug, payload)
            toast.success(res.message || "Order status updated successfully")
            await refetch()
        } catch (error: any) {
            const errorMessage = error.message || "Something went wrong. Please try again later."
            toast.error(errorMessage)
            setStatusError(errorMessage)
            setTimeout(() => setStatusError(null), 5000)
        } finally {
            setIsUpdating(false)
        }
    }, [adminOrder, selectedStatus, slug, refetch, isUpdating])

    const customerInitial = useMemo(
        () => adminOrder?.name?.charAt(0)?.toUpperCase() || "U",
        [adminOrder?.name]
    )

    const hasCoordinates = useMemo(
        () => Boolean(adminOrder?.latitude && adminOrder?.longitude),
        [adminOrder?.latitude, adminOrder?.longitude]
    )

    const coordinatesText = useMemo(
        () => `${adminOrder?.latitude || ""}, ${adminOrder?.longitude || ""}`,
        [adminOrder?.latitude, adminOrder?.longitude]
    )

    const isStatusUpdateDisabled = useMemo(
        () => !adminOrder || selectedStatus === adminOrder.status || isUpdating,
        [selectedStatus, adminOrder, isUpdating]
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-600">Loading order details...</div>
            </div>
        )
    }

    if (!adminOrder) return null

    return (
        <div className="min-h-screen bg-slate-50 print:bg-white">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                <header className="print:hidden mb-6 space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                                Order Details
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-slate-600">
                                Manage and track order information
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="gap-2 text-xs sm:text-sm h-9"
                            aria-label="Download order details"
                        >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                        <SearchSelectField
                            label="Update Status"
                            placeholder="Select new status"
                            options={STATUS_OPTIONS}
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            className="w-full sm:w-64"
                        />
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={isStatusUpdateDisabled}
                            className="w-full sm:w-auto bg-primaryColor text-white font-semibold text-xs sm:text-sm h-9 sm:h-10"
                            aria-label="Update order status"
                        >
                            {isUpdating ? "Updating..." : "Update Status"}
                        </Button>
                    </div>
                </header>

                <main className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 md:p-6 lg:p-8 bg-slate-50 border-b border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-primaryColor flex items-center justify-center flex-shrink-0"
                                    aria-hidden="true"
                                >
                                    <Package className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 break-all">
                                        {adminOrder.order_code}
                                    </h2>
                                    <time className="text-xs sm:text-sm text-slate-600 mt-1 block">
                                        {adminOrder.created_at}
                                    </time>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                {adminOrder.order_item_status && (
                                    <StatusBadge status={adminOrder.order_item_status} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-slate-200">
                        <div className="lg:col-span-2 p-4 md:p-6 lg:p-8 bg-white space-y-6">
                            {statusError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{statusError}</AlertDescription>
                                </Alert>
                            )}

                            <section aria-labelledby="order-items-heading">
                                <h3 id="order-items-heading" className="text-lg md:text-xl font-bold text-slate-900 mb-5">
                                    Order Items
                                </h3>
                                <div className="space-y-4">
                                    {adminOrder.ordered_items.map((item: any) => (
                                        <VendorOrderedItemCard
                                            key={item.order_item_id}
                                            item={item}
                                            showAnimation
                                            orderUuid={slug}
                                            onSuccessAction={refetch}
                                        />
                                    ))}
                                </div>
                            </section>

                            <Separator className="my-6" />

                            <section aria-labelledby="vendor-info-heading">
                                <h3 id="vendor-info-heading" className="text-lg md:text-xl font-bold text-slate-900 mb-5">
                                    Vendor Information
                                </h3>
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                                    <Avatar className="w-12 h-12 bg-primaryColor flex-shrink-0">
                                        <AvatarFallback className="text-white font-bold text-lg">
                                            {customerInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-base md:text-lg text-slate-900 break-words">
                                            {adminOrder.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                            <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                            <a
                                                href={`mailto:${adminOrder.email}`}
                                                className="hover:text-primaryColor hover:underline break-all transition-colors"
                                                aria-label={`Email vendor at ${adminOrder.email}`}
                                            >
                                                {adminOrder.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="p-4 md:p-6 lg:p-8 bg-white space-y-6">
                            <section aria-labelledby="customer-details-heading">
                                <h3 id="customer-details-heading" className="text-lg md:text-xl font-bold text-slate-900 mb-5">
                                    Customer Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                                        <div
                                            className="w-10 h-10 rounded-lg bg-primaryColor/10 flex items-center justify-center flex-shrink-0"
                                            aria-hidden="true"
                                        >
                                            <User className="w-5 h-5 text-primaryColor" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-slate-500 mb-1 font-medium">Customer Name</p>
                                            <p className="font-bold text-base text-slate-900 break-words">
                                                {adminOrder.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                                        <div
                                            className="w-10 h-10 rounded-lg bg-primaryColor/10 flex items-center justify-center flex-shrink-0"
                                            aria-hidden="true"
                                        >
                                            <MapPin className="w-5 h-5 text-primaryColor" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-slate-500 mb-1 font-medium">Delivery Address</p>
                                            <address className="font-bold text-base text-slate-900 not-italic break-words">
                                                {adminOrder.address}
                                            </address>
                                            {hasCoordinates && (
                                                <p className="text-sm text-slate-500 mt-2 font-mono break-all bg-white px-2 py-1 rounded border border-slate-200">
                                                    {coordinatesText}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator className="my-6" />

                            <section aria-labelledby="payment-details-heading">
                                <h3 id="payment-details-heading" className="text-lg md:text-xl font-bold text-slate-900 mb-5">
                                    Payment Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                                        <div
                                            className="w-10 h-10 rounded-lg bg-primaryColor/10 flex items-center justify-center flex-shrink-0"
                                            aria-hidden="true"
                                        >
                                            <CreditCard className="w-5 h-5 text-primaryColor" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-slate-500 mb-1 font-medium">Payment Method</p>
                                            <p className="font-bold text-base text-slate-900">
                                                {adminOrder.payment_method}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-4 md:p-6 border border-slate-200">
                                        <dl className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <dt className="text-sm text-slate-600 font-medium">Subtotal</dt>
                                                <dd className="font-bold text-base text-slate-900">
                                                    {FormatCurrency(adminOrder.price)}
                                                </dd>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <dt className="text-sm text-slate-600 font-medium">Tax</dt>
                                                <dd className="font-bold text-base text-slate-900">Rs. 0.00</dd>
                                            </div>

                                            <Separator className="my-2" />

                                            <div className="flex justify-between items-center pt-2">
                                                <dt className="text-base md:text-lg font-bold text-slate-900">
                                                    Total Amount
                                                </dt>
                                                <dd className="text-lg md:text-xl lg:text-2xl font-bold text-primaryColor">
                                                    {FormatCurrency(adminOrder.price)}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    )
}