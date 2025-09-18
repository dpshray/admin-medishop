"use client"

import type React from "react"
import { Building2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
    icon?: React.ElementType
    title: string
    description?: string
    className?: string
    actionLabel?: string
    onAction?: () => void
    buttonClassName?: string
}

export default function PageHeader({
                                       icon: Icon = Building2,
                                       title,
                                       description,
                                       className,
                                       actionLabel = "Add New",
                                       onAction,
                                       buttonClassName,
                                   }: PageHeaderProps) {
    return (
        <div className={cn("border-b bg-white py-6 ", className)}>
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                            <Icon className="h-6 w-6 text-slate-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">{title}</h1>
                            {description && <p className="mt-1 text-sm text-gray-600 sm:text-base">{description}</p>}
                        </div>
                    </div>
                    {onAction && (
                        <div className="flex shrink-0">
                            <Button onClick={onAction} className={cn("", buttonClassName)}>
                                <Plus className="h-4 w-4" />
                                {actionLabel}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
