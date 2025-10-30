'use client'

import {memo, useCallback, useEffect, useRef, useState} from 'react'
import {CreditCard, Edit, Mail, MapPin, MoreVertical, Package, Phone, User, UserPlus, X} from 'lucide-react'
import {StatusBadge} from "@/lib/helper";

interface OrderType {
    order_uuid: string
    order_code: string
    name: string
    email: string
    mobile: string
    address: string
    payment_method: string
    payment_status: string
    status: string
    no_of_ordered_items: number
    assigned_to?: string
}

interface VendorType {
    vendor_id: string
    vendor_name: string
}

interface OrderCardProps {
    order: OrderType
    vendors: VendorType[]
    orderStatuses: string[]
    onStatusChange: (orderUuid: string, status: string) => Promise<void>
    onVendorAssign: (orderUuid: string, vendorId: string) => Promise<void>
    onViewDetails?: (orderUuid: string) => void
    onDownloadInvoice?: (orderUuid: string) => void
    onCancelOrder?: (orderUuid: string) => void
}


const OrderViewCard = memo<OrderCardProps>(({
                                                order,
                                                vendors,
                                                orderStatuses,
                                                onStatusChange,
                                                onVendorAssign,
                                                onViewDetails,
                                                onDownloadInvoice,
                                                onCancelOrder
                                            }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!isMenuOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false)
                buttonRef.current?.focus()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isMenuOpen])

    const handleStatusChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value
        if (newStatus === order.status) return

        setIsUpdating(true)
        try {
            await onStatusChange(order.order_uuid, newStatus)
        } catch (error) {
            console.error('Failed to update status:', error)
        } finally {
            setIsUpdating(false)
        }
    }, [order.order_uuid, order.status, onStatusChange])

    const handleVendorAssign = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vendorId = e.target.value
        if (vendorId === order.assigned_to) return

        setIsUpdating(true)
        try {
            await onVendorAssign(order.order_uuid, vendorId)
        } catch (error) {
            console.error('Failed to assign vendor:', error)
        } finally {
            setIsUpdating(false)
        }
    }, [order.order_uuid, order.assigned_to, onVendorAssign])

    const handleMenuToggle = useCallback(() => {
        setIsMenuOpen(prev => !prev)
    }, [])

    const handleMenuAction = useCallback((action: () => void) => {
        setIsMenuOpen(false)
        action()
    }, [])

    const formatPaymentMethod = useCallback((method: string) => {
        return method.replace(/_/g, ' ').toUpperCase()
    }, [])

    return (
        <article
            className="bg-white rounded-lg border-2 border-gray-200 hover:border-[#4a358e] hover:shadow-lg transition-all duration-200 p-4 sm:p-6"
            aria-label={`Order ${order.order_code}`}
        >
            <div className="space-y-4">
                <header className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-[#4a358e] flex-shrink-0" aria-hidden="true"/>
                            <h2 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                                {order.order_code}
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge status={order.payment_status}/>
                            <StatusBadge status={order.status}/>
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            ref={buttonRef}
                            onClick={handleMenuToggle}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#4a358e] focus:ring-offset-2"
                            aria-label="More options"
                            aria-expanded={isMenuOpen}
                            aria-haspopup="true"
                        >
                            {isMenuOpen ? (
                                <X className="h-5 w-5 text-gray-600" aria-hidden="true"/>
                            ) : (
                                <MoreVertical className="h-5 w-5 text-gray-600" aria-hidden="true"/>
                            )}
                        </button>
                        {isMenuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                                role="menu"
                                aria-orientation="vertical"
                            >
                                {onViewDetails && (
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors focus:outline-none focus:bg-gray-100"
                                        role="menuitem"
                                        onClick={() => handleMenuAction(() => onViewDetails(order.order_uuid))}
                                    >
                                        View Details
                                    </button>
                                )}
                                {onDownloadInvoice && (
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors focus:outline-none focus:bg-gray-100"
                                        role="menuitem"
                                        onClick={() => handleMenuAction(() => onDownloadInvoice(order.order_uuid))}
                                    >
                                        Download Invoice
                                    </button>
                                )}
                                {onCancelOrder && (
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600 transition-colors focus:outline-none focus:bg-gray-100"
                                        role="menuitem"
                                        onClick={() => handleMenuAction(() => onCancelOrder(order.order_uuid))}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true"/>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate" title={order.name}>
                                {order.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" aria-hidden="true"/>
                                <a
                                    href={`mailto:${order.email}`}
                                    className="text-sm text-gray-500 truncate hover:text-[#4a358e] transition-colors"
                                    title={order.email}
                                >
                                    {order.email}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true"/>
                        <a
                            href={`tel:${order.mobile}`}
                            className="text-sm text-gray-700 font-medium hover:text-[#4a358e] transition-colors"
                        >
                            {order.mobile}
                        </a>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true"/>
                        <p className="text-sm text-gray-600 line-clamp-2" title={order.address}>
                            {order.address}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true"/>
                        <div className="flex items-center gap-2 flex-1 flex-wrap">
                            <span className="text-sm text-gray-600">
                                {formatPaymentMethod(order.payment_method)}
                            </span>
                            <span className="text-gray-300" aria-hidden="true">•</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {order.no_of_ordered_items} {order.no_of_ordered_items === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    </div>

                    {order.assigned_to && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                            <UserPlus className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden="true"/>
                            <span className="text-sm text-gray-600">
                                Assigned to: <span className="font-semibold text-gray-900">{order.assigned_to}</span>
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                    <div className="flex-1 relative">
                        <label htmlFor={`status-${order.order_uuid}`} className="sr-only">
                            Change order status
                        </label>
                        <select
                            id={`status-${order.order_uuid}`}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4a358e] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white"
                            value={order.status}
                            onChange={handleStatusChange}
                            disabled={isUpdating}
                            aria-label="Order status"
                        >
                            {orderStatuses.map(status => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                        <Edit
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                            aria-hidden="true"
                        />
                    </div>

                    {vendors.length > 0 && (
                        <div className="flex-1 relative">
                            <label htmlFor={`vendor-${order.order_uuid}`} className="sr-only">
                                Assign vendor
                            </label>
                            <select
                                id={`vendor-${order.order_uuid}`}
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4a358e] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white"
                                value={order.assigned_to || ''}
                                onChange={handleVendorAssign}
                                disabled={isUpdating}
                                aria-label="Assign vendor"
                            >
                                <option value="">Assign Vendor</option>
                                {vendors.map((vendor) => (
                                    <option key={vendor.vendor_id} value={vendor.vendor_id}>
                                        {vendor.vendor_name}
                                    </option>
                                ))}
                            </select>
                            <UserPlus
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>
            </div>
        </article>
    )
})

OrderViewCard.displayName = 'OrderViewCard'

export default OrderViewCard
export type {OrderType, VendorType, OrderCardProps}