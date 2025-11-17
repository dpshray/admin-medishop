'use client'

import React, {memo, useCallback} from 'react'
import {FormatCurrency, StatusBadge} from '@/lib/helper'
import {FileText, Package, Trash2} from 'lucide-react'
import {cn} from '@/lib/utils'
import {ORDER_TYPE} from '@/types/enum'
import {DocumentSection} from '@/components/vendor/page'
import {Checkbox} from '@/components/ui/checkbox'
import {Button} from '@/components/ui/button'

export interface OrderedItem {
    id?: string | number
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
    checked?: boolean
    onCheckAction?: (checked: boolean, item: OrderedItem) => void
    disabled?: boolean
    ariaLabel?: string
    onDeleteAction?: (item: OrderedItem) => void
}

const OrderedItemCard = memo(function OrderedItemCard({
                                                          item,
                                                          showAnimation = true,
                                                          className = '',
                                                          checked = false,
                                                          onCheckAction,
                                                          onDeleteAction,
                                                          disabled = false,
                                                          ariaLabel,
                                                      }: OrderedItemCardProps) {
    const hasVariant = Boolean(item.variant_name || item.variant_size)
    const variantText = [item.variant_name, item.variant_size].filter(Boolean).join(' • ')

    const handleCheckboxChange = useCallback(
        (value: boolean | 'indeterminate') => {
            if (onCheckAction && !disabled && typeof value === 'boolean') {
                onCheckAction(value, item)
            }
        },
        [onCheckAction, disabled, item]
    )

    const handleDeleteClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            if (onDeleteAction && !disabled) {
                onDeleteAction(item)
            }
        },
        [onDeleteAction, disabled, item]
    )

    const cardId = item.id ? `order-item-${item.id}` : undefined
    const checkboxId = cardId ? `${cardId}-checkbox` : undefined
    const checkboxLabel = ariaLabel || `Select ${item.item_name}`

    return (
        <article
            id={cardId}
            className={cn(
                'group relative bg-white p-3 sm:p-4 lg:p-5 rounded-xl border border-slate-200',
                'hover:border-[var(--color-primaryColor)] hover:shadow-lg hover:scale-[1.01]',
                showAnimation && 'transition-all duration-300 ease-out',
                disabled && 'opacity-50 cursor-not-allowed',
                checked && 'border-[var(--color-primaryColor)] shadow-md bg-purple-50/30',
                !disabled && 'cursor-pointer',
                className
            )}
            aria-labelledby={checkboxId}
            role="group"
            onClick={(e) => {
                const target = e.target as HTMLElement
                if (!disabled && !target.closest('button') && !target.closest('[role="button"]')) {
                    handleCheckboxChange(!checked)
                }
            }}
        >
            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 pt-0.5 z-10" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            id={checkboxId}
                            checked={checked}
                            onCheckedChange={handleCheckboxChange}
                            disabled={disabled}
                            aria-label={checkboxLabel}
                            className={cn('data-[state=checked]:bg-[var(--color-primaryColor)] data-[state=checked]:border-[var(--color-primaryColor)]', disabled && 'opacity-50 cursor-not-allowed',)}
                        />
                    </div>

                    <div
                        className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-purple-100 via-purple-50 to-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-[var(--color-primaryColor)] group-hover:shadow-sm transition-all duration-300">
                        <Package
                            className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--color-primaryColor)] group-hover:scale-110 transition-transform duration-300"
                            aria-hidden="true"/>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base lg:text-lg leading-tight line-clamp-2 break-words group-hover:text-[var(--color-primaryColor)] transition-colors duration-300">
                            {item.item_name}
                        </h3>
                        {hasVariant && (
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate font-medium"
                               title={variantText}>
                                {variantText}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <StatusBadge status={item.type}/>
                    {onDeleteAction && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDeleteClick}
                            disabled={disabled}
                            className=" text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                            aria-label={`Delete ${item.item_name}`}
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    )}
                </div>
            </div>

            <dl className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                <DetailItem label="Quantity" value={`${item.quantity}x`}/>
                <DetailItem label="Unit Price" value={FormatCurrency(item.price)}/>
            </dl>

            {item.prescription_required && item.prescription_image && (
                <div className="mb-3 sm:mb-4">
                    <DocumentSection
                        title="Prescription"
                        documents={[item.prescription_image]}
                        icon={FileText}
                    />
                </div>
            )}

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
                <span
                    className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wide">Subtotal</span>
                <span
                    className="text-base sm:text-lg lg:text-xl font-bold text-[var(--color-primaryColor)] group-hover:scale-105 transition-transform duration-300">
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
        <div className="space-y-1 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</dt>
            <dd className="text-sm sm:text-base font-bold text-slate-900 truncate" title={value}>
                {value}
            </dd>
        </div>
    )
})

OrderedItemCard.displayName = 'OrderedItemCard'
DetailItem.displayName = 'DetailItem'

export {OrderedItemCard, DetailItem}
export default OrderedItemCard