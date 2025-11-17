export default function ProductPageDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
                    <div className="space-y-4 sm:space-y-6 flex-1 min-w-0">
                        <div className="h-6 w-24 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-12 w-full bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2"></div>
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1"></div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <div className="h-6 w-20 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-6 w-36 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    ))}
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <div className="h-6 w-40 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                            <div className="h-4 w-60 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                        <div className="h-6 w-24 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                        {Array.from({ length: 2 }).map((_, idx) => (
                            <div key={idx} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg animate-pulse">
                                <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded mb-2"></div>
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-1"></div>
                                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
