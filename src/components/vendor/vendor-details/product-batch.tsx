import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import BatchAllocationEditor from '@/components/vendor/vendor-details/batch-allocation'

export interface BatchAllocation {
    batchNumberId: number
    batchNumber: string
    quantity: number
}

interface AssignedBatchNumber {
    batch_number_id: number
    batch_number: string
    quantity: number
}

interface BatchNumberList {
    batch_number_id: number
    quantity: number
    batch_number: string
}

interface ItemProduct {
    OIP_ID: number
    variant_id: number
    product_name: string
    variant_name: string
    required_quantity: number
    assigned_batch_numbers: AssignedBatchNumber[]
    batch_numbers_list: BatchNumberList[]
}

interface ProductBatchSectionProps {
    product: ItemProduct
    itemQuantity: number
    OIP_ID: number
    assignBatchNumberAction?: (OIP_ID: number, allocations: BatchAllocation[]) => void
}

const ProductBatchSection = memo<ProductBatchSectionProps>(function ProductBatchSection({
                                                                                            product,
                                                                                            itemQuantity,
                                                                                            OIP_ID,
                                                                                            assignBatchNumberAction
                                                                                        }) {
    const [batchExpanded, setBatchExpanded] = useState(false)
    const [batchAllocations, setBatchAllocations] = useState<BatchAllocation[]>([])

    const batchNumbers = useMemo(() => {
        return product.batch_numbers_list?.map((b) => b.batch_number).filter(Boolean) || []
    }, [product.batch_numbers_list])

    const batchNumbersWithIds = useMemo(() => {
        return product.batch_numbers_list?.filter(b => b.batch_number) || []
    }, [product.batch_numbers_list])

    const hasAssignedBatches = useMemo(() => {
        return product.assigned_batch_numbers && product.assigned_batch_numbers.length > 0
    }, [product.assigned_batch_numbers])

    const allocationStats = useMemo(() => {
        const totalAllocated = batchAllocations.reduce((sum, batch) => sum + (batch.quantity || 0), 0)
        const requiredQuantity = product.required_quantity * itemQuantity
        const remainingQuantity = requiredQuantity - totalAllocated
        const hasOverAllocation = totalAllocated > requiredQuantity
        const isValidAllocation = totalAllocated === requiredQuantity && batchAllocations.every((b) => b.quantity > 0)

        return {
            totalAllocated,
            remainingQuantity,
            hasOverAllocation,
            isValidAllocation,
            requiredQuantity
        }
    }, [batchAllocations, itemQuantity, product.required_quantity])

    useEffect(() => {
        if (batchNumbersWithIds.length === 1 && assignBatchNumberAction && !hasAssignedBatches) {
            const firstBatch = batchNumbersWithIds[0]
            const requiredQuantity = product.required_quantity * itemQuantity
            const allocation: BatchAllocation = {
                batchNumberId: firstBatch.batch_number_id,
                batchNumber: firstBatch.batch_number,
                quantity: requiredQuantity
            }
            assignBatchNumberAction(OIP_ID, [allocation])
        }
    }, [batchNumbersWithIds, itemQuantity, product.required_quantity, assignBatchNumberAction, OIP_ID, hasAssignedBatches])

    const toggleBatch = useCallback(() => {
        if (!batchExpanded && batchNumbersWithIds.length > 0) {
            if (hasAssignedBatches) {
                setBatchAllocations(
                    product.assigned_batch_numbers.map((batch) => ({
                        batchNumberId: batch.batch_number_id,
                        batchNumber: batch.batch_number,
                        quantity: batch.quantity
                    }))
                )
            } else {
                setBatchAllocations(
                    batchNumbersWithIds.map((batch) => ({
                        batchNumberId: batch.batch_number_id,
                        batchNumber: batch.batch_number,
                        quantity: 0
                    }))
                )
            }
        }
        setBatchExpanded((prev) => !prev)
    }, [batchExpanded, batchNumbersWithIds, hasAssignedBatches, product.assigned_batch_numbers])

    const handleQuantityChange = useCallback((index: number, value: string) => {
        const numValue = parseInt(value, 10)
        if (isNaN(numValue) || numValue < 0) return

        setBatchAllocations((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], quantity: numValue }
            return updated
        })
    }, [])

    const handleRemoveBatch = useCallback((index: number) => {
        setBatchAllocations((prev) => prev.filter((_, i) => i !== index))
    }, [])

    const handleAssignBatch = useCallback(() => {
        if (!assignBatchNumberAction || !allocationStats.isValidAllocation) return

        const allocations: BatchAllocation[] = batchAllocations
            .filter((b) => b.quantity > 0)
            .map((b) => ({
                batchNumberId: b.batchNumberId,
                batchNumber: b.batchNumber,
                quantity: b.quantity
            }))

        assignBatchNumberAction(OIP_ID, allocations)
        setBatchExpanded(false)
    }, [assignBatchNumberAction, allocationStats.isValidAllocation, batchAllocations, OIP_ID])

    if (batchNumbers.length === 0) return null

    if (batchNumbers.length === 1) {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span className="font-medium">
                    Auto-assigned: <Badge variant="outline" className="ml-1">{batchNumbers[0]}</Badge>
                </span>
            </div>
        )
    }

    return (
        <div className="mt-3">
            {!hasAssignedBatches ? (
                <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        Assign Batches:
                    </span>
                    {batchNumbers.map((num, index) => (
                        <Badge
                            key={`batch-${product.OIP_ID}-${index}`}
                            variant="secondary"
                            onClick={toggleBatch}
                            className={cn(
                                'text-xs font-medium px-3 py-1 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-colors',
                                batchExpanded && 'bg-blue-100 border-blue-300'
                            )}
                        >
                            {num}
                        </Badge>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <span className="font-semibold">Assigned Batches:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {product.assigned_batch_numbers.map((batch, index) => (
                            <Badge
                                key={`assigned-${batch.batch_number_id}-${index}`}
                                variant="default"
                                className="bg-green-100 text-green-700 border-green-300 text-xs font-medium px-3 py-1"
                            >
                                {batch.batch_number} ({batch.quantity}×)
                            </Badge>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleBatch}
                        className="text-xs mt-2"
                    >
                        Edit Allocation
                    </Button>
                </div>
            )}

            {batchExpanded && (
                <div className="mt-3 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-gray-800">Batch Allocation</h5>
                            {allocationStats.isValidAllocation && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {allocationStats.hasOverAllocation && <AlertCircle className="h-4 w-4 text-red-600" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-semibold">
                                Required: {allocationStats.requiredQuantity}
                            </Badge>
                            <Badge
                                className={cn(
                                    'text-xs font-semibold',
                                    allocationStats.remainingQuantity === 0
                                        ? 'bg-green-100 text-green-700 border-green-300'
                                        : allocationStats.hasOverAllocation
                                            ? 'bg-red-100 text-red-700 border-red-300'
                                            : 'bg-amber-100 text-amber-700 border-amber-300'
                                )}
                            >
                                {allocationStats.hasOverAllocation ? 'Over: ' : 'Remaining: '}
                                {Math.abs(allocationStats.remainingQuantity)}
                            </Badge>
                        </div>
                    </div>

                    <BatchAllocationEditor
                        batchAllocations={batchAllocations}
                        itemQuantity={allocationStats.requiredQuantity}
                        onChangeAction={handleQuantityChange}
                        onRemoveAction={handleRemoveBatch}
                        OIP_ID={OIP_ID}
                    />

                    <div className="flex gap-2">
                        <Button
                            onClick={handleAssignBatch}
                            disabled={!allocationStats.isValidAllocation}
                            size="sm"
                            className="flex-1 text-sm font-semibold"
                        >
                            {allocationStats.isValidAllocation && <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Assign Batches
                        </Button>
                        <Button
                            onClick={() => setBatchExpanded(false)}
                            variant="outline"
                            size="sm"
                            className="text-sm font-medium"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
})

export default ProductBatchSection