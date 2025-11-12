'use client'

import {useMemo} from 'react'
import {useParams} from "next/navigation"
import {Calendar, Package, ShoppingBag, TrendingDown} from "lucide-react"
import {FormatCurrency} from "@/lib/helper"
import KitBagItem from "@/components/kit-bag/kitbag-item-card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {useQuery} from "@tanstack/react-query"
import kitBagService from "@/service/kit-bag.service"
import KitBagDetailsSkeleton from "@/app/admin/kit-bags/[slug]/loading"
import {cn} from "@/lib/utils";

interface KitbagItemVariant {
    name: string
    size_value: number
    size_unit: string
    price: number
    previous_price: number | null
}

interface KitbagItem {
    product_name: string
    image: string
    quantity: number
    variant: KitbagItemVariant
}

interface Kitbag {
    created_at: string
    no_of_kitbag_items: number | null
    items: KitbagItem[]
    user?: {
        name: string
        email: string
    }
}

export default function KitBagDetails() {
    const {slug} = useParams()

    const {data, isLoading} = useQuery<Kitbag>({
        queryKey: ["kitbag", slug],
        queryFn: async () => {
            const res = await kitBagService.getKitBag(slug as string)
            console.log('Response From KitBag Service:', res)
            return res?.data
        },
        enabled: !!slug,
    })

    const calculations = useMemo(() => {
        if (!data?.items) {
            return {
                total: 0,
                savings: 0,
                totalItems: 0
            }
        }

        let total = 0
        let savings = 0
        let totalItems = 0

        data.items.forEach(item => {
            total += item.variant.price * item.quantity
            totalItems += item.quantity
            if (item.variant.previous_price) {
                savings += (item.variant.previous_price - item.variant.price) * item.quantity
            }
        })

        return {total, savings, totalItems}
    }, [data?.items])

    const itemCount = useMemo(() => data?.items.length ?? 0, [data?.items])

    if (isLoading) {
        return <KitBagDetailsSkeleton/>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
                <header className="border-b bg-gradient-to-br from-primary/5 to-purple-50/50 p-4 sm:p-6 lg:p-8 ">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div
                                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border-2 border-primaryColor/10"
                                aria-hidden="true"
                            >
                                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primaryColor"/>
                            </div>
                            <div>
                                <h1 className={cn("text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-primary to-[#6b4fc0] bg-clip-text text-transparent", "capitalize")}>
                                    {data?.user?.name}&#39;s KitBag
                                </h1>
                                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-0.5 sm:mt-1">
                                    Your selected items collection
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Badge
                                variant="secondary"
                                className="bg-white/80 hover:bg-white text-foreground border backdrop-blur-sm font-semibold text-xs sm:text-sm"
                            >
                                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" aria-hidden="true"/>
                                {data?.created_at}
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="bg-white/80 hover:bg-white text-foreground border backdrop-blur-sm font-semibold text-xs sm:text-sm"
                            >
                                <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" aria-hidden="true"/>
                                {calculations.totalItems} {calculations.totalItems === 1 ? "Item" : "Items"}
                            </Badge>
                            {calculations.savings > 0 && (
                                <Badge
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs sm:text-sm">
                                    <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2"
                                                  aria-hidden="true"/>
                                    Saved {FormatCurrency(calculations.savings)}
                                </Badge>
                            )}
                        </div>
                    </div>
                </header>

                <main className="bg-background p-4 sm:p-6 lg:p-8 rounded-b-xl border-x border-b">
                    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        <section className="lg:col-span-2 space-y-4 sm:space-y-5" aria-labelledby="items-heading">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 id="items-heading"
                                    className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
                                    <div className="w-1 h-4 sm:h-5 rounded-full bg-primaryColor flex-shrink-0"
                                         aria-hidden="true"/>
                                    Your Items
                                </h2>
                                <Badge variant="outline" className="text-xs sm:text-sm lg:text-base font-bold">
                                    {itemCount} Product{itemCount !== 1 ? "s" : ""}
                                </Badge>
                            </div>
                            {itemCount > 0 ? (
                                data?.items.map((item, index) => (
                                    <KitBagItem
                                        key={`${item.product_name}-${index}`}
                                        item={item}
                                    />
                                ))
                            ) : (
                                <div
                                    className="text-center py-8 sm:py-12 text-muted-foreground bg-muted/30 rounded-xl border-2 border-dashed border-border">
                                    <ShoppingBag
                                        className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-muted-foreground/50"
                                        aria-hidden="true"/>
                                    <p className="text-sm sm:text-base font-medium">No items in your KitBag</p>
                                </div>
                            )}
                        </section>

                        <aside className="lg:col-span-1" aria-labelledby="summary-heading">
                            <div
                                className="bg-white rounded-xl sm:rounded-2xl border-2 border-primary/10 hover:border-primary/20 transition-all p-4 sm:p-6 lg:p-8 sticky top-4 lg:top-6 space-y-4 sm:space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 id="summary-heading"
                                        className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                                        Summary
                                    </h2>
                                    <div
                                        className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-primaryColor/10 flex items-center justify-center flex-shrink-0"
                                        aria-hidden="true"
                                    >
                                        <ShoppingBag
                                            className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 text-primaryColor"/>
                                    </div>
                                </div>

                                <Separator className="bg-border/60"/>

                                <dl className="space-y-3 sm:space-y-4">
                                    <div className="flex justify-between items-center gap-2">
                                        <dt className="text-xs sm:text-sm text-muted-foreground font-semibold">
                                            Subtotal
                                        </dt>
                                        <dd className="text-base sm:text-lg lg:text-xl font-bold text-foreground break-all text-right">
                                            {FormatCurrency(calculations.total)}
                                        </dd>
                                    </div>

                                    <div className="flex justify-between items-center gap-2">
                                        <dt className="text-xs sm:text-sm text-muted-foreground font-semibold">
                                            Items
                                        </dt>
                                        <dd>
                                            <Badge variant="secondary" className="font-bold text-xs sm:text-sm">
                                                {calculations.totalItems}
                                            </Badge>
                                        </dd>
                                    </div>

                                    {calculations.savings > 0 && (
                                        <div className="bg-green-50 p-3 sm:p-4 rounded-xl border-2 border-green-200">
                                            <div className="flex justify-between items-center gap-2">
                                                <dt className="text-xs sm:text-sm text-green-700 font-bold flex items-center gap-1.5 sm:gap-2">
                                                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                                                                  aria-hidden="true"/>
                                                    You Save
                                                </dt>
                                                <dd className="text-base sm:text-lg lg:text-xl font-black text-green-600 break-all text-right">
                                                    {FormatCurrency(calculations.savings)}
                                                </dd>
                                            </div>
                                        </div>
                                    )}
                                </dl>

                                <Separator className="bg-border/60"/>

                                <div
                                    className="bg-gradient-to-r from-primaryColor/10 to-primaryColor/5 p-4 sm:p-5 rounded-xl">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-base sm:text-lg lg:text-xl font-black text-foreground">
                                            Total
                                        </span>
                                        <span
                                            className="text-lg sm:text-xl lg:text-2xl font-black text-primaryColor break-all text-right">
                                            {FormatCurrency(calculations.total)}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-1 sm:pt-2">
                                    <p className="text-xs sm:text-sm text-muted-foreground text-center font-medium bg-muted/50 p-2.5 sm:p-3 rounded-lg">
                                        Free shipping on orders above NPR 2,000
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    )
}