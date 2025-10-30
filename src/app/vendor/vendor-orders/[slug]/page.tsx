'use client'
import { Package, User, MapPin, CreditCard, Mail, Store, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FormatCurrency, StatusBadge } from "@/lib/helper"
import { useRef } from 'react'


type VendorOrderItem = {
    product_name: string
    variant_name: string
    quantity: number
    price: number
    total: number
    featured_image: string
    vendor_name: string
    vendor_email: string
}

type VendorOrder = {
    order_id: number
    order_code: string
    price: number
    payment_method: string
    status: string
    customer_name: string
    address: string
    order_items: VendorOrderItem[]
}

export default function VendorOrderDetailsPage() {
    const printRef = useRef<HTMLDivElement>(null)

    const vendorOrder: VendorOrder = {
        order_id: 12,
        order_code: "ORD-2025-001",
        price: 2500.75,
        payment_method: "esewa",
        status: "pending",
        customer_name: "John Doe",
        address: "Kathmandu, Nepal",
        order_items: [
            {
                product_name: "Laptop Pro 15",
                variant_name: "8GB / 256GB",
                quantity: 1,
                price: 1200.5,
                total: 1200.5,
                featured_image: "https://example.com/image.jpg",
                vendor_name: "Tech World",
                vendor_email: "vendor@techworld.com"
            },
            {
                product_name: "Wireless Mouse",
                variant_name: "Black",
                quantity: 2,
                price: 25.5,
                total: 51.0,
                featured_image: "https://example.com/mouse.jpg",
                vendor_name: "Tech World",
                vendor_email: "vendor@techworld.com"
            }
        ]
    }

    const uniqueVendors = Array.from(new Map(vendorOrder.order_items.map(item =>
        [item.vendor_email, { name: item.vendor_name, email: item.vendor_email }]
    )).values())

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = () => {
        const orderData = {
            order_code: vendorOrder.order_code,
            order_id: vendorOrder.order_id,
            status: vendorOrder.status,
            customer: {
                name: vendorOrder.customer_name,
                address: vendorOrder.address
            },
            payment: {
                method: vendorOrder.payment_method,
                total: vendorOrder.price
            },
            items: vendorOrder.order_items.map(item => ({
                product: item.product_name,
                variant: item.variant_name,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                vendor: item.vendor_name
            }))
        }

        const dataStr = JSON.stringify(orderData, null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
        const exportFileDefaultName = `order-${vendorOrder.order_code}.json`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 no-print">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                            Order Details
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Manage and track order information
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-xs sm:text-sm"
                            aria-label="Download order"
                            onClick={handleDownload}
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-xs sm:text-sm"
                            aria-label="Print order"
                            onClick={handlePrint}
                        >
                            <Printer className="h-4 w-4" />
                            <span className="hidden sm:inline">Print</span>
                        </Button>
                    </div>
                </div>

                <div ref={printRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                    <Package className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#4a358e' }} />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                        {vendorOrder.order_code}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        Order ID: #{vendorOrder.order_id}
                                    </p>
                                </div>
                            </div>
                            <StatusBadge status={vendorOrder.status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                        <div className="lg:col-span-8 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#4a358e' }}></div>
                                    Order Items
                                </h3>
                                <div className="space-y-3 sm:space-y-4">
                                    {vendorOrder.order_items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-all duration-200 border border-gray-100"
                                        >
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                                <img
                                                    src={item.featured_image}
                                                    alt={`${item.product_name} - ${item.variant_name}`}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 mb-1 line-clamp-2">
                                                    {item.product_name}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                                                    {item.variant_name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm text-gray-600 truncate">
                                                        {item.vendor_name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-1">
                                                    {FormatCurrency(item.total)}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                                    Qty: {item.quantity}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {FormatCurrency(item.price)} each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#4a358e' }}></div>
                                    Vendor Information
                                </h3>
                                <div className="space-y-3">
                                    {uniqueVendors.map((vendor, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-50/30 border border-purple-100 hover:border-purple-200 hover:shadow-sm transition-all"
                                        >
                                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shadow-sm" style={{ backgroundColor: '#4a358e' }}>
                                                <AvatarFallback className="text-white font-semibold text-sm sm:text-base">
                                                    {vendor.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                                    {vendor.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                                    <a
                                                        href={`mailto:${vendor.email}`}
                                                        className="hover:text-purple-600 transition-colors truncate"
                                                    >
                                                        {vendor.email}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50/30">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#4a358e' }}></div>
                                    Customer Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#4a358e' }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                                            <p className="font-semibold text-sm sm:text-base text-gray-900">
                                                {vendorOrder.customer_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#4a358e' }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                                            <p className="font-semibold text-sm sm:text-base text-gray-900">
                                                {vendorOrder.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#4a358e' }}></div>
                                    Payment Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#4a358e' }} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                            <p className="font-semibold text-sm sm:text-base text-gray-900 uppercase">
                                                {vendorOrder.payment_method}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium text-gray-900">
                                                    {FormatCurrency(vendorOrder.price)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax</span>
                                                <span className="font-medium text-gray-900">Rs. 0.00</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between pt-1">
                                                <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
                                                <span className="text-lg sm:text-xl font-bold" style={{ color: '#4a358e' }}>
                                                    {FormatCurrency(vendorOrder.price)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="no-print" />

                            <Button
                                className="w-full py-5 sm:py-6 rounded-xl text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all no-print"
                                style={{ backgroundColor: '#4a358e' }}
                                aria-label="Update order status"
                            >
                                Update Order Status
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}