'use client'

import { memo } from 'react'
import { StatusBadge, FormatCurrency } from '@/lib/helper'
import { Package } from 'lucide-react'
import {cn} from "@/lib/utils";

interface OrderedItem {
    type: string
    item_name: string
    variant_name?: string | null
    variant_size?: string | null
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

export function OrderedItemCard({
                             item,
                             showAnimation = true,
                             className = ''
                         }: OrderedItemCardProps) {
    const hasVariant = item.variant_name || item.variant_size

    return (
        <article
            className={cn(
                "bg-white p-5 rounded-xl border border-slate-200 hover:border-[var(--color-primaryColor)] hover:shadow-md",
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
                        <Package className="w-5 h-5 text-[var(--color-primaryColor)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-base leading-tight truncate">
                            {item.item_name}
                        </h4>
                        {hasVariant && (
                            <p className="text-sm text-slate-500 mt-0.5">
                                {[item.variant_name, item.variant_size]
                                    .filter(Boolean)
                                    .join(' • ')}
                            </p>
                        )}
                    </div>
                </div>
                <StatusBadge status={item.type} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <DetailItem
                    label="Quantity"
                    value={item.quantity.toString()}
                />
                <DetailItem
                    label="Unit Price"
                    value={FormatCurrency(item.price)}
                />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-600 font-medium">
                    Subtotal
                </span>
                <span
                    className="text-lg font-bold text-[var(--color-primaryColor)]"
                    aria-label={`Subtotal: ${FormatCurrency(item.subtotal)}`}
                >
                    {FormatCurrency(item.subtotal)}
                </span>
            </div>
        </article>
    )
}

interface DetailItemProps {
    label: string
    value: string
}

export function DetailItem({ label, value }: DetailItemProps) {
    return (
        <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {label}
            </dt>
            <dd className="text-sm font-semibold text-slate-900">
                {value}
            </dd>
        </div>
    )
}

export default memo(OrderedItemCard)
