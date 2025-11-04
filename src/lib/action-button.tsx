'use client'

import {useCallback, useState} from "react"
import {cn} from "@/lib/utils"
import {Edit, Eye, EyeOff, Loader2, LucideIcon, Trash2} from "lucide-react"
import {Row} from "@tanstack/react-table"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"

interface RowActionsProps<TData> {
    row: Row<TData>
    onEditAction?: (row: Row<TData>) => void
    onDeleteAction?: (row: Row<TData>) => void
    onViewAction?: (row: Row<TData>) => void
    className?: string
    editLabel?: string
    deleteLabel?: string
    viewLabel?: string
}

const RowActions = <TData,>({
                                row,
                                onEditAction,
                                onDeleteAction,
                                onViewAction,
                                className,
                                editLabel = "Edit",
                                deleteLabel = "Delete",
                                viewLabel = "View",
                            }: RowActionsProps<TData>) => {
    const handleEdit = useCallback(() => onEditAction?.(row), [onEditAction, row])
    const handleDelete = useCallback(() => onDeleteAction?.(row), [onDeleteAction, row])
    const handleView = useCallback(() => onViewAction?.(row), [onViewAction, row])

    return (
        <TooltipProvider delayDuration={200}>
            <div className={cn("flex items-center justify-end gap-1.5", className)}>
                {onViewAction && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                onClick={handleView}
                                aria-label={viewLabel}
                            >
                                <Eye className="h-4 w-4" aria-hidden="true"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5} className="border-slate-700 bg-slate-900 text-white">
                            <p className="text-xs font-medium">{viewLabel}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
                {onEditAction && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg bg-transparent transition-all duration-200 hover:scale-105 hover:text-white active:scale-95"
                                style={{backgroundColor: "transparent"}}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#4a358e"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent"
                                }}
                                onClick={handleEdit}
                                aria-label={editLabel}
                            >
                                <Edit className="h-4 w-4" aria-hidden="true"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5} className="border-[#4a358e] bg-[#4a358e] text-white ">
                            <p className="text-xs font-medium">{editLabel}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
                {onDeleteAction && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:text-red-600 active:scale-95 dark:hover:bg-red-950 dark:hover:text-red-400"
                                onClick={handleDelete}
                                aria-label={deleteLabel}
                            >
                                <Trash2 className="h-4 w-4" aria-hidden="true"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5} className="border-red-600 bg-red-600 text-white [&_svg]:bg-red-400 [&_svg]:fill-red-400">
                            <p className="text-xs font-medium">{deleteLabel}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    )
}

interface GlobalStatusToggleProps<T> {
    item: T
    idKey: keyof T
    statusKey: keyof T
    onToggleAction: (item: T, newStatus: boolean) => Promise<void>
    activeLabel?: string
    inactiveLabel?: string
    activeIcon?: LucideIcon
    inactiveIcon?: LucideIcon
    className?: string
    showBadge?: boolean
    showIcon?: boolean
    disabled?: boolean
}

const GlobalStatusToggle = <T extends Record<string, any>>({
                                                               item,
                                                               idKey,
                                                               statusKey,
                                                               onToggleAction,
                                                               activeLabel = "Active",
                                                               inactiveLabel = "Inactive",
                                                               activeIcon: ActiveIcon = Eye,
                                                               inactiveIcon: InactiveIcon = EyeOff,
                                                               className,
                                                               showBadge = true,
                                                               showIcon = true,
                                                               disabled = false,
                                                           }: GlobalStatusToggleProps<T>) => {
    const [isUpdating, setIsUpdating] = useState(false)

    const handleToggle = useCallback(
        async (checked: boolean) => {
            if (isUpdating || disabled) return
            setIsUpdating(true)
            try {
                await onToggleAction(item, checked)
            } catch (error) {
                console.error("Status toggle failed:", error)
            } finally {
                setIsUpdating(false)
            }
        },
        [item, onToggleAction, isUpdating, disabled]
    )

    const id = String(item[idKey])
    const isActive = Boolean(item[statusKey])
    const isDisabled = disabled || isUpdating
    const CurrentIcon = isActive ? ActiveIcon : InactiveIcon
    const label = isActive ? activeLabel : inactiveLabel

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="relative flex items-center">
                <Switch
                    id={`status-${id}`}
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    disabled={isDisabled}
                    aria-label={`Toggle ${label.toLowerCase()}`}
                    className={cn(
                        "transition-all duration-200",
                        isDisabled && "cursor-not-allowed opacity-50",
                        isActive
                            ? "data-[state=checked]:bg-emerald-500 hover:data-[state=checked]:bg-emerald-600"
                            : "data-[state=unchecked]:bg-slate-300 hover:data-[state=unchecked]:bg-slate-400 dark:data-[state=unchecked]:bg-slate-700"
                    )}
                />
                {isUpdating && (
                    <Loader2 className="absolute -right-7 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" aria-hidden="true"/>
                )}
            </div>
            <Label htmlFor={`status-${id}`} className="sr-only">
                Toggle status
            </Label>
            {showBadge && (
                <Badge
                    variant="outline"
                    className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-200",
                        isActive
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                            : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
                    )}
                >
                    {showIcon && <CurrentIcon className="h-3.5 w-3.5" aria-hidden="true"/>}
                    <span className="tracking-wide">{label}</span>
                </Badge>
            )}
        </div>
    )
}

GlobalStatusToggle.displayName = "GlobalStatusToggle"
RowActions.displayName = "RowActions"

export {GlobalStatusToggle, RowActions}