import React, { memo, useCallback } from 'react'
import { Tag, Trash2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
    product: {
        id: number
        quantity: number
        variant_name: string
        variant_id: number
        product_name: string
        brand: string
        categories: string[]
    }
    onDeleteAction?: (variantId: number) => void
    isDeleting?: boolean
    maxCategoriesToShow?: number
}

const PackageProductCard = memo(function ProductCard({
                                                  product,
                                                  onDeleteAction,
                                                  isDeleting = false,
                                                  maxCategoriesToShow = 2
                                              }: ProductCardProps) {
    const visibleCategories = product.categories.slice(0, maxCategoriesToShow)
    const remainingCount = product.categories.length - maxCategoriesToShow

    const handleDelete = useCallback(() => {
        if (onDeleteAction && !isDeleting) {
            onDeleteAction(product.variant_id)
        }
    }, [onDeleteAction, isDeleting, product.variant_id])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isDeleting) {
            e.preventDefault()
            handleDelete()
        }
    }, [handleDelete, isDeleting])

    return (
        <Card
            className="overflow-hidden border-border transition-shadow hover:shadow-md flex flex-col py-0 gap-0"
            role="listitem"
        >
            <CardContent className="p-3 sm:p-4 flex-1 bg-gradient-to-br from-white to-gray-50/30">
                <div className="space-y-2.5 sm:space-y-3.5">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5">
                            <h3 className="line-clamp-2 text-xs sm:text-sm font-bold leading-tight text-gray-900">
                                {product.product_name}
                            </h3>
                            <p className="truncate text-[10px] sm:text-xs text-gray-500 font-medium">
                                {product.variant_name}
                            </p>
                        </div>
                        <div className="flex h-12 w-14 sm:h-14 sm:w-16 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-[#4a358e] to-[#6b4db8] shadow-md">
                            <div className="text-center">
                                <p className="text-[9px] sm:text-[10px] font-bold text-purple-200 uppercase tracking-wider">
                                    Qty
                                </p>
                                <p className="text-base sm:text-lg font-bold leading-none text-white mt-0.5">
                                    {product.quantity}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap pt-0.5 sm:pt-1">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                            <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" aria-hidden="true" />
                            <Badge
                                variant="outline"
                                className="text-[10px] sm:text-xs font-semibold border-gray-300 hover:bg-gray-100 px-1.5 sm:px-2"
                            >
                                {product.brand}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap justify-end gap-1 sm:gap-1.5">
                            {visibleCategories.map((cat, idx) => (
                                <Badge
                                    key={`${product.id}-cat-${idx}`}
                                    variant="secondary"
                                    className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 bg-purple-100 text-purple-700 hover:bg-purple-200"
                                >
                                    {cat}
                                </Badge>
                            ))}
                            {remainingCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 bg-gray-200 text-gray-700"
                                    title={`${remainingCount} more ${remainingCount === 1 ? 'category' : 'categories'}`}
                                >
                                    +{remainingCount}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="mt-auto justify-end p-2.5 sm:pb-3 sm:px-4 bg-gray-50/50 border-t">
                <Button
                    type="button"
                    size="icon"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all h-8 w-8 sm:h-9 sm:w-9 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={handleDelete}
                    onKeyDown={handleKeyDown}
                    disabled={isDeleting}
                    aria-label={`Delete ${product.product_name}`}
                    aria-busy={isDeleting}
                >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
})

export default PackageProductCard