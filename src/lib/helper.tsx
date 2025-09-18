'use client'
import type {Row} from "@tanstack/react-table"
import {Button} from "@/components/ui/button"
import {Edit, Eye, Trash2} from "lucide-react"
import {cn} from "@/lib/utils"

interface RowActionsProps<TData> {
    row: Row<TData>
    onEditAction?: (row: Row<TData>) => void
    onDeleteAction?: (row: Row<TData>) => void
    onViewAction?: (row: Row<TData>) => void
}

export function RowActions<TData>({
                                      row,
                                      onEditAction,
                                      onDeleteAction,
                                      onViewAction,
                                  }: RowActionsProps<TData>) {
    const commonClassName = "h-7 w-7 sm:h-8 sm:w-8 transition-colors duration-300 cursor-pointer"

    return (
        <div className={cn("flex items-center gap-1")}>
            {onEditAction && (
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(commonClassName, "hover:bg-blue-600 hover:text-white")}
                    onClick={() => onEditAction(row)}
                >
                    <Edit size={16}/>
                </Button>
            )}
            {onDeleteAction && (
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(commonClassName, "hover:bg-red-600 hover:text-white")}
                    onClick={() => onDeleteAction(row)}
                >
                    <Trash2 size={16}/>
                </Button>
            )}
            {onViewAction && (
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(commonClassName, "hover:bg-green-600 hover:text-white")}
                    onClick={() => onViewAction(row)}
                >
                    <Eye size={16}/>
                </Button>
            )}
        </div>
    )
}


export function NoDataFound() {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first product.</p>
        </div>
    )
}