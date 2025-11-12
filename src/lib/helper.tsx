'use client'

import {AlertCircle, CheckCircle, Clock, LucideIcon, Package, PackageOpen, XCircle} from "lucide-react"
import {cn} from "@/lib/utils"
import React, {memo} from "react"
import {ORDER_STATUS, PAYMENT_STATUS, STATUS_TYPE} from "@/types/enum"
import {Badge} from "@/components/ui/badge"

interface NoDataFoundProps {
    title?: string
    description?: string
    icon?: LucideIcon
    className?: string
}

export const NoDataFound = memo(
    ({
         title = "No data found",
         description = "Get started by creating your first item.",
         icon: Icon = PackageOpen,
         className
     }: NoDataFoundProps) => {
        return (
            <div className={cn("flex flex-col items-center justify-center ", className)}>
                <Icon className="h-12 w-12 text-muted-foreground" aria-hidden="true"/>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
        )
    }
)

NoDataFound.displayName = "NoDataFound"

interface StatusConfig {
    icon?: LucideIcon
    className: string
}

const statusConfigMap: Record<string, StatusConfig> = {
    [STATUS_TYPE.ACTIVE]: {
        icon: CheckCircle,
        className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    },
    [STATUS_TYPE.INACTIVE]: {
        icon: XCircle,
        className: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
    },
    [STATUS_TYPE.PENDING]: {
        icon: Clock,
        className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
    },
    [STATUS_TYPE.CONFIRMED]: {
        icon: CheckCircle,
        className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    },
    [STATUS_TYPE.CANCELLED]: {
        icon: XCircle,
        className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },
    [STATUS_TYPE.DELIVERED]: {
        icon: Package,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    },
    [PAYMENT_STATUS.PAID]: {
        icon: CheckCircle,
        className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    },
    [PAYMENT_STATUS.UNPAID]: {
        icon: XCircle,
        className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },
    [STATUS_TYPE.VERIFIED]: {
        icon: CheckCircle,
        className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    },
    [STATUS_TYPE.UNVERIFIED]: {
        icon: AlertCircle,
        className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },
    [STATUS_TYPE.IN_STOCK]: {
        icon: Package,
        className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    },
    [STATUS_TYPE.OUT_OF_STOCK]: {
        icon: AlertCircle,
        className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },
    [STATUS_TYPE.PUBLISHED]: {
        icon: CheckCircle,
        className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    },
    [STATUS_TYPE.UNPUBLISHED]: {
        icon: XCircle,
        className: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
    },
    [STATUS_TYPE.DRAFT]: {
        icon: Clock,
        className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
    },
    [STATUS_TYPE.PROCESSING]: {
        icon: Clock,
        className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
    },
    [STATUS_TYPE.SHIPPED]: {
        icon: Clock,
        className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
    },

    [STATUS_TYPE.ACCEPTED]: {
        icon: CheckCircle,
        className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    },
    [STATUS_TYPE.REJECTED]: {
        icon: XCircle,
        className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },

}

const defaultStatusConfig: StatusConfig = {
    icon: AlertCircle,
    className: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
}

export const StatusBadge = memo(({status}: { status: PAYMENT_STATUS | ORDER_STATUS | STATUS_TYPE | string }) => {
    if (!status) return null
    const key = String(status).toUpperCase()
    const config = statusConfigMap[key] || defaultStatusConfig
    const Icon = config.icon
    return (
        <Badge variant="outline" className={cn("gap-1.5 capitalize", config.className)}>
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true"/>}
            <span>{status.toLowerCase().replace(/_/g, ' ')}</span>
        </Badge>
    )
})

StatusBadge.displayName = "StatusBadge"

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
})

export const FormatDate = (dateString: string): string => {
    try {
        return dateFormatter.format(new Date(dateString))
    } catch {
        return dateString
    }
}

const currencyFormatter = new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

export const FormatCurrency = (amount?: number | string): string => {
    if (amount == null || isNaN(Number(amount))) return "N/A"
    return currencyFormatter.format(Number(amount))
}


export const StripHtml = (html: string, maxLength: number = 100): string => {
    const text = html.replace(/<[^>]*>/g, '').trim()
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}