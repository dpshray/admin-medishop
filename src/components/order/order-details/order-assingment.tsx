'use client'
import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UserCog, Store } from 'lucide-react'
import { FormatCurrency } from '@/lib/helper'

export interface VendorAssignedItem {
    item_name: string
    item_price: number
    quantity: number
    sub_total: number
}

export interface VendorAssignment {
    items: VendorAssignedItem[]
    vendor_name: string
    vendor_store_name: string
    assignmentType?: 'admin' | 'vendor'
}

interface AssignmentSummaryProps {
    assignmentsByVendor: Map<string, VendorAssignment>
    onClear: () => void
}

const AssignmentSummary = memo<AssignmentSummaryProps>(
    ({ assignmentsByVendor, onClear }) => (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Assignment Summary</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClear}
                    className="text-xs"
                    aria-label="Clear all assignments"
                >
                    Clear All
                </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from(assignmentsByVendor.entries()).map(
                    ([vendorId, { vendor_name, vendor_store_name, items, assignmentType }]) => {
                        const isAdmin = assignmentType === 'admin'
                        const bgColor = isAdmin ? 'from-blue-50 to-indigo-50' : 'from-green-50 to-emerald-50'
                        const borderColor = isAdmin ? 'border-blue-200' : 'border-green-200'
                        const textColor = isAdmin ? 'text-blue-900' : 'text-green-900'
                        const lightTextColor = isAdmin ? 'text-blue-700' : 'text-green-700'

                        return (
                            <div
                                key={vendorId}
                                className={cn('bg-gradient-to-br p-4 rounded-xl border', bgColor, borderColor)}
                            >
                                <div className="mb-3 flex items-start gap-2">
                                    {isAdmin ? (
                                        <UserCog className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <Store className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn('font-bold text-sm mb-1', textColor)}>{vendor_name}</h3>
                                        <p className={cn('text-xs font-medium', lightTextColor)}>{vendor_store_name}</p>
                                        <p className={cn('text-xs font-medium', lightTextColor)}>ID: {vendorId}</p>
                                    </div>
                                </div>
                                <ul className="space-y-1.5 mb-3">
                                    {items.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className={cn('text-xs flex justify-between items-start', lightTextColor)}
                                        >
                                            <span className="flex-1">• {item.item_name}</span>
                                            <span className="font-semibold ml-2">
                                                {FormatCurrency(item.sub_total)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className={cn('pt-2 border-t', borderColor)}>
                                    <div className="flex justify-between items-center">
                                        <span className={cn('text-xs font-semibold', textColor)}>Total:</span>
                                        <span className={cn('text-sm font-bold', textColor)}>
                                            {FormatCurrency(items.reduce((sum, item) => sum + item.sub_total, 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                )}
            </div>
        </section>
    )
)

AssignmentSummary.displayName = 'AssignmentSummary'

export default AssignmentSummary