'use client'

import {CheckCircle, Clock, PackageOpen, XCircle} from "lucide-react"
import {cn} from "@/lib/utils"
import React, {memo} from "react"


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


const GetStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "delivered":
            return "bg-green-100 text-green-800 border-green-200"
        case "cancelled":
            return "bg-red-100 text-red-800 border-red-200"
        default:
            return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
}
const GetStatusIcon = (status: string) => {
    const normalized = status.toLowerCase()
    if (normalized === 'delivered') return <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true"/>
    if (normalized === 'cancelled') return <XCircle className="w-4 h-4 text-red-600" aria-hidden="true"/>
    return <Clock className="w-4 h-4 text-yellow-600" aria-hidden="true"/>
}


NoDataFound.displayName = "NoDataFound"


export {NoDataFound, GetStatusColor, GetStatusIcon}

