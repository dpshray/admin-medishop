'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { CreditCard, Download, Mail, MapPin, Package, Printer, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FormatCurrency, StatusBadge } from '@/lib/helper'
import SearchSelectField from '@/components/field/search-select'
import VendorOrderedItemCard, { VendorOrderedItem } from '@/components/vendor/vendor-details/vendor-order-card'
import BatchModalFrom from '@/components/batch/batch-modal-from'

const statusOptions = [
    { value: 'Processing', label: 'Processing' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Pending', label: 'Pending' }
]

interface OrderData {
    order_id: string
    order_code: string
    user_type: string
    name: string
    email: string
    mobile: string
    address: string
    latitude?: string
    longitude?: string
    description?: string
    price: number
    payment_method: string
    payment_status: string
    status: string
    created_at: string
    ordered_items: VendorOrderedItem[]
}

const staticOrder: OrderData = {
    order_id: '12345',
    order_code: 'ORD-20251119',
    user_type: 'USER',
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '9876543210',
    address: '123 Main Street, Kathmandu, Nepal',
    latitude: '27.7172',
    longitude: '85.3240',
    description: 'Order description here',
    price: 2500,
    payment_method: 'Cash on Delivery',
    payment_status: 'UNPAID',
    status: 'Processing',
    created_at: '2025-11-19T12:00:00Z',
    ordered_items: [
        {
            order_item_id: 1,
            type: 'PRODUCT',
            prescription_required: false,
            item_name: 'Product 1',
            quantity: 2,
            price: 1000,
            subtotal: 2000,
            order_item_assigned_to: null,
            batch_number: ['12312141', '9259hetkwjsfh']
        },
        {
            order_item_id: 2,
            type: 'PRODUCT',
            prescription_required: false,
            item_name: 'Product 2',
            quantity: 1,
            price: 500,
            subtotal: 500,
            order_item_assigned_to: null,
            batch_number:['7345902345394']
        }
    ]
}

export default function VendorOrderDetailsPage() {
    const printRef = useRef<HTMLDivElement>(null)
    const [selectedStatus, setSelectedStatus] = useState(staticOrder.status)

    const handlePrint = useCallback(() => window.print(), [])
    const handleStatusChange = useCallback((value: string | number | null) => value && setSelectedStatus(String(value)), [])

    const handleUpdateStatus = useCallback(() => {
        if (selectedStatus !== staticOrder.status) {
            const payload = { status: selectedStatus }
            console.log('Update Payload', payload)
        }
    }, [selectedStatus])

    const customerInitial = useMemo(() => staticOrder.name.charAt(0).toUpperCase(), [])
    const hasCoordinates = useMemo(() => Boolean(staticOrder.latitude && staticOrder.longitude), [])
    const coordinatesText = useMemo(() => `${staticOrder.latitude}, ${staticOrder.longitude}`, [])
    const isStatusUpdateDisabled = useMemo(() => selectedStatus === staticOrder.status, [selectedStatus])

    return (
        <div className="min-h-screen bg-slate-50 print:bg-white">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 print:hidden">
                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">Order Details</h1>
                        <p className="text-xs sm:text-sm md:text-base text-slate-600">Manage and track order information</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled className="gap-2 text-xs sm:text-sm h-9">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 text-xs sm:text-sm h-9">
                            <Printer className="h-4 w-4" />
                            <span className="hidden sm:inline">Print</span>
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end print:hidden">
                        <SearchSelectField
                            label="Update Status"
                            placeholder="Select new status"
                            options={statusOptions}
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            className="w-full sm:w-64"
                        />

                        <Button
                            onClick={handleUpdateStatus}
                            disabled={isStatusUpdateDisabled}
                            className="w-full sm:w-auto bg-primaryColor text-white font-semibold text-xs sm:text-sm"
                        >
                            Update Status
                        </Button>
                    </div>

                </header>

                <main ref={printRef} className="bg-white rounded-lg overflow-hidden">
                    <div className="p-4 md:p-6 lg:p-8 bg-slate-50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-primaryColor flex items-center justify-center">
                                    <Package className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl md:text-3xl font-bold text-slate-900 break-all">{staticOrder.order_code}</h2>
                                    <p className="text-sm text-slate-600 mt-1">Order ID: #{staticOrder.order_id}</p>
                                </div>
                            </div>

                            <StatusBadge status={staticOrder.status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-slate-200">
                        <div className="lg:col-span-2 p-4 md:p-6 lg:p-8 bg-white space-y-6">
                            <section>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-5">Order Items</h3>
                                <div className="space-y-4">
                                    {staticOrder.ordered_items.map(item => (
                                        <VendorOrderedItemCard key={item.order_item_id} item={item} showAnimation />
                                    ))}
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-5">Vendor Information</h3>
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                                    <Avatar className="w-12 h-12 bg-primaryColor">
                                        <AvatarFallback className="text-white font-bold">{customerInitial}</AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0">
                                        <p className="font-bold text-lg text-slate-900 break-words">{staticOrder.name}</p>

                                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                            <Mail className="w-4 h-4" />
                                            <a href={`mailto:${staticOrder.email}`} className="hover:text-primaryColor hover:underline break-all">
                                                {staticOrder.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="p-4 md:p-6 lg:p-8 bg-white space-y-6">
                            <section>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-5">Customer Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                                        <div className="w-10 h-10 rounded-lg bg-primaryColor/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primaryColor" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-1 font-medium">Customer Name</p>
                                            <p className="font-bold text-base text-slate-900 break-words">{staticOrder.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                                        <div className="w-10 h-10 rounded-lg bg-primaryColor/10 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-primaryColor" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-1 font-medium">Delivery Address</p>
                                            <address className="font-bold text-base text-slate-900 not-italic break-words">
                                                {staticOrder.address}
                                            </address>

                                            {hasCoordinates && (
                                                <p className="text-sm text-slate-500 mt-2 font-mono break-all bg-white px-2 py-1 rounded">
                                                    {coordinatesText}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-5">Payment Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                                        <div className="w-10 h-10 rounded-lg bg-primaryColor/10 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-primaryColor" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-500 mb-1 font-medium">Payment Method</p>
                                            <p className="font-bold text-base text-slate-900 uppercase">
                                                {staticOrder.payment_method}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-6">
                                        <dl className="space-y-3">
                                            <div className="flex justify-between">
                                                <dt className="text-sm text-slate-600 font-medium">Subtotal</dt>
                                                <dd className="font-bold text-base text-slate-900">{FormatCurrency(staticOrder.price)}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-sm text-slate-600 font-medium">Tax</dt>
                                                <dd className="font-bold text-base text-slate-900">Rs. 0.00</dd>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between pt-2">
                                                <dt className="text-lg font-bold text-slate-900">Total Amount</dt>
                                                <dd className="text-xl lg:text-2xl font-bold text-primaryColor">
                                                    {FormatCurrency(staticOrder.price)}
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
