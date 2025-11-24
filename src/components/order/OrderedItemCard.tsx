'use client'

import React, {memo, useCallback} from 'react'
import {FormatCurrency, StatusBadge} from '@/lib/helper'
import {FileText, Package, Trash2} from 'lucide-react'
import {cn} from '@/lib/utils'
import {ORDER_TYPE} from '@/types/enum'
import {DocumentSection} from '@/components/vendor/page'
import {Checkbox} from '@/components/ui/checkbox'
import {Button} from '@/components/ui/button'
import {Badge} from "@/components/ui/badge";

export interface OrderedItem {
    order_item_id: number
    type: ORDER_TYPE | string
    prescription_required: boolean
    prescription_image?: string
    item_name: string
    variant_name?: string
    variant_size?: string
    quantity: number
    price: number
    subtotal: number
    order_item_assigned_to?: OrderItemAssignedTo | null
}

interface OrderItemAssignedTo {
    vendor_name: string
    vendor_store_name: string
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

const OrderedItemCard = memo<OrderedItemCardProps>(function OrderedItemCard({
                                                                                item,
                                                                                showAnimation = true,
                                                                                className = '',
                                                                                checked = false,
                                                                                onCheckAction,
                                                                                onDeleteAction,
                                                                                disabled = false,
                                                                                ariaLabel,
                                                                            }) {
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

    const handleCardClick = useCallback(
        (e: React.MouseEvent) => {
            if (!onCheckAction || disabled) return

            const target = e.target as HTMLElement
            if (target.closest('button') || target.closest('[role="button"]') || target.closest('[role="checkbox"]')) {
                return
            }
            handleCheckboxChange(!checked)
        },
        [disabled, checked, handleCheckboxChange, onCheckAction]
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!onCheckAction || disabled) return

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCheckboxChange(!checked)
            }
        },
        [disabled, checked, handleCheckboxChange, onCheckAction]
    )

    const cardId = `order-item-${item.order_item_id}`
    const checkboxId = `${cardId}-checkbox`
    const checkboxLabel = ariaLabel || `Select ${item.item_name}`

    return (
        <article
            id={cardId}
            className={cn(
                'group relative bg-white p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-slate-200',
                showAnimation && 'transition-all duration-300 ease-out',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                checked && 'border-[var(--color-primaryColor)] shadow-md bg-purple-50/30',
                !disabled && onCheckAction && 'hover:border-[var(--color-primaryColor)] hover:shadow-lg hover:scale-[1.01] cursor-pointer',
                !onCheckAction && 'focus-within:ring-2 focus-within:ring-[var(--color-primaryColor)] focus-within:ring-offset-2',
                item.order_item_assigned_to && 'border-green-500 shadow-md',
                className
            )}
            aria-labelledby={checkboxId}
            aria-describedby={`${cardId}-details`}
            role="article"
            onClick={handleCardClick}
            tabIndex={disabled || !onCheckAction ? -1 : 0}
            onKeyDown={handleKeyDown}
        >
            <header className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    {onCheckAction && (
                        <div
                            className="flex-shrink-0 pt-0.5 z-10"
                            onClick={(e) => e.stopPropagation()}
                            role="presentation"
                        >
                            <Checkbox
                                id={checkboxId}
                                checked={checked}
                                onCheckedChange={handleCheckboxChange}
                                disabled={disabled}
                                aria-label={checkboxLabel}
                                className={cn(
                                    'h-4 w-4 sm:h-5 sm:w-5',
                                    'data-[state=checked]:bg-[var(--color-primaryColor)] data-[state=checked]:border-[var(--color-primaryColor)]',
                                    'focus-visible:ring-2 focus-visible:ring-[var(--color-primaryColor)] focus-visible:ring-offset-2'
                                )}
                            />
                        </div>
                    )}

                    <div
                        className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-100 via-purple-50 to-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-[var(--color-primaryColor)] group-hover:shadow-sm transition-all duration-300"
                        aria-hidden="true"
                    >
                        <Package
                            className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--color-primaryColor)] group-hover:scale-110 transition-transform duration-300"/>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3
                            id={checkboxId}
                            className="font-semibold text-slate-900 text-xs sm:text-sm lg:text-base leading-tight line-clamp-2 break-words group-hover:text-[var(--color-primaryColor)] transition-colors duration-300"
                        >
                            {item.item_name}
                        </h3>
                        {hasVariant && (
                            <p
                                className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate font-medium"
                                title={variantText}
                                aria-label={`Variant: ${variantText}`}
                            >
                                {variantText}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <StatusBadge status={item.type}/>
                    {item.order_item_assigned_to && (
                        <Badge className={cn('flex shrink-0  capitalize', 'bg-green-500 text-white')} variant="default">
                            {item.order_item_assigned_to.vendor_name}
                            {item.order_item_assigned_to.vendor_store_name && `(${item.order_item_assigned_to.vendor_store_name})`}
                        </Badge>
                    )}
                    {onDeleteAction && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDeleteClick}
                            disabled={disabled}
                            className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            aria-label={`Delete ${item.item_name}`}
                        >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true"/>
                        </Button>
                    )}
                </div>
            </header>

            <dl id={`${cardId}-details`} className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <DetailItem
                    label="Quantity"
                    value={`${item.quantity}×`}
                    ariaLabel={`Quantity ${item.quantity}`}
                />
                <DetailItem
                    label="Unit Price"
                    value={FormatCurrency(item.price)}
                    ariaLabel={`Price ${FormatCurrency(item.price)}`}
                />
            </dl>

            {item.prescription_required && item.prescription_image && (
                <div className="mb-3 sm:mb-4" role="region" aria-label="Prescription documents">
                    <DocumentSection
                        title="Prescription"
                        documents={[item.prescription_image]}
                        icon={FileText}
                    />
                </div>
            )}

            <footer className="flex items-center justify-between pt-2.5 sm:pt-3 lg:pt-4 border-t border-slate-100">
                <span
                    className="text-[10px] sm:text-xs lg:text-sm text-slate-600 font-semibold uppercase tracking-wide">
                    Subtotal
                </span>
                <span
                    className="text-sm sm:text-base lg:text-lg font-bold text-[var(--color-primaryColor)] group-hover:scale-105 transition-transform duration-300 tabular-nums"
                    aria-label={`Subtotal ${FormatCurrency(item.subtotal)}`}
                >
                    {FormatCurrency(item.subtotal)}
                </span>
            </footer>

            {item.order_item_assigned_to && (
                <div
                    className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-slate-100"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-600">
                        <span className="font-semibold">Assigned to:</span>
                        <span className="truncate" title={item.order_item_assigned_to.vendor_store_name}>
                            {item.order_item_assigned_to.vendor_store_name}
                        </span>
                    </div>
                </div>
            )}
        </article>
    )
})

interface DetailItemProps {
    label: string
    value: string
    ariaLabel?: string
}

const DetailItem = memo<DetailItemProps>(function DetailItem({label, value, ariaLabel}) {
    return (
        <div
            className="space-y-0.5 sm:space-y-1 p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
            <dt className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {label}
            </dt>
            <dd
                className="text-xs sm:text-sm font-bold text-slate-900 truncate tabular-nums"
                title={value}
                aria-label={ariaLabel || value}
            >
                {value}
            </dd>
        </div>
    )
})

OrderedItemCard.displayName = 'OrderedItemCard'
DetailItem.displayName = 'DetailItem'

export {OrderedItemCard, DetailItem}
export default OrderedItemCard