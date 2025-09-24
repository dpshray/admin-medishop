'use client'

import { useState } from 'react'
import Image from 'next/image'
import {Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GalleryImage {
    id: number | string
    url: string
    alt?: string
}

interface ImageGalleryProps {
    images: GalleryImage[]
    productName?: string
    className?: string
    thumbnailClassName?: string
    showImageCount?: boolean
    aspectRatio?: 'square' | 'video' | 'auto'
    columns?: 2 | 3 | 4 | 5 | 6
    enableLightbox?: boolean
    priority?: boolean
}

export default function ImageGallery({
                                         images,
                                         productName = 'Product',
                                         className,
                                         thumbnailClassName,
                                         showImageCount = true,
                                         aspectRatio = 'square',
                                         columns = 4,
                                         enableLightbox = true,
                                         priority = false,
                                     }: ImageGalleryProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    if (!images || images.length === 0) {
        return null
    }

    const aspectRatioClass = {
        square: 'aspect-square',
        video: 'aspect-video',
        auto: 'aspect-auto',
    }[aspectRatio]

    const gridColsClass = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
    }[columns]

    const handleThumbnailClick = (index: number) => {
        setSelectedImageIndex(index)
        if (enableLightbox) {
            setIsLightboxOpen(true)
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleThumbnailClick(index)
        }
    }

    const navigateImage = (direction: 'prev' | 'next') => {
        setSelectedImageIndex((prevIndex) => {
            if (direction === 'prev') {
                return prevIndex === 0 ? images.length - 1 : prevIndex - 1
            } else {
                return prevIndex === images.length - 1 ? 0 : prevIndex + 1
            }
        })
    }

    const handleLightboxKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            navigateImage('prev')
        } else if (event.key === 'ArrowRight') {
            navigateImage('next')
        } else if (event.key === 'Escape') {
            setIsLightboxOpen(false)
        }
    }

    const currentImage = images[selectedImageIndex]

    return (
        <div className={cn('w-full', className)}>
            <div className={cn('grid gap-2', gridColsClass)}>
                {images.map((image, index) => (
                    <div
                        key={image.id}
                        className={cn(
                            'relative group cursor-pointer rounded-md overflow-hidden bg-muted transition-all duration-200 hover:ring-2 hover:ring-ring hover:ring-offset-2',
                            aspectRatioClass,
                            thumbnailClassName
                        )}
                        onClick={() => handleThumbnailClick(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${image.alt || `${productName} image ${index + 1}`} in gallery`}
                    >
                        <Image
                            src={image.url}
                            alt={image.alt || `${productName} gallery image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            priority={priority && index < 4}
                        />

                        {enableLightbox && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                                    <Maximize2 className="h-4 w-4 text-gray-800" />
                                </div>
                            </div>
                        )}

                        {showImageCount && (
                            <Badge
                                variant="secondary"
                                className="absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                                {index + 1}/{images.length}
                            </Badge>
                        )}
                    </div>
                ))}
            </div>

            {enableLightbox && (
                <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                    <DialogTitle>
                        {productName}
                    </DialogTitle>
                    <DialogContent
                        className="max-w-screen-xl w-full h-[90vh] p-0 bg-black/95 border-none"
                        onKeyDown={handleLightboxKeyDown}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-4 right-4 z-50 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                                    aria-label="Close gallery"
                                >
                                    <X className="h-4 w-4 text-white" />
                                </Button>
                            </DialogClose>

                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                                        onClick={() => navigateImage('prev')}
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="h-4 w-4 text-white" />
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                                        onClick={() => navigateImage('next')}
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="h-4 w-4 text-white" />
                                    </Button>
                                </>
                            )}

                            <div className="relative w-full h-full max-w-4xl max-h-full">
                                <Image
                                    src={currentImage.url}
                                    alt={currentImage.alt || `${productName} gallery image ${selectedImageIndex + 1}`}
                                    fill
                                    className="object-contain"
                                    priority
                                    sizes="100vw"
                                />
                            </div>

                            {showImageCount && images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                    <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                                        {selectedImageIndex + 1} of {images.length}
                                    </Badge>
                                </div>
                            )}

                            <div className="absolute bottom-4 right-4">
                                <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-xs">
                                    <ZoomIn className="h-3 w-3 mr-1" />
                                    Click & drag to zoom
                                </Badge>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}