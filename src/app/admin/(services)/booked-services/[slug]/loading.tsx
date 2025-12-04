import {Skeleton} from "@/components/ui/skeleton";
import type React from "react";

const BookingServiceLoadingSkeleton = () => (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="border rounded-lg p-6 sm:p-8 bg-background space-y-8">
            <div className="space-y-3">
                <Skeleton className="h-8 w-64"/>
                <Skeleton className="h-4 w-48"/>
            </div>
            <Skeleton className="h-px w-full"/>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-56 w-full rounded-lg"/>
                    <Skeleton className="h-64 w-full rounded-lg"/>
                </div>
                <div className="space-y-8">
                    <Skeleton className="h-48 w-full rounded-lg"/>
                    <Skeleton className="h-56 w-full rounded-lg"/>
                    <Skeleton className="h-64 w-full rounded-lg"/>
                </div>
            </div>
        </div>
    </div>
)

export default BookingServiceLoadingSkeleton;