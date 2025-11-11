'use client'

import {Calendar, Package, ShoppingBag, TrendingDown} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Card, CardContent} from "@/components/ui/card"
import {Skeleton} from "@/components/ui/skeleton"

export default function KitBagDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <header
                className="relative bg-gradient-to-r from-primaryColor/50 via-primaryColor/60 to-primaryColor text-white py-8 px-4 shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"/>
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <ShoppingBag className="w-8 h-8" strokeWidth={2.5}/>
                        </div>
                        <Skeleton className="h-8 w-64 rounded-lg"/>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                        <Badge variant="secondary"
                               className="bg-white/20 text-white border-0 backdrop-blur-sm font-semibold">
                            <Calendar className="w-4 h-4 mr-2"/>
                            <Skeleton className="h-4 w-20"/>
                        </Badge>
                        <Badge variant="secondary"
                               className="bg-white/20 text-white border-0 backdrop-blur-sm font-semibold">
                            <Package className="w-4 h-4 mr-2"/>
                            <Skeleton className="h-4 w-12"/>
                        </Badge>
                        <Badge className="bg-green-500 text-white font-bold shadow-lg">
                            <TrendingDown className="w-4 h-4 mr-2"/>
                            <Skeleton className="h-4 w-16"/>
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-6 w-48 rounded-md"/>
                            <Skeleton className="h-6 w-24 rounded-md"/>
                        </div>
                        {Array.from({length: 3}).map((_, i) => (
                            <Card key={i} className="overflow-hidden rounded-2xl border border-gray-100 p-4 md:p-6">
                                <CardContent className="flex gap-4 md:gap-6">
                                    <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-xl"/>
                                    <div className="flex-1 flex flex-col justify-between gap-3">
                                        <Skeleton className="h-6 w-48 rounded-md"/>
                                        <Skeleton className="h-4 w-32 rounded-md"/>
                                        <Skeleton className="h-6 w-24 rounded-md"/>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <aside className="lg:col-span-1">
                        <Card
                            className="p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-32 rounded-md"/>
                                <Skeleton className="h-12 w-12 rounded-full"/>
                            </div>
                            <Separator className="bg-gray-200"/>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-24 rounded-md"/>
                                    <Skeleton className="h-6 w-20 rounded-md"/>
                                </div>
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-16 rounded-md"/>
                                    <Skeleton className="h-6 w-16 rounded-md"/>
                                </div>
                                <div
                                    className="flex justify-between items-center bg-green-50 p-4 rounded-xl border-2 border-green-200">
                                    <Skeleton className="h-4 w-24 rounded-md"/>
                                    <Skeleton className="h-6 w-20 rounded-md"/>
                                </div>
                            </div>
                            <Separator className="bg-gray-200"/>
                            <div
                                className="flex justify-between items-center bg-gradient-to-r from-primaryColor/10 to-primaryColor/5 p-5 rounded-xl">
                                <Skeleton className="h-6 w-24 rounded-md"/>
                                <Skeleton className="h-8 w-24 rounded-md"/>
                            </div>
                            <Skeleton className="h-4 w-full rounded-md mt-2"/>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    )
}
