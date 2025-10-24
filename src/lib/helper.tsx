'use client'

import {AlertCircle, Ban, CheckCircle, Clock, Package, PackageOpen, XCircle} from "lucide-react"
import {cn} from "@/lib/utils"
import React, {memo, useMemo} from "react"
import {OrderStatus, PaymentStatus, StatusType} from "@/types/enum"
import {PAYMENT_PREFIX} from "@/config/app-constant"

interface NoDataFoundProps {
    title?: string
    description?: string
    icon?: React.ReactNode
    className?: string
}

const NoDataFound = memo(
    ({
         title = "No data found",
         description = "Get started by creating your first item.",
         icon,
         className
     }: NoDataFoundProps) => {
        return (
            <div className={cn("flex flex-col items-center justify-center py-12", className)}>
                {icon || <PackageOpen className="h-12 w-12 text-muted-foreground" aria-hidden="true"/>}
                <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
        )
    }
)

NoDataFound.displayName = "NoDataFound"

interface StatusProps {
    status: string | StatusType | PaymentStatus | OrderStatus
    className?: string
    showIcon?: boolean
}

type StatusConfigKey =
    | Lowercase<StatusType>
    | Lowercase<PaymentStatus>
    | Lowercase<OrderStatus>

interface StatusConfig {
    color: string
    icon: typeof CheckCircle
    iconColor: string
    label: string
}

const STATUS_CONFIG: Record<StatusConfigKey, StatusConfig> = {
    delivered: {
        color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        icon: CheckCircle,
        iconColor: "text-green-600 dark:text-green-400",
        label: "Delivered"
    },
    cancelled: {
        color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        icon: XCircle,
        iconColor: "text-red-600 dark:text-red-400",
        label: "Cancelled"
    },
    pending: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
        icon: Clock,
        iconColor: "text-yellow-600 dark:text-yellow-400",
        label: "Pending"
    },
    confirmed: {
        color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        icon: Package,
        iconColor: "text-blue-600 dark:text-blue-400",
        label: "Confirmed"
    },
    verified: {
        color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        icon: CheckCircle,
        iconColor: "text-green-600 dark:text-green-400",
        label: "Verified"
    },
    unverified: {
        color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
        icon: AlertCircle,
        iconColor: "text-gray-600 dark:text-gray-400",
        label: "Unverified"
    },
    active: {
        color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        icon: CheckCircle,
        iconColor: "text-green-600 dark:text-green-400",
        label: "Active"
    },
    inactive: {
        color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
        icon: Ban,
        iconColor: "text-gray-600 dark:text-gray-400",
        label: "Inactive"
    },
    out_of_stock: {
        color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        icon: XCircle,
        iconColor: "text-red-600 dark:text-red-400",
        label: "Out of Stock"
    },
    in_stock: {
        color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        icon: CheckCircle,
        iconColor: "text-green-600 dark:text-green-400",
        label: "In Stock"
    },
    draft: {
        color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
        icon: Clock,
        iconColor: "text-gray-600 dark:text-gray-400",
        label: "Draft"
    },
    published: {
        color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        icon: CheckCircle,
        iconColor: "text-green-600 dark:text-green-400",
        label: "Published"
    },
    unpublished: {
        color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
        icon: Ban,
        iconColor: "text-gray-600 dark:text-gray-400",
        label: "Unpublished"
    },
    paid: {
        color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        icon: CheckCircle,
        iconColor: "text-green-600 dark:text-green-400",
        label: "Paid"
    },
    unpaid: {
        color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        icon: XCircle,
        iconColor: "text-red-600 dark:text-red-400",
        label: "Unpaid"
    }
}

const normalizeStatus = (status: string | StatusType | PaymentStatus | OrderStatus): StatusConfigKey => {
    const normalized = String(status).toLowerCase().replace(/\s+/g, '_') as StatusConfigKey
    return STATUS_CONFIG[normalized] ? normalized : 'pending'
}

const GetStatusColor = (status: string | StatusType | PaymentStatus | OrderStatus): string => {
    const normalizedStatus = normalizeStatus(status)
    return STATUS_CONFIG[normalizedStatus].color
}

const GetStatusIcon = memo(({status}: {status: string | StatusType | PaymentStatus | OrderStatus}) => {
    const config = useMemo(() => {
        const normalizedStatus = normalizeStatus(status)
        return STATUS_CONFIG[normalizedStatus]
    }, [status])

    const Icon = config.icon
    return <Icon className={cn("w-4 h-4", config.iconColor)} aria-hidden="true"/>
})

GetStatusIcon.displayName = "GetStatusIcon"

const GetStatusLabel = (status: string | StatusType | PaymentStatus | OrderStatus): string => {
    const normalizedStatus = normalizeStatus(status)
    return STATUS_CONFIG[normalizedStatus].label
}

const StatusBadge = memo(({status, className, showIcon = true}: StatusProps) => {
    const config = useMemo(() => {
        const normalizedStatus = normalizeStatus(status)
        return STATUS_CONFIG[normalizedStatus]
    }, [status])

    const Icon = config.icon

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                config.color,
                className
            )}
            role="status"
            aria-label={`Status: ${config.label}`}
        >
            {showIcon && <Icon className={cn("w-3.5 h-3.5", config.iconColor)} aria-hidden="true"/>}
            <span>{config.label}</span>
        </span>
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

const FormatDate = (dateString: string): string => {
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


const FormatCurrency = (amount: number): string => {
    return currencyFormatter.format(amount)
}

const StripHtml = (html: string, maxLength: number = 100): string => {
    const text = html.replace(/<[^>]*>/g, '').trim()
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

export {
    NoDataFound,
    GetStatusColor,
    GetStatusIcon,
    GetStatusLabel,
    StatusBadge,
    STATUS_CONFIG,
   FormatCurrency,
    FormatDate,
    StripHtml,
    type StatusProps,
    type StatusConfigKey
}