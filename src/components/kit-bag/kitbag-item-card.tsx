'use client'

import React, {FC, memo} from "react"
import Image from "next/image"
import {FormatCurrency} from "@/lib/helper"
import {cn} from "@/lib/utils"
import {Badge} from "@/components/ui/badge"

interface KitbagItemVariant {
    name: string
    size_value: number
    size_unit: string
    price: number
    previous_price: number | null
}

interface KitbagItemProps {
    product_name: string
    image: string
    quantity: number
    variant: KitbagItemVariant
}

interface Props {
    item: KitbagItemProps
    className?: string
}

const KitBagItem: FC<Props> = memo(({item, className}) => {
    const calculateDiscount = (price: number, previousPrice: number) =>
        Math.round(((previousPrice - price) / previousPrice) * 100)

    const hasDiscount = item.variant.previous_price !== null && item.variant.previous_price > item.variant.price
    const subtotal = item.variant.price * item.quantity

    return (
        <article
            className={cn(
                "group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 p-4 md:p-6 border border-gray-100 hover:border-primaryColor/30 overflow-hidden",
                "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primaryColor/0 before:via-primaryColor/5 before:to-primaryColor/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
                className
            )}
            aria-label={`${item.product_name} in cart`}
        >
            <div className="relative flex flex-col md:flex-row gap-4 md:gap-6">
                <div
                    className="relative flex-shrink-0 w-full md:w-32 lg:w-40 h-40 md:h-32 lg:h-40 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-xl overflow-hidden ring-2 ring-gray-100 group-hover:ring-primaryColor/40 transition-all duration-300">
                    <Image
                        src={item.image}
                        alt={`${item.product_name} ${item.variant.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 128px, 160px"
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                        quality={90}
                    />
                    {hasDiscount && (
                        <div className="absolute top-2 right-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Badge
                                variant="destructive"
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-xs font-bold shadow-lg backdrop-blur-sm"
                            >
                                {calculateDiscount(item.variant.price, item.variant.previous_price!)}%
                            </Badge>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"/>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between gap-3 md:gap-4">
                    <div className="space-y-3">
                        <h3 className="text-lg md:text-xl font-medium text-gray-900 line-clamp-2 group-hover:text-primaryColor transition-colors duration-300 leading-tight">
                            {item.product_name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Product attributes">
                            <Badge variant="secondary"
                                   className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 transition-colors">
                                {item.variant.name}
                            </Badge>
                            <Badge variant="secondary"
                                   className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 transition-colors">
                                {item.variant.size_value} {item.variant.size_unit}
                            </Badge>
                            <Badge
                                className="bg-gradient-to-r from-primaryColor to-primaryColor/90 hover:from-primaryColor/90 hover:to-primaryColor text-white text-xs font-bold shadow-md hover:shadow-lg transition-all">
                                Qty: {item.quantity}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl font-semibold tracking-tight" aria-label="Current price">
                {FormatCurrency(item.variant.price)}
              </span>
                            {hasDiscount && (
                                <span className="text-xl text-gray-400 line-through font-semibold"
                                      aria-label="Original price">
                  {FormatCurrency(item.variant.previous_price!)}
                </span>
                            )}
                        </div>

                        {item.quantity && (
                            <div
                                className="flex items-center justify-between pt-3 border-t-2 border-gray-100 group-hover:border-primaryColor/20 transition-colors">
                                <span
                                    className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Subtotal</span>
                                <span className="text-xl font-black text-primaryColor tracking-tight"
                                      aria-label="Item subtotal">
                  {FormatCurrency(subtotal)}
                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    )
})

KitBagItem.displayName = "KitBagItem"

export default KitBagItem
