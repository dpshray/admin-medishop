'use client'

import React, { memo, useCallback, useMemo, useState } from 'react'
import { Box, FileText, Package, ShoppingBag, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DocumentSection } from '@/components/vendor/page'
import { FormatCurrency } from "@/lib/helper"
import BatchAllocationEditor from "@/components/vendor/vendor-details/batch-allocation"

export interface AssignedBatchNumber {
    batch_number: number
    quantity: number
    variant_id: number
}

export interface BatchNumber {
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
    assigned_batch_numbers: AssignedBatchNumber[] | null
    batch_numbers: BatchNumber[]
}

export interface OrderItem {
    type: "product" | "package" | "kitbag"
    prescription_required: boolean
    prescription_image: string | null
    item_products: ItemProduct[]
    order_item_id: number
    quantity: number
    price: number
    subtotal: number
}

interface VendorOrderedItemCardProps {
    item: OrderItem
    showAnimation?: boolean
    className?: string
    disabled?: boolean
    ariaLabel?: string
    onDeleteAction?: (item: OrderItem) => void
    orderUuid: string
    onSuccessAction?: () => void
}

const ProductItem = memo<{
    product: ItemProduct
    index: number
    isCollection: boolean
    onBatchClick: (product: ItemProduct) => void
    getTotalAssigned: (batches?: AssignedBatchNumber[]) => number
}>(({ product, index, isCollection, onBatchClick, getTotalAssigned }) => {
    const totalAssigned = getTotalAssigned(product.assigned_batch_numbers || undefined)
    const hasAssignedBatches = product.assigned_batch_numbers && product.assigned_batch_numbers.length > 0
    const hasBatchNumbers = product.batch_numbers && product.batch_numbers.length > 0

    return (
        <div className="border rounded-lg p-3 sm:p-4 bg-white hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-2 sm:gap-3">
                {isCollection && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0">
                        {index + 1}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm sm:text-base text-foreground break-words">
                                {product.product_name}
                            </h5>
                            {product.variant_name && (
                                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 break-words">
                                    {product.variant_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm mb-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Required:</span>
                            <Badge variant="outline" className="font-semibold text-xs">
                                {product.required_quantity}
                            </Badge>
                        </div>
                        {hasAssignedBatches && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Assigned:</span>
                                <Badge
                                    variant="outline"
                                    className="font-semibold bg-green-50 text-green-700 border-green-200 text-xs"
                                >
                                    {totalAssigned}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {hasAssignedBatches && (
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                Assigned Batches
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {product.assigned_batch_numbers!.map((batch, batchIndex) => (
                                    <Badge key={batchIndex} variant="secondary" className="text-xs">
                                        {batch.batch_number}
                                        <span className="text-xs font-semibold text-muted-foreground ml-1">
                      ({batch.quantity})
                    </span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasBatchNumbers && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                Available Batches
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {product.batch_numbers.map((batch, batchIndex) => (
                                    <Badge
                                        key={batchIndex}
                                        variant="outline"
                                        className="font-mono text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 cursor-pointer transition-colors"
                                        onClick={() => onBatchClick(product)}
                                    >
                                        {batch.batch_number}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
})

ProductItem.displayName = 'ProductItem'

const VendorOrderedItemCard = memo<VendorOrderedItemCardProps>(function VendorOrderedItemCard({
                                                                                                  item,
                                                                                                  showAnimation = true,
                                                                                                  className = '',
                                                                                                  disabled = false,
                                                                                                  ariaLabel,
                                                                                                  onDeleteAction,
                                                                                                  orderUuid,
                                                                                                  onSuccessAction,
                                                                                              }) {
    const [selectedProduct, setSelectedProduct] = useState<ItemProduct | null>(null)

    const getTypeIcon = useMemo(() => {
        switch (item.type) {
            case 'package':
                return <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            case 'kitbag':
                return <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            case 'product':
                return <Box className="w-4 h-4 sm:w-5 sm:h-5" />
            default:
                return <Box className="w-4 h-4 sm:w-5 sm:h-5" />
        }
    }, [item.type])

    const getTypeBadgeColor = useMemo(() => {
        switch (item.type) {
            case 'package':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'kitbag':
                return 'bg-purple-50 text-purple-700 border-purple-200'
            case 'product':
                return 'bg-green-50 text-green-700 border-green-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }, [item.type])

    const getTypeBackground = useMemo(() => {
        switch (item.type) {
            case 'package':
                return 'bg-blue-50/50 border-blue-100'
            case 'kitbag':
                return 'bg-purple-50/50 border-purple-100'
            case 'product':
                return 'bg-green-50/50 border-green-100'
            default:
                return 'bg-gray-50/50 border-gray-100'
        }
    }, [item.type])

    const getTotalAssignedQuantity = useCallback((assignedBatches?: AssignedBatchNumber[]) => {
        if (!assignedBatches) return 0
        return assignedBatches.reduce((sum, batch) => sum + batch.quantity, 0)
    }, [])

    const handleBatchAllocation = useCallback((product: ItemProduct) => {
        setSelectedProduct(product)
    }, [])

    const handleCloseEditor = useCallback(() => {
        setSelectedProduct(null)
    }, [])

    const handleSuccess = useCallback(() => {
        setSelectedProduct(null)
        onSuccessAction?.()
    }, [onSuccessAction])

    const isCollection = item.type === 'package' || item.type === 'kitbag'

    return (
        <>
            <article
                className={cn(
                    'border rounded-xl overflow-hidden transition-all duration-200 bg-white',
                    showAnimation && 'hover:shadow-md hover:border-gray-300',
                    disabled && 'opacity-60 pointer-events-none',
                    getTypeBackground,
                    className
                )}
                aria-label={ariaLabel || `Order item ${item.order_item_id}`}
            >
                <div className="p-3 sm:p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 sm:gap-4 flex-col sm:flex-row">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                            <div className={cn('p-2 sm:p-3 rounded-xl border-2', getTypeBadgeColor)}>
                                {getTypeIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={cn('capitalize border text-xs', getTypeBadgeColor)}>
                                        {item.type}
                                    </Badge>
                                    {item.prescription_required && (
                                        <Badge
                                            variant="outline"
                                            className="text-orange-600 border-orange-300 bg-orange-50 text-xs"
                                        >
                                            <FileText className="w-3 h-3 mr-1" aria-hidden="true" />
                                            Prescription
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                        <span className="text-muted-foreground">Order Item:</span>
                                        <span className="font-semibold text-foreground">#{item.order_item_id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                        <span className="text-muted-foreground">Quantity:</span>
                                        <span className="font-semibold text-foreground">{item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto">
                            <div className="text-left sm:text-right">
                                <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                                <p className="text-xl sm:text-2xl font-bold text-foreground">
                                    {FormatCurrency(item.subtotal)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {FormatCurrency(item.price)} × {item.quantity}
                                </p>
                            </div>
                            {onDeleteAction && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                                    onClick={() => onDeleteAction(item)}
                                    aria-label={`Remove order item ${item.order_item_id}`}
                                >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" aria-hidden="true" />
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-3 sm:p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            {isCollection ? `Products in ${item.type}` : 'Product Details'}
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {item.item_products.length}
                            </Badge>
                        </h4>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        {item.item_products.map((product, productIndex) => (
                            <ProductItem
                                key={productIndex}
                                product={product}
                                index={productIndex}
                                isCollection={isCollection}
                                onBatchClick={handleBatchAllocation}
                                getTotalAssigned={getTotalAssignedQuantity}
                            />
                        ))}
                    </div>

                    {item.prescription_image && (
                        <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t">
                            <DocumentSection
                                title="Prescription"
                                documents={[item.prescription_image]}
                                icon={FileText}
                            />
                        </div>
                    )}
                </div>
            </article>

            {selectedProduct && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
                    onClick={handleCloseEditor}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="batch-allocation-title"
                >
                    <div
                        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                                <h3 id="batch-allocation-title" className="text-base sm:text-lg font-bold text-white">
                                    Assign Batch Numbers
                                </h3>
                                <p className="text-xs sm:text-sm text-blue-100 mt-0.5 truncate">
                                    {selectedProduct.product_name}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCloseEditor}
                                className="text-white hover:bg-white/20 rounded-full shrink-0"
                                aria-label="Close batch allocation dialog"
                            >
                                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </div>
                        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            <BatchAllocationEditor
                                batchAllocations={selectedProduct.batch_numbers.map(batch => ({
                                    batchNumberId: batch.batch_number_id,
                                    batchNumber: batch.batch_number,
                                    quantity: selectedProduct.assigned_batch_numbers?.find(
                                        ab => ab.batch_number.toString() === batch.batch_number
                                    )?.quantity || 0
                                }))}
                                itemQuantity={selectedProduct.required_quantity}
                                OIP_ID={selectedProduct.OIP_ID}
                                onSuccess={handleSuccess}
                                orderUuid={orderUuid}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
})

export default VendorOrderedItemCard