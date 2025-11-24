import React, {memo, useCallback, useMemo} from 'react'
import {Badge} from '@/components/ui/badge'
import TextInputField from '@/components/field/text-input'
import {Button} from '@/components/ui/button'
import {AlertCircle, CheckCircle2, Package, X} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Controller, useForm} from 'react-hook-form'
import batchService from "@/service/order/batch.service";

interface BatchAllocation {
    batchNumberId: number
    batchNumber: string
    quantity: number
}

interface BatchAllocationEditorProps {
    batchAllocations: BatchAllocation[]
    itemQuantity: number
    OIP_ID: number
    onSuccess?: () => void
}

interface BatchFormValues {
    batchNumbers: { batchNumberId: number; quantity: number }[]
}

const BatchAllocationEditor = memo<BatchAllocationEditorProps>(function BatchAllocationEditor({
                                                                                                  batchAllocations,
                                                                                                  itemQuantity,
                                                                                                  OIP_ID,
                                                                                                  onSuccess
                                                                                              }) {
    const allocationStats = useMemo(() => {
        const totalAllocated = batchAllocations.reduce((sum, batch) => sum + (batch.quantity || 0), 0)
        const remaining = itemQuantity - totalAllocated
        const hasOverAllocation = totalAllocated > itemQuantity
        const isComplete = totalAllocated === itemQuantity
        return {totalAllocated, remaining, hasOverAllocation, isComplete}
    }, [batchAllocations, itemQuantity])

    const getBatchStatus = useCallback(
        (batchQuantity: number) => {
            if (batchQuantity === 0) return 'empty'
            if (batchQuantity > itemQuantity) return 'invalid'
            return 'valid'
        },
        [itemQuantity]
    )

    const {control, handleSubmit} = useForm<BatchFormValues>({
        defaultValues: {
            batchNumbers: batchAllocations.map(b => ({batchNumberId: b.batchNumberId, quantity: b.quantity}))
        }
    })

    const onSubmit = async (data: BatchFormValues) => {
        const payload = [
            {
                OIP_ID: Number(OIP_ID),
                batch_numbers: data.batchNumbers
                    .filter(b => b.quantity > 0)
                    .map(b => ({batch_number_id: Number(b.batchNumberId), quantity: Number(b.quantity)}))
            }
        ]
        console.log('Payload:', payload)
        try {
            const response = await batchService.assignBatchToOrderItems(payload)
            console.log('Batch assigned', response.data)
            onSuccess?.()
        } catch (error: any) {
            console.error('Failed to assign batch', error.response?.data || error.message)
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-600"/>
                    <span className="text-sm font-semibold text-gray-700">Total Required:</span>
                    <Badge variant="outline" className="font-bold">
                        {itemQuantity}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    {allocationStats.isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600"/>
                    ) : allocationStats.hasOverAllocation ? (
                        <AlertCircle className="h-4 w-4 text-red-600"/>
                    ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600"/>
                    )}
                    <Badge
                        className={cn(
                            'font-semibold',
                            allocationStats.isComplete
                                ? 'bg-green-100 text-green-700 border-green-300'
                                : allocationStats.hasOverAllocation
                                    ? 'bg-red-100 text-red-700 border-red-300'
                                    : 'bg-amber-100 text-amber-700 border-amber-300'
                        )}
                    >
                        {allocationStats.hasOverAllocation ? 'Over: ' : 'Allocated: '}
                        {allocationStats.totalAllocated}
                    </Badge>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}
                  className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {batchAllocations.map((batch, index) => {
                    const status = getBatchStatus(batch.quantity)
                    const labelId = `batch-label-${OIP_ID}-${index}`

                    return (
                        <Controller
                            key={`${batch.batchNumberId}-${index}`}
                            name={`batchNumbers.${index}.quantity`}
                            control={control}
                            render={({field}) => (
                                <div
                                    className={cn(
                                        'flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 bg-gradient-to-br from-white to-gray-50',
                                        status === 'valid' && batch.quantity > 0 && 'border-green-300 bg-green-50/30',
                                        status === 'invalid' && 'border-red-300 bg-red-50/30',
                                        status === 'empty' && 'border-gray-200'
                                    )}
                                >
                                    <div
                                        className="flex-1 w-full space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 items-center">
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="text-xs font-semibold text-gray-600 flex-shrink-0"
                                                  id={labelId}>
                                                Batch:
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 truncate max-w-[180px]"
                                            >
                                                {batch.batchNumber || '—'}
                                            </Badge>
                                        </div>

                                        <TextInputField
                                            type="number"
                                            placeholder="0"
                                            min={0}
                                            max={itemQuantity}
                                            {...field}
                                            className={cn(
                                                'text-sm font-semibold w-full',
                                                status === 'valid' && batch.quantity > 0 && 'border-green-300 focus:border-green-400',
                                                status === 'invalid' && 'border-red-300 focus:border-red-400'
                                            )}
                                            aria-labelledby={labelId}
                                            aria-invalid={status === 'invalid'}
                                        />

                                        {status === 'invalid' && (
                                            <p className="text-xs text-red-500 mt-1">
                                                Batch quantity exceeds the required quantity ({itemQuantity})
                                            </p>
                                        )}
                                        {status === 'empty' && (
                                            <p className="text-xs text-gray-500 mt-1">No batches available for this
                                                product</p>
                                        )}
                                    </div>

                                    {batchAllocations.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={() => {
                                                field.onChange(0)
                                            }}
                                            className="h-9 w-9 sm:h-10 sm:w-10 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0 self-end sm:self-center"
                                            aria-label={`Clear batch ${batch.batchNumber}`}
                                        >
                                            <X className="h-4 w-4 sm:h-5 sm:w-5"/>
                                        </Button>
                                    )}
                                </div>
                            )}
                        />
                    )
                })}

                <Button type="submit" className="w-full mt-3">
                    Assign Batches
                </Button>
            </form>
        </div>
    )
})

export default BatchAllocationEditor
