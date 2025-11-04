'use client'

import type React from "react"
import {memo} from "react"
import {cn} from "@/lib/utils"
import {type LucideIcon} from "lucide-react"

interface TableHeaderProps {
    title: string
    description?: string
    icon?: LucideIcon
    iconColor?: string
    children?: React.ReactNode
    className?: string
}

const TableHeading = memo(function TableHeading({
                                                    title,
                                                    description,
                                                    icon: Icon,
                                                    iconColor = "#4a358e",
                                                    className,
                                                    children,
                                                }: TableHeaderProps) {
    return (
        <header
            className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}
            role="banner"
        >
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                {Icon && (
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-gray-200 ring-offset-1 transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-offset-2 sm:h-12 sm:w-12"
                        style={{
                            backgroundColor: `${iconColor}15`,
                        }}
                        aria-hidden="true"
                    >
                        <Icon
                            className="h-5 w-5 sm:h-6 sm:w-6"
                            style={{color: iconColor}}
                            strokeWidth={1.5}
                        />
                    </div>
                )}
                <div className="min-w-0 flex-1 space-y-1.5">
                    <h1 className="text-xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {children && (
                <div className="flex shrink-0 items-center gap-2">
                    {children}
                </div>
            )}
        </header>
    )
}, (prevProps, nextProps) => {
    return (
        prevProps.title === nextProps.title &&
        prevProps.description === nextProps.description &&
        prevProps.icon === nextProps.icon &&
        prevProps.iconColor === nextProps.iconColor &&
        prevProps.className === nextProps.className &&
        prevProps.children === nextProps.children
    )
})

TableHeading.displayName = 'TableHeading'

export default TableHeading