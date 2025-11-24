'use client'

import React, { memo, useMemo, useCallback, useState } from 'react'
import { FormatCurrency, StatusBadge } from '@/lib/helper'
import { FileText, Package, Trash2, ShoppingBag, Box, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocumentSection } from '@/components/vendor/page'
import { Button } from '@/components/ui/button'
import { DetailItem } from '@/components/order/OrderedItemCard'
import { Badge } from '@/components/ui/badge'
import BatchAllocationEditor from "@/components/vendor/vendor-details/batch-allocation";

export interface AssignedBatchNumber {
    batch_number_id: number
    batch_number: string
    quantity: number
}

export interface BatchNumberList {
    batch_number_id: number
    quantity: number
    batch_number: string
}

export interface ItemProduct {
    OIP_ID: number
    variant_id: number
    product_name: string
    variant_name: string
    required_quantity: number
    assigned_batch_numbers: AssignedBatchNumber[]
    batch_numbers_list: BatchNumberList[]
}

export interface OrderedItem {
    type: string
    prescription_required: boolean
    prescription_image: string | null
    item_products: ItemProduct[]
    order_item_id: number
    quantity: number
    price: number
    subtotal: number
}

interface VendorOrderedItemCardProps {
    item: OrderedItem
    showAnimation?: boolean
    className?: string
    disabled?: boolean
    ariaLabel?: string
    onDeleteAction?: (item: OrderedItem) => void
}

const VendorOrderedItemCard = memo<VendorOrderedItemCardProps>(function VendorOrderedItemCard({
                                                                                                  item,
                                                                                                  showAnimation = true,
                                                                                                  className = '',
                                                                                                  disabled = false,
                                                                                                  ariaLabel,
                                                                                                  onDeleteAction
                                                                                              }) {
    const [activeEditorOIP, setActiveEditorOIP] = useState<number | null>(null)
    const [batchAllocations, setBatchAllocations] = useState<Record<number, Array<{
        batchNumberId: number
        batchNumber: string
        quantity: number
    }>>>({})

    const isCollectionType = useMemo(() =>
            ['collection', 'combo', 'package', 'kitbag'].includes(item.type),
        [item.type]
    )

    const itemName = useMemo(() => {
        if (isCollectionType) {
            const typeNames: Record<string, string> = {
                collection: 'Collection Package',
                combo: 'Combo Package',
                package: 'Package Bundle',
                kitbag: 'Kit Bag'
            }
            return typeNames[item.type] || 'Bundle'
        }
        return item.item_products?.[0]?.product_name || 'Product'
    }, [item.item_products, item.type, isCollectionType])

    const variantText = useMemo(() => {
        if (isCollectionType) {
            const count = item.item_products?.length || 0
            return `${count} Product${count !== 1 ? 's' : ''} included`
        }
        return item.item_products?.[0]?.variant_name || null
    }, [item.item_products, isCollectionType])

    const productsWithBatches = useMemo(() => {
        if (!isCollectionType || !item.item_products) return []

        return item.item_products.map(product => ({
            ...product,
            first_batch_number: product.assigned_batch_numbers?.[0]?.batch_number ||
                product.batch_numbers_list?.[0]?.batch_number || null
        }))
    }, [item.item_products, isCollectionType])

    const productBatchNumbers = useMemo(() => {
        if (item.type !== 'product' || !item.item_products?.[0]) return []

        const product = item.item_products[0]
        return product.assigned_batch_numbers?.map(batch => ({
            batch_number: batch.batch_number,
            quantity: batch.quantity
        })) || []
    }, [item.item_products, item.type])

    const handleDeleteClick = useCallback(() => {
        if (onDeleteAction && !disabled) {
            onDeleteAction(item)
        }
    }, [onDeleteAction, disabled, item])

    const cardIcon = useMemo(() => {
        if (item.type === 'package') return Box
        if (item.type === 'kitbag') return ShoppingBag
        if (['collection', 'combo'].includes(item.type)) return ShoppingBag
        return Package
    }, [item.type])

    const handleBatchClick = useCallback((OIP_ID: number, batchList: BatchNumberList[]) => {
        if (activeEditorOIP === OIP_ID) {
            setActiveEditorOIP(null)
        } else {
            setActiveEditorOIP(OIP_ID)
            if (!batchAllocations[OIP_ID]) {
                setBatchAllocations(prev => ({
                    ...prev,
                    [OIP_ID]: batchList.map(batch => ({
                        batchNumberId: batch.batch_number_id,
                        batchNumber: batch.batch_number,
                        quantity: 0
                    }))
                }))
            }
        }
    }, [activeEditorOIP, batchAllocations])

    const handleAllocationChange = useCallback((OIP_ID: number, index: number, value: string) => {
        setBatchAllocations(prev => {
            const allocations = [...(prev[OIP_ID] || [])]
            allocations[index] = {
                ...allocations[index],
                quantity: parseInt(value) || 0
            }
            return {
                ...prev,
                [OIP_ID]: allocations
            }
        })
    }, [])

    const handleAllocationRemove = useCallback((OIP_ID: number, index: number) => {
        setBatchAllocations(prev => {
            const allocations = [...(prev[OIP_ID] || [])]
            allocations.splice(index, 1)
            return {
                ...prev,
                [OIP_ID]: allocations
            }
        })
    }, [])

    return (
        <article
            id={`order-item-${item.order_item_id}`}
            className={cn(
                'group relative bg-white rounded-lg sm:rounded-xl border overflow-hidden w-full',
                showAnimation && 'transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-0.5',
                'border-gray-200/80 shadow-sm',
                disabled && 'opacity-60 pointer-events-none',
                className
            )}
            aria-label={ariaLabel || `Order item: ${itemName}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none" />

            <div className="relative p-3 sm:p-4 md:p-5 lg:p-6">
                <header className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
                        {React.createElement(cardIcon, {
                            className: "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white"
                        })}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg leading-tight mb-1 sm:mb-1.5 break-words">
                            {itemName}
                        </h3>
                        {variantText && (
                            <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium flex items-center gap-2 break-words">
                                {variantText}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
                        <div className="scale-75 sm:scale-90 md:scale-100 origin-top-right">
                            <StatusBadge status={item.type} />
                        </div>
                        {onDeleteAction && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDeleteClick}
                                disabled={disabled}
                                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                            >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                        )}
                    </div>
                </header>

                <dl className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                    <DetailItem label="Quantity" value={`${item.quantity}×`} />
                    <DetailItem label="Unit Price" value={FormatCurrency(item.price)} />
                </dl>

                {item.prescription_required && item.prescription_image && (
                    <div className="mb-4 sm:mb-5">
                        <DocumentSection
                            title="Prescription Required"
                            documents={[item.prescription_image]}
                            icon={FileText}
                        />
                    </div>
                )}

                {isCollectionType && productsWithBatches.length > 0 ? (
                    <div className="mb-4 sm:mb-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                            <h4 className="text-xs sm:text-sm font-bold text-gray-700 px-2 sm:px-3 py-1 bg-gray-100 rounded-full whitespace-nowrap">
                                Products ({productsWithBatches.length})
                            </h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            {productsWithBatches.map(product => (
                                <div
                                    key={product.OIP_ID}
                                    className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1 break-words">
                                                    {product.product_name}
                                                </p>

                                                {product.variant_name && (
                                                    <p className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2 break-words">
                                                        {product.variant_name}
                                                    </p>
                                                )}

                                                {product.assigned_batch_numbers?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                                                        {product.assigned_batch_numbers.map((batch, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="bg-green-50 text-green-700 border-green-200 font-medium text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
                                                            >
                                                                {batch.batch_number} ({batch.quantity}×)
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {product.batch_numbers_list?.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] sm:text-xs font-semibold text-gray-600">
                                                        Available Batches
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleBatchClick(product.OIP_ID, product.batch_numbers_list)}
                                                        className="h-6 sm:h-7 text-[10px] sm:text-xs gap-1"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        {activeEditorOIP === product.OIP_ID ? 'Hide' : 'Assign'}
                                                    </Button>
                                                </div>

                                                {activeEditorOIP !== product.OIP_ID && (
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                        {product.batch_numbers_list.map((batch) => (
                                                            <Badge
                                                                key={batch.batch_number_id}
                                                                variant="outline"
                                                                className="bg-blue-50 text-blue-600 border-blue-200 font-medium text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 cursor-pointer hover:bg-blue-100"
                                                                onClick={() => handleBatchClick(product.OIP_ID, product.batch_numbers_list)}
                                                            >
                                                                {batch.batch_number} (Avail: {batch.quantity})
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                {activeEditorOIP === product.OIP_ID && batchAllocations[product.OIP_ID] && (
                                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                        <BatchAllocationEditor
                                                            batchAllocations={batchAllocations[product.OIP_ID]}
                                                            itemQuantity={product.required_quantity * item.quantity}
                                                            onChangeAction={(index, value) => handleAllocationChange(product.OIP_ID, index, value)}
                                                            onRemoveAction={(index) => handleAllocationRemove(product.OIP_ID, index)}
                                                            OIP_ID={product.OIP_ID}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    item.type === 'product' &&
                    productBatchNumbers.length > 0 && (
                        <section className="mb-4 sm:mb-5">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Batch Numbers</h4>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {productBatchNumbers.map((batch, index: number) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1"
                                    >
                                        {batch.batch_number} ({batch.quantity}×)
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    )
                )}

                <footer className="flex items-center justify-between pt-3 sm:pt-4 md:pt-5 border-t-2 border-gray-100">
                    <span className="text-xs sm:text-sm md:text-base text-gray-600 font-bold uppercase tracking-wide">
                        Subtotal
                    </span>
                    <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {FormatCurrency(item.subtotal)}
                    </span>
                </footer>
            </div>
        </article>
    )
})

export default VendorOrderedItemCard