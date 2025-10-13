'use client'
import { Package2, CheckCircle2, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import ImageGallery from "@/components/product/GalleryImages"

interface Product {
    id: number
    quantity: number
    variant_name: string
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
}

export default function PackageDetailsCard({
                                               name,
                                               description,
                                               price,
                                               discount_percent,
                                               status,
                                               featured_image,
                                               gallery_images = [],
                                               products = []
                                           }: PackageDetailsCardProps) {
    const hasImages = featured_image || gallery_images.length > 0

    return (
        <Card className="overflow-hidden border-border shadow-sm py-0">
            <CardHeader className="space-y-4 bg-gradient-to-br from-purple-50 via-purple-50/80 to-background p-6 sm:space-y-6 sm:pb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4a358e] text-white shadow-md sm:h-14 sm:w-14"
                        aria-hidden="true"
                    >
                        <Package2 className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <div className="flex-1 space-y-1.5 sm:space-y-2">
                        <CardTitle className="text-xl font-bold leading-tight sm:text-2xl lg:text-3xl">
                            {name}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed sm:text-base">
                            {description}
                        </CardDescription>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3" role="list" aria-label="Package details">
                    <div
                        className="flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-2.5"
                        role="listitem"
                    >
                        <span className="text-xs font-medium text-muted-foreground sm:text-sm">Price:</span>
                        <span className="text-sm font-bold text-[#4a358e] sm:text-base">
              Rs. {price?.toLocaleString()}
            </span>
                    </div>
                    <div
                        className="flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-2.5"
                        role="listitem"
                    >
                        <span className="text-xs font-medium text-muted-foreground sm:text-sm">Discount:</span>
                        <Badge className="bg-green-600 text-xs font-semibold hover:bg-green-700 sm:text-sm">
                            {discount_percent}% OFF
                        </Badge>
                    </div>
                    <div
                        className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-2.5"
                        role="listitem"
                    >
                        <span className="text-xs font-medium text-muted-foreground sm:text-sm">Status:</span>
                        <Badge
                            variant={status ? "default" : "secondary"}
                            className="text-xs font-semibold sm:text-sm"
                            style={status ? { backgroundColor: '#4a358e' } : undefined}
                        >
                            {status ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            {hasImages && (
                <CardContent className="space-y-4 pb-6 pt-6 sm:space-y-6">
                    <div className="flex items-center gap-2 border-b pb-3">
                        <ImageIcon className="h-5 w-5 text-[#4a358e]" aria-hidden="true" />
                        <h2 className="text-base font-semibold sm:text-lg">Package Images</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                        {featured_image && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground sm:text-sm">Featured Image</p>
                                <div className="relative aspect-video overflow-hidden rounded-lg border shadow-sm sm:rounded-xl">
                                    <Image
                                        fill
                                        src={featured_image}
                                        alt={`${name} featured image`}
                                        className="object-cover transition-transform hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, 50vw"
                                        priority
                                    />
                                </div>
                            </div>
                        )}

                        {gallery_images.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground sm:text-sm">Gallery Images</p>
                                <ImageGallery images={gallery_images} productName={name} />
                            </div>
                        )}
                    </div>
                </CardContent>
            )}

            <CardContent className="space-y-4 pb-6 sm:space-y-6 sm:pb-8">
                <div className="flex items-center gap-2 border-b pb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                    <h2 className="text-base font-semibold sm:text-lg">Current Products</h2>
                    <Badge variant="secondary" className="ml-auto text-xs sm:text-sm">
                        {products.length} {products.length === 1 ? 'Product' : 'Products'}
                    </Badge>
                </div>

                {products.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3" role="list" aria-label="Current products in package">
                        {products.map((product) => (
                            <Card key={product.id} className="overflow-hidden border-border transition-shadow hover:shadow-md" role="listitem">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                                                    {product.product_name}
                                                </h3>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {product.variant_name}
                                                </p>
                                            </div>
                                            <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg bg-[#4a358e]/10">
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-muted-foreground">Qty</p>
                                                    <p className="text-xs font-bold leading-none text-[#4a358e]">
                                                        {product.quantity}
                                                    </p>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <Badge variant="outline" className="text-xs font-medium">
                                                {product.brand}
                                            </Badge>
                                            <div className="flex flex-wrap justify-end gap-1">
                                                {product.categories.slice(0, 2).map((cat, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
                                <Package2 className="h-8 w-8 text-purple-400" />
                            </div>
                            <p className="text-sm font-semibold text-muted-foreground sm:text-base">
                                No products in this package yet
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/80 sm:text-sm">
                                Add products using the form below
                            </p>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    )
}