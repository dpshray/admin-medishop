'use client'

import React, {memo} from "react"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Loader2, XCircle} from "lucide-react"

interface FallbackProps {
    title?: string
    message?: string
    primaryAction?: {
        label: string
        onClick: () => void
        loading?: boolean
    }
    secondaryAction?: {
        label: string
        onClick: () => void
    }
    icon?: React.ReactNode
}

export const ErrorFallback: React.FC<FallbackProps> = memo(
    ({
         title = "Something Went Wrong",
         message = "We couldn’t complete your request. Please try again.",
         primaryAction,
         secondaryAction,
         icon,
     }) => (
        <div
            className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50/80 to-slate-100/80 p-4">
            <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                <CardContent className="flex flex-col items-center justify-center py-16 px-6 sm:px-10">
                    <div
                        className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        {icon || <XCircle className="h-10 w-10 text-red-500"/>}
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-slate-900 text-center">{title}</h2>
                    <p className="text-slate-600 text-center leading-relaxed mb-8 max-w-sm">{message}</p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                        {primaryAction && (
                            <Button
                                variant="default"
                                onClick={primaryAction.onClick}
                                className="flex-1 bg-slate-900 hover:bg-slate-800"
                                disabled={primaryAction.loading}
                            >
                                {primaryAction.loading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                                {primaryAction.label}
                            </Button>
                        )}
                        {secondaryAction && (
                            <Button variant="outline" onClick={secondaryAction.onClick} className="flex-1">
                                {secondaryAction.label}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
)

ErrorFallback.displayName = "ErrorFallback"
