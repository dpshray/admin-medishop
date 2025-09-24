import {memo} from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

const LoadingSkeleton = memo(() => (
    <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl"
        role="status"
        aria-label="Loading vendor details"
    >
        <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 sm:h-9 w-48 sm:w-64"/>
                    <Skeleton className="h-4 w-32"/>
                </div>
                <Skeleton className="h-6 w-20 sm:w-24"/>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {Array.from({length: 4}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-40"/>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({length: 3}).map((_, j) => (
                                <div key={j} className="space-y-2">
                                    <Skeleton className="h-4 w-24"/>
                                    <Skeleton className="h-5 w-full"/>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4 sm:space-y-6">
                {Array.from({length: 2}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32"/>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-16 w-16 rounded-full"/>
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-32"/>
                                    <Skeleton className="h-4 w-20"/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";


export default LoadingSkeleton;
