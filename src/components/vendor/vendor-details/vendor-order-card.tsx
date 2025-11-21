'use client'

import React, {memo, useCallback, useMemo, useState} from 'react'
import {FormatCurrency, StatusBadge} from '@/lib/helper'
import {AlertCircle, CheckCircle2, FileText, Package, Trash2, X} from 'lucide-react'
import {cn} from '@/lib/utils'
import {ORDER_TYPE, STATUS_TYPE} from '@/types/enum'
import {DocumentSection} from '@/components/vendor/page'
import {Button} from '@/components/ui/button'
import {DetailItem} from '@/components/order/OrderedItemCard'
import TextInputField from '@/components/field/text-input'
import {Badge} from "@/components/ui/badge"

export interface VendorOrderedItem {
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
    batch_number?: string[]
}

interface OrderItemAssignedTo {
    vendor_name: string
    vendor_store_name: string
}

interface VendorOrderedItemCardProps {
    item: VendorOrderedItem
    index?: number
    showAnimation?: boolean
    className?: string
    disabled?: boolean
    ariaLabel?: string
    onDeleteAction?: (item: VendorOrderedItem) => void
    assignBatchNumberAction?: (item: VendorOrderedItem, batchData: BatchAllocation[]) => void
}

interface BatchAllocation {
    batchNumber: string
    quantity: number
}

const VendorOrderedItemCard = memo(function VendorOrderedItemCard({
                                                                      item,
                                                                      showAnimation = true,
                                                                      className = '',
                                                                      disabled = false,
                                                                      ariaLabel,
                                                                      onDeleteAction,
                                                                      assignBatchNumberAction
                                                                  }: VendorOrderedItemCardProps) {
    const [batchExpanded, setBatchExpanded] = useState(false)
    const [batchAllocations, setBatchAllocations] = useState<BatchAllocation[]>(() => {
        if (item.batch_number && item.batch_number.length > 0) {
            if (item.batch_number.length === 1) {
                return [{batchNumber: item.batch_number[0], quantity: item.quantity}]
            }
            return item.batch_number.map(bn => ({batchNumber: bn, quantity: 0}))
        }
        return []
    })

    const variantText = useMemo(() =>
            [item.variant_name, item.variant_size].filter(Boolean).join(' • '),
        [item.variant_name, item.variant_size]
    )
    const hasVariant = variantText.length > 0

    const totalAllocated = useMemo(() =>
            batchAllocations.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0),
        [batchAllocations]
    )

    const remainingQuantity = item.quantity - totalAllocated
    const isValidAllocation = totalAllocated === item.quantity &&
        batchAllocations.every(b => b.quantity > 0 && b.batchNumber.trim().length > 0)
    const hasOverAllocation = totalAllocated > item.quantity

    const toggleBatch = useCallback(() => {
        setBatchExpanded(v => !v)
    }, [])

    const handleDeleteClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            if (!disabled && onDeleteAction) onDeleteAction(item)
        },
        [disabled, onDeleteAction, item]
    )

    const handleQuantityChange = useCallback(
        (index: number, value: string) => {
            const numValue = parseInt(value, 10)
            const quantity = isNaN(numValue) || numValue < 0 ? 0 : Math.min(numValue, item.quantity)
            setBatchAllocations(prev => {
                const updated = [...prev]
                updated[index] = {...updated[index], quantity}
                return updated
            })
        },
        [item.quantity]
    )

    const handleRemoveBatch = useCallback((index: number) => {
        setBatchAllocations(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)
    }, [])

    const handleAssignBatch = useCallback(() => {
        if (isValidAllocation && assignBatchNumberAction) {
            assignBatchNumberAction(item, batchAllocations)
            setBatchExpanded(false)
        }
    }, [isValidAllocation, assignBatchNumberAction, item, batchAllocations])

    const cardId = `order-item-${item.order_item_id}`

    return (
        <article
            id={cardId}
            className={cn(
                'group relative bg-white p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm hover:shadow-md',
                showAnimation && 'transition-all duration-300 ease-out',
                item.order_item_assigned_to && 'border-green-500 shadow-md hover:shadow-lg',
                disabled && 'opacity-60 pointer-events-none',
                className
            )}
            aria-label={ariaLabel || item.item_name}
            role="article"
        >
            <header className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                        className={cn(
                            'flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl',
                            'bg-gradient-to-br from-purple-100 via-purple-50 to-slate-50',
                            'flex items-center justify-center border border-slate-200',
                            'transition-all duration-300 group-hover:border-[var(--color-primaryColor)] group-hover:shadow-sm'
                        )}
                        aria-hidden="true"
                    >
                        <Package
                            className={cn(
                                'w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--color-primaryColor)]',
                                'transition-transform duration-300 group-hover:scale-110'
                            )}
                            aria-label="Package icon"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-xs sm:text-sm lg:text-base leading-tight line-clamp-2">
                            {item.item_name}
                        </h3>

                        {hasVariant && (
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate font-medium">
                                {variantText}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <StatusBadge status={item.type}/>
                    {item.order_item_assigned_to && <StatusBadge status={STATUS_TYPE.ASSIGNED}/>}

                    {onDeleteAction && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDeleteClick}
                            disabled={disabled}
                            className={cn(
                                'h-7 w-7 sm:h-8 sm:w-8',
                                'text-slate-400 hover:text-red-600 hover:bg-red-50',
                                'transition-colors duration-200'
                            )}
                            aria-label="Delete item"
                        >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4"/>
                        </Button>
                    )}
                </div>
            </header>

            <dl className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <DetailItem label="Quantity" value={`${item.quantity}×`}/>
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

            {item.batch_number && item.batch_number.length > 0 && (
                <div className="mb-3 sm:mb-4">
                    <h2 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                        Batch Numbers
                    </h2>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                        {item.batch_number.map((num, index) => (
                            <Badge
                                variant="secondary"
                                key={index}
                                onClick={toggleBatch}
                                className={cn(
                                    'text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1',
                                    'hover:bg-slate-200 transition-colors duration-200 cursor-pointer',
                                    batchExpanded && 'bg-slate-200 border-slate-400'
                                )}
                                aria-label={`Batch ${num}`}
                                aria-expanded={batchExpanded}
                            >
                                {num}
                            </Badge>
                        ))}
                    </div>

                    {batchExpanded && (
                        <div className={cn(
                            'mt-3 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3',
                            'animate-in fade-in slide-in-from-top-2 duration-300'
                        )}>
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-xs sm:text-sm font-semibold text-slate-700">
                                        Batch Allocation
                                    </h4>
                                    {isValidAllocation && (
                                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600"
                                                      aria-label="Valid allocation"/>
                                    )}
                                    {hasOverAllocation && (
                                        <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600"
                                                     aria-label="Over allocation"/>
                                    )}
                                </div>
                                <Badge className={cn(
                                    'text-[10px] sm:text-xs font-medium',
                                    remainingQuantity === 0
                                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                        : hasOverAllocation
                                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                )} role="status" aria-live="polite">
                                    {hasOverAllocation ? 'Over: ' : 'Remaining: '}{Math.abs(remainingQuantity)}
                                </Badge>
                            </div>

                            <div className={cn(
                                'space-y-2 max-h-64 overflow-y-auto pr-1',
                                'scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100'
                            )}>
                                {batchAllocations.map((batch, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'flex items-start gap-2 p-2 sm:p-2.5',
                                            'bg-white rounded-lg border border-slate-200',
                                            'transition-all duration-200 hover:border-slate-300 hover:shadow-sm'
                                        )}
                                    >
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-[10px] sm:text-xs font-medium text-slate-600 whitespace-nowrap">
                                                    Batch:
                                                </span>
                                                <Badge variant="outline"
                                                       className="text-[10px] sm:text-xs font-medium">
                                                    {batch.batchNumber}
                                                </Badge>
                                            </div>
                                            <TextInputField
                                                label=""
                                                type="number"
                                                placeholder="Quantity"
                                                value={batch.quantity || ''}
                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                min={1}
                                                max={item.quantity}
                                                className="text-xs sm:text-sm"
                                                aria-label={`Quantity for batch ${batch.batchNumber}`}
                                                required
                                            />
                                        </div>
                                        {batchAllocations.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveBatch(index)}
                                                className={cn(
                                                    'h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0',
                                                    'text-slate-400 hover:text-red-600 hover:bg-red-50',
                                                    'transition-colors duration-200'
                                                )}
                                                aria-label={`Remove batch ${batch.batchNumber}`}
                                            >
                                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4"/>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-2 pt-2">
                                {!isValidAllocation && totalAllocated > 0 && (
                                    <div className={cn(
                                        'flex items-start gap-1.5 p-2 rounded-md flex-1',
                                        hasOverAllocation
                                            ? 'bg-red-50 border border-red-200'
                                            : 'bg-amber-50 border border-amber-200'
                                    )} role="alert">
                                        <AlertCircle className={cn(
                                            'h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5',
                                            hasOverAllocation ? 'text-red-600' : 'text-amber-600'
                                        )}/>
                                        <p className={cn(
                                            'text-[10px] sm:text-xs leading-relaxed',
                                            hasOverAllocation ? 'text-red-700' : 'text-amber-700'
                                        )}>
                                            {hasOverAllocation
                                                ? `Exceeds by ${totalAllocated - item.quantity}`
                                                : `Allocate ${remainingQuantity} more`}
                                        </p>
                                    </div>
                                )}
                                <Button
                                    onClick={handleAssignBatch}
                                    disabled={!isValidAllocation}
                                    size="sm"
                                    className={cn(
                                        'text-xs sm:text-sm font-medium flex-shrink-0 sm:ml-auto',
                                        'transition-all duration-200',
                                        isValidAllocation && 'hover:scale-[1.02]'
                                    )}
                                    aria-label="Assign batches"
                                >
                                    {isValidAllocation &&
                                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1"/>}
                                    Assign
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <footer className="flex items-center justify-between pt-2.5 sm:pt-3 lg:pt-4 border-t border-slate-100">
                <span
                    className="text-[10px] sm:text-xs lg:text-sm text-slate-600 font-semibold uppercase tracking-wide">
                    Subtotal
                </span>
                <span className="text-sm sm:text-base lg:text-lg font-bold text-[var(--color-primaryColor)]">
                    {FormatCurrency(item.subtotal)}
                </span>
            </footer>

            {item.order_item_assigned_to && (
                <div className={cn(
                    'mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-slate-100',
                    'animate-in fade-in duration-300'
                )}>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-600">
                        <span className="font-semibold flex-shrink-0">Assigned to:</span>
                        <span className="truncate font-medium"
                              title={item.order_item_assigned_to.vendor_store_name}>
                            {item.order_item_assigned_to.vendor_store_name}
                        </span>
                    </div>
                </div>
            )}
        </article>
    )
})

VendorOrderedItemCard.displayName = 'VendorOrderedItemCard'

export default VendorOrderedItemCard