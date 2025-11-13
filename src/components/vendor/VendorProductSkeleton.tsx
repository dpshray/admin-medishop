'use client'

import {Package} from "lucide-react";
import {cn} from "@/lib/utils";

const VendorProductSkeleton = () => {
    return (
        <section className="space-y-6">
            {Array.from({length: 3}).map((_, idx) => (
                <article
                    key={idx}
                    className={cn(
                        'group relative bg-white border rounded-xl overflow-hidden p-5 flex flex-col sm:flex-row animate-pulse',
                        'border-gray-200'
                    )}
                >
                    <div
                        className="w-full sm:w-40 h-40 bg-gray-200 rounded-lg flex-shrink-0 mr-5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-3xl"></div>
                        <Package className="w-16 h-16 text-gray-300 relative z-10" aria-hidden="true"/>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-3/5"></div>
                        <div className="flex gap-2">
                            <div className="h-5 w-16 bg-gray-300 rounded"></div>
                            <div className="h-5 w-16 bg-gray-300 rounded"></div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                            <div className="h-4 w-28 bg-gray-300 rounded"></div>
                            <div className="h-4 w-24 bg-gray-300 rounded"></div>
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-300 rounded"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Array.from({length: 3}).map((_, vIdx) => (
                                    <div
                                        key={vIdx}
                                        className="h-24 bg-gray-200 rounded-lg border border-gray-200"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </section>
    );
};

export default VendorProductSkeleton;
