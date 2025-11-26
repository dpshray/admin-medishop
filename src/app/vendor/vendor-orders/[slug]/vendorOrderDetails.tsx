"use client"

import React, { useCallback, useMemo, useRef, useState, memo } from "react"
import { CreditCard, Download, Gift, Mail, MapPin, Package, Printer, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FormatCurrency, StatusBadge } from "@/lib/helper"
import SearchSelectField from "@/components/field/search-select"
import VendorOrderedItemCard from "@/components/vendor/vendor-details/vendor-order-card"
import { useQuery } from "@tanstack/react-query"
import vendorOrderService from "@/service/order/vendor-order.service"
import { toast } from "sonner"

interface StatusOption {
    value: string
    label: string
}

const STATUS_OPTIONS: StatusOption[] = [
    { value: "Processing", label: "Processing" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Pending", label: "Pending" },
]

interface VendorOrderDetailsProps {
    slug: string
}

const InfoCard = memo<{
    icon: React.ElementType
    label: string
    value: string | React.ReactNode
    className?: string
}>(({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-slate-50 ${className}`}>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primaryColor/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primaryColor" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-slate-500 mb-1 font-medium">{label}</p>
            {typeof value === 'string' ? (
                <p className="font-bold text-sm sm:text-base text-slate-900 break-words">{value}</p>
            ) : (
                value
            )}
        </div>
    </div>
))

InfoCard.displayName = 'InfoCard'

const PriceRow = memo<{ label: string; amount: string; isTotal?: boolean }>(
    ({ label, amount, isTotal = false }) => (
        <div className="flex justify-between items-center">
            <dt className={isTotal ? "text-sm sm:text-base md:text-lg font-bold text-slate-900" : "text-xs sm:text-sm text-slate-600 font-medium"}>
                {label}
            </dt>
            <dd className={isTotal ? "text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primaryColor" : "font-bold text-sm sm:text-base text-slate-900"}>
                {amount}
            </dd>
        </div>
    )
)

PriceRow.displayName = 'PriceRow'

export default function VendorAssignedOrderDetailsPage({ slug }: VendorOrderDetailsProps) {
    const { data: vendorOrder, refetch, isLoading } = useQuery({
        queryKey: ["orderDetails", slug],
        queryFn: async () => {
            return await vendorOrderService.getVendorOrderDetail(slug)
        },
        enabled: !!slug,
    })

    const printRef = useRef<HTMLDivElement>(null)
    const [selectedStatus, setSelectedStatus] = useState<string>("")
    const [isUpdating, setIsUpdating] = useState(false)

    useMemo(() => {
        if (vendorOrder?.status) {
            setSelectedStatus(vendorOrder.status)
        }
    }, [vendorOrder?.status])

    const handlePrint = useCallback(() => {
        window.print()
    }, [])

    const handleStatusChange = useCallback((value: string | number | null) => {
        if (value) setSelectedStatus(String(value))
    }, [])

    const handleUpdateStatus = useCallback(async () => {
        if (!vendorOrder || selectedStatus === vendorOrder.status) return

        setIsUpdating(true)
        try {
            const payload = { status: selectedStatus }
            await vendorOrderService.updateVendorOrderStatus(slug, payload)
            toast.success("Order status updated successfully")
            refetch()
        } catch (error: any) {
            toast.error(error?.message || "Failed to update order status")
        } finally {
            setIsUpdating(false)
        }
    }, [vendorOrder, selectedStatus, slug, refetch])

    const customerInitial = useMemo(
        () => vendorOrder?.name?.charAt(0)?.toUpperCase() || "U",
        [vendorOrder?.name]
    )

    const hasCoordinates = useMemo(
        () => Boolean(vendorOrder?.latitude && vendorOrder?.longitude),
        [vendorOrder?.latitude, vendorOrder?.longitude]
    )

    const coordinatesText = useMemo(
        () => `${vendorOrder?.latitude || ""}, ${vendorOrder?.longitude || ""}`,
        [vendorOrder?.latitude, vendorOrder?.longitude]
    )

    const isStatusUpdateDisabled = useMemo(
        () => !vendorOrder || selectedStatus === vendorOrder.status || isUpdating,
        [selectedStatus, vendorOrder, isUpdating]
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto animate-pulse text-primaryColor mb-4" />
                    <p className="text-sm sm:text-base text-slate-600">Loading order details...</p>
                </div>
            </div>
        )
    }

    if (!vendorOrder) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-sm sm:text-base text-slate-600">Order not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 print:bg-white">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                <header className="print:hidden mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                    <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                                Order Details
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-slate-600">
                                Manage and track order information
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="gap-2 text-xs sm:text-sm h-8 sm:h-9"
                                aria-label="Download order details"
                            >
                                <Download className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                                <span className="hidden sm:inline">Download</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                className="gap-2 text-xs sm:text-sm h-8 sm:h-9"
                                aria-label="Print order details"
                            >
                                <Printer className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                                <span className="hidden sm:inline">Print</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-end">
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

                <main ref={printRef} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-50 border-b border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-primaryColor flex items-center justify-center flex-shrink-0">
                                    <Package className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 break-all">
                                        {vendorOrder.order_code}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                        {vendorOrder.created_at}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <StatusBadge status={vendorOrder.status} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-slate-200">
                        <div className="lg:col-span-2 p-3 sm:p-4 md:p-6 lg:p-8 bg-white space-y-4 sm:space-y-6">
                            <section>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-4 sm:mb-5">
                                    Order Items
                                </h3>
                                <div className="space-y-3 sm:space-y-4">
                                    {vendorOrder.ordered_items.map((item: any) => (
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

                            <Separator className="my-4 sm:my-6" />

                            <section>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-4 sm:mb-5">
                                    Vendor Information
                                </h3>
                                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-slate-50">
                                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 bg-primaryColor flex-shrink-0">
                                        <AvatarFallback className="text-white font-bold text-base sm:text-lg">
                                            {customerInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm sm:text-base md:text-lg text-slate-900 break-words">
                                            {vendorOrder.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 mt-1">
                                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                                            <a
                                                href={`mailto:${vendorOrder.email}`}
                                                className="hover:text-primaryColor hover:underline break-all transition-colors"
                                                aria-label={`Email ${vendorOrder.name}`}
                                            >
                                                {vendorOrder.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="p-3 sm:p-4 md:p-6 lg:p-8 bg-white space-y-4 sm:space-y-6">
                            <section>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-4 sm:mb-5">
                                    Customer Details
                                </h3>
                                <div className="space-y-3 sm:space-y-4">
                                    <InfoCard icon={User} label="Customer Name" value={vendorOrder.name} />

                                    <InfoCard
                                        icon={MapPin}
                                        label="Delivery Address"
                                        value={
                                            <>
                                                <address className="font-bold text-sm sm:text-base text-slate-900 not-italic break-words">
                                                    {vendorOrder.address}
                                                </address>
                                                {hasCoordinates && (
                                                    <p className="text-xs sm:text-sm text-slate-500 mt-2 font-mono break-all bg-white px-2 py-1 rounded border border-slate-200">
                                                        {coordinatesText}
                                                    </p>
                                                )}
                                            </>
                                        }
                                    />

                                    {vendorOrder.gift_wrap && (
                                        <InfoCard
                                            icon={Gift}
                                            label="Gift Wrap"
                                            value={
                                                <>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs sm:text-sm text-slate-500 font-medium">Charge:</span>
                                                        <span className="font-bold text-sm sm:text-base text-slate-900">
                              {vendorOrder.gift_wrap_charge}
                            </span>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-slate-600 break-words">
                                                        {vendorOrder.gift_wrap_remarks}
                                                    </p>
                                                </>
                                            }
                                        />
                                    )}
                                </div>
                            </section>

                            <Separator className="my-4 sm:my-6" />

                            <section>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-4 sm:mb-5">
                                    Payment Details
                                </h3>
                                <div className="space-y-3 sm:space-y-4">
                                    <InfoCard
                                        icon={CreditCard}
                                        label="Payment Method"
                                        value={vendorOrder.payment_method}
                                    />

                                    <div className="bg-slate-50 rounded-lg p-3 sm:p-4 md:p-6 border border-slate-200">
                                        <dl className="space-y-2 sm:space-y-3" role="list">
                                            <PriceRow label="Subtotal" amount={FormatCurrency(vendorOrder.price)} />
                                            <PriceRow label="Tax" amount="Rs. 0.00" />
                                            <Separator className="my-2" />
                                            <div className="pt-2">
                                                <PriceRow label="Total Amount" amount={FormatCurrency(vendorOrder.price)} isTotal />
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