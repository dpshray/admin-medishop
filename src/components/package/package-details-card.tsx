'use client'

import React, {useState} from 'react'
import {Box, CheckCircle2, Image as ImageIcon, Package2, Tag, Trash2} from 'lucide-react'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import Image from 'next/image'
import ImageGallery from '@/components/product/GalleryImages'
import {Button} from '@/components/ui/button'
import ActionModal from '@/components/modal/ConfirmModal'

interface Product {
    id: number
    quantity: number
    variant_name: string
    variant_id: number
    product_name: string
    brand: string
    categories: string[]
}

interface PackageDetailsCardProps {
    name: string
    description: string
    price: number
    discount_percent: number
    status: boolean
    featured_image?: string
    gallery_images?: string[]
    products?: Product[]
    onDeleteAction?: (productId: number) => void
}

export default function PackageDetailsCard({
                                               name,
                                               description,
                                               price,
                                               discount_percent,
                                               status,
                                               featured_image,
                                               gallery_images = [],
                                               products = [],
                                               onDeleteAction,
                                           }: PackageDetailsCardProps) {
    const [open, setOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const hasImages = featured_image || gallery_images.length > 0

    const handleDeleteClick = (productId: number) => {

        setSelectedProductId(productId)
        setOpen(true)
    }

    const handleConfirmDelete = async () => {
        console.log(selectedProductId)
        if (selectedProductId !== null && onDeleteAction) {
            setDeleteLoading(true)
            try {
                await onDeleteAction(selectedProductId)
            } finally {
                setDeleteLoading(false)
                setOpen(false)
                setSelectedProductId(null)
            }
        }
    }


    const finalPrice = price - (price * discount_percent / 100)

    return (
        <>
            <Card className="overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader
                    className="space-y-4 bg-gradient-to-br from-purple-50 via-purple-50/80 to-background p-5 sm:p-7 sm:space-y-6 sm:pb-9 border-b">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4a358e] to-[#6b4db8] text-white shadow-lg sm:h-16 sm:w-16 ring-4 ring-purple-100"
                            aria-hidden="true"
                        >
                            <Package2 className="h-7 w-7 sm:h-8 sm:w-8"/>
                        </div>
                        <div className="flex-1 space-y-2 sm:space-y-2.5">
                            <CardTitle
                                className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl text-gray-900">
                                {name}
                            </CardTitle>
                            <CardDescription className="text-sm leading-relaxed sm:text-base text-gray-600">
                                {description}
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 sm:gap-3" role="list" aria-label="Package details">
                        <div
                            className="flex items-center gap-2.5 rounded-xl border border-purple-200 bg-gradient-to-br from-white to-purple-50/30 px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow sm:px-5 sm:py-3"
                            role="listitem"
                        >
                            <span
                                className="text-xs font-semibold text-gray-600 sm:text-sm uppercase tracking-wide">Price:</span>
                            <div className="flex flex-col items-end">
                                {discount_percent > 0 && (
                                    <span
                                        className="text-xs text-gray-400 line-through">Rs. {price?.toLocaleString()}</span>
                                )}
                                <span className="text-base font-bold text-[#4a358e] sm:text-lg">
                                    Rs. {finalPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div
                            className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-gradient-to-br from-white to-green-50/30 px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow sm:px-5 sm:py-3"
                            role="listitem"
                        >
                            <span
                                className="text-xs font-semibold text-gray-600 sm:text-sm uppercase tracking-wide">Discount:</span>
                            <Badge
                                className="bg-gradient-to-r from-green-600 to-green-500 text-xs font-bold hover:from-green-700 hover:to-green-600 sm:text-sm shadow-md px-3">
                                {discount_percent}% OFF
                            </Badge>
                        </div>
                        <div
                            className="flex items-center gap-2.5 rounded-xl border border-border bg-gradient-to-br from-white to-gray-50/30 px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow sm:px-5 sm:py-3"
                            role="listitem"
                        >
                            <span
                                className="text-xs font-semibold text-gray-600 sm:text-sm uppercase tracking-wide">Status:</span>
                            <Badge
                                variant={status ? 'default' : 'secondary'}
                                className="text-xs font-bold sm:text-sm shadow-md px-3"
                                style={status ? {background: 'linear-gradient(135deg, #4a358e 0%, #6b4db8 100%)'} : undefined}
                            >
                                {status ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                {hasImages && (
                    <CardContent
                        className="space-y-5 p-5 sm:p-7 sm:space-y-6 bg-gradient-to-b from-gray-50/50 to-white border-b">
                        <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3.5">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#4a358e] to-[#6b4db8] text-white shadow-md">
                                <ImageIcon className="h-4.5 w-4.5" aria-hidden="true"/>
                            </div>
                            <h2 className="text-lg font-bold sm:text-xl text-gray-900">Package Images</h2>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                            {featured_image && (
                                <div className="space-y-2.5">
                                    <p className="text-xs font-semibold text-gray-600 sm:text-sm uppercase tracking-wide">Featured
                                        Image</p>
                                    <div
                                        className="relative aspect-video overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] sm:rounded-2xl">
                                        <Image
                                            fill
                                            src={featured_image}
                                            alt={`${name} featured image`}
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, 50vw"
                                            priority
                                        />
                                    </div>
                                </div>
                            )}

                            {gallery_images.length > 0 && (
                                <div className="space-y-2.5">
                                    <p className="text-xs font-semibold text-gray-600 sm:text-sm uppercase tracking-wide">Gallery
                                        Images</p>
                                    <ImageGallery images={gallery_images} productName={name}/>
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}

                <CardContent className="space-y-5 p-5 sm:p-7 sm:space-y-6">
                    <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3.5">
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-500 text-white shadow-md">
                            <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true"/>
                        </div>
                        <h2 className="text-lg font-bold sm:text-xl text-gray-900">Current Products</h2>
                        <Badge variant="secondary" className="ml-auto text-xs sm:text-sm font-bold shadow-sm px-3">
                            {products.length} {products.length === 1 ? 'Product' : 'Products'}
                        </Badge>
                    </div>

                    {products.length > 0 ? (
                        <div
                            className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
                            role="list"
                            aria-label="Current products in package"
                        >
                            {products.map((product) => (
                                <Card
                                    key={product.id}
                                    className="overflow-hidden border-border transition-shadow hover:shadow-md flex flex-col py-0 gap-0"
                                    role="listitem"
                                >
                                    <CardContent className="p-4 flex-1 bg-gradient-to-br from-white to-gray-50/30">
                                        <div className="space-y-3.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1 space-y-1.5">
                                                    <h3 className="line-clamp-2 text-sm font-bold leading-tight text-gray-900">
                                                        {product.product_name}
                                                    </h3>
                                                    <p className="truncate text-xs text-gray-500 font-medium">
                                                        {product.variant_name}
                                                    </p>
                                                </div>
                                                <div
                                                    className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4a358e] to-[#6b4db8] shadow-md">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">Qty</p>
                                                        <p className="text-lg font-bold leading-none text-white mt-0.5">
                                                            {product.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Tag className="h-3 w-3 text-gray-400"/>
                                                    <Badge variant="outline"
                                                           className="text-xs font-semibold border-gray-300 hover:bg-gray-100">
                                                        {product.brand}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap justify-end gap-1.5">
                                                    {product.categories.slice(0, 2).map((cat, idx) => (
                                                        <Badge key={idx} variant="secondary"
                                                               className="text-[10px] font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 hover:bg-purple-200">
                                                            {cat}
                                                        </Badge>
                                                    ))}
                                                    {product.categories.length > 2 && (
                                                        <Badge variant="secondary"
                                                               className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-700">
                                                            +{product.categories.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="mt-auto justify-end pb-3 px-4 bg-gray-50/50 border-t">
                                        <Button
                                            size="icon"
                                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all h-9 w-9"
                                            onClick={() => handleDeleteClick(product.variant_id)}
                                            aria-label={`Delete ${product.product_name}`}
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card
                            className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
                            <CardContent className="flex flex-col items-center justify-center py-14 sm:py-20">
                                <div
                                    className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 shadow-inner">
                                    <Box className="h-10 w-10 text-purple-400"/>
                                </div>
                                <p className="text-base font-bold text-gray-700 sm:text-lg">
                                    No products in this package yet
                                </p>
                                <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                                    Add products using the form below
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            <ActionModal
                open={open}
                setOpen={setOpen}
                title="Delete Product"
                description="Are you sure you want to delete this product from the package? This action cannot be undone."
                onConfirm={handleConfirmDelete}
            />
        </>
    )
}