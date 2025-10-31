'use client'

import { useCallback, useRef, useState } from 'react'
import { CreditCard, Download, Mail, MapPin, Package, Printer, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FormatCurrency, StatusBadge } from '@/lib/helper'
import { OrderedItemCard } from '@/components/order/OrderedItemCard'
import SearchSelectField from '@/components/field/search-select'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import vendorOrderService from '@/service/order/vendor-order.service'

interface OrderedItem {
    type: string
    item_name: string
    variant_name: string
    variant_size?: string
    quantity: number
    price: number
    subtotal: number
}

interface Order {
    order_code: string
    order_id: string
    user_type: string
    name: string
    email: string
    mobile?: string
    address: string
    description?: string
    price: number
    payment_method: string
    payment_status?: string
    status: string
    created_at?: string
    ordered_items: OrderedItem[]
}

export default function VendorOrderDetailsPage() {
    const { slug } = useParams()
    const printRef = useRef<HTMLDivElement>(null)
    const [selectedStatus, setSelectedStatus] = useState<string>('pending')

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ]

    const { data: vendorOrder, isLoading, error } = useQuery<Order>({
        queryKey: ['vendor-order', slug],
        queryFn: () => vendorOrderService.getVendorOrderDetail(slug as string).then((res) => res),
        enabled: !!slug,
    })

    const updateStatusMutation = useMutation({
        mutationFn: (variables: { slug: string; status: string }) => vendorOrderService.updateVendorOrderStatus(variables.slug, { status: variables.status }),
        onSuccess: () => {
            toast.success(`Order status updated to "${selectedStatus}"`)
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update order status')
        }
    })

    const handlePrint = useCallback(() => window.print(), [])

    const handleStatusChange = useCallback((value: string | number | null) => {
        if (value) setSelectedStatus(String(value))
    }, [])

    const handleUpdateStatus = useCallback(() => {
        if (vendorOrder && selectedStatus && selectedStatus !== vendorOrder.status) {
            updateStatusMutation.mutate({ slug: vendorOrder.order_code, status: selectedStatus })
        }
    }, [selectedStatus, updateStatusMutation, vendorOrder])

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (error || !vendorOrder) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load order details</div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 print:bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 print:hidden">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primaryColor to-[#6b4fc0] bg-clip-text text-transparent">
                            Order Details
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2">Manage and track order information</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm border-2 hover:border-primaryColor/40 transition-all h-9 sm:h-10">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">Download</span>
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm border-2 hover:border-primaryColor/40 transition-all h-9 sm:h-10" onClick={handlePrint}>
                            <Printer className="h-4 w-4" />
                            <span className="hidden sm:inline font-medium">Print</span>
                        </Button>
                    </div>
                </div>

                <div ref={printRef} className="bg-card rounded-2xl shadow-lg border-2 hover:border-primaryColor/30 transition-all overflow-hidden">
                    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-primaryColor/5 to-purple-50/50 border-b">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0 border-2 border-primaryColor/10">
                                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primaryColor" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{vendorOrder.order_code}</h2>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Order ID: #{vendorOrder.order_id}</p>
                                    </div>
                                </div>
                                <StatusBadge status={vendorOrder.status} />
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
                                    disabled={!selectedStatus || selectedStatus === vendorOrder.status}
                                    className="w-full sm:w-auto bg-primaryColor hover:bg-[#3d2d75] text-white font-semibold shadow-md hover:shadow-lg transition-all"
                                >
                                    Update Status
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        <div className="lg:col-span-8 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full bg-primaryColor"></div>
                                    Order Items
                                </h3>
                                <div className="space-y-4">
                                    {vendorOrder.ordered_items.map((item, index) => (
                                        <OrderedItemCard
                                            key={index}
                                            item={{
                                                type: item.type,
                                                item_name: item.item_name,
                                                variant_name: item.variant_name,
                                                quantity: item.quantity,
                                                price: item.price,
                                                subtotal: item.subtotal,
                                            }}
                                            showAnimation
                                        />
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-border/60" />

                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full bg-primaryColor"></div>
                                    Vendor Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-primaryColor/5 to-purple-50/30 border-2 border-primaryColor/10 hover:border-primaryColor/30 hover:shadow-md transition-all">
                                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shadow-md bg-primaryColor ring-2 ring-primaryColor/20">
                                            <AvatarFallback className="text-white font-bold text-sm sm:text-base bg-primaryColor">{vendorOrder.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm sm:text-base text-foreground truncate">{vendorOrder.name}</p>
                                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1">
                                                <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                                <a href={`mailto:${vendorOrder.email}`} className="hover:text-primaryColor transition-colors truncate font-medium">{vendorOrder.email}</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 p-4 sm:p-6 lg:p-8 space-y-6 bg-muted/20">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full bg-primaryColor"></div>
                                    Customer Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-primaryColor/20">
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primaryColor" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-1 font-medium">Customer Name</p>
                                            <p className="font-bold text-sm sm:text-base text-foreground">{vendorOrder.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-primaryColor/20">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primaryColor" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-1 font-medium">Delivery Address</p>
                                            <p className="font-bold text-sm sm:text-base text-foreground">{vendorOrder.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/60" />

                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full bg-primaryColor"></div>
                                    Payment Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-primaryColor/20">
                                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primaryColor" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-1 font-medium">Payment Method</p>
                                            <p className="font-bold text-sm sm:text-base text-foreground uppercase">{vendorOrder.payment_method}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-md border-2 border-primaryColor/10 hover:border-primaryColor/20 transition-all">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground font-medium">Subtotal</span>
                                                <span className="font-bold text-foreground">{FormatCurrency(vendorOrder.price)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground font-medium">Tax</span>
                                                <span className="font-bold text-foreground">Rs. 0.00</span>
                                            </div>
                                            <Separator className="bg-border/60" />
                                            <div className="flex justify-between pt-2">
                                                <span className="text-base sm:text-lg font-bold text-foreground">Total</span>
                                                <span className="text-lg sm:text-xl font-bold text-primaryColor">{FormatCurrency(vendorOrder.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
