import {Skeleton} from "@/components/ui/skeleton";
import React from "react";

const AdminProductDetailsSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="h-8 w-64 mb-2"/>
                    <Skeleton className="h-4 w-32"/>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-24"/>
                    <Skeleton className="h-10 w-24"/>
                    <Skeleton className="h-10 w-32"/>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Skeleton className="aspect-square w-full rounded-xl"/>
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-full"/>
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-3/4"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {Array.from({length: 4}).map((_, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                            <Skeleton className="h-5 w-32 mb-4"/>
                            <Skeleton className="h-8 w-20"/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)
export default AdminProductDetailsSkeleton