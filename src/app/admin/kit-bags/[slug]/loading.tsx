'use client'

import {Skeleton} from "@/components/ui/skeleton"
import {ShoppingBag, TrendingDown, Package, Calendar} from "lucide-react"

export default function KitBagDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 animate-pulse">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
                <header className="border-b bg-gradient-to-br from-primary/5 to-purple-50/50 p-4 sm:p-6 lg:p-8">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border-2 border-primaryColor/10">
                                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primaryColor/40"/>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-6 sm:h-8 w-32 sm:w-48"/>
                                <Skeleton className="h-3 sm:h-4 w-24 sm:w-36"/>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 bg-white/80 border px-3 py-1.5 rounded-lg">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground"/>
                                <Skeleton className="h-3 w-20 sm:w-24"/>
                            </div>
                            <div className="flex items-center gap-2 bg-white/80 border px-3 py-1.5 rounded-lg">
                                <Package className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground"/>
                                <Skeleton className="h-3 w-16 sm:w-20"/>
                            </div>
                            <div className="flex items-center gap-2 bg-green-500/10 border px-3 py-1.5 rounded-lg">
                                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-green-500"/>
                                <Skeleton className="h-3 w-24 sm:w-28"/>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="bg-background p-4 sm:p-6 lg:p-8 rounded-b-xl border-x border-b">
                    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        <section className="lg:col-span-2 space-y-4 sm:space-y-5">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <Skeleton className="h-6 sm:h-8 w-28 sm:w-36"/>
                                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20"/>
                            </div>
                            {[...Array(3)].map((_, index) => (
                                <div
                                    key={index}
                                    className="flex gap-4 sm:gap-6 bg-muted/30 p-4 sm:p-5 rounded-xl border border-border"
                                >
                                    <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg"/>
                                    <div className="flex-1 space-y-2 sm:space-y-3">
                                        <Skeleton className="h-4 sm:h-5 w-3/4"/>
                                        <Skeleton className="h-3 sm:h-4 w-1/2"/>
                                        <Skeleton className="h-4 sm:h-5 w-1/3"/>
                                        <Skeleton className="h-4 sm:h-5 w-1/4"/>
                                    </div>
                                </div>
                            ))}
                        </section>

                        <aside className="lg:col-span-1">
                            <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-primary/10 p-4 sm:p-6 lg:p-8 sticky top-4 lg:top-6 space-y-4 sm:space-y-6">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 sm:h-7 w-20 sm:w-28"/>
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-primaryColor/10 flex items-center justify-center">
                                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-primaryColor/40"/>
                                    </div>
                                </div>

                                <Skeleton className="h-px bg-border/60"/>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-16"/>
                                        <Skeleton className="h-4 w-20"/>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-12"/>
                                        <Skeleton className="h-4 w-8"/>
                                    </div>
                                    <div className="bg-green-50 p-3 sm:p-4 rounded-xl border-2 border-green-200">
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-4 w-16"/>
                                            <Skeleton className="h-4 w-20"/>
                                        </div>
                                    </div>
                                </div>

                                <Skeleton className="h-px bg-border/60"/>

                                <div className="bg-gradient-to-r from-primaryColor/10 to-primaryColor/5 p-4 sm:p-5 rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-5 w-16"/>
                                        <Skeleton className="h-6 w-20"/>
                                    </div>
                                </div>

                                <Skeleton className="h-8 sm:h-9 w-full rounded-lg bg-muted/60"/>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    )
}
