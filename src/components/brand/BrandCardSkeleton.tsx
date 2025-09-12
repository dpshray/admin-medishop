"use client"

import {Card, CardContent} from "@/components/ui/card"
import {Skeleton} from "@/components/ui/skeleton"

export default function BrandCardSkeleton() {
    return (
        <Card className="group hover:shadow-lg transition-all border-purple-100 hover:border-purple-300">
            <CardContent className="p-4 sm:p-6 text-center">
                <div
                    className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center">
                    <Skeleton className="w-10 h-10 rounded-md"/>
                </div>
                <Skeleton className="h-5 w-24 mx-auto mb-2"/>
                <Skeleton className="h-4 w-20 mx-auto rounded"/>
                <div className="flex gap-2 justify-center mt-4 flex-wrap">
                    <Skeleton className="h-8 w-16 rounded-md"/>
                    <Skeleton className="h-8 w-16 rounded-md"/>
                    <Skeleton className="h-8 w-16 rounded-md"/>
                </div>
            </CardContent>
        </Card>
    )
}
