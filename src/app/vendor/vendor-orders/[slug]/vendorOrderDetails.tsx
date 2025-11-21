'use client'

import {useCallback, useMemo, useRef, useState} from 'react'
import {CreditCard, Download, Mail, MapPin, Package, Printer, User} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {FormatCurrency, StatusBadge} from '@/lib/helper'
import {OrderedItem, OrderedItemCard} from '@/components/order/OrderedItemCard'
import SearchSelectField from '@/components/field/search-select'
import {toast} from 'sonner'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useParams} from 'next/navigation'
import vendorOrderService from '@/service/order/vendor-order.service'
import VendorOrderDetailsLoading from "@/app/vendor/vendor-orders/[slug]/loading"
import {ORDER_STATUS, PAYMENT_STATUS, USER_TYPE} from "@/types/enum"

interface OrderData {
    order_id: string
    order_code: string
    user_type: USER_TYPE | string
    name: string
    email: string
    mobile: string
    address: string
    latitude?: string
    longitude?: string
    description?: string
    price: number
    payment_method: string
    payment_status: PAYMENT_STATUS | string
    status: ORDER_STATUS | string
    created_at: string
    ordered_items: OrderedItem[]
}



const statusOptions = [
    {value: 'Processing', label: 'Processing'},
    {value: 'Delivered', label: 'Delivered'},
    {value: 'Cancelled', label: 'Cancelled'},
    {value: 'Pending', label: 'Pending'},
]

export default function VendorOrderDetailsPage() {
    const {slug} = useParams()
    const printRef = useRef<HTMLDivElement>(null)
    const [selectedStatus, setSelectedStatus] = useState<string>('')

    const {data: vendorOrder, refetch, isLoading, error} = useQuery<OrderData>({
        queryKey: ['vendor-order', slug],
        queryFn: () => vendorOrderService.getVendorOrderDetail(slug as string),
        enabled: !!slug,
    })


    const updateStatusMutation = useMutation({
        mutationFn: async ({slug, status}: { slug: string; status: string }) => {
            return await vendorOrderService.updateVendorOrderStatus(slug, {status})
        },
        onSuccess: () => {
            toast.success(`Order status updated to "${selectedStatus}"`)
            refetch()
            setSelectedStatus('')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update order status')
        },
    })

    const handlePrint = useCallback(() => {
        window.print()
    }, [])

    const handleStatusChange = useCallback((value: string | number | null) => {
        if (value) setSelectedStatus(String(value))
    }, [])

    const handleUpdateStatus = useCallback(() => {
        if (vendorOrder && selectedStatus && selectedStatus !== vendorOrder.status) {
            updateStatusMutation.mutate({slug: slug as string, status: selectedStatus})
        }
    }, [selectedStatus, slug, updateStatusMutation, vendorOrder])

    const customerInitial = useMemo(
        () => vendorOrder?.name?.charAt(0).toUpperCase() || 'U',
        [vendorOrder?.name]
    )

    const isStatusUpdateDisabled = useMemo(
        () => !selectedStatus || selectedStatus === vendorOrder?.status || updateStatusMutation.isPending,
        [selectedStatus, vendorOrder?.status, updateStatusMutation.isPending]
    )

    const hasCoordinates = useMemo(
        () => Boolean(vendorOrder?.latitude && vendorOrder?.longitude),
        [vendorOrder?.latitude, vendorOrder?.longitude]
    )

    const coordinatesText = useMemo(() => {
        if (!hasCoordinates || !vendorOrder) return null
        return `${vendorOrder.latitude}, ${vendorOrder.longitude}`
    }, [hasCoordinates, vendorOrder])


    if (isLoading) {
        return <VendorOrderDetailsLoading/>
    }

    if (error || !vendorOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" role="alert">
                <div className="text-center">
                    <p className="text-base sm:text-lg text-red-500 font-semibold">
                        Failed to load order details
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Please try refreshing the page
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 print:bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 xl:py-12">
                <header
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6 lg:mb-8 print:hidden">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-primaryColor to-[#6b4fc0] bg-clip-text text-transparent">
                            Order Details
                        </h1>
                        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1 sm:mt-2">
                            Manage and track order information
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-xs sm:text-sm border-2 hover:border-primaryColor/40 transition-all h-8 sm:h-9 lg:h-10"
                            disabled
                            aria-label="Download order (coming soon)"
                        >
                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true"/>
                            <span className="hidden sm:inline font-medium">Download</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-xs sm:text-sm border-2 hover:border-primaryColor/40 transition-all h-8 sm:h-9 lg:h-10"
                            onClick={handlePrint}
                        >
                            <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true"/>
                            <span className="hidden sm:inline font-medium">Print</span>
                        </Button>
                    </div>
                </header>

                <main
                    ref={printRef}
                    className="bg-card rounded-xl sm:rounded-2xl shadow-lg border-2 hover:border-primaryColor/30 transition-all overflow-hidden"
                >
                    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-primaryColor/5 to-purple-50/50 border-b">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div
                                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0 border-2 border-primaryColor/10"
                                        aria-hidden="true"
                                    >
                                        <Package className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primaryColor"/>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground break-all">
                                            {vendorOrder.order_code}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                                            Order ID: #{vendorOrder.order_id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <StatusBadge status={vendorOrder.status}/>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end print:hidden">
                                <SearchSelectField
                                    label="Update Status"
                                    placeholder="Select new status"
                                    options={statusOptions}
                                    value={selectedStatus || vendorOrder.status}
                                    onChange={handleStatusChange}
                                    className="w-full sm:w-64"
                                />
                                <Button
                                    onClick={handleUpdateStatus}
                                    disabled={isStatusUpdateDisabled}
                                    className="w-full sm:w-auto bg-primaryColor hover:bg-[#3d2d75] text-white font-semibold shadow-md hover:shadow-lg transition-all text-xs sm:text-sm disabled:opacity-50"
                                >
                                    {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        <div className="lg:col-span-8 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
                            <section aria-labelledby="order-items-heading">
                                <h3 id="order-items-heading"
                                    className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                                    <div className="w-1 h-4 sm:h-5 rounded-full bg-primaryColor flex-shrink-0"
                                         aria-hidden="true"/>
                                    Order Items
                                </h3>
                                <div className="space-y-3 sm:space-y-4">
                                    {vendorOrder.ordered_items.map((item, index) => (
                                        <OrderedItemCard
                                            key={`${item.item_name || index}-${vendorOrder.order_id}`}
                                            item={item}
                                            showAnimation
                                            disabled
                                        />
                                    ))}
                                </div>
                            </section>

                            <Separator className="bg-border/60"/>

                            <section aria-labelledby="vendor-info-heading">
                                <h3 id="vendor-info-heading"
                                    className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                                    <div className="w-1 h-4 sm:h-5 rounded-full bg-primaryColor flex-shrink-0"
                                         aria-hidden="true"/>
                                    Vendor Information
                                </h3>
                                <div
                                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 rounded-xl bg-gradient-to-r from-primaryColor/5 to-purple-50/30 border-2 border-primaryColor/10 hover:border-primaryColor/30 hover:shadow-md transition-all">
                                    <Avatar
                                        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 shadow-md bg-primaryColor ring-2 ring-primaryColor/20 flex-shrink-0">
                                        <AvatarFallback
                                            className="text-white font-bold text-sm sm:text-base lg:text-lg bg-primaryColor">
                                            {customerInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm sm:text-base lg:text-lg text-foreground break-words">
                                            {vendorOrder.name}
                                        </p>
                                        <div
                                            className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1">
                                            <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"
                                                  aria-hidden="true"/>
                                            <a
                                                href={`mailto:${vendorOrder.email}`}
                                                className="hover:text-primaryColor transition-colors break-all font-medium"
                                            >
                                                {vendorOrder.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="lg:col-span-4 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-muted/20">
                            <section aria-labelledby="customer-details-heading">
                                <h3 id="customer-details-heading"
                                    className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                                    <div className="w-1 h-4 sm:h-5 rounded-full bg-primaryColor flex-shrink-0"
                                         aria-hidden="true"/>
                                    Customer Details
                                </h3>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-primaryColor/20"
                                            aria-hidden="true"
                                        >
                                            <User
                                                className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-primaryColor"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1 font-medium">
                                                Customer Name
                                            </p>
                                            <p className="font-bold text-sm sm:text-base text-foreground break-words">
                                                {vendorOrder.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-primaryColor/20"
                                            aria-hidden="true"
                                        >
                                            <MapPin
                                                className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-primaryColor"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1 font-medium">
                                                Delivery Address
                                            </p>
                                            <p className="font-bold text-sm sm:text-base text-foreground break-words leading-relaxed">
                                                {vendorOrder.address}
                                            </p>
                                            {hasCoordinates && (
                                                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono break-all">
                                                    {coordinatesText}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator className="bg-border/60"/>

                            <section aria-labelledby="payment-details-heading">
                                <h3 id="payment-details-heading"
                                    className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                                    <div className="w-1 h-4 sm:h-5 rounded-full bg-primaryColor flex-shrink-0"
                                         aria-hidden="true"/>
                                    Payment Details
                                </h3>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-primaryColor/20"
                                            aria-hidden="true"
                                        >
                                            <CreditCard
                                                className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-primaryColor"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1 font-medium">
                                                Payment Method
                                            </p>
                                            <p className="font-bold text-sm sm:text-base text-foreground uppercase">
                                                {vendorOrder.payment_method}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="bg-white rounded-xl p-4 sm:p-5 shadow-md border-2 border-primaryColor/10 hover:border-primaryColor/20 transition-all">
                                        <dl className="space-y-2 sm:space-y-3">
                                            <div className="flex justify-between text-xs sm:text-sm gap-2">
                                                <dt className="text-muted-foreground font-medium">Subtotal</dt>
                                                <dd className="font-bold text-foreground text-right break-all">
                                                    {FormatCurrency(vendorOrder.price)}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm gap-2">
                                                <dt className="text-muted-foreground font-medium">Tax</dt>
                                                <dd className="font-bold text-foreground">Rs. 0.00</dd>
                                            </div>
                                            <Separator className="bg-border/60"/>
                                            <div className="flex justify-between pt-1 sm:pt-2 gap-2">
                                                <dt className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
                                                    Total
                                                </dt>
                                                <dd className="text-base sm:text-lg lg:text-xl font-bold text-primaryColor text-right break-all">
                                                    {FormatCurrency(vendorOrder.price)}
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