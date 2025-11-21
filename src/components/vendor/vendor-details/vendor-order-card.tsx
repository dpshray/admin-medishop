'use client'

import React, {memo, useCallback, useEffect, useMemo, useState} from 'react'
import {FormatCurrency, StatusBadge} from '@/lib/helper'
import {AlertCircle, CheckCircle2, FileText, Package, Trash2, X} from 'lucide-react'
import {cn} from '@/lib/utils'
import {ORDER_TYPE, STATUS_TYPE} from '@/types/enum'
import {DocumentSection} from '@/components/vendor/page'
import {Button} from '@/components/ui/button'
import {DetailItem} from '@/components/order/OrderedItemCard'
import TextInputField from '@/components/field/text-input'
import {Badge} from '@/components/ui/badge'

export interface OrderItemAssignedTo {
    vendor_name: string
    vendor_store_name: string
}

export interface BatchAllocation {
    batch_number: string
    quantity: number
}

export interface VendorOrderedItemBase {
    order_item_id: number
    type: ORDER_TYPE.PRODUCT | ORDER_TYPE.PACKAGE | ORDER_TYPE.KITBAG
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

interface ProductItem extends VendorOrderedItemBase {
    type: ORDER_TYPE.PRODUCT
    batch_number?: string[]
}

interface PackageSubItem {
    order_item_id: number
    item_name: string
    variant_name?: string
    variant_size?: string
    quantity: number
    price: number
    subtotal: number
    batch_number?: string[]
}

export interface PackageItem extends VendorOrderedItemBase {
    type: ORDER_TYPE.PACKAGE
    packageItems: PackageSubItem[]
}

export interface KitbagItem extends VendorOrderedItemBase {
    type: ORDER_TYPE.KITBAG
    kitbagItems: PackageSubItem[]
}

export type VendorOrderedItem = ProductItem | PackageItem | KitbagItem

export interface VendorOrderedItemCardProps {
    item: VendorOrderedItem
    index?: number
    showAnimation?: boolean
    className?: string
    disabled?: boolean
    ariaLabel?: string
    onDeleteAction?: (item: VendorOrderedItem) => void
    assignBatchNumberAction?: (item: VendorOrderedItem, batchData: BatchAllocation[]) => void
}

interface BatchInput {
    batchNumber: string
    quantity: number
}

interface BatchAllocationEditorProps {
    batchAllocations: BatchInput[]
    itemQuantity: number
    onChange: (index: number, value: string) => void
    onRemove: (index: number) => void
}

const BatchAllocationEditor = memo<BatchAllocationEditorProps>(
    function BatchAllocationEditor({
                                       batchAllocations,
                                       itemQuantity,
                                       onChange,
                                       onRemove,
                                   }) {
        return (
            <div
                className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                role="list"
                aria-label="Batch allocations"
            >
                {batchAllocations.map((batch, index) => {
                    const labelId = `batch-label-${index}`
                    return (
                        <div
                            key={`${batch.batchNumber ?? 'batch'}-${index}`}
                            className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                            role="listitem"
                        >
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 flex-shrink-0" id={labelId}>
                  Batch:
                </span>
                                    <Badge variant="outline" className="text-xs font-medium" aria-labelledby={labelId}>
                                        {batch.batchNumber || '—'}
                                    </Badge>
                                </div>

                                <TextInputField
                                    label=""
                                    type="number"
                                    placeholder="Enter quantity"
                                    value={batch.quantity || ''}
                                    onChange={(e) => onChange(index, e.target.value)}
                                    min={1}
                                    max={itemQuantity}
                                    className="text-sm"
                                    aria-label={`Quantity for batch ${batch.batchNumber || index + 1}`}
                                    inputMode="numeric"
                                    required
                                />
                            </div>

                            {batchAllocations.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemove(index)}
                                    className="h-8 w-8 flex-shrink-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    aria-label={`Remove batch ${batch.batchNumber || index + 1}`}
                                >
                                    <X className="h-4 w-4" aria-hidden="true"/>
                                </Button>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    })

const VendorOrderedItemCard = memo<VendorOrderedItemCardProps>(function VendorOrderedItemCard({
                                                                                                  item,
                                                                                                  showAnimation = true,
                                                                                                  className = '',
                                                                                                  disabled = false,
                                                                                                  ariaLabel,
                                                                                                  onDeleteAction,
                                                                                                  assignBatchNumberAction,
                                                                                              }) {
    const [batchExpanded, setBatchExpanded] = useState(false)
    const createInitialAllocations = useCallback(
        (batchNumbers?: string[]) => {
            if (!batchNumbers || batchNumbers.length === 0) return []
            if (batchNumbers.length === 1) {
                return [{batchNumber: batchNumbers[0], quantity: item.quantity}]
            }
            return batchNumbers.map((bn) => ({batchNumber: bn, quantity: 0}))
        },
        [item.quantity]
    )

    const [batchAllocations, setBatchAllocations] = useState<BatchInput[]>(
        () => createInitialAllocations((item as ProductItem).batch_number)
    )

    useEffect(() => {
        // keep allocations synced if item.batch_number changes
        setBatchAllocations((prev) => {
            const incoming = (item as ProductItem).batch_number
            if (!incoming || incoming.length === 0) return []
            // if incoming length equals prev length, keep quantities where possible
            if (incoming.length === prev.length) {
                return incoming.map((bn, i) => ({batchNumber: bn, quantity: prev[i]?.quantity ?? 0}))
            }
            return createInitialAllocations(incoming)
        })
    }, [item, createInitialAllocations])

    const variantText = useMemo(
        () => [item.variant_name, item.variant_size].filter(Boolean).join(' • '),
        [item.variant_name, item.variant_size]
    )

    const {totalAllocated, remainingQuantity, isValidAllocation, hasOverAllocation} = useMemo(() => {
        const total = batchAllocations.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0)
        const remaining = item.quantity - total
        const isValid =
            total === item.quantity && batchAllocations.every((b) => b.quantity > 0 && (b.batchNumber ?? '').toString().trim().length > 0)
        const hasOver = total > item.quantity
        return {
            totalAllocated: total,
            remainingQuantity: remaining,
            isValidAllocation: isValid,
            hasOverAllocation: hasOver,
        }
    }, [batchAllocations, item.quantity])

    const toggleBatch = useCallback(() => setBatchExpanded((v) => !v), [])

    const handleDeleteClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            if (!disabled && onDeleteAction) {
                onDeleteAction(item)
            }
        },
        [disabled, onDeleteAction, item]
    )

    const handleQuantityChange = useCallback(
        (index: number, value: string) => {
            const numValue = parseInt(value, 10)
            const quantity = isNaN(numValue) || numValue < 1 ? 0 : Math.min(numValue, item.quantity)
            setBatchAllocations((prev) => {
                const updated = [...prev]
                updated[index] = {...updated[index], quantity}
                return updated
            })
        },
        [item.quantity]
    )

    const handleRemoveBatch = useCallback((index: number) => {
        setBatchAllocations((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
    }, [])

    const handleAssignBatch = useCallback(() => {
        if (isValidAllocation && assignBatchNumberAction) {
            const allocations: BatchAllocation[] = batchAllocations.map((b) => ({
                batch_number: b.batchNumber,
                quantity: b.quantity,
            }))
            assignBatchNumberAction(item, allocations)
            setBatchExpanded(false)
        }
    }, [isValidAllocation, assignBatchNumberAction, item, batchAllocations])

    const hasPackageItems =
        item.type === ORDER_TYPE.PACKAGE && 'packageItems' in item && Array.isArray((item as PackageItem).packageItems)
    const hasKitbagItems =
        item.type === ORDER_TYPE.KITBAG && 'kitbagItems' in item && Array.isArray((item as KitbagItem).kitbagItems)

    const batchNumbers = (item as ProductItem).batch_number ?? []

    return (
        <article
            id={`order-item-${item.order_item_id}`}
            className={cn(
                'group relative bg-white rounded-xl border shadow-sm',
                'p-4 md:p-5 lg:p-6',
                showAnimation && 'transition-all duration-300 ease-out hover:shadow-lg',
                item.order_item_assigned_to ? 'border-green-500 shadow-green-100' : 'border-gray-200',
                disabled && 'opacity-60 pointer-events-none',
                className
            )}
            aria-label={ariaLabel || `Order item: ${item.item_name}`}

        >
            <header className="flex items-start gap-3 mb-4">
                <div
                    className={cn(
                        'flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl',
                        'bg-gradient-to-br from-purple-100 to-blue-50',
                        'flex items-center justify-center border border-gray-200',
                        'transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-md'
                    )}
                    aria-hidden="true"
                >
                    <Package
                        className="w-5 h-5 md:w-6 md:h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300"
                        aria-hidden="true"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base lg:text-lg leading-tight mb-1 truncate">
                        {item.item_name}
                    </h3>
                    {variantText &&
                        <p className="text-xs md:text-sm text-gray-600 font-medium truncate">{variantText}</p>}
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex flex-wrap gap-1.5 justify-end" role="group" aria-label="Item status badges">
                        <StatusBadge status={item.type}/>
                        {item.order_item_assigned_to && <StatusBadge status={STATUS_TYPE.ASSIGNED}/>}
                    </div>
                    {onDeleteAction && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDeleteClick}
                            disabled={disabled}
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete ${item.item_name}`}
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true"/>
                        </Button>
                    )}
                </div>
            </header>

            <dl className="grid grid-cols-2 gap-3 mb-4">
                <DetailItem label="Quantity" value={`${item.quantity}×`}/>
                <DetailItem label="Unit Price" value={FormatCurrency(item.price)}/>
            </dl>

            {item.prescription_required && item.prescription_image && (
                <div className="mb-4">
                    <DocumentSection title="Prescription" documents={[item.prescription_image]} icon={FileText}/>
                </div>
            )}

            {hasPackageItems && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Package Items</h4>
                    <ul className="space-y-2" role="list" aria-label="Package contents">
                        {(item as PackageItem).packageItems.map((subItem, idx) => (
                            <li key={`package-${idx}`} className="flex justify-between text-sm text-gray-600 truncate">
                <span className="truncate">
                  {subItem.item_name}
                    {subItem.variant_name ? ` • ${subItem.variant_name}` : ''}
                </span>
                                <span>{FormatCurrency(subItem.subtotal)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {hasKitbagItems && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Kitbag Items</h4>
                    <ul className="space-y-2" role="list" aria-label="Kitbag contents">
                        {(item as KitbagItem).kitbagItems.map((subItem, idx) => (
                            <li key={`kitbag-${idx}`} className="flex justify-between text-sm text-gray-600 truncate">
                <span className="truncate">
                  {subItem.item_name}
                    {subItem.variant_name ? ` • ${subItem.variant_name}` : ''}
                </span>
                                <span>{FormatCurrency(subItem.subtotal)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {batchNumbers && batchNumbers.length > 0 && (
                <section className="mb-4" aria-labelledby={`batch-section-${item.order_item_id}`}>
                    <h4 id={`batch-section-${item.order_item_id}`} className="text-sm font-semibold text-gray-700 mb-2">
                        Batch Numbers
                    </h4>

                    <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label="Batch numbers selection">
                        {batchNumbers.map((num, index) => {
                            const expanded = batchExpanded
                            const badgeId = `batch-${item.order_item_id}-${index}`
                            return (
                                <Badge
                                    key={badgeId}
                                    variant="secondary"
                                    onClick={toggleBatch}
                                    className={cn(
                                        'text-xs font-medium px-3 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1',
                                        'hover:bg-gray-200 transition-colors duration-200',
                                        expanded && 'bg-gray-200 border-gray-400'
                                    )}
                                    aria-label={`Batch ${num}`}
                                    aria-expanded={expanded}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            toggleBatch()
                                        }
                                    }}
                                >
                                    {num}
                                </Badge>
                            )
                        })}
                    </div>

                    {batchExpanded && (
                        <div
                            className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
                            role="region"
                            aria-label="Batch allocation editor"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-sm font-semibold text-gray-700">Batch Allocation</h5>
                                    {isValidAllocation &&
                                        <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true"/>}
                                    {hasOverAllocation &&
                                        <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true"/>}
                                </div>

                                <Badge
                                    className={cn(
                                        'text-xs font-medium',
                                        remainingQuantity === 0
                                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                            : hasOverAllocation
                                                ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                    )}
                                    role="status"
                                    aria-live="polite"
                                >
                                    {hasOverAllocation ? 'Over: ' : 'Remaining: '}
                                    {Math.abs(remainingQuantity)}
                                </Badge>
                            </div>

                            <BatchAllocationEditor
                                batchAllocations={batchAllocations}
                                itemQuantity={item.quantity}
                                onChange={handleQuantityChange}
                                onRemove={handleRemoveBatch}
                            />

                            <div
                                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-gray-200">
                                {!isValidAllocation && totalAllocated > 0 && (
                                    <div
                                        className={cn(
                                            'flex items-start gap-2 p-3 rounded-lg flex-1',
                                            hasOverAllocation ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
                                        )}
                                        role="alert"
                                    >
                                        <AlertCircle
                                            className={cn('h-4 w-4 flex-shrink-0 mt-0.5', hasOverAllocation ? 'text-red-600' : 'text-amber-600')}
                                            aria-hidden="true"
                                        />
                                        <p className={cn('text-xs leading-relaxed', hasOverAllocation ? 'text-red-700' : 'text-amber-700')}>
                                            {hasOverAllocation
                                                ? `Allocation exceeds total by ${totalAllocated - item.quantity} unit${totalAllocated - item.quantity !== 1 ? 's' : ''}`
                                                : `Please allocate ${remainingQuantity} more unit${remainingQuantity !== 1 ? 's' : ''}`}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleAssignBatch}
                                    disabled={!isValidAllocation}
                                    size="sm"
                                    className={cn('text-sm font-medium sm:ml-auto whitespace-nowrap', 'transition-all duration-200', isValidAllocation && 'hover:scale-[1.02]')}
                                    aria-label="Assign batch allocations"
                                >
                                    {isValidAllocation && <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true"/>}
                                    Assign Batches
                                </Button>
                            </div>
                        </div>
                    )}
                </section>
            )}

            <footer className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs md:text-sm text-gray-600 font-semibold uppercase tracking-wide">Subtotal</span>
                <span
                    className="text-base md:text-lg lg:text-xl font-bold text-blue-600">{FormatCurrency(item.subtotal)}</span>
            </footer>

            {item.order_item_assigned_to && (
                <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-xs text-gray-600 truncate"
                         title={item.order_item_assigned_to.vendor_store_name}>
                        <span className="font-semibold flex-shrink-0">Assigned to:</span>
                        <span className="truncate font-medium">{item.order_item_assigned_to.vendor_store_name}</span>
                    </div>
                </div>
            )}
        </article>
    )
})

export default VendorOrderedItemCard
