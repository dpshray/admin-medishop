"use client"

import {Skeleton} from "@/components/ui/skeleton"

const ProductManageFormSkeleton = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64 rounded-lg"/>
                            <Skeleton className="h-4 w-96 rounded-lg"/>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6 space-y-6">
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full rounded-lg"/>
                            <Skeleton className="h-12 w-full rounded-lg"/>
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full rounded-lg"/>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Skeleton className="h-40 w-full rounded-lg"/>
                            <Skeleton className="h-40 w-full rounded-lg"/>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Skeleton className="h-12 w-full rounded-lg"/>
                            <Skeleton className="h-12 w-full rounded-lg"/>
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full rounded-lg"/>
                            <Skeleton className="h-12 w-full rounded-lg"/>
                        </div>

                        <div className="space-y-6">
                            {[...Array(2)].map((_, idx) => (
                                <div key={idx} className="space-y-4 border border-slate-200 rounded-xl p-4 bg-slate-50">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-6 w-32 rounded-lg"/>
                                        <Skeleton className="h-6 w-6 rounded-full"/>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <Skeleton className="h-12 w-full rounded-lg"/>
                                        <Skeleton className="h-12 w-full rounded-lg"/>
                                        <Skeleton className="h-12 w-full rounded-lg"/>
                                        <Skeleton className="h-12 w-full rounded-lg"/>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Skeleton className="h-12 w-32 rounded-lg"/>
                            <Skeleton className="h-12 w-40 rounded-lg"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductManageFormSkeleton
