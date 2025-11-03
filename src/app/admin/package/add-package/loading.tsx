"use client"

export default function PackageFormSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="container mx-auto space-y-6 animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-8 w-1/3 bg-gray-300 rounded"></div>
                        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 w-24 bg-gray-300 rounded"></div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 bg-gray-300 rounded"></div>
                        <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="h-10 bg-gray-300 rounded w-full"></div>
                        <div className="h-10 bg-gray-300 rounded w-full"></div>
                        <div className="h-10 bg-gray-300 rounded w-full"></div>
                        <div className="h-10 bg-gray-300 rounded w-full"></div>
                    </div>

                    <div className="h-24 bg-gray-300 rounded w-full"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="h-10 bg-gray-300 rounded w-full"></div>
                        <div className="h-10 bg-gray-300 rounded w-full"></div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="h-10 bg-gray-300 rounded w-full sm:w-1/2"></div>
                        <div className="h-10 bg-gray-300 rounded w-full sm:w-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
