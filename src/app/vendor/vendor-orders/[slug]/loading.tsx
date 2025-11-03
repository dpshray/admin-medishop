"use client"

import {Skeleton} from "@/components/ui/skeleton"
import {Card, CardContent} from "@/components/ui/card"

export default function VendorOrderDetailsLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 sm:w-64 rounded-lg" />
                        <Skeleton className="h-4 w-64 sm:w-80" />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Skeleton className="h-10 w-28 rounded-lg" />
                        <Skeleton className="h-10 w-28 rounded-lg" />
                    </div>
                </div>

                {/* Main card skeleton */}
                <Card className="border-2 shadow-lg">
                    <CardContent className="p-4 sm:p-6 lg:p-8 space-y-8">
                        {/* Top section (order info) */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <Skeleton className="w-16 h-16 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-40 sm:w-60" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-32 rounded-lg" />
                            </div>

                            {/* Status update section */}
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                                <Skeleton className="h-10 w-full sm:w-64 rounded-lg" />
                                <Skeleton className="h-10 w-full sm:w-32 rounded-lg" />
                            </div>
                        </div>

                        {/* Body grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left side (Order Items + Vendor Info) */}
                            <div className="lg:col-span-8 space-y-8">
                                <div>
                                    <Skeleton className="h-6 w-40 mb-4 rounded-lg" />
                                    <div className="space-y-3">
                                        {Array.from({length: 3}).map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 border rounded-xl">
                                                <Skeleton className="w-16 h-16 rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-40" />
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Skeleton className="h-6 w-48 mb-4 rounded-lg" />
                                    <div className="flex items-center gap-4 p-4 border rounded-xl">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side (Customer + Payment) */}
                            <div className="lg:col-span-4 space-y-8">
                                <div>
                                    <Skeleton className="h-6 w-44 mb-4 rounded-lg" />
                                    <div className="space-y-4">
                                        {Array.from({length: 2}).map((_, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Skeleton className="w-10 h-10 rounded-xl" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-4 w-48" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Skeleton className="h-6 w-40 mb-4 rounded-lg" />
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Skeleton className="w-10 h-10 rounded-xl" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </div>
                                        <div className="border rounded-xl p-4 space-y-3">
                                            {Array.from({length: 3}).map((_, i) => (
                                                <div key={i} className="flex justify-between">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                            ))}
                                            <Skeleton className="h-[1px] w-full" />
                                            <div className="flex justify-between pt-2">
                                                <Skeleton className="h-5 w-24" />
                                                <Skeleton className="h-5 w-28" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
