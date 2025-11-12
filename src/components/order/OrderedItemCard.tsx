'use client'

import {memo} from 'react'
import {FormatCurrency, StatusBadge} from '@/lib/helper'
import {Package} from 'lucide-react'
import {cn} from "@/lib/utils"
import {ORDER_TYPE} from "@/types/enum"

export interface OrderedItem {
    type: ORDER_TYPE | string
    prescription_required: boolean
    prescription_image?: string
    item_name: string
    variant_name?: string
    variant_size?: string
    quantity: number
    price: number
    subtotal: number
}

interface OrderedItemCardProps {
    item: OrderedItem
    index?: number
    showAnimation?: boolean
    className?: string
}

const OrderedItemCard = memo(function OrderedItemCard({
                                                          item,
                                                          showAnimation = true,
                                                          className = ''
                                                      }: OrderedItemCardProps) {
    const hasVariant = item.variant_name || item.variant_size
    const variantText = [item.variant_name, item.variant_size]
        .filter(Boolean)
        .join(' • ')

    return (
        <article
            className={cn(
                "bg-white p-4 sm:p-5 rounded-xl border border-slate-200",
                "hover:border-[var(--color-primaryColor)] hover:shadow-md",
                showAnimation && "transition-all duration-200",
                className
            )}
            aria-label={`Order item: ${item.item_name}`}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-50 to-slate-50 flex items-center justify-center border border-slate-200"
                        aria-hidden="true"
                    >
                        <Package className="w-5 h-5 text-[var(--color-primaryColor)]" aria-hidden="true"/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-tight line-clamp-2">
                            {item.item_name}
                        </h3>
                        {hasVariant && (
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                                {variantText}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <StatusBadge status={item.type}/>
                </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <DetailItem
                    label="Quantity"
                    value={item.quantity.toString()}
                />
                <DetailItem
                    label="Unit Price"
                    value={FormatCurrency(item.price)}
                />
            </dl>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
                <span className="text-xs sm:text-sm text-slate-600 font-medium">
                    Subtotal
                </span>
                <span
                    className="text-base sm:text-lg font-bold text-[var(--color-primaryColor)]"
                    aria-label={`Subtotal: ${FormatCurrency(item.subtotal)}`}
                >
                    {FormatCurrency(item.subtotal)}
                </span>
            </div>
        </article>
    )
})

interface DetailItemProps {
    label: string
    value: string
}

const DetailItem = memo(function DetailItem({label, value}: DetailItemProps) {
    return (
        <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {label}
            </dt>
            <dd className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {value}
            </dd>
        </div>
    )
})

OrderedItemCard.displayName = 'OrderedItemCard'
DetailItem.displayName = 'DetailItem'

export {OrderedItemCard, DetailItem}
export default OrderedItemCard