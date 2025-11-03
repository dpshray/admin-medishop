'use client'

import {Skeleton} from "@/components/ui/skeleton"
import {Card, CardContent, CardHeader} from "@/components/ui/card"

export default function AddProductToPackageSkeleton() {
    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 sm:p-6 animate-pulse">
            <Card className="overflow-hidden border-border shadow-lg py-0">
                <CardHeader className="p-6 border-b bg-gradient-to-br from-purple-50 via-purple-50/80 to-background">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <Skeleton className="h-16 w-16 rounded-2xl sm:h-16 sm:w-16"/>
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64 rounded-lg"/>
                            <Skeleton className="h-4 w-96 rounded-lg"/>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                    {[...Array(2)].map((_, idx) => (
                        <Card key={idx}
                              className="border-2 rounded-lg hover:shadow-lg hover:border-purple-200 transition-all">
                            <CardContent className="p-5">
                                <div className="flex flex-col gap-5">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="h-11 w-11 rounded-full"/>
                                        <div className="grid flex-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                            <Skeleton className="h-12 w-full rounded-lg"/>
                                            <Skeleton className="h-12 w-full rounded-lg"/>
                                            <Skeleton className="h-12 w-full rounded-lg"/>
                                        </div>
                                        <Skeleton className="h-10 w-10 rounded-full"/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Skeleton className="h-12 w-full rounded-lg mt-4"/>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end mt-6">
                        <Skeleton className="h-12 w-full sm:w-32 rounded-lg"/>
                        <Skeleton className="h-12 w-full sm:w-40 rounded-lg"/>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
