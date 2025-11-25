'use client'

import React, {memo, useCallback, useMemo, useState} from 'react'
import {Box, FileText, Package, ShoppingBag, Trash2, X} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Separator} from '@/components/ui/separator'
import {DocumentSection} from '@/components/vendor/page'
import {FormatCurrency} from "@/lib/helper"
import BatchAllocationEditor from "@/components/vendor/vendor-details/batch-allocation";


export interface AssignedBatchNumber {
    batch_number_id: number;
    quantity: number;
}

export interface BatchNumber {
    batch_number_id: number;
    quantity: number;
    batch_number: string;
}

export interface ItemProduct {
    OIP_ID: number;
    variant_id: number;
    product_name: string;
    variant_name: string;
    required_quantity: number;
    assigned_batch_numbers: AssignedBatchNumber[] | null;
    batch_numbers: BatchNumber[];
}

export interface OrderItem {
    type: "product" | "package" | "kitbag";
    prescription_required: boolean;
    prescription_image: string | null;
    item_products: ItemProduct[];
    order_item_id: number;
    quantity: number;
    price: number;
    subtotal: number;
}

interface VendorOrderedItemCardProps {
    item: OrderItem
    showAnimation?: boolean
    className?: string
    disabled?: boolean
    ariaLabel?: string
    onDeleteAction?: (item: OrderItem) => void
    orderUuid: string
}

const VendorOrderedItemCard = memo<VendorOrderedItemCardProps>(function VendorOrderedItemCard({
                                                                                                  item,
                                                                                                  showAnimation = true,
                                                                                                  className = '',
                                                                                                  disabled = false,
                                                                                                  ariaLabel,
                                                                                                  onDeleteAction,
                                                                                                  orderUuid,
                                                                                              }) {
    const [selectedProduct, setSelectedProduct] = useState<ItemProduct | null>(null)

    const getTypeIcon = useMemo(() => {
        switch (item.type) {
            case 'package':
                return <Package className="w-5 h-5"/>
            case 'kitbag':
                return <ShoppingBag className="w-5 h-5"/>
            case 'product':
                return <Box className="w-5 h-5"/>
            default:
                return <Box className="w-5 h-5"/>
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
        return (e: React.MouseEvent) => {
            e.stopPropagation()
            setSelectedProduct(product)
        }
    }, [])

    const handleCloseEditor = useCallback(() => {
        setSelectedProduct(null)
    }, [])

    const handleSuccess = useCallback(() => {
        setSelectedProduct(null)
    }, [])

    const isCollection = item.type === 'package' || item.type === 'kitbag'

    return (
        <>
            <div
                className={cn(
                    'border rounded-xl overflow-hidden transition-all duration-200 bg-white',
                    showAnimation && 'hover:shadow-md hover:border-gray-300',
                    disabled && 'opacity-60 pointer-events-none',
                    getTypeBackground,
                    className
                )}
                aria-label={ariaLabel}
            >
                <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className={cn('p-3 rounded-xl border-2', getTypeBadgeColor)}>
                                {getTypeIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={cn('capitalize border', getTypeBadgeColor)}>{item.type}</Badge>
                                    {item.prescription_required && (
                                        <Badge variant="outline"
                                               className="text-orange-600 border-orange-300 bg-orange-50">
                                            <FileText className="w-3 h-3 mr-1"/> Prescription
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Order Item:</span>
                                        <span className="font-semibold text-foreground">#{item.order_item_id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Quantity:</span>
                                        <span className="font-semibold text-foreground">{item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                                <p className="text-2xl font-bold text-foreground">{FormatCurrency(item.subtotal)}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {FormatCurrency(item.price)} × {item.quantity}
                                </p>
                            </div>
                            {onDeleteAction && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => onDeleteAction(item)}
                                >
                                    <Trash2 className="w-4 h-4 mr-1"/>
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Separator/>

                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            {isCollection ? `Products in ${item.type}` : 'Product Details'}
                            <Badge variant="secondary" className="ml-1">{item.item_products.length}</Badge>
                        </h4>
                    </div>

                    <div className="space-y-3">
                        {item.item_products.map((product, productIndex) => (
                            <div key={productIndex}
                                 className="border rounded-lg p-4 bg-white hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-start gap-3">
                                    {isCollection && (
                                        <div
                                            className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0">
                                            {productIndex + 1}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-base text-foreground">{product.product_name}</h5>
                                                {product.variant_name && (
                                                    <p className="text-sm text-muted-foreground mt-0.5">{product.variant_name}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-muted-foreground">Required:</span>
                                                <Badge variant="outline"
                                                       className="font-semibold">{product.required_quantity}</Badge>
                                            </div>
                                            {product.assigned_batch_numbers && product.assigned_batch_numbers.length > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-muted-foreground">Assigned:</span>
                                                    <Badge variant="outline"
                                                           className="font-semibold bg-green-50 text-green-700 border-green-200">
                                                        {getTotalAssignedQuantity(product.assigned_batch_numbers)}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        {product.assigned_batch_numbers && product.assigned_batch_numbers.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                                    Assigned Batches
                                                </p>
                                                <div className="space-y-1.5">
                                                    {product.assigned_batch_numbers.map((batch, batchIndex) => (
                                                        <div key={batchIndex}
                                                             className="flex items-center justify-between p-2.5 rounded-md bg-green-50/50 border border-green-200">
                                                            <Badge variant="outline"
                                                                   className="font-mono text-xs bg-white">
                                                                {batch.batch_number_id}
                                                            </Badge>
                                                            <span className="text-xs font-medium text-green-700">
                                                                Qty: {batch.quantity}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {product.batch_numbers && product.batch_numbers.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                                    Available Batches
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {product.batch_numbers.map((batch, batchIndex) => (
                                                        <Badge key={batchIndex} variant="outline"
                                                               className="font-mono text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 cursor-pointer transition-colors"
                                                               onClick={handleBatchAllocation(product)}>
                                                            {batch.batch_number}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {item.prescription_image && (
                        <div className="mt-5 pt-5 border-t">
                            <DocumentSection title="Prescription" documents={[item.prescription_image]}
                                             icon={FileText}/>
                        </div>
                    )}
                </div>
            </div>

            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                     onClick={handleCloseEditor}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                         onClick={(e) => e.stopPropagation()}>
                        <div
                            className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Assign Batch Numbers</h3>
                                <p className="text-sm text-blue-100 mt-0.5">{selectedProduct.product_name}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCloseEditor}
                                className="text-white hover:bg-white/20 rounded-full"
                            >
                                <X className="h-5 w-5"/>
                            </Button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            <BatchAllocationEditor
                                batchAllocations={selectedProduct.batch_numbers.map(batch => ({
                                    batchNumberId: batch.batch_number_id,
                                    batchNumber: batch.batch_number,
                                    quantity: selectedProduct.assigned_batch_numbers?.find(
                                        ab => ab.batch_number_id === batch.batch_number_id
                                    )?.quantity || 0
                                }))}
                                itemQuantity={selectedProduct.required_quantity}
                                OIP_ID={selectedProduct.OIP_ID}
                                onSuccess={handleSuccess} orderUuid={orderUuid}/>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
})

export default VendorOrderedItemCard