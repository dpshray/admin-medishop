"use client";

import { Skeleton } from "@/components/ui/skeleton";

const ProductManageFormSkeleton = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 sm:px-6 lg:px-8 animate-pulse">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-200"></div>
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>

                {/* Basic Information */}
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100"></div>
                        <Skeleton className="h-6 w-40" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <Skeleton className="h-24 w-full rounded-xl" />

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                </div>

                {/* Product Images */}
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-orange-100"></div>
                        <Skeleton className="h-6 w-40" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                </div>

                {/* Categories */}
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-green-100"></div>
                        <Skeleton className="h-6 w-56" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </div>

                {/* Variations */}
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 sm:p-8 space-y-6">

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100"></div>
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <Skeleton className="h-10 w-32 rounded-xl" />
                    </div>

                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-6 space-y-4"
                        >
                            <div className="flex justify-between mb-4">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-20" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Skeleton className="h-12 rounded-xl" />
                                <Skeleton className="h-12 rounded-xl" />
                                <Skeleton className="h-12 rounded-xl" />
                                <Skeleton className="h-12 rounded-xl" />
                                <Skeleton className="h-12 rounded-xl" />
                                <Skeleton className="h-12 rounded-xl" />
                                <Skeleton className="h-12 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
                    <Skeleton className="h-12 w-full sm:w-52 rounded-xl" />
                </div>
            </div>
        </div>
    );
};

export default ProductManageFormSkeleton;
