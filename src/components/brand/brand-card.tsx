"use client";

import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Building2, Edit, Eye, Loader2, Trash2} from "lucide-react";
import Image from "next/image";
import {useState} from "react";

export interface Brand {
    id: number;
    name: string;
    slug: string;
    image: string;
}

interface BrandCardProps {
    brand: Brand;
    onViewAction?: (brand: Brand) => void;
    onEditAction?: (brand: Brand) => void;
    onDeleteAction?: (brand: Brand) => void;
    actionLoading?: boolean;
}

export default function BrandCard({
                                      brand,
                                      onViewAction,
                                      onEditAction,
                                      onDeleteAction,
                                      actionLoading = false,
                                  }: BrandCardProps) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <Card
            className="group hover:shadow-lg transition-all duration-300 border-purple-100 hover:border-purple-300 bg-white">
            <CardContent className="p-4 sm:p-3">
                <div className="text-center mb-4">
                    <div
                        className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                        {!imageError && brand.image ? (
                            <Image
                                width={40}
                                height={40}
                                src={brand.image}
                                alt={brand.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                onError={handleImageError}
                                unoptimized
                            />
                        ) : (
                            <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600"/>
                        )}
                    </div>

                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors duration-300">
                        {brand.name}
                    </h3>

                    <div className="text-xs sm:text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-md">
                        <span className="truncate block">{brand.slug}</span>
                    </div>
                </div>

                <div className="flex gap-1.5 sm:gap-2 justify-center">
                    {onViewAction && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewAction(brand)}
                            className="flex-1 sm:flex-none border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700"
                            disabled={actionLoading}
                        >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1"/>
                            <span className="hidden sm:inline">View</span>
                        </Button>
                    )}

                    {onEditAction && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditAction(brand)}
                            className="flex-1 sm:flex-none border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700"
                            disabled={actionLoading}
                        >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1"/>
                            <span className="hidden sm:inline">Edit</span>
                        </Button>
                    )}

                    {onDeleteAction && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteAction(brand)}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                            {actionLoading ? (
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin sm:mr-1"/>
                            ) : (
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1"/>
                            )}
                            <span className="hidden sm:inline">Delete</span>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}