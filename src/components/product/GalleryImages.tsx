"use client"

import {useCallback, useState} from "react"
import Image from "next/image"
import {cn} from "@/lib/utils"
import {ImageOff} from "lucide-react"

interface ProductImageGalleryProps {
    images: string[]
    productName: string
}

export default function ImageGallery({images, productName}: ProductImageGalleryProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    const handleImageSelect = useCallback((index: number) => {
        setSelectedImageIndex(index)
        setImageLoaded(false)
        setImageError(false)
    }, [])

    const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleImageSelect(index)
        }
    }, [handleImageSelect])

    if (!images || images.length === 0) {
        return (
            <div className="flex items-center justify-center aspect-square w-full bg-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                    <ImageOff className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                    <p className="text-sm">No images available</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <div className="flex flex-row sm:flex-col gap-2 p-3 overflow-x-auto sm:overflow-visible scrollbar-hide">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => handleImageSelect(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={cn(
                            "relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-md border-2 transition-all duration-200 overflow-hidden",
                            selectedImageIndex === index
                                ? "border-mainColor  ring-mainColor/20 shadow-md"
                                : "border-muted hover:border-muted-foreground/30"
                        )}
                        aria-label={`View ${productName} image ${index + 1}`}
                        aria-pressed={selectedImageIndex === index}
                    >
                        <Image
                            src={image}
                            alt={`${productName} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    </button>
                ))}
            </div>

            <div
                className="relative aspect-square w-full bg-gradient-to-br from-muted/50 to-muted rounded-lg overflow-hidden shadow-sm">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/50"
                         aria-hidden="true"/>
                )}

                {imageError ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <ImageOff className="w-16 h-16 mx-auto mb-3 opacity-50"/>
                            <p className="text-sm font-medium">Image unavailable</p>
                        </div>
                    </div>
                ) : (
                    <Image
                        src={images[selectedImageIndex]}
                        alt={`${productName} - Main view`}
                        fill
                        className={cn(
                            "object-fill p-4 transition-opacity duration-300",
                            imageLoaded ? "opacity-100" : "opacity-0"
                        )}
                        priority={selectedImageIndex === 0}
                        sizes="(max-width: 640px) 100vw, 50vw"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                )}
            </div>
        </div>
    )
}