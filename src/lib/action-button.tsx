'use client'
import {useCallback, useState} from "react";
import {cn} from "@/lib/utils";
import {Edit, Eye, EyeOff, LucideIcon, Trash2} from "lucide-react";
import {Row} from "@tanstack/react-table";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";

interface RowActionsProps<TData> {
    row: Row<TData>
    onEditAction?: (row: Row<TData>) => void
    onDeleteAction?: (row: Row<TData>) => void
    onViewAction?: (row: Row<TData>) => void
    className?: string
}

const RowActions = <TData, >({
                                 row,
                                 onEditAction,
                                 onDeleteAction,
                                 onViewAction,
                                 className,
                             }: RowActionsProps<TData>) => {
    const handleEdit = useCallback(() => onEditAction?.(row), [onEditAction, row])
    const handleDelete = useCallback(() => onDeleteAction?.(row), [onDeleteAction, row])
    const handleView = useCallback(() => onViewAction?.(row), [onViewAction, row])

    return (
        <div className={cn("flex items-center justify-end gap-1", className)}>
            {onEditAction && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                    onClick={handleEdit}
                    aria-label="Edit"
                >
                    <Edit size={16} aria-hidden="true"/>
                </Button>
            )}
            {onViewAction && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-950 dark:hover:text-gray-400"
                    onClick={handleView}
                    aria-label="View"
                >
                    <Eye size={16} aria-hidden="true"/>
                </Button>
            )}
            {onDeleteAction && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    onClick={handleDelete}
                    aria-label="Delete"
                >
                    <Trash2 size={16} aria-hidden="true"/>
                </Button>
            )}
        </div>
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
                                                               disabled = false,
                                                           }: GlobalStatusToggleProps<T>) => {
    const [isUpdating, setIsUpdating] = useState(false)

    const handleToggle = useCallback(
        async (checked: boolean) => {
            if (isUpdating) return
            setIsUpdating(true)
            try {
                await onToggleAction(item, checked)
            } catch (error) {
                console.error("Status toggle failed:", error)
            } finally {
                setIsUpdating(false)
            }
        },
        [item, onToggleAction, isUpdating]
    )

    const id = String(item[idKey])
    const isActive = Boolean(item[statusKey])
    const isDisabled = disabled || isUpdating
    const CurrentIcon = isActive ? ActiveIcon : InactiveIcon
    const label = isActive ? activeLabel : inactiveLabel

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Switch
                id={`status-${id}`}
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isDisabled}
                aria-label={`Toggle ${label.toLowerCase()}`}
                className={cn(
                    "cursor-pointer",
                    isDisabled && "cursor-not-allowed",
                    isActive
                        ? "data-[state=checked]:bg-green-500 data-[state=checked]:text-green-700"
                        : "data-[state=checked]:bg-red-500 data-[state=checked]:text-red-700"
                )}
            />
            <Label htmlFor={`status-${id}`} className="sr-only">
                Toggle status
            </Label>
            {showBadge && (
                <Badge
                    variant="outline"
                    className={cn(
                        "text-xs font-medium transition-colors flex items-center gap-1",
                        isActive
                            ? "border-green-500 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400"
                            : "border-red-500 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400"
                    )}
                >
                    <CurrentIcon className="h-3 w-3" aria-hidden="true"/>
                    {label}
                </Badge>
            )}
        </div>
    )
}

GlobalStatusToggle.displayName = "GlobalStatusToggle"
RowActions.displayName = "RowActions"


export {GlobalStatusToggle, RowActions}
