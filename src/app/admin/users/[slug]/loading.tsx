'use client'
import {memo} from "react";
import {Skeleton} from "@/components/ui/skeleton";

const LoadingSkeleton = memo(() => (
    <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-card p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Skeleton className="h-24 w-24 rounded-full flex-shrink-0"/>
                    <div className="flex-1 space-y-3 w-full">
                        <Skeleton className="h-8 w-48"/>
                        <Skeleton className="h-4 w-64"/>
                        <Skeleton className="h-4 w-32"/>
                    </div>
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32"/>
                ))}
            </div>
        </div>
    </div>
))
LoadingSkeleton.displayName = "LoadingSkeleton"

export default LoadingSkeleton